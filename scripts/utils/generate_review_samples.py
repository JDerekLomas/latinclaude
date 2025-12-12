#!/usr/bin/env python3
"""
Generate stratified random samples for human review.

Creates CSV files for manual validation of:
1. Latin language detection accuracy
2. Match quality at different confidence tiers
3. "Not found" verification (are they really missing?)

Output: CSV files ready for human annotation.
"""

import os
import json
import random
import csv
from datetime import datetime
from pathlib import Path
from collections import defaultdict

from supabase import create_client

# Configuration
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "human_review"
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ykhxaecbbxaaqlujuzde.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlraHhhZWNiYnhhYXFsdWp1emRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjExMDEsImV4cCI6MjA4MDYzNzEwMX0.O2chfnHGQWLOaVSFQ-F6UJMlya9EzPbsUh848SEOPj4")

# Sample sizes (n=12 per category gives ~44% CI width at 95% confidence)
# Trade-off: Smaller sample = faster review, wider confidence intervals
SAMPLES_PER_CATEGORY = 12

random.seed(42)  # Reproducibility


def get_supabase_client():
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def load_bph_works(year_min=1400, year_max=1700):
    """Load BPH Latin works from the target period."""
    client = get_supabase_client()

    all_works = []
    offset = 0

    while True:
        result = client.table('bph_works').select(
            'id, title, author, year, ubn, detected_language'
        ).eq('detected_language', 'Latin').gte('year', year_min).lte('year', year_max).range(offset, offset + 999).execute()

        if not result.data:
            break
        all_works.extend(result.data)
        offset += 1000

    return all_works


def sample_for_latin_validation(works, n=SAMPLES_PER_CATEGORY):
    """
    Sample works for validating Latin language detection.

    Question: Is this work actually in Latin?
    """
    # Stratify by century
    by_century = defaultdict(list)
    for w in works:
        if w.get('year'):
            century = (w['year'] // 100) + 1
            by_century[century].append(w)

    samples = []
    per_century = max(1, n // len(by_century))

    for century, century_works in sorted(by_century.items()):
        sample = random.sample(century_works, min(per_century, len(century_works)))
        for w in sample:
            samples.append({
                'id': w['id'],
                'title': w['title'],
                'author': w.get('author', ''),
                'year': w.get('year', ''),
                'century': f"{century}th",
                'ubn': w.get('ubn', ''),
                'catalog_url': f"https://embassyofthefreemind.com/en/library/online-catalogue/detail/{w.get('ubn', '')}",
                # Human fills in:
                'is_latin': '',  # Yes / No / Partial / Uncertain
                'actual_language': '',  # If not Latin, what is it?
                'notes': ''
            })

    return samples[:n]


def sample_matches_for_validation(match_results_path, n_per_tier=SAMPLES_PER_CATEGORY):
    """
    Sample matches at different confidence tiers for validation.

    Question: Is this a true match (same work)?
    """
    # We need to regenerate matches with full data for sampling
    # For now, load from results file if available

    samples = {
        'high_confidence': [],      # title + author + year
        'medium_confidence': [],    # title + author OR title + year
        'low_confidence': [],       # title only >= 0.85
    }

    # Load match results (would need to save full match pairs)
    # For demonstration, generate placeholder structure

    return samples


def sample_unmatched_for_ia_search(works, matched_ids, n=SAMPLES_PER_CATEGORY):
    """
    Sample "unmatched" works for manual IA search verification.

    Question: Can a human find this in Internet Archive?
    """
    unmatched = [w for w in works if w['id'] not in matched_ids]

    # Stratify by century
    by_century = defaultdict(list)
    for w in unmatched:
        if w.get('year'):
            century = (w['year'] // 100) + 1
            by_century[century].append(w)

    samples = []
    per_century = max(1, n // len(by_century))

    for century, century_works in sorted(by_century.items()):
        sample = random.sample(century_works, min(per_century, len(century_works)))
        for w in sample:
            samples.append({
                'id': w['id'],
                'title': w['title'],
                'author': w.get('author', ''),
                'year': w.get('year', ''),
                'century': f"{century}th",
                'catalog_url': f"https://embassyofthefreemind.com/en/library/online-catalogue/detail/{w.get('ubn', '')}",
                'ia_search_url': f"https://archive.org/search?query={w['title'][:50].replace(' ', '+')}",
                # Human fills in:
                'found_in_ia': '',  # Yes / No
                'ia_identifier': '',  # If found, the IA identifier
                'ia_url': '',  # Full URL if found
                'match_quality': '',  # Exact / Different edition / Related work / Not found
                'notes': ''
            })

    return samples[:n]


def generate_review_csvs():
    """Generate all review CSV files."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d")

    print("Loading BPH Latin works (1400-1700)...")
    works = load_bph_works(1400, 1700)
    print(f"  Loaded {len(works)} works")

    # 1. Latin validation samples
    print("\nGenerating Latin validation samples...")
    latin_samples = sample_for_latin_validation(works, n=SAMPLES_PER_CATEGORY)

    latin_csv = OUTPUT_DIR / f"latin_validation_{timestamp}.csv"
    with open(latin_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'id', 'title', 'author', 'year', 'century', 'ubn', 'catalog_url',
            'is_latin', 'actual_language', 'notes'
        ])
        writer.writeheader()
        writer.writerows(latin_samples)
    print(f"  Saved {len(latin_samples)} samples to {latin_csv}")

    # 2. Unmatched verification samples
    # Load matched IDs from results (placeholder - would need actual match results)
    print("\nGenerating unmatched verification samples...")
    # For now, use empty set - in practice, load from match results
    matched_ids = set()

    unmatched_samples = sample_unmatched_for_ia_search(works, matched_ids, n=SAMPLES_PER_CATEGORY)

    unmatched_csv = OUTPUT_DIR / f"unmatched_verification_{timestamp}.csv"
    with open(unmatched_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'id', 'title', 'author', 'year', 'century', 'catalog_url', 'ia_search_url',
            'found_in_ia', 'ia_identifier', 'ia_url', 'match_quality', 'notes'
        ])
        writer.writeheader()
        writer.writerows(unmatched_samples)
    print(f"  Saved {len(unmatched_samples)} samples to {unmatched_csv}")

    # 3. Generate match validation template
    print("\nGenerating match validation template...")
    match_template = OUTPUT_DIR / f"match_validation_template_{timestamp}.csv"
    with open(match_template, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'bph_id', 'bph_title', 'bph_author', 'bph_year',
            'ia_identifier', 'ia_title', 'ia_creator', 'ia_year',
            'match_score', 'match_type', 'ia_url',
            # Human fills in:
            'is_same_work', 'is_same_edition', 'notes'
        ])
        writer.writeheader()
        # Rows would be filled by match generation script
    print(f"  Saved template to {match_template}")

    print("\n" + "="*60)
    print("REVIEW INSTRUCTIONS")
    print("="*60)
    print("""
1. LATIN VALIDATION (latin_validation_*.csv)
   - Open each catalog_url in browser
   - Examine the work details and any available scans
   - Fill in:
     * is_latin: Yes / No / Partial (bilingual) / Uncertain
     * actual_language: If not Latin, specify the language
     * notes: Any relevant observations

2. UNMATCHED VERIFICATION (unmatched_verification_*.csv)
   - Click the ia_search_url to search Internet Archive
   - Try variations: author name, shortened title, year
   - Fill in:
     * found_in_ia: Yes / No
     * ia_identifier: The IA identifier if found
     * ia_url: Full URL to the item
     * match_quality: Exact / Different edition / Related / Not found
     * notes: Search strategies tried, reasons for uncertainty

3. MATCH VALIDATION (match_validation_*.csv)
   - Compare the BPH and IA entries
   - Check if they represent the same work
   - Fill in:
     * is_same_work: Yes / No / Uncertain
     * is_same_edition: Yes / No / Unknown (if same work)
     * notes: Reasons for judgment

Return completed CSVs for analysis.
""")

    return {
        'latin_validation': str(latin_csv),
        'unmatched_verification': str(unmatched_csv),
        'match_template': str(match_template)
    }


if __name__ == "__main__":
    generate_review_csvs()
