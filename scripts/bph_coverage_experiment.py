#!/usr/bin/env python3
"""
BPH Coverage Experiment

Samples 100 works from BPH (1400-1500) and checks:
1. Coverage in Internet Archive, HathiTrust, Google Books
2. Cross-reference with ISTC and USTC in Supabase
"""

import json
import random
import time
import os
import requests
from pathlib import Path
from datetime import datetime

try:
    from supabase import create_client, Client
except ImportError:
    import subprocess
    subprocess.run(["pip", "install", "supabase"], check=True)
    from supabase import create_client, Client

# Configuration
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "coverage_experiment"
SAMPLE_SIZE = 100

# Supabase config
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ykhxaecbbxaaqlujuzde.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlraHhhZWNiYnhhYXFsdWp1emRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjExMDEsImV4cCI6MjA4MDYzNzEwMX0.O2chfnHGQWLOaVSFQ-F6UJMlya9EzPbsUh848SEOPj4")

def get_supabase_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def sample_bph_1400_1500(n=100, seed=2024):
    """Sample n works from BPH dated 1400-1500."""
    client = get_supabase_client()

    # Get all BPH works from 1400-1500
    result = client.table('bph_works').select('*').gte('year', 1400).lte('year', 1500).execute()
    works = result.data

    print(f"BPH works 1400-1500: {len(works)}")

    if len(works) == 0:
        return []

    # Random sample
    random.seed(seed)
    sample = random.sample(works, min(n, len(works)))

    return sample

def search_internet_archive(title, author=""):
    """Search Internet Archive for a work."""
    try:
        query_parts = []
        if title:
            clean_title = title.replace('"', '').replace(':', '')[:100]
            query_parts.append(f'title:"{clean_title}"')
        if author:
            clean_author = author.replace('"', '')[:50]
            query_parts.append(f'creator:"{clean_author}"')

        query = ' AND '.join(query_parts) if query_parts else title[:50]

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
                'results': docs[:3]
            }
    except Exception as e:
        return {'found': False, 'error': str(e)}

    return {'found': False, 'num_results': 0, 'results': []}

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

    return {'found': False, 'num_results': 0, 'results': []}

def search_istc(title, author=""):
    """Search ISTC in Supabase for matching work."""
    client = get_supabase_client()

    try:
        # Search by title (first 50 chars)
        clean_title = title[:50] if title else ""
        result = client.table('istc_works').select('id, author, title, date_single, place').ilike('title', f'%{clean_title[:30]}%').limit(5).execute()

        if result.data:
            return {
                'found': True,
                'num_results': len(result.data),
                'results': result.data[:3]
            }
    except Exception as e:
        return {'found': False, 'error': str(e)}

    return {'found': False, 'num_results': 0, 'results': []}

def search_ustc(title, author=""):
    """Search USTC in Supabase for matching work."""
    client = get_supabase_client()

    try:
        # Search by title (first 50 chars)
        clean_title = title[:50] if title else ""
        result = client.table('ustc_editions').select('id, author_1, title, year, place').ilike('title', f'%{clean_title[:30]}%').limit(5).execute()

        if result.data:
            return {
                'found': True,
                'num_results': len(result.data),
                'results': result.data[:3]
            }
    except Exception as e:
        return {'found': False, 'error': str(e)}

    return {'found': False, 'num_results': 0, 'results': []}

def main():
    print("=" * 60)
    print("BPH COVERAGE EXPERIMENT")
    print("15th Century Works (1400-1500)")
    print("=" * 60)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Sample from BPH
    print("\n--- Sampling from BPH (1400-1500) ---")
    works = sample_bph_1400_1500(SAMPLE_SIZE, seed=2024)
    print(f"Sampled {len(works)} works")

    if len(works) == 0:
        print("No works found in date range!")
        return

    # Run searches
    results = []
    ia_found = 0
    gb_found = 0
    istc_found = 0
    ustc_found = 0

    print(f"\n{'=' * 60}")
    print(f"Searching {len(works)} BPH works...")
    print('=' * 60)

    for i, work in enumerate(works):
        title = work.get('title', '')
        author = work.get('author', '')

        print(f"\n[{i+1}/{len(works)}] {work.get('year')}: {title[:50]}...")

        result = {
            'bph_id': work.get('id'),
            'ubn': work.get('ubn'),
            'author': author,
            'title': title,
            'year': work.get('year'),
            'place': work.get('place'),
            'keywords': work.get('keywords'),
        }

        # Search Internet Archive
        ia_result = search_internet_archive(title, author)
        result['internet_archive'] = ia_result
        if ia_result.get('found'):
            ia_found += 1
            print(f"  [IA] {ia_result.get('num_results', 0)} results")
        else:
            print(f"  [IA] not found")

        time.sleep(0.3)

        # Search Google Books
        gb_result = search_google_books(title, author)
        result['google_books'] = gb_result
        if gb_result.get('found'):
            gb_found += 1
            print(f"  [GB] {gb_result.get('num_results', 0)} results")
        else:
            print(f"  [GB] not found")

        time.sleep(0.3)

        # Search ISTC
        istc_result = search_istc(title, author)
        result['istc'] = istc_result
        if istc_result.get('found'):
            istc_found += 1
            print(f"  [ISTC] {istc_result.get('num_results', 0)} matches")
        else:
            print(f"  [ISTC] no match")

        # Search USTC
        ustc_result = search_ustc(title, author)
        result['ustc'] = ustc_result
        if ustc_result.get('found'):
            ustc_found += 1
            print(f"  [USTC] {ustc_result.get('num_results', 0)} matches")
        else:
            print(f"  [USTC] no match")

        results.append(result)
        time.sleep(0.5)

    # Calculate any_found
    any_digital = sum(1 for r in results if
                   r['internet_archive'].get('found') or
                   r['google_books'].get('found'))

    any_catalog = sum(1 for r in results if
                   r['istc'].get('found') or
                   r['ustc'].get('found'))

    # Print summary
    print("\n" + "=" * 60)
    print("FINAL RESULTS")
    print("=" * 60)

    print(f"\nBPH 15th century works sampled: {len(works)}")
    print(f"\nDigitization Coverage:")
    print(f"  Internet Archive: {ia_found}/{len(works)} ({100*ia_found/len(works):.1f}%)")
    print(f"  Google Books:     {gb_found}/{len(works)} ({100*gb_found/len(works):.1f}%)")
    print(f"  ANY digital:      {any_digital}/{len(works)} ({100*any_digital/len(works):.1f}%)")

    print(f"\nCatalog Cross-Reference:")
    print(f"  In ISTC:          {istc_found}/{len(works)} ({100*istc_found/len(works):.1f}%)")
    print(f"  In USTC:          {ustc_found}/{len(works)} ({100*ustc_found/len(works):.1f}%)")
    print(f"  In either:        {any_catalog}/{len(works)} ({100*any_catalog/len(works):.1f}%)")

    # Save results
    output = {
        'metadata': {
            'timestamp': timestamp,
            'source': 'BPH 1400-1500',
            'sample_size': len(works),
            'seed': 2024
        },
        'summary': {
            'internet_archive': {'found': ia_found, 'pct': 100*ia_found/len(works)},
            'google_books': {'found': gb_found, 'pct': 100*gb_found/len(works)},
            'any_digital': {'found': any_digital, 'pct': 100*any_digital/len(works)},
            'istc': {'found': istc_found, 'pct': 100*istc_found/len(works)},
            'ustc': {'found': ustc_found, 'pct': 100*ustc_found/len(works)},
            'any_catalog': {'found': any_catalog, 'pct': 100*any_catalog/len(works)},
        },
        'results': results
    }

    json_path = OUTPUT_DIR / f"bph_coverage_{timestamp}.json"
    with open(json_path, 'w') as f:
        json.dump(output, f, indent=2)
    print(f"\nResults saved to: {json_path}")

if __name__ == "__main__":
    main()
