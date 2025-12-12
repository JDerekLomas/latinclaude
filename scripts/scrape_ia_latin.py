#!/usr/bin/env python3
"""
Scrape Internet Archive for Latin texts (1450-1700)

Uses IA's Scraping API which allows deep pagination beyond 10,000 results.
Stores results in Supabase for cross-referencing with ISTC/USTC/BPH.
"""

import os
import json
import time
import requests
from datetime import datetime
from pathlib import Path

try:
    from supabase import create_client, Client
except ImportError:
    import subprocess
    subprocess.run(["pip", "install", "supabase"], check=True)
    from supabase import create_client, Client

# Configuration
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "internet_archive"
BATCH_SIZE = 500

# Supabase config
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ykhxaecbbxaaqlujuzde.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlraHhhZWNiYnhhYXFsdWp1emRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjExMDEsImV4cCI6MjA4MDYzNzEwMX0.O2chfnHGQWLOaVSFQ-F6UJMlya9EzPbsUh848SEOPj4")

# IA Scrape API
SCRAPE_URL = "https://archive.org/services/search/v1/scrape"

def get_supabase_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def scrape_ia_latin(query: str, fields: list[str], max_items: int = None):
    """
    Scrape Internet Archive using their pagination API.

    Args:
        query: Search query (Lucene syntax)
        fields: Metadata fields to return
        max_items: Maximum items to retrieve (None = all)

    Yields:
        dict: Item metadata
    """
    params = {
        'q': query,
        'fields': ','.join(fields),
        'count': 1000,  # Max per request
    }

    cursor = None
    total_retrieved = 0

    while True:
        if cursor:
            params['cursor'] = cursor

        try:
            response = requests.get(SCRAPE_URL, params=params, timeout=60)
            response.raise_for_status()
            data = response.json()
        except requests.exceptions.RequestException as e:
            print(f"Request error: {e}")
            print("Waiting 30 seconds before retry...")
            time.sleep(30)
            continue
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            print(f"Response: {response.text[:500]}")
            break

        items = data.get('items', [])
        if not items:
            break

        for item in items:
            yield item
            total_retrieved += 1

            if max_items and total_retrieved >= max_items:
                return

        cursor = data.get('cursor')
        if not cursor:
            break

        # Rate limiting
        time.sleep(0.5)

        if total_retrieved % 1000 == 0:
            print(f"  Retrieved {total_retrieved:,} items...")

def transform_ia_item(item: dict) -> dict:
    """Transform IA item to our schema."""
    # Handle fields that might be lists
    def get_first(val):
        if isinstance(val, list):
            return val[0] if val else None
        return val

    def get_year(date_val):
        """Extract year from various date formats."""
        if not date_val:
            return None
        date_str = str(get_first(date_val))
        # Try to extract 4-digit year
        import re
        match = re.search(r'\b(1[4-9]\d{2}|20\d{2})\b', date_str)
        if match:
            return int(match.group(1))
        return None

    return {
        'identifier': item.get('identifier'),
        'title': get_first(item.get('title')),
        'creator': get_first(item.get('creator')),
        'date_raw': get_first(item.get('date')),
        'year': get_year(item.get('date')),
        'subject': item.get('subject') if isinstance(item.get('subject'), list) else [item.get('subject')] if item.get('subject') else [],
        'language': get_first(item.get('language')),
        'mediatype': get_first(item.get('mediatype')),
        'collection': item.get('collection') if isinstance(item.get('collection'), list) else [item.get('collection')] if item.get('collection') else [],
        'description': get_first(item.get('description'))[:2000] if item.get('description') else None,
        'downloads': item.get('downloads'),
        'item_size': item.get('item_size'),
    }

def upload_to_supabase(items: list, table: str = 'ia_latin_texts'):
    """Upload items to Supabase in batches."""
    client = get_supabase_client()

    uploaded = 0
    errors = 0

    for i in range(0, len(items), BATCH_SIZE):
        batch = items[i:i + BATCH_SIZE]

        try:
            # Upsert to handle duplicates
            result = client.table(table).upsert(batch, on_conflict='identifier').execute()
            uploaded += len(batch)

            if uploaded % 2000 == 0:
                print(f"  Uploaded {uploaded:,}/{len(items):,}")
        except Exception as e:
            print(f"  Error uploading batch {i}: {str(e)[:100]}")
            errors += len(batch)

    return uploaded, errors

def main():
    print("=" * 60)
    print("INTERNET ARCHIVE LATIN TEXTS SCRAPER")
    print("=" * 60)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Fields to retrieve
    fields = [
        'identifier', 'title', 'creator', 'date',
        'subject', 'language', 'mediatype', 'collection',
        'description', 'downloads', 'item_size'
    ]

    # Queries to run
    queries = [
        # Latin subject texts
        ('subject:Latin AND mediatype:texts', 'subject_latin'),
        # Language=Latin texts
        ('language:lat AND mediatype:texts', 'language_lat'),
        ('language:Latin AND mediatype:texts', 'language_latin'),
        # Early printed books collections
        ('collection:earlymoderntexts', 'earlymodern'),
        ('collection:incunabula', 'incunabula'),
    ]

    all_items = {}

    for query, label in queries:
        print(f"\n--- Scraping: {label} ---")
        print(f"Query: {query}")

        count = 0
        for item in scrape_ia_latin(query, fields):
            identifier = item.get('identifier')
            if identifier and identifier not in all_items:
                transformed = transform_ia_item(item)
                all_items[identifier] = transformed
                count += 1

        print(f"  Found {count:,} new items (total unique: {len(all_items):,})")
        time.sleep(2)  # Be nice between queries

    print(f"\n{'=' * 60}")
    print(f"TOTAL UNIQUE ITEMS: {len(all_items):,}")
    print("=" * 60)

    # Filter to 1450-1700 where we have dates
    early_modern = [
        item for item in all_items.values()
        if item['year'] and 1450 <= item['year'] <= 1700
    ]
    print(f"Items with dates 1450-1700: {len(early_modern):,}")

    # Save to JSON
    json_path = OUTPUT_DIR / f"ia_latin_{timestamp}.json"
    with open(json_path, 'w') as f:
        json.dump({
            'metadata': {
                'timestamp': timestamp,
                'total_items': len(all_items),
                'early_modern_items': len(early_modern),
                'queries': [q[0] for q in queries],
            },
            'items': list(all_items.values())
        }, f, indent=2)
    print(f"\nSaved to: {json_path}")

    # Upload to Supabase
    print(f"\n--- Uploading to Supabase ---")
    items_list = list(all_items.values())
    uploaded, errors = upload_to_supabase(items_list)
    print(f"Uploaded: {uploaded:,}, Errors: {errors:,}")

    # Summary stats
    print(f"\n{'=' * 60}")
    print("SUMMARY")
    print("=" * 60)

    # By language
    langs = {}
    for item in all_items.values():
        lang = item.get('language') or 'unknown'
        langs[lang] = langs.get(lang, 0) + 1

    print("\nTop languages:")
    for lang, count in sorted(langs.items(), key=lambda x: -x[1])[:10]:
        print(f"  {lang}: {count:,}")

    # By century (where dated)
    centuries = {}
    for item in all_items.values():
        year = item.get('year')
        if year:
            century = (year // 100) + 1
            centuries[century] = centuries.get(century, 0) + 1

    print("\nBy century:")
    for century in sorted(centuries.keys()):
        if 15 <= century <= 18:
            print(f"  {century}th c.: {centuries[century]:,}")

if __name__ == "__main__":
    main()
