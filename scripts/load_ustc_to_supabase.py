#!/usr/bin/env python3
"""
Load USTC data into Supabase.

Usage:
    export SUPABASE_URL="https://xxx.supabase.co"
    export SUPABASE_KEY="your-anon-key"
    python load_ustc_to_supabase.py

This script loads the Universal Short Title Catalogue (1.6M editions from 1450-1700).
"""

import os
import csv
import json
from pathlib import Path
from datetime import datetime

try:
    from supabase import create_client, Client
except ImportError:
    print("Installing supabase-py...")
    import subprocess
    subprocess.run(["pip", "install", "supabase"], check=True)
    from supabase import create_client, Client

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Configuration
USTC_CSV = Path(__file__).parent.parent / "data" / "ustc" / "ustc_editions.csv"
BATCH_SIZE = 1000  # Larger batches for efficiency
MAX_ROWS = None  # Set to a number to limit (e.g., 10000 for testing)

def get_supabase_client() -> Client:
    """Create Supabase client from environment variables."""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")

    if not url or not key:
        raise ValueError(
            "Please set SUPABASE_URL and SUPABASE_KEY environment variables.\n"
            "You can find these in your Supabase project settings > API."
        )

    return create_client(url, key)

def parse_year(year_str: str) -> int | None:
    """Parse USTC year string to integer."""
    if not year_str:
        return None

    # Try direct conversion
    try:
        year = int(year_str)
        if 1400 <= year <= 1800:
            return year
    except ValueError:
        pass

    # Try to extract a 4-digit year
    import re
    match = re.search(r'\b(1[4-7]\d{2})\b', str(year_str))
    if match:
        return int(match.group(1))

    return None

def transform_row(row: dict) -> dict:
    """Transform a CSV row to match Supabase schema."""
    # Parse year
    year = parse_year(row.get('year', ''))

    # Parse ID as integer
    try:
        edition_id = int(row.get('id', 0))
    except ValueError:
        edition_id = None

    if not edition_id:
        return None

    # Parse serial number
    try:
        sn = int(row.get('sn', 0)) if row.get('sn', '').isdigit() else None
    except ValueError:
        sn = None

    # Parse boolean fields (integers in Access)
    female_author = row.get('female_author', '') == '1'
    female_printer = row.get('female_printer', '') == '1'

    return {
        'id': edition_id,
        'status': row.get('status', '') or None,
        'type': row.get('type', '') or None,
        'sn': sn,

        # Authors (simplified - keep first 3)
        'author_1': row.get('author_name_1', '') or None,
        'author_role_1': row.get('author_role_1', '') or None,
        'author_2': row.get('author_name_2', '') or None,
        'author_3': row.get('author_name_3', '') or None,

        # Title and imprint
        'title': row.get('std_title', '') or None,
        'imprint': row.get('std_imprint', '') or None,
        'colophon': row.get('std_colophon', '') or None,

        # Location
        'country': row.get('country', '') or None,
        'region': row.get('region', '') or None,
        'place': row.get('place', '') or None,

        # Printers (simplified - keep first 2)
        'printer_1': row.get('printer_name_1', '') or None,
        'printer_2': row.get('printer_name_2', '') or None,

        # Date and format
        'year': year,
        'format': row.get('format', '') or None,
        'pagination': row.get('pagination', '') or None,
        'signatures': row.get('signatures', '') or None,

        # Classifications (up to 4)
        'classification_1': row.get('classification_1', '') or None,
        'classification_2': row.get('classification_2', '') or None,
        'classification_3': row.get('classification_3', '') or None,
        'classification_4': row.get('classification_4', '') or None,

        # Languages (up to 4)
        'language_1': row.get('language_1', '') or None,
        'language_2': row.get('language_2', '') or None,
        'language_3': row.get('language_3', '') or None,
        'language_4': row.get('language_4', '') or None,

        # Flags
        'female_author': female_author,
        'female_printer': female_printer,
    }

def load_ustc_data():
    """Load USTC CSV and prepare for upload."""
    editions = []
    skipped = 0

    print(f"Reading {USTC_CSV}...")
    with open(USTC_CSV, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            if MAX_ROWS and i >= MAX_ROWS:
                break

            try:
                edition = transform_row(row)
                if edition and edition['id']:
                    editions.append(edition)
                else:
                    skipped += 1
            except Exception as e:
                skipped += 1
                if skipped <= 10:
                    print(f"Error processing row {i}: {e}")
                continue

            if (i + 1) % 100000 == 0:
                print(f"  Processed {i+1:,} rows...")

    print(f"Loaded {len(editions):,} editions (skipped {skipped:,})")
    return editions

def upload_to_supabase(editions: list):
    """Upload editions to Supabase in batches."""
    client = get_supabase_client()

    # Deduplicate by ID (keep first occurrence)
    seen_ids = set()
    unique_editions = []
    for edition in editions:
        if edition['id'] and edition['id'] not in seen_ids:
            seen_ids.add(edition['id'])
            unique_editions.append(edition)

    print(f"\nUploading {len(unique_editions):,} unique editions to Supabase...")
    print(f"Batch size: {BATCH_SIZE}")

    uploaded = 0
    errors = 0
    error_samples = []

    for i in range(0, len(unique_editions), BATCH_SIZE):
        batch = unique_editions[i:i + BATCH_SIZE]

        try:
            result = client.table('ustc_editions').insert(batch).execute()
            uploaded += len(batch)

            if (i + BATCH_SIZE) % 50000 == 0 or i + BATCH_SIZE >= len(unique_editions):
                print(f"  Uploaded {uploaded:,}/{len(unique_editions):,} ({100*uploaded/len(unique_editions):.1f}%)")
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
    result = client.table('ustc_editions').select('id', count='exact').execute()
    total = result.count

    # Count Latin
    result = client.table('ustc_editions').select('id', count='exact').eq('language_1', 'Latin').execute()
    latin = result.count

    # Sample queries
    print("\n" + "=" * 50)
    print("VERIFICATION")
    print("=" * 50)
    print(f"Total editions in Supabase: {total:,}")
    print(f"Latin editions: {latin:,}")

    # Sample record
    sample = client.table('ustc_editions').select('*').limit(1).execute()
    if sample.data:
        print(f"\nSample record:")
        print(json.dumps(sample.data[0], indent=2, default=str))

def main():
    print("=" * 50)
    print("USTC -> SUPABASE LOADER")
    print("=" * 50)

    # Check if CSV exists
    if not USTC_CSV.exists():
        print(f"\nError: CSV file not found at {USTC_CSV}")
        print("Please run: mdb-export 'USTC Editions July 2025.accdb' 'USTC Editions July 2025' > ustc_editions.csv")
        return

    # Load data
    editions = load_ustc_data()

    # Upload
    upload_to_supabase(editions)

    # Verify
    verify_upload()

if __name__ == "__main__":
    main()
