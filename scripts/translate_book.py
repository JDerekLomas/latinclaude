#!/usr/bin/env python3
"""
Systematic Latin Translation Pipeline

This script processes Renaissance Latin texts from Internet Archive:
1. Downloads page images
2. Transcribes Latin using vision models (OpenAI GPT-4V, Gemini, or Claude)
3. Translates Latin to English
4. Saves results with checkpointing

Usage:
    python translate_book.py --identifier hin-wel-all-00001266-001 --start 15 --end 50
    python translate_book.py --identifier hin-wel-all-00001266-001 --resume
    python translate_book.py --identifier hin-wel-all-00001266-001 --provider openai --page 15

Supported providers:
    - openai: GPT-4o (default, cheapest with vision)
    - gemini: Gemini 1.5 Pro (free tier available)
    - claude: Claude Sonnet (highest quality, most expensive)
"""

import os
import sys
import json
import argparse
import time
import base64
import requests
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any

# Load .env file
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

# Configuration
DATA_DIR = Path(__file__).parent.parent / "data" / "translations"

# Prompts
TRANSCRIPTION_PROMPT = """Transcribe the Latin text from this page image exactly as it appears.

Instructions:
- Transcribe all Latin text faithfully, including abbreviations
- Preserve line breaks where meaningful (paragraph breaks)
- Expand common abbreviations in [brackets] where clear (e.g., [que] for ꝗ)
- Note any unclear sections with [?]
- Include page numbers if visible
- Skip decorative elements, just focus on the text
- For Greek text, transcribe using Greek letters

Output only the transcription, no commentary."""

TRANSLATION_PROMPT_TEMPLATE = """Translate the following Latin text to English.

Instructions:
- Provide an accurate, readable English translation
- Preserve paragraph structure
- For technical/philosophical terms, provide the Latin in parentheses on first use
- Maintain the scholarly tone of the original
- If there are unclear passages marked with [?], translate as best you can and note uncertainty

Latin text:
{latin_text}

Provide only the English translation, no commentary."""


class ModelProvider:
    """Base class for model providers"""

    def transcribe_image(self, image_data: bytes) -> str:
        raise NotImplementedError

    def translate_text(self, latin_text: str) -> str:
        raise NotImplementedError


class OpenAIProvider(ModelProvider):
    """OpenAI GPT-4o provider - best value for vision tasks"""

    def __init__(self):
        from openai import OpenAI
        self.client = OpenAI()
        self.vision_model = "gpt-4o"  # or "gpt-4o-mini" for cheaper
        self.text_model = "gpt-4o-mini"  # cheaper for text-only translation

    def transcribe_image(self, image_data: bytes) -> str:
        image_b64 = base64.standard_b64encode(image_data).decode("utf-8")

        response = self.client.chat.completions.create(
            model=self.vision_model,
            max_tokens=4096,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_b64}"
                            }
                        },
                        {
                            "type": "text",
                            "text": TRANSCRIPTION_PROMPT
                        }
                    ]
                }
            ]
        )
        return response.choices[0].message.content

    def translate_text(self, latin_text: str) -> str:
        response = self.client.chat.completions.create(
            model=self.text_model,
            max_tokens=4096,
            messages=[
                {
                    "role": "user",
                    "content": TRANSLATION_PROMPT_TEMPLATE.format(latin_text=latin_text)
                }
            ]
        )
        return response.choices[0].message.content


class GeminiProvider(ModelProvider):
    """Google Gemini provider - free tier available"""

    def __init__(self):
        import google.generativeai as genai
        genai.configure(api_key=os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY"))
        self.vision_model = genai.GenerativeModel("gemini-1.5-pro")
        self.text_model = genai.GenerativeModel("gemini-1.5-flash")  # cheaper for text

    def transcribe_image(self, image_data: bytes) -> str:
        from PIL import Image
        import io

        image = Image.open(io.BytesIO(image_data))
        response = self.vision_model.generate_content([
            TRANSCRIPTION_PROMPT,
            image
        ])
        return response.text

    def translate_text(self, latin_text: str) -> str:
        response = self.text_model.generate_content(
            TRANSLATION_PROMPT_TEMPLATE.format(latin_text=latin_text)
        )
        return response.text


class ClaudeProvider(ModelProvider):
    """Anthropic Claude provider - highest quality"""

    def __init__(self):
        import anthropic
        self.client = anthropic.Anthropic()
        self.model = "claude-sonnet-4-20250514"

    def transcribe_image(self, image_data: bytes) -> str:
        image_b64 = base64.standard_b64encode(image_data).decode("utf-8")

        response = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": image_b64
                            }
                        },
                        {
                            "type": "text",
                            "text": TRANSCRIPTION_PROMPT
                        }
                    ]
                }
            ]
        )
        return response.content[0].text

    def translate_text(self, latin_text: str) -> str:
        response = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            messages=[
                {
                    "role": "user",
                    "content": TRANSLATION_PROMPT_TEMPLATE.format(latin_text=latin_text)
                }
            ]
        )
        return response.content[0].text


def get_provider(name: str) -> ModelProvider:
    """Factory function to get the appropriate provider"""
    providers = {
        "openai": OpenAIProvider,
        "gemini": GeminiProvider,
        "claude": ClaudeProvider,
    }

    if name not in providers:
        raise ValueError(f"Unknown provider: {name}. Choose from: {list(providers.keys())}")

    return providers[name]()


class TranslationPipeline:
    def __init__(self, identifier: str, provider_name: str = "openai", output_dir: Optional[Path] = None):
        self.identifier = identifier
        self.output_dir = output_dir or DATA_DIR / identifier.replace("-", "_")
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.images_dir = self.output_dir / "images"
        self.images_dir.mkdir(exist_ok=True)

        self.transcriptions_dir = self.output_dir / "transcriptions"
        self.transcriptions_dir.mkdir(exist_ok=True)

        self.translations_dir = self.output_dir / "translations"
        self.translations_dir.mkdir(exist_ok=True)

        self.progress_file = self.output_dir / "progress.json"
        self.manifest_file = self.output_dir / "manifest.json"

        self.provider_name = provider_name
        self.provider = get_provider(provider_name)

        # Load or initialize progress
        self.progress = self._load_progress()

    def _load_progress(self) -> Dict[str, Any]:
        """Load progress from checkpoint file."""
        if self.progress_file.exists():
            with open(self.progress_file) as f:
                return json.load(f)
        return {
            "identifier": self.identifier,
            "provider": self.provider_name,
            "started_at": datetime.now().isoformat(),
            "completed_pages": [],
            "failed_pages": [],
            "last_page": 0,
            "total_pages": None
        }

    def _save_progress(self):
        """Save progress to checkpoint file."""
        self.progress["updated_at"] = datetime.now().isoformat()
        with open(self.progress_file, "w") as f:
            json.dump(self.progress, f, indent=2)

    def _get_page_url(self, page_num: int) -> str:
        """Get Internet Archive page image URL."""
        return f"https://archive.org/download/{self.identifier}/page/n{page_num}.jpg"

    def download_page(self, page_num: int, force: bool = False) -> Optional[Path]:
        """Download a page image from Internet Archive."""
        image_path = self.images_dir / f"page_{page_num:03d}.jpg"

        if image_path.exists() and not force:
            # Check if file is valid (not empty, not error page)
            if image_path.stat().st_size > 1000:
                return image_path

        url = self._get_page_url(page_num)

        try:
            response = requests.get(url, allow_redirects=True, timeout=30)

            # Check for 302/404 (page doesn't exist)
            if response.status_code == 404:
                return None

            # Check content type
            content_type = response.headers.get("content-type", "")
            if "image" not in content_type:
                print(f"  Page {page_num}: Not an image (content-type: {content_type})")
                return None

            # Save image
            with open(image_path, "wb") as f:
                f.write(response.content)

            return image_path

        except Exception as e:
            print(f"  Error downloading page {page_num}: {e}")
            return None

    def get_total_pages(self) -> int:
        """Determine total number of pages in the book."""
        if self.progress.get("total_pages"):
            return self.progress["total_pages"]

        print("Determining total page count...")

        # Binary search for last page
        low, high = 1, 1000

        while low < high:
            mid = (low + high + 1) // 2
            url = self._get_page_url(mid)

            try:
                response = requests.head(url, allow_redirects=True, timeout=10)
                content_type = response.headers.get("content-type", "")

                if response.status_code == 200 and "image" in content_type:
                    low = mid
                else:
                    high = mid - 1
            except:
                high = mid - 1

        self.progress["total_pages"] = low
        self._save_progress()

        print(f"Total pages: {low}")
        return low

    def transcribe_page(self, page_num: int, force: bool = False) -> Optional[str]:
        """Transcribe Latin text from page image using vision model."""
        transcription_file = self.transcriptions_dir / f"page_{page_num:03d}.txt"

        if transcription_file.exists() and not force:
            with open(transcription_file) as f:
                return f.read()

        # Get image
        image_path = self.images_dir / f"page_{page_num:03d}.jpg"
        if not image_path.exists():
            image_path = self.download_page(page_num)
            if not image_path:
                return None

        # Read image
        with open(image_path, "rb") as f:
            image_data = f.read()

        try:
            transcription = self.provider.transcribe_image(image_data)

            # Save transcription
            with open(transcription_file, "w") as f:
                f.write(transcription)

            return transcription

        except Exception as e:
            print(f"  Error transcribing page {page_num}: {e}")
            return None

    def translate_page(self, page_num: int, force: bool = False) -> Optional[str]:
        """Translate Latin transcription to English."""
        translation_file = self.translations_dir / f"page_{page_num:03d}.txt"

        if translation_file.exists() and not force:
            with open(translation_file) as f:
                return f.read()

        # Get transcription
        transcription_file = self.transcriptions_dir / f"page_{page_num:03d}.txt"
        if not transcription_file.exists():
            transcription = self.transcribe_page(page_num)
            if not transcription:
                return None
        else:
            with open(transcription_file) as f:
                transcription = f.read()

        try:
            translation = self.provider.translate_text(transcription)

            # Save translation
            with open(translation_file, "w") as f:
                f.write(translation)

            return translation

        except Exception as e:
            print(f"  Error translating page {page_num}: {e}")
            return None

    def process_page(self, page_num: int, force: bool = False) -> bool:
        """Process a single page: download, transcribe, translate."""
        print(f"\nProcessing page {page_num}...")

        # Download
        print(f"  Downloading...")
        image_path = self.download_page(page_num, force=force)
        if not image_path:
            print(f"  Page {page_num} not available")
            return False

        # Transcribe
        print(f"  Transcribing ({self.provider_name})...")
        transcription = self.transcribe_page(page_num, force=force)
        if not transcription:
            print(f"  Failed to transcribe page {page_num}")
            self.progress["failed_pages"].append(page_num)
            self._save_progress()
            return False

        # Translate
        print(f"  Translating ({self.provider_name})...")
        translation = self.translate_page(page_num, force=force)
        if not translation:
            print(f"  Failed to translate page {page_num}")
            self.progress["failed_pages"].append(page_num)
            self._save_progress()
            return False

        # Update progress
        if page_num not in self.progress["completed_pages"]:
            self.progress["completed_pages"].append(page_num)
        self.progress["last_page"] = page_num
        self._save_progress()

        print(f"  ✓ Page {page_num} complete")
        return True

    def process_range(self, start: int, end: int, force: bool = False, delay: float = 1.0):
        """Process a range of pages."""
        total = end - start + 1
        completed = 0
        failed = 0

        print(f"\n{'='*60}")
        print(f"Processing pages {start} to {end} ({total} pages)")
        print(f"Identifier: {self.identifier}")
        print(f"Provider: {self.provider_name}")
        print(f"Output: {self.output_dir}")
        print(f"{'='*60}")

        for page_num in range(start, end + 1):
            # Skip already completed unless force
            if not force and page_num in self.progress["completed_pages"]:
                print(f"\nSkipping page {page_num} (already completed)")
                completed += 1
                continue

            if self.process_page(page_num, force=force):
                completed += 1
            else:
                failed += 1

            # Rate limiting
            if delay > 0:
                time.sleep(delay)

        print(f"\n{'='*60}")
        print(f"COMPLETE: {completed}/{total} pages processed, {failed} failed")
        print(f"{'='*60}")

    def generate_combined_output(self):
        """Generate combined transcription and translation files."""
        print("\nGenerating combined output files...")

        # Sort completed pages
        pages = sorted(self.progress["completed_pages"])

        if not pages:
            print("No completed pages to combine")
            return

        # Combined transcription
        combined_latin = self.output_dir / "complete_latin.txt"
        with open(combined_latin, "w") as f:
            f.write(f"# {self.identifier}\n")
            f.write(f"# Latin Transcription\n")
            f.write(f"# Generated: {datetime.now().isoformat()}\n\n")

            for page_num in pages:
                transcription_file = self.transcriptions_dir / f"page_{page_num:03d}.txt"
                if transcription_file.exists():
                    f.write(f"\n{'='*60}\n")
                    f.write(f"PAGE {page_num}\n")
                    f.write(f"{'='*60}\n\n")
                    f.write(transcription_file.read_text())
                    f.write("\n")

        # Combined translation
        combined_english = self.output_dir / "complete_english.txt"
        with open(combined_english, "w") as f:
            f.write(f"# {self.identifier}\n")
            f.write(f"# English Translation\n")
            f.write(f"# Generated: {datetime.now().isoformat()}\n\n")

            for page_num in pages:
                translation_file = self.translations_dir / f"page_{page_num:03d}.txt"
                if translation_file.exists():
                    f.write(f"\n{'='*60}\n")
                    f.write(f"PAGE {page_num}\n")
                    f.write(f"{'='*60}\n\n")
                    f.write(translation_file.read_text())
                    f.write("\n")

        print(f"  Created: {combined_latin}")
        print(f"  Created: {combined_english}")

        # Update manifest
        self._update_manifest()

    def _update_manifest(self):
        """Update the manifest file with book metadata."""
        manifest = {
            "identifier": self.identifier,
            "ia_url": f"https://archive.org/details/{self.identifier}",
            "provider": self.provider_name,
            "total_pages": self.progress.get("total_pages"),
            "completed_pages": len(self.progress["completed_pages"]),
            "failed_pages": len(self.progress["failed_pages"]),
            "started_at": self.progress.get("started_at"),
            "updated_at": datetime.now().isoformat(),
            "files": {
                "images": str(self.images_dir),
                "transcriptions": str(self.transcriptions_dir),
                "translations": str(self.translations_dir),
                "combined_latin": str(self.output_dir / "complete_latin.txt"),
                "combined_english": str(self.output_dir / "complete_english.txt")
            }
        }

        with open(self.manifest_file, "w") as f:
            json.dump(manifest, f, indent=2)

    def status(self):
        """Print current status."""
        total = self.progress.get("total_pages", "unknown")
        completed = len(self.progress["completed_pages"])
        failed = len(self.progress["failed_pages"])

        print(f"\n{'='*60}")
        print(f"Translation Pipeline Status")
        print(f"{'='*60}")
        print(f"Identifier: {self.identifier}")
        print(f"Provider: {self.provider_name}")
        print(f"Output directory: {self.output_dir}")
        print(f"Total pages: {total}")
        print(f"Completed: {completed}")
        print(f"Failed: {failed}")
        print(f"Last page: {self.progress.get('last_page', 'N/A')}")

        if self.progress["completed_pages"]:
            print(f"Completed pages: {min(self.progress['completed_pages'])} - {max(self.progress['completed_pages'])}")

        print(f"{'='*60}\n")


def main():
    parser = argparse.ArgumentParser(description="Translate Renaissance Latin texts from Internet Archive")
    parser.add_argument("--identifier", "-i", required=True, help="Internet Archive identifier")
    parser.add_argument("--provider", "-m", default="openai", choices=["openai", "gemini", "claude"],
                        help="Model provider (default: openai)")
    parser.add_argument("--start", "-s", type=int, help="Start page number")
    parser.add_argument("--end", "-e", type=int, help="End page number")
    parser.add_argument("--resume", "-r", action="store_true", help="Resume from last page")
    parser.add_argument("--force", "-f", action="store_true", help="Force reprocess existing pages")
    parser.add_argument("--delay", "-d", type=float, default=1.0, help="Delay between pages (seconds)")
    parser.add_argument("--status", action="store_true", help="Show status only")
    parser.add_argument("--combine", action="store_true", help="Generate combined output files")
    parser.add_argument("--page", "-p", type=int, help="Process single page")

    args = parser.parse_args()

    pipeline = TranslationPipeline(args.identifier, provider_name=args.provider)

    if args.status:
        pipeline.status()
        return

    if args.combine:
        pipeline.generate_combined_output()
        return

    if args.page:
        pipeline.process_page(args.page, force=args.force)
        return

    if args.resume:
        # Continue from last page
        start = pipeline.progress.get("last_page", 0) + 1
        end = pipeline.get_total_pages()
    elif args.start and args.end:
        start = args.start
        end = args.end
    else:
        print("Please specify --start and --end, or use --resume")
        sys.exit(1)

    pipeline.process_range(start, end, force=args.force, delay=args.delay)
    pipeline.generate_combined_output()


if __name__ == "__main__":
    main()
