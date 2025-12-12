#!/usr/bin/env python3
"""
Latin Translation Pipeline using OpenAI Codex CLI

This script processes Renaissance Latin texts from Internet Archive using
the Codex CLI tool (OpenAI's CLI) which provides free/cheap access to GPT-4o.

Usage:
    python translate_book_codex.py --identifier hin-wel-all-00001266-001 --start 15 --end 50
    python translate_book_codex.py --identifier hin-wel-all-00001266-001 --page 15

Requirements:
    - Codex CLI installed: npm install -g @openai/codex
    - Logged in: codex login
"""

import os
import sys
import json
import argparse
import time
import subprocess
import tempfile
import requests
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any

# Configuration
DATA_DIR = Path(__file__).parent.parent / "data" / "translations"

# Prompts
TRANSCRIPTION_PROMPT = """Transcribe the Latin text from this page image exactly as it appears.

Instructions:
- Transcribe all Latin text faithfully, including abbreviations
- Preserve paragraph breaks
- Expand common abbreviations in [brackets] where clear (e.g., [que] for ꝗ)
- Note any unclear sections with [?]
- Include page numbers if visible
- Skip decorative elements, just focus on the text
- For Greek text, transcribe using Greek letters

Output ONLY the transcription text, nothing else. No commentary, no explanations."""

TRANSLATION_PROMPT_TEMPLATE = """Translate the following Latin text to English.

Instructions:
- Provide an accurate, readable English translation
- Preserve paragraph structure
- For technical/philosophical terms, provide the Latin in parentheses on first use
- Maintain the scholarly tone of the original
- If there are unclear passages marked with [?], translate as best you can

Latin text:
{latin_text}

Output ONLY the English translation, nothing else."""


def run_codex(prompt: str, image_path: Optional[Path] = None, output_file: Optional[Path] = None) -> str:
    """Run codex exec with the given prompt and optional image."""
    cmd = [
        "codex", "exec",
        "--full-auto",  # Run without confirmations
        "--skip-git-repo-check",
    ]

    if image_path:
        cmd.extend(["-i", str(image_path)])

    if output_file:
        cmd.extend(["--output-last-message", str(output_file)])

    cmd.append(prompt)

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120,  # 2 minute timeout
            cwd=str(DATA_DIR)
        )

        # If output file was specified, read from it
        if output_file and output_file.exists():
            return output_file.read_text().strip()

        # Otherwise parse from stdout
        return result.stdout.strip()

    except subprocess.TimeoutExpired:
        raise Exception("Codex timed out after 120 seconds")
    except Exception as e:
        raise Exception(f"Codex failed: {e}")


class TranslationPipeline:
    def __init__(self, identifier: str, output_dir: Optional[Path] = None):
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

        # Load or initialize progress
        self.progress = self._load_progress()

    def _load_progress(self) -> Dict[str, Any]:
        """Load progress from checkpoint file."""
        if self.progress_file.exists():
            with open(self.progress_file) as f:
                return json.load(f)
        return {
            "identifier": self.identifier,
            "provider": "codex",
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
            if image_path.stat().st_size > 1000:
                return image_path

        url = self._get_page_url(page_num)

        try:
            response = requests.get(url, allow_redirects=True, timeout=30)

            if response.status_code == 404:
                return None

            content_type = response.headers.get("content-type", "")
            if "image" not in content_type:
                print(f"  Page {page_num}: Not an image (content-type: {content_type})")
                return None

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
        """Transcribe Latin text from page image using Codex CLI."""
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

        try:
            # Create temp file for output
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as tmp:
                tmp_path = Path(tmp.name)

            transcription = run_codex(
                TRANSCRIPTION_PROMPT,
                image_path=image_path,
                output_file=tmp_path
            )

            # Clean up temp file
            tmp_path.unlink(missing_ok=True)

            if not transcription:
                raise Exception("Empty transcription returned")

            # Save transcription
            with open(transcription_file, "w") as f:
                f.write(transcription)

            return transcription

        except Exception as e:
            print(f"  Error transcribing page {page_num}: {e}")
            return None

    def translate_page(self, page_num: int, force: bool = False) -> Optional[str]:
        """Translate Latin transcription to English using Codex CLI."""
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
            # Create temp file for output
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as tmp:
                tmp_path = Path(tmp.name)

            translation = run_codex(
                TRANSLATION_PROMPT_TEMPLATE.format(latin_text=transcription),
                output_file=tmp_path
            )

            # Clean up temp file
            tmp_path.unlink(missing_ok=True)

            if not translation:
                raise Exception("Empty translation returned")

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
        print(f"  Transcribing (codex)...")
        transcription = self.transcribe_page(page_num, force=force)
        if not transcription:
            print(f"  Failed to transcribe page {page_num}")
            self.progress["failed_pages"].append(page_num)
            self._save_progress()
            return False

        # Translate
        print(f"  Translating (codex)...")
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

    def process_range(self, start: int, end: int, force: bool = False, delay: float = 2.0):
        """Process a range of pages."""
        total = end - start + 1
        completed = 0
        failed = 0

        print(f"\n{'='*60}")
        print(f"Processing pages {start} to {end} ({total} pages)")
        print(f"Identifier: {self.identifier}")
        print(f"Provider: codex")
        print(f"Output: {self.output_dir}")
        print(f"{'='*60}")

        for page_num in range(start, end + 1):
            if not force and page_num in self.progress["completed_pages"]:
                print(f"\nSkipping page {page_num} (already completed)")
                completed += 1
                continue

            if self.process_page(page_num, force=force):
                completed += 1
            else:
                failed += 1

            # Rate limiting (codex needs more time between requests)
            if delay > 0:
                time.sleep(delay)

        print(f"\n{'='*60}")
        print(f"COMPLETE: {completed}/{total} pages processed, {failed} failed")
        print(f"{'='*60}")

    def generate_combined_output(self):
        """Generate combined transcription and translation files."""
        print("\nGenerating combined output files...")

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

    def status(self):
        """Print current status."""
        total = self.progress.get("total_pages", "unknown")
        completed = len(self.progress["completed_pages"])
        failed = len(self.progress["failed_pages"])

        print(f"\n{'='*60}")
        print(f"Translation Pipeline Status")
        print(f"{'='*60}")
        print(f"Identifier: {self.identifier}")
        print(f"Provider: codex")
        print(f"Output directory: {self.output_dir}")
        print(f"Total pages: {total}")
        print(f"Completed: {completed}")
        print(f"Failed: {failed}")
        print(f"Last page: {self.progress.get('last_page', 'N/A')}")

        if self.progress["completed_pages"]:
            print(f"Completed pages: {min(self.progress['completed_pages'])} - {max(self.progress['completed_pages'])}")

        print(f"{'='*60}\n")


def main():
    parser = argparse.ArgumentParser(description="Translate Renaissance Latin texts using Codex CLI")
    parser.add_argument("--identifier", "-i", required=True, help="Internet Archive identifier")
    parser.add_argument("--start", "-s", type=int, help="Start page number")
    parser.add_argument("--end", "-e", type=int, help="End page number")
    parser.add_argument("--resume", "-r", action="store_true", help="Resume from last page")
    parser.add_argument("--force", "-f", action="store_true", help="Force reprocess existing pages")
    parser.add_argument("--delay", "-d", type=float, default=2.0, help="Delay between pages (seconds)")
    parser.add_argument("--status", action="store_true", help="Show status only")
    parser.add_argument("--combine", action="store_true", help="Generate combined output files")
    parser.add_argument("--page", "-p", type=int, help="Process single page")

    args = parser.parse_args()

    # Check codex is installed
    try:
        subprocess.run(["codex", "--version"], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Error: Codex CLI not found. Install with: npm install -g @openai/codex")
        sys.exit(1)

    pipeline = TranslationPipeline(args.identifier)

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
