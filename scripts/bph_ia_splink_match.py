#!/usr/bin/env python3
"""
BPH-IA Probabilistic Record Linkage with Splink

Uses the Fellegi-Sunter model via Splink for probabilistic matching
of BPH catalog records against Internet Archive Latin texts.

Key advantages:
- Probabilistic: Computes match probability, not just similarity scores
- Multi-signal: Weighs title, author, year, publisher signals together
- Unsupervised: Learns weights from data without training labels
- Scalable: Can handle millions of records efficiently

Based on:
- Splink: https://moj-analytical-services.github.io/splink/
- Python Record Linkage Toolkit patterns
- LEAD hybrid approach for handling ambiguous cases

Usage:
    python bph_ia_splink_match.py [--year-min 1400] [--year-max 1700] [--sample N]
"""

import os
import re
import json
import argparse
from datetime import datetime
from pathlib import Path
from typing import Optional
import unicodedata

# Install dependencies if needed
def ensure_dependencies():
    required = ['splink', 'supabase', 'rapidfuzz', 'pandas']
    import subprocess
    import sys
    for pkg in required:
        try:
            __import__(pkg)
        except ImportError:
            print(f"Installing {pkg}...")
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', pkg])

ensure_dependencies()

import pandas as pd
from supabase import create_client, Client
from rapidfuzz import fuzz
from splink import Linker, DuckDBAPI, SettingsCreator, block_on
import splink.comparison_library as cl
import splink.comparison_level_library as cll

# Configuration
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "splink_matching"
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ykhxaecbbxaaqlujuzde.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlraHhhZWNiYnhhYXFsdWp1emRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjExMDEsImV4cCI6MjA4MDYzNzEwMX0.O2chfnHGQWLOaVSFQ-F6UJMlya9EzPbsUh848SEOPj4")


def get_supabase_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def normalize_text(text: str) -> str:
    """Normalize text for comparison."""
    if not text:
        return ""
    # Lowercase
    text = text.lower()
    # Normalize unicode (æ -> ae, etc.)
    text = unicodedata.normalize('NFKD', text)
    text = text.replace('æ', 'ae').replace('œ', 'oe')
    # Remove punctuation except spaces
    text = re.sub(r'[^\w\s]', ' ', text)
    # Normalize whitespace
    text = ' '.join(text.split())
    return text


def extract_surname(name: str) -> str:
    """Extract likely surname from author name."""
    if not name:
        return ""
    # Remove dates like (1433-1499)
    name = re.sub(r'\([^)]*\d+[^)]*\)', '', name)
    # Remove post-comma content for "Surname, Firstname" format
    if ',' in name:
        name = name.split(',')[0]
    # Get first capitalized word > 2 chars
    words = name.split()
    for word in words:
        cleaned = re.sub(r'[^\w]', '', word)
        if len(cleaned) > 2 and cleaned[0].isupper():
            return cleaned.lower()
    return normalize_text(name)[:20] if name else ""


def extract_title_keywords(title: str, n: int = 5) -> Optional[str]:
    """Extract significant keywords from title. Returns None if no keywords found."""
    if not title:
        return None

    stopwords = {
        'de', 'in', 'ad', 'et', 'ex', 'pro', 'per', 'cum', 'ab', 'a', 'ut',
        'the', 'of', 'and', 'or', 'to', 'from', 'by', 'with', 'for', 'on',
        'liber', 'libri', 'libro', 'libros', 'opus', 'opera', 'tractatus',
        'von', 'und', 'der', 'die', 'das', 'des', 'dem', 'den', 'ein', 'eine',
        'seu', 'sive', 'quae', 'quod', 'que', 'qui', 'quibus', 'item'
    }

    normalized = normalize_text(title)
    words = [w for w in normalized.split() if len(w) > 3 and w not in stopwords]
    result = ' '.join(words[:n])
    return result if result else None


def load_bph_works(year_min: int = 1400, year_max: int = 1700, limit: Optional[int] = None) -> pd.DataFrame:
    """Load BPH Latin works from Supabase."""
    client = get_supabase_client()
    print(f"Loading BPH Latin works ({year_min}-{year_max})...")

    all_works = []
    offset = 0
    batch_size = 1000

    while True:
        query = client.table('bph_works').select(
            'id, title, author, year, publisher, place, ubn'
        ).eq('detected_language', 'Latin')

        if year_min:
            query = query.gte('year', year_min)
        if year_max:
            query = query.lte('year', year_max)

        result = query.range(offset, offset + batch_size - 1).execute()

        if not result.data:
            break

        all_works.extend(result.data)
        offset += batch_size

        if limit and len(all_works) >= limit:
            all_works = all_works[:limit]
            break

    print(f"  Loaded {len(all_works)} BPH works")

    # Convert to DataFrame and preprocess
    df = pd.DataFrame(all_works)
    df['source'] = 'bph'
    df['unique_id'] = df['id'].apply(lambda x: f"bph_{x}")
    df['title_normalized'] = df['title'].apply(normalize_text)
    df['title_keywords'] = df['title'].apply(extract_title_keywords)
    df['author_surname'] = df['author'].apply(extract_surname)
    df['year_str'] = df['year'].apply(lambda x: str(int(x)) if pd.notna(x) else '')

    return df


def load_ia_works(limit: Optional[int] = None) -> pd.DataFrame:
    """Load Internet Archive Latin works from Supabase."""
    client = get_supabase_client()
    print("Loading IA Latin works...")

    all_works = []
    offset = 0
    batch_size = 1000

    while True:
        result = client.table('ia_latin_texts').select(
            'identifier, title, creator, year, description'
        ).range(offset, offset + batch_size - 1).execute()

        if not result.data:
            break

        all_works.extend(result.data)
        offset += batch_size

        if offset % 10000 == 0:
            print(f"    {offset}...")

        if limit and len(all_works) >= limit:
            all_works = all_works[:limit]
            break

    print(f"  Loaded {len(all_works)} IA works")

    # Convert to DataFrame and preprocess
    df = pd.DataFrame(all_works)
    df['source'] = 'ia'
    df['unique_id'] = df['identifier'].apply(lambda x: f"ia_{x}")
    df['id'] = df['identifier']  # For consistency
    df['author'] = df['creator']  # Rename for consistency
    df['title_normalized'] = df['title'].apply(normalize_text)
    df['title_keywords'] = df['title'].apply(extract_title_keywords)
    df['author_surname'] = df['creator'].apply(extract_surname)
    df['year_str'] = df['year'].apply(lambda x: str(int(x)) if pd.notna(x) else '')

    return df


def create_splink_settings():
    """Create Splink settings for bibliographic record linkage."""

    # Custom comparison for normalized titles using Jaro-Winkler
    title_comparison = cl.JaroWinklerAtThresholds(
        "title_normalized",
        score_threshold_or_thresholds=[0.95, 0.88, 0.80],
    )

    # Keywords comparison (bag of words approach)
    keywords_comparison = cl.JaccardAtThresholds(
        "title_keywords",
        score_threshold_or_thresholds=[0.9, 0.7, 0.5],
    )

    # Author surname comparison
    author_comparison = cl.JaroWinklerAtThresholds(
        "author_surname",
        score_threshold_or_thresholds=[0.92, 0.85],
    )

    # Year comparison with tolerance
    year_comparison = cl.DamerauLevenshteinAtThresholds(
        "year_str",
        distance_threshold_or_thresholds=[1, 2],  # Exact or 1-2 char difference
    )

    settings = SettingsCreator(
        link_type="link_only",  # Only link between datasets, don't dedupe within
        unique_id_column_name="unique_id",
        comparisons=[
            title_comparison,
            # Note: Jaccard keywords comparison removed due to DuckDB issues with short strings
            author_comparison,
            year_comparison,
        ],
        blocking_rules_to_generate_predictions=[
            # Block on first 3 chars of normalized title
            block_on("substr(title_normalized, 1, 3)"),
            # Block on author surname (when not null)
            "l.author_surname IS NOT NULL AND r.author_surname IS NOT NULL AND l.author_surname = r.author_surname",
            # Block on year
            block_on("year_str"),
        ],
        retain_matching_columns=True,
        retain_intermediate_calculation_columns=True,
    )

    return settings


def run_splink_matching(bph_df: pd.DataFrame, ia_df: pd.DataFrame) -> pd.DataFrame:
    """Run Splink probabilistic record linkage."""
    print("\n" + "=" * 70)
    print("RUNNING SPLINK PROBABILISTIC MATCHING")
    print("=" * 70)

    # Prepare dataframes - keep only needed columns
    cols_to_keep = ['unique_id', 'source', 'title', 'title_normalized',
                    'author_surname', 'year_str', 'id']

    bph_clean = bph_df[cols_to_keep].copy()
    ia_clean = ia_df[cols_to_keep].copy()

    print(f"\nBPH records: {len(bph_clean)}")
    print(f"IA records: {len(ia_clean)}")

    # Initialize Splink with DuckDB backend
    db_api = DuckDBAPI()
    settings = create_splink_settings()

    linker = Linker(
        [bph_clean, ia_clean],
        settings,
        db_api,
    )

    # Estimate u probabilities (probability of random agreement)
    print("\nEstimating u probabilities...")
    linker.training.estimate_u_using_random_sampling(max_pairs=1e6)

    # Estimate m probabilities using Expectation-Maximization
    print("Training model with EM algorithm...")

    # Train on blocking rules
    training_rules = [
        block_on("title_normalized"),  # Exact title matches
        block_on("author_surname", "year_str"),  # Same author and year
    ]

    for rule in training_rules:
        try:
            linker.training.estimate_parameters_using_expectation_maximisation(rule)
        except Exception as e:
            print(f"  Warning: Training rule failed: {e}")

    # Generate predictions
    print("\nGenerating match predictions...")
    predictions = linker.inference.predict(threshold_match_probability=0.5)

    # Convert to dataframe
    results_df = predictions.as_pandas_dataframe()

    print(f"\nFound {len(results_df)} candidate matches above 0.5 probability")

    return results_df, linker


def post_process_results(results_df: pd.DataFrame, bph_df: pd.DataFrame,
                         ia_df: pd.DataFrame) -> pd.DataFrame:
    """Post-process Splink results with additional validation."""
    print("\nPost-processing results...")

    if len(results_df) == 0:
        print("  No matches to process")
        return pd.DataFrame()

    # Add original metadata back
    bph_lookup = bph_df.set_index('unique_id').to_dict('index')
    ia_lookup = ia_df.set_index('unique_id').to_dict('index')

    enhanced_results = []

    for _, row in results_df.iterrows():
        # Determine which is BPH and which is IA
        if row['unique_id_l'].startswith('bph_'):
            bph_id = row['unique_id_l']
            ia_id = row['unique_id_r']
        else:
            bph_id = row['unique_id_r']
            ia_id = row['unique_id_l']

        bph_data = bph_lookup.get(bph_id, {})
        ia_data = ia_lookup.get(ia_id, {})

        # Calculate additional similarity metrics
        bph_title = bph_data.get('title', '')
        ia_title = ia_data.get('title', '')

        title_ratio = fuzz.token_set_ratio(
            normalize_text(bph_title),
            normalize_text(ia_title)
        ) / 100.0

        # Confidence tier based on signals
        prob = row['match_probability']
        has_author = bool(bph_data.get('author_surname') and ia_data.get('author_surname'))
        has_year = bool(bph_data.get('year_str') and ia_data.get('year_str'))

        if prob >= 0.9 and has_author and has_year:
            confidence = 'high'
        elif prob >= 0.8 or (prob >= 0.7 and (has_author or has_year)):
            confidence = 'medium'
        else:
            confidence = 'low'

        enhanced_results.append({
            'bph_id': bph_id.replace('bph_', ''),
            'bph_title': bph_title,
            'bph_author': bph_data.get('author', ''),
            'bph_year': bph_data.get('year_str', ''),
            'ia_identifier': ia_id.replace('ia_', ''),
            'ia_title': ia_title,
            'ia_creator': ia_data.get('author', ''),
            'ia_year': ia_data.get('year_str', ''),
            'match_probability': prob,
            'title_similarity': title_ratio,
            'confidence': confidence,
            'match_weight': row.get('match_weight', 0),
        })

    enhanced_df = pd.DataFrame(enhanced_results)
    enhanced_df = enhanced_df.sort_values('match_probability', ascending=False)

    # Summary by confidence
    print("\nResults by confidence tier:")
    for conf in ['high', 'medium', 'low']:
        count = len(enhanced_df[enhanced_df['confidence'] == conf])
        print(f"  {conf}: {count}")

    return enhanced_df


def save_results(results_df: pd.DataFrame, bph_df: pd.DataFrame,
                 linker, output_dir: Path):
    """Save results and generate reports."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir.mkdir(parents=True, exist_ok=True)

    # Save matches CSV
    csv_path = output_dir / f"splink_matches_{timestamp}.csv"
    results_df.to_csv(csv_path, index=False)
    print(f"\nMatches saved to: {csv_path}")

    # Calculate summary statistics
    total_bph = len(bph_df)
    matched_bph = results_df['bph_id'].nunique() if len(results_df) > 0 else 0

    summary = {
        'timestamp': timestamp,
        'total_bph_works': total_bph,
        'matched_bph_works': matched_bph,
        'match_rate': matched_bph / total_bph if total_bph > 0 else 0,
        'by_confidence': {
            conf: len(results_df[results_df['confidence'] == conf])
            for conf in ['high', 'medium', 'low']
        } if len(results_df) > 0 else {},
        'high_confidence_rate': len(results_df[results_df['confidence'] == 'high']) / total_bph if total_bph > 0 else 0,
    }

    # Save summary JSON
    json_path = output_dir / f"splink_summary_{timestamp}.json"
    with open(json_path, 'w') as f:
        json.dump(summary, f, indent=2)
    print(f"Summary saved to: {json_path}")

    # Print summary
    print("\n" + "=" * 70)
    print("FINAL RESULTS")
    print("=" * 70)
    print(f"Total BPH works: {total_bph}")
    print(f"Matched: {matched_bph} ({100*matched_bph/total_bph:.1f}%)")
    print(f"High confidence: {summary['by_confidence'].get('high', 0)}")
    print(f"Medium confidence: {summary['by_confidence'].get('medium', 0)}")
    print(f"Low confidence: {summary['by_confidence'].get('low', 0)}")

    # Save Splink model diagnostics if available
    try:
        # Save comparison viewer data
        comparison_path = output_dir / f"splink_comparison_viewer_{timestamp}.html"
        linker.visualisations.comparison_viewer_dashboard(
            results_df.head(100) if len(results_df) > 0 else None,
            out_path=str(comparison_path)
        )
        print(f"Comparison viewer saved to: {comparison_path}")
    except Exception as e:
        print(f"Could not save comparison viewer: {e}")

    return summary


def main():
    parser = argparse.ArgumentParser(description='BPH-IA Probabilistic Record Linkage')
    parser.add_argument('--year-min', type=int, default=1400, help='Minimum year')
    parser.add_argument('--year-max', type=int, default=1700, help='Maximum year')
    parser.add_argument('--sample', type=int, default=None, help='Sample size for BPH works')
    parser.add_argument('--ia-sample', type=int, default=None, help='Limit IA corpus (default: full)')
    args = parser.parse_args()

    print("=" * 70)
    print("BPH-IA PROBABILISTIC RECORD LINKAGE WITH SPLINK")
    print("=" * 70)
    print(f"Year range: {args.year_min}-{args.year_max}")
    if args.sample:
        print(f"BPH sample: {args.sample}")
    if args.ia_sample:
        print(f"IA sample: {args.ia_sample}")

    # Load data - full IA by default, but can be limited for testing
    bph_df = load_bph_works(args.year_min, args.year_max, args.sample)
    ia_df = load_ia_works(args.ia_sample)

    # Run Splink matching
    results_df, linker = run_splink_matching(bph_df, ia_df)

    # Post-process
    enhanced_df = post_process_results(results_df, bph_df, ia_df)

    # Save results
    save_results(enhanced_df, bph_df, linker, OUTPUT_DIR)

    # Print sample matches
    if len(enhanced_df) > 0:
        print("\n" + "=" * 70)
        print("SAMPLE HIGH-CONFIDENCE MATCHES")
        print("=" * 70)

        high_conf = enhanced_df[enhanced_df['confidence'] == 'high'].head(10)
        for _, row in high_conf.iterrows():
            print(f"\nBPH: {row['bph_title'][:60]}...")
            print(f"  IA: {row['ia_title'][:60]}...")
            print(f"  Prob: {row['match_probability']:.3f}, Title sim: {row['title_similarity']:.3f}")


if __name__ == "__main__":
    main()
