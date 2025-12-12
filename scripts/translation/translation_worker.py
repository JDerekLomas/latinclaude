#!/usr/bin/env python3
"""
Translation Worker - Polls for jobs and processes PDFs/IA books.

This worker:
1. Polls the webapp API for pending translation jobs
2. Downloads page images from Internet Archive (or renders from PDF)
3. Runs OCR using vision models
4. Translates Latin to English
5. Reports progress back to the API

Usage:
    export WORKER_API_KEY="your-key"
    export OPENAI_API_KEY="your-key"
    python scripts/translation_worker.py --api-url http://localhost:3000

For production:
    python scripts/translation_worker.py --api-url https://secondrenaissance.vercel.app
"""

from __future__ import annotations

import os
import sys
import time
import json
import argparse
import requests
import base64
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any, List
from io import BytesIO

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

try:
    from translate_book import get_provider, ModelProvider
    HAS_PROVIDERS = True
except ImportError:
    HAS_PROVIDERS = False
    print("Warning: translate_book.py not found, using direct OpenAI API")

try:
    from de_mysteriis_processing import render_pdf_pages
    HAS_PDF_PROCESSING = True
except ImportError:
    HAS_PDF_PROCESSING = False
    print("Warning: de_mysteriis_processing.py not found, PDF upload not supported")


class TranslationWorker:
    """Worker that polls for and processes translation jobs."""

    def __init__(
        self,
        api_url: str,
        worker_key: str,
        poll_interval: int = 10,
        provider_name: str = "openai"
    ):
        self.api_url = api_url.rstrip('/')
        self.worker_key = worker_key
        self.poll_interval = poll_interval
        self.provider_name = provider_name
        self.headers = {'X-Worker-Key': worker_key}
        self.session = requests.Session()

    def poll_for_job(self) -> Optional[Dict[str, Any]]:
        """Poll API for next available job."""
        try:
            response = self.session.get(
                f"{self.api_url}/api/worker/poll",
                headers=self.headers,
                timeout=30
            )
            if response.status_code == 200:
                data = response.json()
                return data.get('job')
            elif response.status_code == 401:
                print("Error: Invalid worker API key")
                return None
            else:
                print(f"Poll error: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"Poll error: {e}")
            return None

    def update_job(self, job_id: str, **kwargs) -> bool:
        """Report progress/results back to API."""
        try:
            payload = {'jobId': job_id, **kwargs}
            response = self.session.post(
                f"{self.api_url}/api/worker/update",
                headers=self.headers,
                json=payload,
                timeout=30
            )
            if response.status_code != 200:
                print(f"Update error: {response.status_code} - {response.text}")
                return False
            return True
        except Exception as e:
            print(f"Update error: {e}")
            return False

    def download_ia_page(self, identifier: str, page_num: int) -> Optional[bytes]:
        """Download a page image from Internet Archive."""
        url = f"https://archive.org/download/{identifier}/page/n{page_num}.jpg"
        try:
            response = self.session.get(url, timeout=60)
            if response.status_code == 200:
                return response.content
            elif response.status_code == 404:
                return None  # Page doesn't exist
            else:
                print(f"IA download error for page {page_num}: {response.status_code}")
                return None
        except Exception as e:
            print(f"IA download error for page {page_num}: {e}")
            return None

    def detect_ia_page_count(self, identifier: str) -> int:
        """Detect total pages in an IA item using binary search."""
        # Try common page counts first
        for test_page in [10, 50, 100, 200, 500]:
            if self.download_ia_page(identifier, test_page) is None:
                break
            last_valid = test_page

        # Binary search to find exact count
        low, high = last_valid if 'last_valid' in dir() else 1, test_page
        while low < high:
            mid = (low + high + 1) // 2
            if self.download_ia_page(identifier, mid) is not None:
                low = mid
            else:
                high = mid - 1

        return low

    def transcribe_image_claude(self, image_data: bytes, prompt: str) -> str:
        """Transcribe image using Claude's vision API."""
        import anthropic
        client = anthropic.Anthropic()

        base64_image = base64.b64encode(image_data).decode('utf-8')

        # Detect media type (assume JPEG for IA images)
        media_type = "image/jpeg"

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": base64_image
                            }
                        },
                        {"type": "text", "text": prompt}
                    ]
                }
            ]
        )

        return response.content[0].text if response.content else ""

    def translate_text_claude(self, text: str, prompt: str) -> str:
        """Translate text using Claude's API."""
        import anthropic
        client = anthropic.Anthropic()

        full_prompt = f"{prompt}\n\nLatin text:\n{text}"

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            messages=[{"role": "user", "content": full_prompt}]
        )

        return response.content[0].text if response.content else ""

    def process_page(
        self,
        job_id: str,
        page_num: int,
        image_data: bytes,
        prompts: Dict[str, str],
        image_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """Process a single page: OCR + translate."""
        start_time = time.time()

        try:
            # OCR
            ocr_prompt = prompts.get('ocr', 'Transcribe the Latin text from this image.')
            ocr_text = self.transcribe_image_claude(image_data, ocr_prompt)

            # Translate
            translation_prompt = prompts.get('translation', 'Translate the following Latin text to English.')
            translation_text = self.translate_text_claude(ocr_text, translation_prompt)

            # Summary (optional)
            summary_text = None
            if prompts.get('summary'):
                summary_prompt = prompts['summary']
                summary_full = f"{summary_prompt}\n\nText:\n{translation_text}"
                summary_text = self.translate_text_claude("", summary_full)

            processing_time = int((time.time() - start_time) * 1000)

            return {
                'page_number': page_num,
                'image_url': image_url,
                'ocr_text': ocr_text,
                'translation_text': translation_text,
                'summary_text': summary_text,
                'status': 'completed',
                'processing_time_ms': processing_time
            }

        except Exception as e:
            print(f"Error processing page {page_num}: {e}")
            return {
                'page_number': page_num,
                'image_url': image_url,
                'status': 'failed',
                'error_message': str(e)
            }

    def process_ia_job(self, job: Dict[str, Any]):
        """Process a job from Internet Archive."""
        job_id = job['id']
        identifier = job['ia_identifier']
        prompts = job.get('prompts', {})
        preview_pages = job.get('preview_pages', 30)
        max_pages = job.get('max_pages')  # Optional limit
        status = job['status']
        pages_processed = job.get('pages_processed', 0)

        print(f"\n{'='*60}")
        print(f"Processing IA job: {job_id}")
        print(f"Identifier: {identifier}")
        print(f"Status: {status}")
        if max_pages:
            print(f"Max pages: {max_pages}")
        print(f"{'='*60}")

        try:
            # Detect total pages if not known
            total_pages = job.get('total_pages')
            if not total_pages:
                print("Detecting page count...")
                total_pages = self.detect_ia_page_count(identifier)
                print(f"Found {total_pages} pages")

            # Apply max_pages limit if set
            if max_pages:
                total_pages = min(total_pages, max_pages)
                print(f"Limited to {total_pages} pages")

            self.update_job(job_id, total_pages=total_pages)

            # Determine page range
            if status in ['pending', 'processing_preview']:
                start_page = pages_processed
                end_page = min(preview_pages, total_pages)
            else:  # processing_full
                start_page = pages_processed
                end_page = total_pages

            print(f"Processing pages {start_page + 1} to {end_page}")

            # Process pages
            for page_num in range(start_page, end_page):
                print(f"  Page {page_num + 1}/{end_page}...", end=" ", flush=True)

                # Download image
                image_data = self.download_ia_page(identifier, page_num)
                if image_data is None:
                    print("not found, skipping")
                    continue

                # Process
                image_url = f"https://archive.org/download/{identifier}/page/n{page_num}.jpg"
                result = self.process_page(job_id, page_num + 1, image_data, prompts, image_url)

                # Report progress
                self.update_job(
                    job_id,
                    pages_processed=page_num + 1,
                    current_page=page_num + 1,
                    page_result=result
                )

                print(f"{'done' if result['status'] == 'completed' else 'failed'}")

                # Rate limiting
                time.sleep(1)

            # Update final status
            if status in ['pending', 'processing_preview']:
                print("\nPreview complete - awaiting review")
                self.update_job(
                    job_id,
                    status='awaiting_review',
                    preview_completed_at=datetime.now().isoformat()
                )
            else:
                print("\nJob complete!")
                self.update_job(
                    job_id,
                    status='completed',
                    completed_at=datetime.now().isoformat()
                )

        except Exception as e:
            print(f"\nJob failed: {e}")
            self.update_job(
                job_id,
                status='failed',
                error_message=str(e)
            )

    def process_pdf_job(self, job: Dict[str, Any]):
        """Process a job from uploaded PDF."""
        if not HAS_PDF_PROCESSING:
            self.update_job(
                job['id'],
                status='failed',
                error_message='PDF processing not available on this worker'
            )
            return

        job_id = job['id']
        pdf_path = Path(job['pdf_path'])
        prompts = job.get('prompts', {})
        preview_pages = job.get('preview_pages', 30)
        status = job['status']

        print(f"\n{'='*60}")
        print(f"Processing PDF job: {job_id}")
        print(f"PDF: {pdf_path}")
        print(f"Status: {status}")
        print(f"{'='*60}")

        try:
            # Set up output directory
            output_dir = Path(f"data/translation_jobs/{job_id}")
            output_dir.mkdir(parents=True, exist_ok=True)

            if status == 'rendering':
                print("Rendering PDF to images...")
                # Render all pages
                records = render_pdf_pages(
                    pdf_path=pdf_path,
                    source_dir=output_dir / 'source_images',
                    processed_dir=output_dir / 'processed_images',
                    start_page=1,
                    end_page=9999,
                    dpi=300,
                    max_dim=1900
                )

                total_pages = len(records)
                print(f"Rendered {total_pages} pages")

                self.update_job(
                    job_id,
                    status='processing_preview',
                    total_pages=total_pages
                )
                status = 'processing_preview'

            # Process pages (similar to IA job)
            total_pages = job.get('total_pages', preview_pages)
            pages_processed = job.get('pages_processed', 0)

            if status == 'processing_preview':
                start_page = pages_processed
                end_page = min(preview_pages, total_pages)
            else:
                start_page = pages_processed
                end_page = total_pages

            print(f"Processing pages {start_page + 1} to {end_page}")

            for page_num in range(start_page, end_page):
                print(f"  Page {page_num + 1}/{end_page}...", end=" ", flush=True)

                # Read processed image
                image_path = output_dir / 'processed_images' / f'page_{page_num + 1:04d}_processed.jpg'
                if not image_path.exists():
                    print("not found, skipping")
                    continue

                with open(image_path, 'rb') as f:
                    image_data = f.read()

                # Process
                result = self.process_page(
                    job_id,
                    page_num + 1,
                    image_data,
                    prompts,
                    str(image_path)
                )

                self.update_job(
                    job_id,
                    pages_processed=page_num + 1,
                    current_page=page_num + 1,
                    page_result=result
                )

                print(f"{'done' if result['status'] == 'completed' else 'failed'}")
                time.sleep(1)

            # Update final status
            if status == 'processing_preview':
                print("\nPreview complete - awaiting review")
                self.update_job(
                    job_id,
                    status='awaiting_review',
                    preview_completed_at=datetime.now().isoformat()
                )
            else:
                print("\nJob complete!")
                self.update_job(
                    job_id,
                    status='completed',
                    completed_at=datetime.now().isoformat()
                )

        except Exception as e:
            print(f"\nJob failed: {e}")
            self.update_job(
                job_id,
                status='failed',
                error_message=str(e)
            )

    def process_images_job(self, job: Dict[str, Any]):
        """Process a job from uploaded ZIP of images."""
        job_id = job['id']
        images_dir = Path(job['images_dir'])
        prompts = job.get('prompts', {})
        preview_pages = job.get('preview_pages', 30)
        max_pages = job.get('max_pages')  # Optional limit
        status = job['status']
        pages_processed = job.get('pages_processed', 0)

        print(f"\n{'='*60}")
        print(f"Processing images job: {job_id}")
        print(f"Images dir: {images_dir}")
        print(f"Status: {status}")
        print(f"{'='*60}")

        try:
            # Get list of image files
            image_files = sorted([
                f for f in images_dir.iterdir()
                if f.suffix.lower() in ('.png', '.jpg', '.jpeg')
            ], key=lambda f: int(''.join(filter(str.isdigit, f.stem)) or 0))

            total_pages = len(image_files)
            if max_pages:
                total_pages = min(total_pages, max_pages)

            print(f"Found {len(image_files)} images, will process {total_pages}")
            self.update_job(job_id, total_pages=total_pages)

            # Determine page range
            if status in ['pending', 'processing_preview']:
                start_page = pages_processed
                end_page = min(preview_pages, total_pages)
            else:  # processing_full
                start_page = pages_processed
                end_page = total_pages

            print(f"Processing pages {start_page + 1} to {end_page}")

            for i, page_num in enumerate(range(start_page, end_page)):
                if page_num >= len(image_files):
                    break

                image_path = image_files[page_num]
                print(f"  Page {page_num + 1}/{end_page}...", end=" ", flush=True)

                with open(image_path, 'rb') as f:
                    image_data = f.read()

                result = self.process_page(
                    job_id,
                    page_num + 1,
                    image_data,
                    prompts,
                    str(image_path)
                )

                self.update_job(
                    job_id,
                    pages_processed=page_num + 1,
                    current_page=page_num + 1,
                    page_result=result
                )

                print(f"{'done' if result['status'] == 'completed' else 'failed'}")
                time.sleep(1)

            # Update final status
            if status in ['pending', 'processing_preview']:
                print("\nPreview complete - awaiting review")
                self.update_job(
                    job_id,
                    status='awaiting_review',
                    preview_completed_at=datetime.now().isoformat()
                )
            else:
                print("\nJob complete!")
                self.update_job(
                    job_id,
                    status='completed',
                    completed_at=datetime.now().isoformat()
                )

        except Exception as e:
            print(f"\nJob failed: {e}")
            self.update_job(
                job_id,
                status='failed',
                error_message=str(e)
            )

    def process_job(self, job: Dict[str, Any]):
        """Route job to appropriate processor."""
        if job.get('ia_identifier'):
            self.process_ia_job(job)
        elif job.get('pdf_path'):
            self.process_pdf_job(job)
        elif job.get('images_dir'):
            self.process_images_job(job)
        else:
            self.update_job(
                job['id'],
                status='failed',
                error_message='Job has no ia_identifier, pdf_path, or images_dir'
            )

    def run(self):
        """Main loop: poll for jobs and process them."""
        print(f"Translation Worker started")
        print(f"API: {self.api_url}")
        print(f"Poll interval: {self.poll_interval}s")
        print("-" * 40)

        while True:
            try:
                job = self.poll_for_job()

                if job:
                    self.process_job(job)
                else:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] No jobs, sleeping {self.poll_interval}s...")
                    time.sleep(self.poll_interval)

            except KeyboardInterrupt:
                print("\nShutting down...")
                break
            except Exception as e:
                print(f"Worker error: {e}")
                time.sleep(self.poll_interval)


def main():
    parser = argparse.ArgumentParser(
        description="Translation worker that processes PDF/IA translation jobs"
    )
    parser.add_argument(
        '--api-url',
        required=True,
        help='Base URL of the webapp API (e.g., http://localhost:3000)'
    )
    parser.add_argument(
        '--poll-interval',
        type=int,
        default=10,
        help='Seconds between polls when idle (default: 10)'
    )
    parser.add_argument(
        '--provider',
        default='openai',
        choices=['openai', 'gemini', 'claude'],
        help='LLM provider to use (default: openai)'
    )
    args = parser.parse_args()

    worker_key = os.environ.get('WORKER_API_KEY')
    if not worker_key:
        print("Error: WORKER_API_KEY environment variable required")
        sys.exit(1)

    # Verify Anthropic key is available
    if not os.environ.get('ANTHROPIC_API_KEY'):
        print("Warning: ANTHROPIC_API_KEY not set, transcription/translation will fail")

    worker = TranslationWorker(
        api_url=args.api_url,
        worker_key=worker_key,
        poll_interval=args.poll_interval,
        provider_name=args.provider
    )

    worker.run()


if __name__ == '__main__':
    main()
