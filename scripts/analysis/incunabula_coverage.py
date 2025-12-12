#!/usr/bin/env python3
"""
Incunabula Coverage Experiment

Randomly samples 100 Latin incunabula from ISTC and checks their availability in:
1. Internet Archive (via ia CLI/API)
2. HathiTrust (via API)
3. Google Books (via search)

This helps estimate digitization coverage for 15th-century Latin books.
"""

import csv
import json
import random
import time
import subprocess
import requests
from pathlib import Path
from datetime import datetime

# Configuration
ISTC_CSV = Path(__file__).parent.parent / "data" / "istc" / "istc_core_imprints.csv"
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "coverage_experiment"
SAMPLE_SIZE = 100
RANDOM_SEED = 42  # For reproducibility

def load_istc_latin_works():
    """Load all Latin works from ISTC CSV."""
    works = []
    with open(ISTC_CSV, 'r', encoding='utf-8-sig') as f:  # utf-8-sig handles BOM
        reader = csv.DictReader(f)
        for row in reader:
            # Filter for Latin works only
            if row.get('language_of_item', '').lower() == 'lat':
                # First column might have BOM prefix
                istc_id = row.get('', '') or row.get('\ufeff', '')
                works.append({
                    'istc_id': istc_id,
                    'author': row.get('author', ''),
                    'title': row.get('title', ''),
                    'date': row.get('date_of_item_single_date', ''),
                    'place': row.get('imprint_place', ''),
                    'printer': row.get('imprint_name', ''),
                    'language': row.get('language_of_item', ''),
                })
    return works

def random_sample(works, n=100, seed=42):
    """Take a random sample of n works."""
    random.seed(seed)
    return random.sample(works, min(n, len(works)))

def search_internet_archive(title, author=""):
    """Search Internet Archive for a work."""
    try:
        # Build search query
        query_parts = []
        if title:
            # Clean title for search
            clean_title = title.replace('"', '').replace(':', '')[:100]
            query_parts.append(f'title:"{clean_title}"')
        if author:
            clean_author = author.replace('"', '')[:50]
            query_parts.append(f'creator:"{clean_author}"')

        query = ' AND '.join(query_parts) if query_parts else title[:50]

        # Use Internet Archive's search API
        url = "https://archive.org/advancedsearch.php"
        params = {
            'q': query,
            'fl[]': ['identifier', 'title', 'creator', 'date', 'mediatype'],
            'rows': 5,
            'output': 'json'
        }

        response = requests.get(url, params=params, timeout=30)
        if response.status_code == 200:
            data = response.json()
            docs = data.get('response', {}).get('docs', [])
            return {
                'found': len(docs) > 0,
                'num_results': len(docs),
                'results': docs[:3]  # Keep top 3
            }
    except Exception as e:
        return {'found': False, 'error': str(e)}

    return {'found': False, 'num_results': 0}

def search_hathitrust(title, author=""):
    """Search HathiTrust catalog for a work."""
    try:
        # Build search query
        query_parts = []
        if title:
            clean_title = title.replace('"', '').replace(':', '')[:100]
            query_parts.append(clean_title)
        if author:
            clean_author = author.replace('"', '')[:50]
            query_parts.append(clean_author)

        query = ' '.join(query_parts)

        # Use HathiTrust's catalog API
        url = "https://catalog.hathitrust.org/api/volumes/brief/title/{}.json".format(
            requests.utils.quote(query[:100])
        )

        response = requests.get(url, timeout=30)
        if response.status_code == 200:
            data = response.json()
            items = data.get('items', [])
            return {
                'found': len(items) > 0,
                'num_results': len(items),
                'results': items[:3]
            }
    except Exception as e:
        # Try alternative search endpoint
        try:
            url = f"https://babel.hathitrust.org/cgi/ls?field1=ocr;q1={requests.utils.quote(query[:50])};a=srchls;lmt=ft"
            response = requests.get(url, timeout=30)
            # Just check if we got a response - full parsing would need HTML
            return {'found': False, 'searched': True, 'error': str(e)}
        except:
            pass
        return {'found': False, 'error': str(e)}

    return {'found': False, 'num_results': 0}

def search_google_books(title, author=""):
    """Search Google Books API for a work."""
    try:
        query_parts = []
        if title:
            clean_title = title.replace('"', '')[:80]
            query_parts.append(f'intitle:{clean_title}')
        if author:
            clean_author = author.replace('"', '')[:40]
            query_parts.append(f'inauthor:{clean_author}')

        query = '+'.join(query_parts) if query_parts else title[:50]

        url = "https://www.googleapis.com/books/v1/volumes"
        params = {
            'q': query,
            'maxResults': 5,
            'printType': 'books'
        }

        response = requests.get(url, params=params, timeout=30)
        if response.status_code == 200:
            data = response.json()
            items = data.get('items', [])
            return {
                'found': len(items) > 0,
                'num_results': data.get('totalItems', 0),
                'results': [
                    {
                        'title': item.get('volumeInfo', {}).get('title'),
                        'authors': item.get('volumeInfo', {}).get('authors', []),
                        'link': item.get('volumeInfo', {}).get('infoLink')
                    }
                    for item in items[:3]
                ]
            }
    except Exception as e:
        return {'found': False, 'error': str(e)}

    return {'found': False, 'num_results': 0}

def run_experiment():
    """Run the full coverage experiment."""
    print("=" * 60)
    print("INCUNABULA DIGITIZATION COVERAGE EXPERIMENT")
    print("=" * 60)
    print(f"\nLoading ISTC data from: {ISTC_CSV}")

    # Load data
    all_works = load_istc_latin_works()
    print(f"Found {len(all_works):,} Latin works in ISTC")

    # Sample
    sample = random_sample(all_works, SAMPLE_SIZE, RANDOM_SEED)
    print(f"Random sample: {len(sample)} works (seed={RANDOM_SEED})")

    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Results storage
    results = []
    ia_found = 0
    ht_found = 0
    gb_found = 0

    print("\n" + "-" * 60)
    print("Searching databases...")
    print("-" * 60)

    for i, work in enumerate(sample):
        print(f"\n[{i+1}/{len(sample)}] {work['istc_id']}: {work['title'][:50]}...")

        result = {
            'istc_id': work['istc_id'],
            'author': work['author'],
            'title': work['title'],
            'date': work['date'],
            'place': work['place'],
            'printer': work['printer'],
        }

        # Search Internet Archive
        ia_result = search_internet_archive(work['title'], work['author'])
        result['internet_archive'] = ia_result
        if ia_result.get('found'):
            ia_found += 1
            print(f"  ✓ Internet Archive: {ia_result.get('num_results', 0)} results")
        else:
            print(f"  ✗ Internet Archive: not found")

        # Rate limit
        time.sleep(0.5)

        # Search HathiTrust
        ht_result = search_hathitrust(work['title'], work['author'])
        result['hathitrust'] = ht_result
        if ht_result.get('found'):
            ht_found += 1
            print(f"  ✓ HathiTrust: {ht_result.get('num_results', 0)} results")
        else:
            print(f"  ✗ HathiTrust: not found")

        # Rate limit
        time.sleep(0.5)

        # Search Google Books
        gb_result = search_google_books(work['title'], work['author'])
        result['google_books'] = gb_result
        if gb_result.get('found'):
            gb_found += 1
            print(f"  ✓ Google Books: {gb_result.get('num_results', 0)} results")
        else:
            print(f"  ✗ Google Books: not found")

        results.append(result)

        # Rate limit between works
        time.sleep(1)

    # Summary
    print("\n" + "=" * 60)
    print("RESULTS SUMMARY")
    print("=" * 60)
    print(f"\nSample size: {len(sample)} Latin incunabula")
    print(f"\nDigitization coverage estimates:")
    print(f"  Internet Archive: {ia_found}/{len(sample)} ({ia_found/len(sample)*100:.1f}%)")
    print(f"  HathiTrust:       {ht_found}/{len(sample)} ({ht_found/len(sample)*100:.1f}%)")
    print(f"  Google Books:     {gb_found}/{len(sample)} ({gb_found/len(sample)*100:.1f}%)")

    # Any source
    any_found = sum(1 for r in results if
                   r['internet_archive'].get('found') or
                   r['hathitrust'].get('found') or
                   r['google_books'].get('found'))
    print(f"\n  ANY source:       {any_found}/{len(sample)} ({any_found/len(sample)*100:.1f}%)")

    # Save results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Full JSON
    json_path = OUTPUT_DIR / f"coverage_results_{timestamp}.json"
    with open(json_path, 'w') as f:
        json.dump({
            'metadata': {
                'timestamp': timestamp,
                'sample_size': len(sample),
                'random_seed': RANDOM_SEED,
                'source': str(ISTC_CSV)
            },
            'summary': {
                'internet_archive': {'found': ia_found, 'pct': ia_found/len(sample)*100},
                'hathitrust': {'found': ht_found, 'pct': ht_found/len(sample)*100},
                'google_books': {'found': gb_found, 'pct': gb_found/len(sample)*100},
                'any_source': {'found': any_found, 'pct': any_found/len(sample)*100}
            },
            'results': results
        }, f, indent=2)
    print(f"\nFull results saved to: {json_path}")

    # Summary CSV
    csv_path = OUTPUT_DIR / f"coverage_summary_{timestamp}.csv"
    with open(csv_path, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['istc_id', 'author', 'title', 'date', 'ia_found', 'ht_found', 'gb_found', 'any_found'])
        for r in results:
            writer.writerow([
                r['istc_id'],
                r['author'][:50],
                r['title'][:80],
                r['date'],
                r['internet_archive'].get('found', False),
                r['hathitrust'].get('found', False),
                r['google_books'].get('found', False),
                r['internet_archive'].get('found') or r['hathitrust'].get('found') or r['google_books'].get('found')
            ])
    print(f"Summary CSV saved to: {csv_path}")

    return results

if __name__ == "__main__":
    run_experiment()
