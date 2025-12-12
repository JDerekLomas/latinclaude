#!/usr/bin/env python3
"""
Improved BPH-IA Matching with Multiple Strategies

Uses fuzzy matching, substring matching, author+keyword matching,
and n-gram matching to find BPH works in Internet Archive.

The key insight from manual verification:
- Works often appear in anthologies with different titles
- IA titles are often much longer than BPH titles
- The BPH title appears as a SUBSTRING of the IA title
"""

import os
import re
import json
from datetime import datetime
from pathlib import Path
from collections import defaultdict

try:
    from rapidfuzz import fuzz, process
except ImportError:
    import subprocess
    subprocess.run(["pip", "install", "rapidfuzz"], check=True)
    from rapidfuzz import fuzz, process

try:
    from supabase import create_client, Client
except ImportError:
    import subprocess
    subprocess.run(["pip", "install", "supabase"], check=True)
    from supabase import create_client, Client

# Configuration
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "fuzzy_matching"
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ykhxaecbbxaaqlujuzde.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlraHhhZWNiYnhhYXFsdWp1emRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjExMDEsImV4cCI6MjA4MDYzNzEwMX0.O2chfnHGQWLOaVSFQ-F6UJMlya9EzPbsUh848SEOPj4")

# Matching thresholds
FUZZY_THRESHOLD = 80  # Minimum similarity score for fuzzy match
SUBSTRING_MIN_LENGTH = 15  # Minimum title length for substring matching


def get_supabase_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def normalize_title(title: str) -> str:
    """Normalize a title for comparison."""
    if not title:
        return ""
    # Lowercase
    t = title.lower()
    # Remove punctuation
    t = re.sub(r'[^\w\s]', ' ', t)
    # Normalize whitespace
    t = ' '.join(t.split())
    # Handle ae/æ variations
    t = t.replace('æ', 'ae').replace('œ', 'oe')
    return t


def extract_significant_words(title: str, min_length: int = 4) -> set:
    """Extract significant words (not stopwords) from a title."""
    stopwords = {
        'de', 'in', 'ad', 'et', 'ex', 'pro', 'per', 'cum', 'ab', 'a',
        'the', 'of', 'and', 'or', 'to', 'from', 'by', 'with', 'for',
        'liber', 'libri', 'libro', 'opus', 'opera', 'tractatus', 'summa',
        'von', 'und', 'der', 'die', 'das', 'des', 'dem', 'den', 'ein', 'eine'
    }

    normalized = normalize_title(title)
    words = normalized.split()
    return {w for w in words if len(w) >= min_length and w not in stopwords}


def load_bph_latin_works(limit: int = None) -> list:
    """Load BPH Latin works from Supabase."""
    client = get_supabase_client()

    print("Loading BPH Latin works...")

    # Get works where detected_language is Latin
    all_works = []
    offset = 0
    batch_size = 1000

    while True:
        result = client.table('bph_works').select(
            'id, title, author, year, ubn'
        ).eq('detected_language', 'Latin').range(offset, offset + batch_size - 1).execute()

        if not result.data:
            break

        all_works.extend(result.data)
        offset += batch_size

        if limit and len(all_works) >= limit:
            all_works = all_works[:limit]
            break

    print(f"  Loaded {len(all_works)} Latin works from BPH")
    return all_works


def load_ia_latin_works() -> list:
    """Load Internet Archive Latin works from Supabase."""
    client = get_supabase_client()

    print("Loading IA Latin works...")

    all_works = []
    offset = 0
    batch_size = 1000

    while True:
        result = client.table('ia_latin_texts').select(
            'identifier, title, creator, year'
        ).range(offset, offset + batch_size - 1).execute()

        if not result.data:
            break

        all_works.extend(result.data)
        offset += batch_size

        # Progress
        if offset % 10000 == 0:
            print(f"    {offset}...")

    print(f"  Loaded {len(all_works)} Latin works from IA")
    return all_works


def build_ia_indices(ia_works: list) -> dict:
    """Build multiple indices for efficient matching."""
    print("Building IA indices...")

    indices = {
        'by_normalized_title': {},  # normalized title -> [works]
        'by_author': defaultdict(list),  # author surname -> [works]
        'by_words': defaultdict(list),  # significant word -> [works]
        'all_titles': [],  # list of (normalized_title, work)
    }

    for work in ia_works:
        title = work.get('title', '')
        creator = work.get('creator', '')

        # Normalized title
        norm_title = normalize_title(title)
        if norm_title:
            if norm_title not in indices['by_normalized_title']:
                indices['by_normalized_title'][norm_title] = []
            indices['by_normalized_title'][norm_title].append(work)
            indices['all_titles'].append((norm_title, work))

        # Author index (extract surname)
        if creator:
            # Try to get the surname (last name)
            surnames = re.findall(r'\b([A-Z][a-z]+)\b', creator)
            for surname in surnames:
                indices['by_author'][surname.lower()].append(work)

        # Word index
        for word in extract_significant_words(title):
            indices['by_words'][word].append(work)

    print(f"  Indexed {len(indices['by_normalized_title'])} unique normalized titles")
    print(f"  Indexed {len(indices['by_author'])} author surnames")
    print(f"  Indexed {len(indices['by_words'])} significant words")

    return indices


def match_exact_prefix(bph_title: str, ia_indices: dict, prefix_len: int = 50) -> list:
    """Original prefix matching approach."""
    norm_bph = normalize_title(bph_title)
    prefix = norm_bph[:prefix_len]

    matches = []
    for norm_ia, work in ia_indices['all_titles']:
        if norm_ia.startswith(prefix):
            matches.append({
                'method': 'exact_prefix',
                'score': 100,
                'ia_work': work
            })

    return matches[:5]


def match_substring(bph_title: str, ia_indices: dict) -> list:
    """Check if BPH title appears as substring in IA title."""
    norm_bph = normalize_title(bph_title)

    if len(norm_bph) < SUBSTRING_MIN_LENGTH:
        return []

    # Use significant words to narrow candidates
    bph_words = extract_significant_words(bph_title)

    if not bph_words:
        return []

    # Find candidates that share at least 2 significant words
    candidates = defaultdict(int)
    for word in bph_words:
        for work in ia_indices['by_words'].get(word, []):
            candidates[work['identifier']] += 1

    # Filter to those with 2+ shared words
    strong_candidates = [
        work_id for work_id, count in candidates.items()
        if count >= min(2, len(bph_words))
    ]

    matches = []
    for norm_ia, work in ia_indices['all_titles']:
        if work['identifier'] not in strong_candidates:
            continue

        # Check if BPH title appears in IA title
        if norm_bph in norm_ia:
            matches.append({
                'method': 'substring',
                'score': 95,
                'ia_work': work
            })

    return matches[:5]


def match_fuzzy(bph_title: str, ia_indices: dict) -> list:
    """Fuzzy matching using rapidfuzz."""
    norm_bph = normalize_title(bph_title)

    if len(norm_bph) < 10:
        return []

    # Use word index to narrow candidates
    bph_words = extract_significant_words(bph_title)

    candidates = defaultdict(int)
    for word in bph_words:
        for work in ia_indices['by_words'].get(word, []):
            candidates[work['identifier']] += 1

    # Get candidates with at least 1 shared word
    candidate_works = []
    for norm_ia, work in ia_indices['all_titles']:
        if work['identifier'] in candidates:
            candidate_works.append((norm_ia, work))

    if not candidate_works:
        return []

    # Fuzzy match against candidates only
    matches = []
    for norm_ia, work in candidate_works:
        # Use token_set_ratio for better handling of word order differences
        score = fuzz.token_set_ratio(norm_bph, norm_ia)
        if score >= FUZZY_THRESHOLD:
            matches.append({
                'method': 'fuzzy',
                'score': score,
                'ia_work': work
            })

    # Sort by score and take top 5
    matches.sort(key=lambda x: x['score'], reverse=True)
    return matches[:5]


def match_author_title(bph_work: dict, ia_indices: dict) -> list:
    """Match by author + partial title."""
    author = bph_work.get('author', '')
    title = bph_work.get('title', '')

    if not author or not title:
        return []

    # Extract author surname
    surnames = re.findall(r'\b([A-Z][a-z]+)\b', author)
    if not surnames:
        return []

    matches = []
    for surname in surnames:
        surname_lower = surname.lower()
        if surname_lower not in ia_indices['by_author']:
            continue

        # Check each work by this author
        for work in ia_indices['by_author'][surname_lower]:
            ia_title = work.get('title', '')
            norm_bph = normalize_title(title)
            norm_ia = normalize_title(ia_title)

            # Check for significant overlap
            score = fuzz.token_set_ratio(norm_bph, norm_ia)
            if score >= 60:  # Lower threshold since we have author match
                matches.append({
                    'method': 'author_title',
                    'score': score,
                    'ia_work': work
                })

    matches.sort(key=lambda x: x['score'], reverse=True)
    return matches[:5]


def find_matches(bph_work: dict, ia_indices: dict) -> dict:
    """Apply all matching strategies and return best matches."""
    title = bph_work.get('title', '')

    all_matches = []

    # Strategy 1: Exact prefix (original method)
    prefix_matches = match_exact_prefix(title, ia_indices)
    all_matches.extend(prefix_matches)

    # Strategy 2: Substring matching
    substring_matches = match_substring(title, ia_indices)
    all_matches.extend(substring_matches)

    # Strategy 3: Fuzzy matching
    fuzzy_matches = match_fuzzy(title, ia_indices)
    all_matches.extend(fuzzy_matches)

    # Strategy 4: Author + title
    author_matches = match_author_title(bph_work, ia_indices)
    all_matches.extend(author_matches)

    # Deduplicate by IA identifier
    seen = set()
    unique_matches = []
    for match in all_matches:
        ia_id = match['ia_work'].get('identifier', match['ia_work'].get('id'))
        if ia_id not in seen:
            seen.add(ia_id)
            unique_matches.append(match)

    # Sort by score
    unique_matches.sort(key=lambda x: x['score'], reverse=True)

    return {
        'bph_work': bph_work,
        'matches': unique_matches[:5],
        'best_method': unique_matches[0]['method'] if unique_matches else None,
        'best_score': unique_matches[0]['score'] if unique_matches else 0,
        'found': len(unique_matches) > 0
    }


def main():
    print("=" * 70)
    print("BPH-IA IMPROVED MATCHING WITH FUZZY SEARCH")
    print("=" * 70)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Load data
    bph_works = load_bph_latin_works()
    ia_works = load_ia_latin_works()

    # Build indices
    ia_indices = build_ia_indices(ia_works)

    # Match BPH works
    print("\n" + "=" * 70)
    print("MATCHING BPH WORKS TO IA...")
    print("=" * 70)

    results = []
    method_counts = defaultdict(int)

    matched = 0
    for i, bph_work in enumerate(bph_works):
        result = find_matches(bph_work, ia_indices)
        results.append(result)

        if result['found']:
            matched += 1
            method_counts[result['best_method']] += 1

        # Progress
        if (i + 1) % 500 == 0:
            print(f"  Processed {i + 1}/{len(bph_works)} - {matched} matched ({100*matched/(i+1):.1f}%)")

    # Calculate statistics
    total = len(bph_works)

    print("\n" + "=" * 70)
    print("RESULTS")
    print("=" * 70)

    print(f"\nTotal BPH Latin works: {total}")
    print(f"Matched in IA:         {matched} ({100*matched/total:.1f}%)")
    print(f"Not found:             {total - matched} ({100*(total-matched)/total:.1f}%)")

    print("\nMatches by method:")
    for method, count in sorted(method_counts.items(), key=lambda x: -x[1]):
        print(f"  {method}: {count} ({100*count/matched:.1f}% of matches)")

    # Century breakdown
    print("\nBy century:")
    century_stats = defaultdict(lambda: {'total': 0, 'matched': 0})
    for r in results:
        year = r['bph_work'].get('year')
        if year:
            century = f"{(year // 100) + 1}th"
            century_stats[century]['total'] += 1
            if r['found']:
                century_stats[century]['matched'] += 1

    for century in sorted(century_stats.keys()):
        stats = century_stats[century]
        pct = 100 * stats['matched'] / stats['total'] if stats['total'] > 0 else 0
        print(f"  {century}: {stats['matched']}/{stats['total']} ({pct:.1f}%)")

    # Save detailed results
    output = {
        'metadata': {
            'timestamp': timestamp,
            'bph_latin_works': total,
            'ia_latin_works': len(ia_works),
            'fuzzy_threshold': FUZZY_THRESHOLD,
        },
        'summary': {
            'matched': matched,
            'matched_pct': 100 * matched / total,
            'not_found': total - matched,
            'methods': dict(method_counts),
            'by_century': {k: dict(v) for k, v in century_stats.items()}
        },
        # Only save a sample of results (full results would be huge)
        'sample_matches': [
            {
                'bph_title': r['bph_work'].get('title'),
                'bph_author': r['bph_work'].get('author'),
                'bph_year': r['bph_work'].get('year'),
                'ia_title': r['matches'][0]['ia_work'].get('title') if r['matches'] else None,
                'ia_identifier': r['matches'][0]['ia_work'].get('identifier') if r['matches'] else None,
                'method': r['best_method'],
                'score': r['best_score']
            }
            for r in results[:100] if r['found']
        ]
    }

    json_path = OUTPUT_DIR / f"fuzzy_match_results_{timestamp}.json"
    with open(json_path, 'w') as f:
        json.dump(output, f, indent=2)
    print(f"\nResults saved to: {json_path}")

    # Print some example matches
    print("\n" + "=" * 70)
    print("SAMPLE MATCHES")
    print("=" * 70)

    for r in results[:20]:
        if r['found']:
            bph = r['bph_work']
            match = r['matches'][0]
            print(f"\nBPH: {bph.get('title', '')[:60]}...")
            print(f"  IA: {match['ia_work'].get('title', '')[:60]}...")
            print(f"  Method: {match['method']}, Score: {match['score']}")


if __name__ == "__main__":
    main()
