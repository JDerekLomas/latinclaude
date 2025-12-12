#!/usr/bin/env python3
"""Utility helpers for processing Marsilio Ficino's *De mysteriis* facsimile.

The script renders pages from the source PDF, saves archival-quality PNGs,
creates lightweight high-contrast JPEGs for easier reading, and can scale
processing to selected page ranges. OCR/translation are handled separately,
but the script emits JSON metadata plus a human-readable run log so downstream
automation can coordinate prompts and track provenance.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Iterable, List

import fitz  # PyMuPDF
from PIL import Image, ImageEnhance, ImageOps
from tqdm import tqdm


@dataclass
class PageArtifact:
    """Metadata describing artifacts for a single page."""

    page_number: int
    source_image: str
    processed_image: str
    ocr_text: str
    translation_text: str


def ensure_dir(path: Path) -> None:
    """Create directory if needed."""
    path.mkdir(parents=True, exist_ok=True)


def render_pdf_pages(
    pdf_path: Path,
    source_dir: Path,
    processed_dir: Path,
    start_page: int,
    end_page: int,
    dpi: int = 300,
    max_dim: int = 1900,
) -> List[PageArtifact]:
    """Render PDF pages to PNG + optimized JPEGs and return metadata records."""

    if start_page < 1:
        raise ValueError("start_page must be >= 1")

    doc = fitz.open(pdf_path)
    total_pages = doc.page_count
    end = min(end_page, total_pages)
    if start_page > end:
        raise ValueError("start_page beyond document length")

    zoom = dpi / 72.0
    matrix = fitz.Matrix(zoom, zoom)

    records: List[PageArtifact] = []
    for page_number in tqdm(
        range(start_page - 1, end), desc="Rendering pages", unit="page"
    ):
        page = doc.load_page(page_number)
        pix = page.get_pixmap(matrix=matrix, alpha=False)

        basename = f"page_{page_number + 1:04d}"
        source_filename = f"{basename}_source.png"
        processed_filename = f"{basename}_processed.jpg"
        ocr_filename = f"{basename}_ocr.md"
        translation_filename = f"{basename}_translation.md"

        source_path = source_dir / source_filename
        source_path.write_bytes(pix.tobytes("png"))

        # Process with Pillow for contrast/size improvements without overblowing
        image = Image.open(source_path)
        grayscale = ImageOps.grayscale(image)
        balanced = ImageOps.autocontrast(grayscale, cutoff=1)
        enhancer = ImageEnhance.Contrast(balanced)
        processed = enhancer.enhance(1.15)
        width, height = processed.size
        if max(width, height) > max_dim:
            processed.thumbnail((max_dim, max_dim), resample=Image.LANCZOS)

        processed_path = processed_dir / processed_filename
        processed.save(
            processed_path,
            format="JPEG",
            quality=92,
            subsampling=0,
            optimize=True,
        )

        records.append(
            PageArtifact(
                page_number=page_number + 1,
                source_image=str(source_path.relative_to(source_dir.parent)),
                processed_image=str(processed_path.relative_to(processed_dir.parent)),
                ocr_text=str(
                    (source_dir.parent / "ocr_text" / ocr_filename).relative_to(
                        source_dir.parent
                    )
                ),
                translation_text=str(
                    (
                        source_dir.parent
                        / "translations"
                        / translation_filename
                    ).relative_to(source_dir.parent)
                ),
            )
        )

    doc.close()
    return records


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Render/prepare Marsilio Ficino's De mysteriis facsimile"
    )
    parser.add_argument("--pdf", type=Path, required=True)
    parser.add_argument("--base-dir", type=Path, required=True)
    parser.add_argument("--start", type=int, default=1)
    parser.add_argument("--end", type=int, default=1)
    parser.add_argument("--dpi", type=int, default=300)
    parser.add_argument("--max-dim", type=int, default=1900)
    parser.add_argument(
        "--metadata-json",
        type=Path,
        default=None,
        help="Optional path to append page metadata as JSON lines",
    )
    parser.add_argument(
        "--run-notes",
        type=str,
        default="",
        help="Freeform notes describing methods/prompts used this run",
    )
    parser.add_argument(
        "--prompt-file",
        type=Path,
        default=None,
        help="Optional file whose contents describe OCR/translation prompts",
    )
    parser.add_argument(
        "--prompt-text",
        type=str,
        default="",
        help="Inline prompt description to embed in the run log",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    source_dir = args.base_dir / "source_images"
    processed_dir = args.base_dir / "processed_images"
    ensure_dir(source_dir)
    ensure_dir(processed_dir)

    metadata_records = render_pdf_pages(
        pdf_path=args.pdf,
        source_dir=source_dir,
        processed_dir=processed_dir,
        start_page=args.start,
        end_page=args.end,
        dpi=args.dpi,
        max_dim=args.max_dim,
    )

    run_timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    prompt_blob = args.prompt_text.strip()
    if args.prompt_file and args.prompt_file.exists():
        prompt_text = args.prompt_file.read_text(encoding="utf-8").strip()
        prompt_blob = "\n".join(filter(None, [prompt_blob, prompt_text])).strip()

    write_run_log(
        base_dir=args.base_dir,
        timestamp=run_timestamp,
        args=args,
        metadata_records=metadata_records,
        run_notes=args.run_notes.strip(),
        prompt_blob=prompt_blob,
    )

    if args.metadata_json:
        ensure_dir(args.metadata_json.parent)
        with args.metadata_json.open("a", encoding="utf-8") as fh:
            for record in metadata_records:
                fh.write(json.dumps(asdict(record), ensure_ascii=False) + "\n")


def write_run_log(
    base_dir: Path,
    timestamp: str,
    args: argparse.Namespace,
    metadata_records: List[PageArtifact],
    run_notes: str,
    prompt_blob: str,
) -> None:
    """Persist a human-readable record describing this processing run."""

    run_dir = base_dir / "run_logs"
    ensure_dir(run_dir)
    log_path = run_dir / f"run_{timestamp}.txt"

    lines = [
        f"Run timestamp: {timestamp}",
        f"PDF: {args.pdf}",
        f"Pages: {args.start} - {args.end}",
        f"DPI: {args.dpi}",
        f"Max dimension: {args.max_dim}",
    ]

    if run_notes:
        lines.append("")
        lines.append("Run Notes:")
        lines.append(run_notes)

    if prompt_blob:
        lines.append("")
        lines.append("Prompts / Methodology:")
        lines.append(prompt_blob)

    lines.append("")
    lines.append("Files generated:")
    if not metadata_records:
        lines.append("- (no pages processed)")
    else:
        for record in metadata_records:
            lines.append(
                f"- Page {record.page_number:04d}: "
                f"source={record.source_image}, processed={record.processed_image}, "
                f"ocr={record.ocr_text}, translation={record.translation_text}"
            )

    log_path.write_text("\n".join(lines).strip() + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
