#!/usr/bin/env python3
"""Supabase-connected worker for the digitizer pipeline.

This script polls the `digitizer_jobs` table for queued uploads, downloads the
PDF from Supabase storage, runs the local processing script, and pushes the
output PNG/JPG/Markdown files back to Supabase. Use it inside GitHub Actions or
another long-running worker.  Requires the Python dependencies already used in
this repo (PyMuPDF, Pillow, tqdm, supabase-py).
"""

from __future__ import annotations

import argparse
import json
import os
import tempfile
from pathlib import Path
from typing import Dict, List

from supabase import Client, create_client

REQUIRED_ENV = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_DIGITIZER_BUCKET",
    "SUPABASE_PAGE_IMAGES_BUCKET",
    "SUPABASE_PAGE_TEXT_BUCKET",
]

DIGITIZER_SCRIPT = Path("scripts/de_mysteriis_processing.py")
BASE_DIR = Path("data/marsilio_ficino_de_mysteriis")


def ensure_env() -> None:
    missing = [key for key in REQUIRED_ENV if not os.environ.get(key)]
    if missing:
        raise RuntimeError(f"Missing environment variables: {', '.join(missing)}")


def get_client() -> Client:
    return create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])


def fetch_next_job(client: Client) -> Dict | None:
    response = client.table("digitizer_jobs").select("*").eq("status", "queued").order("created_at").limit(1).execute()
    if not response.data:
        return None
    return response.data[0]


def download_pdf(client: Client, job: Dict, target_path: Path) -> None:
    bucket = os.environ["SUPABASE_DIGITIZER_BUCKET"]
    storage_res = client.storage.from_(bucket).download(job["storage_path"])
    target_path.write_bytes(storage_res)


def run_processing(pdf_path: Path, start: int, end: int) -> None:
    cmd = [
        "python",
        str(DIGITIZER_SCRIPT),
        "--pdf",
        str(pdf_path),
        "--base-dir",
        str(BASE_DIR),
        "--start",
        str(start),
        "--end",
        str(end),
        "--dpi",
        "350",
        "--run-notes",
        "Supabase worker batch",
    ]
    os.system(" ".join(cmd))


def upload_page_assets(client: Client, job_id: str, page_number: int) -> None:
    meta_file = BASE_DIR / "page_metadata.jsonl"
    targets = []
    for line in meta_file.read_text().splitlines():
        record = json.loads(line)
        if record["page_number"] == page_number:
            targets.append(record)
    if not targets:
        return

    images_bucket = os.environ["SUPABASE_PAGE_IMAGES_BUCKET"]
    text_bucket = os.environ["SUPABASE_PAGE_TEXT_BUCKET"]

    for record in targets:
        source_path = BASE_DIR / record["source_image"]
        processed_path = BASE_DIR / record["processed_image"]
        ocr_path = BASE_DIR / record["ocr_text"]
        translation_path = BASE_DIR / record["translation_text"]

        def upload_file(bucket: str, file_path: Path) -> str:
            storage_path = f"jobs/{job_id}/page_{page_number:04d}/{file_path.name}"
            client.storage.from_(bucket).upload(storage_path, file_path.read_bytes(), file_options={"cacheControl": "3600", "upsert": True})
            url = client.storage.from_(bucket).get_public_url(storage_path)
            return url

        source_url = upload_file(images_bucket, source_path)
        processed_url = upload_file(images_bucket, processed_path)
        ocr_url = upload_file(text_bucket, ocr_path)
        translation_url = upload_file(text_bucket, translation_path)

        client.table("digitizer_pages").upsert(
            {
                "job_id": job_id,
                "page_number": page_number,
                "source_url": source_url,
                "processed_url": processed_url,
                "ocr_url": ocr_url,
                "translation_url": translation_url,
            }
        ).execute()


def mark_job(client: Client, job_id: str, status: str, error: str | None = None) -> None:
    client.table("digitizer_jobs").update({"status": status, "error": error}).eq("id", job_id).execute()


def main(range_start: int, range_end: int) -> None:
    ensure_env()
    client = get_client()
    job = fetch_next_job(client)
    if not job:
        print("No queued jobs.")
        return

    print(f"Processing job {job['id']} ({job['original_name']})")
    tmp_dir = Path(tempfile.mkdtemp())
    pdf_path = tmp_dir / job["original_name"]
    try:
        download_pdf(client, job, pdf_path)
        run_processing(pdf_path, range_start, range_end)
        for page_number in range(range_start, range_end + 1):
            upload_page_assets(client, job["id"], page_number)
        mark_job(client, job["id"], "completed")
    except Exception as exc:  # noqa: BLE001
        print("Digitizer worker error", exc)
        mark_job(client, job["id"], "failed", str(exc))
    finally:
        for child in tmp_dir.iterdir():
            child.unlink()
        tmp_dir.rmdir()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run digitizer worker batch")
    parser.add_argument("--start", type=int, default=1, help="Start page")
    parser.add_argument("--end", type=int, default=10, help="End page")
    args = parser.parse_args()
    main(args.start, args.end)
