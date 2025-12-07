#!/usr/bin/env python3
"""
Load BPH (Bibliotheca Philosophica Hermetica) catalog into Supabase.

The BPH is the Embassy of the Free Mind's collection of esoteric/hermetic texts.
~28,000 works spanning 1469-present, with ~4,000 pre-1700.
"""

import os
import csv
import json
import re
from pathlib import Path
from datetime import datetime

try:
    from supabase import create_client, Client
except ImportError:
    print("Installing supabase-py...")
    import subprocess
    subprocess.run(["pip", "install", "supabase"], check=True)
    from supabase import create_client, Client

# Configuration
BPH_CSV = Path("/Users/dereklomas/Downloads/BibliotheekExportTest.csv")
BATCH_SIZE = 500

# Supabase config
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ykhxaecbbxaaqlujuzde.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlraHhhZWNiYnhhYXFsdWp1emRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjExMDEsImV4cCI6MjA4MDYzNzEwMX0.O2chfnHGQWLOaVSFQ-F6UJMlya9EzPbsUh848SEOPj4")

def get_supabase_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def parse_year(year_str: str) -> int | None:
    """Parse BPH year string to integer."""
    if not year_str:
        return None

    # Extract 4-digit year (1400-2099)
    match = re.search(r'\b(1[4-9]\d{2}|20\d{2})\b', str(year_str))
    if match:
        return int(match.group(1))

    return None

def transform_row(row: dict) -> dict | None:
    """Transform a CSV row to match Supabase schema."""
    uuid = row.get('uuid', '').strip()
    title = row.get('Title', '').strip()

    if not uuid or not title:
        return None

    year = parse_year(row.get('Year of publication', ''))

    return {
        'id': uuid,
        'ubn': row.get('UBN', '').strip() or None,
        'title': title,
        'parallel_title': row.get('Parallel title', '').strip() or None,
        'uniform_title': row.get('Uniform title', '').strip() or None,
        'author': row.get('Author', '').strip() or None,
        'variant_author': row.get("Variant author's name", '').strip() or None,
        'pseudonym': row.get('Pseudonym', '').strip() or None,
        'editor': row.get('Editor', '').strip() or None,
        'place': row.get('Place of publication', '').strip() or None,
        'printer': row.get('Printer', '').strip() or None,
        'publisher': row.get('Publisher', '').strip() or None,
        'year_raw': row.get('Year of publication', '').strip() or None,
        'year': year,
        'keywords': row.get('Keywords', '').strip() or None,
        'language': row.get('Language', '').strip() or None,
        'shelf_mark': row.get('Shelf mark', '').strip() or None,
        'series_title': row.get('Series title', '').strip() or None,
        'location': row.get('Present location', '').strip() or None,
        'object_size': row.get('Object size in cm', '').strip() or None,
        'binding': row.get('Binding', '').strip() or None,
        'provenance': row.get('Provenance', '').strip() or None,
        'remarks': row.get('Remarks', '').strip() or None,
        'bibliography': row.get('Bibliography', '').strip() or None,
        'status': row.get('Status', '').strip() or None,
    }

def load_bph_data():
    """Load BPH CSV and prepare for upload."""
    works = []
    skipped = 0

    print(f"Reading {BPH_CSV}...")
    with open(BPH_CSV, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            try:
                work = transform_row(row)
                if work:
                    works.append(work)
                else:
                    skipped += 1
            except Exception as e:
                skipped += 1
                if skipped <= 5:
                    print(f"Error processing row {i}: {e}")

    print(f"Loaded {len(works):,} works (skipped {skipped:,})")
    return works

def upload_to_supabase(works: list):
    """Upload works to Supabase in batches."""
    client = get_supabase_client()

    # Deduplicate by ID
    seen_ids = set()
    unique_works = []
    for work in works:
        if work['id'] not in seen_ids:
            seen_ids.add(work['id'])
            unique_works.append(work)

    print(f"\nUploading {len(unique_works):,} unique works to Supabase...")
    print(f"Batch size: {BATCH_SIZE}")

    uploaded = 0
    errors = 0
    error_samples = []

    for i in range(0, len(unique_works), BATCH_SIZE):
        batch = unique_works[i:i + BATCH_SIZE]

        try:
            result = client.table('bph_works').insert(batch).execute()
            uploaded += len(batch)

            if (i + BATCH_SIZE) % 5000 == 0 or i + BATCH_SIZE >= len(unique_works):
                print(f"  Uploaded {uploaded:,}/{len(unique_works):,} ({100*uploaded/len(unique_works):.1f}%)")
        except Exception as e:
            error_msg = str(e)
            if len(error_samples) < 5:
                error_samples.append(f"Batch {i}: {error_msg[:100]}")
            errors += len(batch)

    print(f"\nDone! Uploaded: {uploaded:,}, Errors: {errors:,}")

    if error_samples:
        print("\nSample errors:")
        for err in error_samples:
            print(f"  {err}")

    return uploaded, errors

def verify_upload():
    """Verify the upload by querying Supabase."""
    client = get_supabase_client()

    # Count total
    result = client.table('bph_works').select('id', count='exact').limit(1).execute()
    total = result.count

    # Count pre-1700
    result = client.table('bph_works').select('id', count='exact').lte('year', 1700).execute()
    pre_1700 = result.count

    # Count by keyword
    print("\n" + "=" * 50)
    print("VERIFICATION")
    print("=" * 50)
    print(f"Total works in Supabase: {total:,}")
    print(f"Pre-1700 works: {pre_1700:,}")

    # Sample record
    sample = client.table('bph_works').select('*').limit(1).execute()
    if sample.data:
        print(f"\nSample record:")
        print(json.dumps(sample.data[0], indent=2, default=str))

def main():
    print("=" * 50)
    print("BPH (Bibliotheca Philosophica Hermetica) -> SUPABASE")
    print("Embassy of the Free Mind Collection")
    print("=" * 50)

    if not BPH_CSV.exists():
        print(f"\nError: CSV file not found at {BPH_CSV}")
        return

    # Load data
    works = load_bph_data()

    # Upload
    upload_to_supabase(works)

    # Verify
    verify_upload()

if __name__ == "__main__":
    main()
