#!/usr/bin/env python3
"""
Load HathiTrust HathiFiles into Supabase.

The HathiFiles is a tab-delimited file with metadata for every item in HathiTrust.
Download from: https://www.hathitrust.org/member-libraries/resources-for-librarians/data-resources/hathifiles/

Expected file: data/hathitrust/hathi_full_YYYYMMDD.txt.gz
"""

import os
import gzip
import re
from pathlib import Path
from datetime import datetime

try:
    from supabase import create_client, Client
except ImportError:
    import subprocess
    subprocess.run(["pip", "install", "supabase"], check=True)
    from supabase import create_client, Client

# Configuration
DATA_DIR = Path(__file__).parent.parent / "data" / "hathitrust"
BATCH_SIZE = 1000

# Supabase config
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ykhxaecbbxaaqlujuzde.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlraHhhZWNiYnhhYXFsdWp1emRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjExMDEsImV4cCI6MjA4MDYzNzEwMX0.O2chfnHGQWLOaVSFQ-F6UJMlya9EzPbsUh848SEOPj4")

# HathiFiles column order (from hathifiles description)
# https://www.hathitrust.org/member-libraries/resources-for-librarians/data-resources/hathifiles/hathifiles-description/
COLUMNS = [
    'htid',           # 0: HathiTrust ID (e.g., mdp.39015000000001)
    'access',         # 1: Access rights (allow, deny)
    'rights',         # 2: Rights code
    'ht_bib_key',     # 3: HathiTrust bibliographic record key
    'description',    # 4: Volume/issue description
    'source',         # 5: Source of digitization (e.g., google)
    'source_bib_num', # 6: Source bibliographic number
    'oclc_num',       # 7: OCLC number(s), comma-separated
    'isbn',           # 8: ISBN(s), comma-separated
    'issn',           # 9: ISSN(s), comma-separated
    'lccn',           # 10: LCCN
    'title',          # 11: Title
    'imprint',        # 12: Imprint (publisher, date, place)
    'rights_reason_code',  # 13: Rights reason
    'rights_timestamp',    # 14: Rights determination date
    'us_gov_doc_flag',     # 15: US government document flag
    'rights_date_used',    # 16: Date used for rights determination
    'pub_place',      # 17: Publication place code
    'lang',           # 18: Language code
    'bib_fmt',        # 19: Bibliographic format
    'collection_code',# 20: Collection code
    'content_provider_code',  # 21: Content provider
    'responsible_entity_code',# 22: Responsible entity
    'digitization_agent_code',# 23: Digitization agent
    'access_profile_code',    # 24: Access profile
    'author',         # 25: Author (added later, may not be in all files)
]

def get_supabase_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def find_hathifile():
    """Find the most recent hathi_full file in data directory."""
    files = list(DATA_DIR.glob("hathi_full_*.txt.gz"))
    if not files:
        # Also check for uncompressed
        files = list(DATA_DIR.glob("hathi_full_*.txt"))

    if not files:
        return None

    # Sort by name (date) descending
    files.sort(reverse=True)
    return files[0]

def parse_year(date_str: str) -> int | None:
    """Extract year from various date formats."""
    if not date_str:
        return None

    # Try to find 4-digit year
    match = re.search(r'\b(1[4-9]\d{2}|20\d{2})\b', str(date_str))
    if match:
        return int(match.group(1))
    return None

def parse_row(line: str) -> dict | None:
    """Parse a tab-delimited row into a dict."""
    parts = line.strip().split('\t')

    if len(parts) < 19:  # Minimum columns needed
        return None

    htid = parts[0] if len(parts) > 0 else None
    if not htid:
        return None

    # Extract year from imprint field
    imprint = parts[12] if len(parts) > 12 else ''
    year = parse_year(imprint)

    # Also try rights_date_used
    if not year and len(parts) > 16:
        year = parse_year(parts[16])

    return {
        'htid': htid,
        'access': parts[1] if len(parts) > 1 else None,
        'rights': parts[2] if len(parts) > 2 else None,
        'ht_bib_key': parts[3] if len(parts) > 3 else None,
        'description': parts[4][:500] if len(parts) > 4 and parts[4] else None,
        'source': parts[5] if len(parts) > 5 else None,
        'oclc_num': parts[7] if len(parts) > 7 else None,
        'isbn': parts[8] if len(parts) > 8 else None,
        'lccn': parts[10] if len(parts) > 10 else None,
        'title': parts[11][:1000] if len(parts) > 11 and parts[11] else None,
        'imprint': parts[12][:500] if len(parts) > 12 and parts[12] else None,
        'year': year,
        'pub_place': parts[17] if len(parts) > 17 else None,
        'lang': parts[18] if len(parts) > 18 else None,
        'bib_fmt': parts[19] if len(parts) > 19 else None,
        'author': parts[25][:500] if len(parts) > 25 and parts[25] else None,
    }

def load_hathifile(filepath: Path, limit: int = None, latin_only: bool = False):
    """Load and parse the HathiFile."""
    items = []
    skipped = 0

    print(f"Loading {filepath}...")

    opener = gzip.open if str(filepath).endswith('.gz') else open

    with opener(filepath, 'rt', encoding='utf-8', errors='replace') as f:
        for i, line in enumerate(f):
            if i == 0 and line.startswith('htid'):
                # Skip header
                continue

            try:
                item = parse_row(line)
                if item:
                    # Filter for Latin if requested
                    if latin_only and item.get('lang') != 'lat':
                        continue

                    items.append(item)
                else:
                    skipped += 1
            except Exception as e:
                skipped += 1
                if skipped <= 5:
                    print(f"  Error row {i}: {str(e)[:50]}")

            if limit and len(items) >= limit:
                break

            if i > 0 and i % 500000 == 0:
                print(f"  Processed {i:,} rows, kept {len(items):,}...")

    print(f"Loaded {len(items):,} items (skipped {skipped:,})")
    return items

def upload_to_supabase(items: list, table: str = 'hathitrust_items'):
    """Upload items to Supabase in batches."""
    client = get_supabase_client()

    uploaded = 0
    errors = 0

    print(f"\nUploading {len(items):,} items to Supabase...")

    for i in range(0, len(items), BATCH_SIZE):
        batch = items[i:i + BATCH_SIZE]

        try:
            result = client.table(table).upsert(batch, on_conflict='htid').execute()
            uploaded += len(batch)

            if uploaded % 50000 == 0:
                print(f"  Uploaded {uploaded:,}/{len(items):,} ({100*uploaded/len(items):.1f}%)")
        except Exception as e:
            errors += len(batch)
            if errors <= 5 * BATCH_SIZE:
                print(f"  Error batch {i}: {str(e)[:100]}")

    print(f"Done! Uploaded: {uploaded:,}, Errors: {errors:,}")
    return uploaded, errors

def main():
    print("=" * 60)
    print("HATHITRUST HATHIFILES -> SUPABASE")
    print("=" * 60)

    # Find the file
    hathifile = find_hathifile()
    if not hathifile:
        print(f"\nNo hathi_full_*.txt.gz file found in {DATA_DIR}")
        print("Download from: https://www.hathitrust.org/member-libraries/resources-for-librarians/data-resources/hathifiles/")
        return

    print(f"Found: {hathifile}")
    print(f"Size: {hathifile.stat().st_size / 1e9:.2f} GB")

    # Option: Load only Latin texts (much smaller)
    import sys
    latin_only = '--latin' in sys.argv
    limit = None

    for arg in sys.argv:
        if arg.startswith('--limit='):
            limit = int(arg.split('=')[1])

    if latin_only:
        print("\n*** Loading LATIN texts only (lang=lat) ***")
    if limit:
        print(f"*** Limiting to {limit:,} items ***")

    # Load data
    items = load_hathifile(hathifile, limit=limit, latin_only=latin_only)

    if not items:
        print("No items loaded!")
        return

    # Print stats
    print("\n" + "=" * 40)
    print("STATISTICS")
    print("=" * 40)

    # By access
    access_counts = {}
    for item in items:
        acc = item.get('access') or 'unknown'
        access_counts[acc] = access_counts.get(acc, 0) + 1
    print("\nBy access:")
    for acc, count in sorted(access_counts.items(), key=lambda x: -x[1]):
        print(f"  {acc}: {count:,}")

    # By language (top 10)
    lang_counts = {}
    for item in items:
        lang = item.get('lang') or 'unknown'
        lang_counts[lang] = lang_counts.get(lang, 0) + 1
    print("\nTop languages:")
    for lang, count in sorted(lang_counts.items(), key=lambda x: -x[1])[:10]:
        print(f"  {lang}: {count:,}")

    # By century
    century_counts = {}
    for item in items:
        year = item.get('year')
        if year and 1400 <= year <= 2025:
            century = (year // 100) + 1
            century_counts[century] = century_counts.get(century, 0) + 1
    print("\nBy century:")
    for century in sorted(century_counts.keys()):
        if 15 <= century <= 21:
            print(f"  {century}th c.: {century_counts[century]:,}")

    # Early modern count
    early_modern = sum(1 for item in items if item.get('year') and 1450 <= item['year'] <= 1700)
    print(f"\nEarly modern (1450-1700): {early_modern:,}")

    # Upload
    uploaded, errors = upload_to_supabase(items)

    print("\n" + "=" * 60)
    print("COMPLETE")
    print("=" * 60)
    print(f"Total uploaded: {uploaded:,}")
    if errors:
        print(f"Errors: {errors:,}")

if __name__ == "__main__":
    main()
