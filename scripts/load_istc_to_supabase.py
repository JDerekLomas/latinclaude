#!/usr/bin/env python3
"""
Load ISTC data into Supabase.

Usage:
    export SUPABASE_URL="https://xxx.supabase.co"
    export SUPABASE_KEY="your-anon-key"
    python load_istc_to_supabase.py

Or create a .env file with these values.
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
ISTC_CSV = Path(__file__).parent.parent / "data" / "istc" / "istc_core_imprints.csv"
BATCH_SIZE = 500

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

def parse_date(date_str: str) -> dict:
    """Parse ISTC date string into components."""
    result = {
        'date_single': None,
        'date_from': None,
        'date_to': None,
        'date_display': date_str
    }

    if not date_str:
        return result

    # Try to extract year
    import re
    years = re.findall(r'\b(14\d{2}|15\d{2})\b', str(date_str))
    if years:
        result['date_single'] = int(years[0])
        if len(years) > 1:
            result['date_from'] = int(years[0])
            result['date_to'] = int(years[-1])

    return result

def transform_row(row: dict) -> dict:
    """Transform a CSV row to match Supabase schema."""
    # Handle BOM in first column
    istc_id = row.get('', '') or row.get('\ufeff', '')

    # Parse date
    date_info = parse_date(row.get('date_of_item_single_date', ''))

    # Parse coordinates - handle edge cases
    lat = row.get('lat', '').strip()
    lon = row.get('lon', '').strip()

    try:
        latitude = float(lat) if lat and lat not in ['', ' ', 'unknown'] else None
    except ValueError:
        latitude = None

    try:
        longitude = float(lon) if lon and lon not in ['', ' ', 'unknown'] else None
    except ValueError:
        longitude = None

    return {
        'id': istc_id,
        'author': row.get('author', '') or None,
        'title': row.get('title', ''),
        'date_single': date_info['date_single'],
        'date_display': row.get('imprint_date', ''),
        'dimensions': row.get('dimensions', '') or None,
        'material_type': row.get('material_type', '') or None,
        'has_woodcuts': row.get('woodcut', '').lower() == 'true',
        'language': row.get('language_of_item', '') or None,
        'printer': row.get('imprint_name', '') or None,
        'place': row.get('imprint_place', '') or None,
        'country_code': row.get('imprint_country_code', '') or None,
        'latitude': latitude,
        'longitude': longitude,
        'geonames_id': int(row.get('geonames_id', 0)) if row.get('geonames_id', '').isdigit() else None,
        'notes': row.get('notes', '') or None,
        'cataloguing_level': row.get('cataloguing_level', '') or None,
    }

def load_istc_data():
    """Load ISTC CSV and prepare for upload."""
    works = []

    print(f"Reading {ISTC_CSV}...")
    with open(ISTC_CSV, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                work = transform_row(row)
                if work['id'] and work['title']:
                    works.append(work)
            except Exception as e:
                print(f"Error processing row: {e}")
                continue

    print(f"Loaded {len(works):,} works")
    return works

def upload_to_supabase(works: list):
    """Upload works to Supabase in batches."""
    client = get_supabase_client()

    # Deduplicate by ID (keep first occurrence)
    seen_ids = set()
    unique_works = []
    for work in works:
        if work['id'] and work['id'] not in seen_ids:
            seen_ids.add(work['id'])
            unique_works.append(work)

    print(f"\nUploading {len(unique_works):,} unique works to Supabase (removed {len(works) - len(unique_works)} duplicates)...")
    print(f"Batch size: {BATCH_SIZE}")

    uploaded = 0
    errors = 0

    for i in range(0, len(unique_works), BATCH_SIZE):
        batch = unique_works[i:i + BATCH_SIZE]

        try:
            # Use insert instead of upsert
            result = client.table('istc_works').insert(batch).execute()
            uploaded += len(batch)
            print(f"  Uploaded {uploaded:,}/{len(unique_works):,} ({100*uploaded/len(unique_works):.1f}%)")
        except Exception as e:
            print(f"  Error in batch {i}-{i+BATCH_SIZE}: {e}")
            errors += len(batch)

    print(f"\nDone! Uploaded: {uploaded:,}, Errors: {errors}")
    return uploaded, errors

def verify_upload():
    """Verify the upload by querying Supabase."""
    client = get_supabase_client()

    # Count total
    result = client.table('istc_works').select('id', count='exact').execute()
    total = result.count

    # Count Latin
    result = client.table('istc_works').select('id', count='exact').eq('language', 'lat').execute()
    latin = result.count

    # Sample queries
    print("\n" + "=" * 50)
    print("VERIFICATION")
    print("=" * 50)
    print(f"Total works in Supabase: {total:,}")
    print(f"Latin works: {latin:,}")

    # Sample record
    sample = client.table('istc_works').select('*').limit(1).execute()
    if sample.data:
        print(f"\nSample record:")
        print(json.dumps(sample.data[0], indent=2, default=str))

def main():
    print("=" * 50)
    print("ISTC -> SUPABASE LOADER")
    print("=" * 50)

    # Load data
    works = load_istc_data()

    # Upload
    upload_to_supabase(works)

    # Verify
    verify_upload()

if __name__ == "__main__":
    main()
