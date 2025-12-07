#!/usr/bin/env python3
"""
Coverage Experiment v2

Samples 100 works from ISTC and 100 from USTC (via Supabase),
then checks digitization coverage in:
1. Internet Archive (via API)
2. HathiTrust (via Solr API)
3. Google Books (via API)

Fixes HathiTrust search from v1.
"""

import json
import random
import time
import os
import requests
from pathlib import Path
from datetime import datetime

# Try to load supabase
try:
    from supabase import create_client, Client
except ImportError:
    print("Installing supabase-py...")
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

def sample_istc_from_supabase(n=100, seed=123):
    """Sample n Latin works from ISTC in Supabase."""
    client = get_supabase_client()

    # Get total count of Latin works
    result = client.table('istc_works').select('id', count='exact').eq('language', 'lat').execute()
    total = result.count
    print(f"ISTC Latin works in Supabase: {total:,}")

    # Generate random offsets
    random.seed(seed)
    offsets = random.sample(range(total), min(n, total))

    works = []
    for offset in offsets:
        result = client.table('istc_works').select('id, author, title, date_single, place, printer').eq('language', 'lat').range(offset, offset).execute()
        if result.data:
            work = result.data[0]
            works.append({
                'id': work['id'],
                'author': work.get('author') or '',
                'title': work.get('title') or '',
                'date': str(work.get('date_single') or ''),
                'place': work.get('place') or '',
                'printer': work.get('printer') or '',
                'source': 'ISTC'
            })

    return works

def sample_ustc_from_supabase(n=100, seed=456):
    """Sample n Latin editions from USTC in Supabase."""
    client = get_supabase_client()

    # Get total count of Latin editions
    result = client.table('ustc_editions').select('id', count='exact').eq('language_1', 'Latin').limit(1).execute()
    total = result.count
    print(f"USTC Latin editions in Supabase: {total:,}")

    # Generate random offsets
    random.seed(seed)
    offsets = random.sample(range(min(total, 100000)), min(n, total))  # Limit to first 100k for speed

    works = []
    for offset in offsets:
        result = client.table('ustc_editions').select('id, author_1, title, year, place, printer_1').eq('language_1', 'Latin').range(offset, offset).execute()
        if result.data:
            work = result.data[0]
            works.append({
                'id': str(work['id']),
                'author': work.get('author_1') or '',
                'title': work.get('title') or '',
                'date': str(work.get('year') or ''),
                'place': work.get('place') or '',
                'printer': work.get('printer_1') or '',
                'source': 'USTC'
            })

    return works

def search_internet_archive(title, author=""):
    """Search Internet Archive for a work."""
    try:
        # Build search query
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

def search_hathitrust(title, author=""):
    """Search HathiTrust using their Solr-based catalog search."""
    try:
        # Use HathiTrust's full-text search API
        # Format: https://catalog.hathitrust.org/api/volumes/full/title/TITLE.json

        # Clean and truncate title
        clean_title = title.replace('"', '').replace(':', '').replace('/', ' ')[:80]

        # Try the bibliographic API first
        url = f"https://catalog.hathitrust.org/api/volumes/brief/title/{requests.utils.quote(clean_title)}.json"

        response = requests.get(url, timeout=30)
        if response.status_code == 200:
            data = response.json()
            records = data.get('records', {})
            items = data.get('items', [])

            if records or items:
                return {
                    'found': True,
                    'num_results': len(records) if records else len(items),
                    'results': list(records.values())[:3] if records else items[:3]
                }

        # Try OCLC number search if we have one
        # Fallback: try a broader search with just first few words
        words = clean_title.split()[:4]
        short_query = ' '.join(words)

        url2 = f"https://catalog.hathitrust.org/api/volumes/brief/title/{requests.utils.quote(short_query)}.json"
        response2 = requests.get(url2, timeout=30)

        if response2.status_code == 200:
            data2 = response2.json()
            records2 = data2.get('records', {})
            items2 = data2.get('items', [])

            if records2 or items2:
                return {
                    'found': True,
                    'num_results': len(records2) if records2 else len(items2),
                    'results': list(records2.values())[:3] if records2 else items2[:3]
                }

    except Exception as e:
        return {'found': False, 'error': str(e), 'num_results': 0, 'results': []}

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

def run_experiment_on_sample(works, source_name):
    """Run coverage experiment on a list of works."""
    results = []
    ia_found = 0
    ht_found = 0
    gb_found = 0

    print(f"\n{'=' * 60}")
    print(f"Searching {len(works)} {source_name} works...")
    print('=' * 60)

    for i, work in enumerate(works):
        print(f"\n[{i+1}/{len(works)}] {work['id']}: {work['title'][:50]}...")

        result = {
            'id': work['id'],
            'author': work['author'],
            'title': work['title'],
            'date': work['date'],
            'place': work['place'],
            'printer': work['printer'],
            'source': work['source']
        }

        # Search Internet Archive
        ia_result = search_internet_archive(work['title'], work['author'])
        result['internet_archive'] = ia_result
        if ia_result.get('found'):
            ia_found += 1
            print(f"  [IA] {ia_result.get('num_results', 0)} results")
        else:
            print(f"  [IA] not found")

        time.sleep(0.3)

        # Search HathiTrust
        ht_result = search_hathitrust(work['title'], work['author'])
        result['hathitrust'] = ht_result
        if ht_result.get('found'):
            ht_found += 1
            print(f"  [HT] {ht_result.get('num_results', 0)} results")
        else:
            print(f"  [HT] not found")

        time.sleep(0.3)

        # Search Google Books
        gb_result = search_google_books(work['title'], work['author'])
        result['google_books'] = gb_result
        if gb_result.get('found'):
            gb_found += 1
            print(f"  [GB] {gb_result.get('num_results', 0)} results")
        else:
            print(f"  [GB] not found")

        results.append(result)
        time.sleep(0.5)

    # Calculate any_found
    any_found = sum(1 for r in results if
                   r['internet_archive'].get('found') or
                   r['hathitrust'].get('found') or
                   r['google_books'].get('found'))

    summary = {
        'source': source_name,
        'sample_size': len(works),
        'internet_archive': {'found': ia_found, 'pct': ia_found/len(works)*100 if works else 0},
        'hathitrust': {'found': ht_found, 'pct': ht_found/len(works)*100 if works else 0},
        'google_books': {'found': gb_found, 'pct': gb_found/len(works)*100 if works else 0},
        'any_source': {'found': any_found, 'pct': any_found/len(works)*100 if works else 0}
    }

    return results, summary

def main():
    print("=" * 60)
    print("COVERAGE EXPERIMENT V2")
    print("ISTC + USTC from Supabase, Fixed HathiTrust")
    print("=" * 60)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Sample from ISTC (new seed for fresh sample)
    print("\n--- Sampling from ISTC ---")
    istc_works = sample_istc_from_supabase(SAMPLE_SIZE, seed=2024)
    print(f"Sampled {len(istc_works)} ISTC works")

    # Sample from USTC
    print("\n--- Sampling from USTC ---")
    ustc_works = sample_ustc_from_supabase(SAMPLE_SIZE, seed=2025)
    print(f"Sampled {len(ustc_works)} USTC works")

    # Run experiments
    istc_results, istc_summary = run_experiment_on_sample(istc_works, "ISTC")
    ustc_results, ustc_summary = run_experiment_on_sample(ustc_works, "USTC")

    # Print summaries
    print("\n" + "=" * 60)
    print("FINAL RESULTS")
    print("=" * 60)

    for name, summary in [("ISTC (15th c.)", istc_summary), ("USTC (1450-1700)", ustc_summary)]:
        print(f"\n{name} - {summary['sample_size']} Latin works:")
        print(f"  Internet Archive: {summary['internet_archive']['found']}/{summary['sample_size']} ({summary['internet_archive']['pct']:.1f}%)")
        print(f"  HathiTrust:       {summary['hathitrust']['found']}/{summary['sample_size']} ({summary['hathitrust']['pct']:.1f}%)")
        print(f"  Google Books:     {summary['google_books']['found']}/{summary['sample_size']} ({summary['google_books']['pct']:.1f}%)")
        print(f"  ANY source:       {summary['any_source']['found']}/{summary['sample_size']} ({summary['any_source']['pct']:.1f}%)")

    # Save results
    output = {
        'metadata': {
            'timestamp': timestamp,
            'version': 2,
            'istc_seed': 2024,
            'ustc_seed': 2025
        },
        'istc': {
            'summary': istc_summary,
            'results': istc_results
        },
        'ustc': {
            'summary': ustc_summary,
            'results': ustc_results
        }
    }

    json_path = OUTPUT_DIR / f"coverage_v2_{timestamp}.json"
    with open(json_path, 'w') as f:
        json.dump(output, f, indent=2)
    print(f"\nResults saved to: {json_path}")

if __name__ == "__main__":
    main()
