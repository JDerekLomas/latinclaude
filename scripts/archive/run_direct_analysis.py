#!/usr/bin/env python3
"""
Direct Neo-Latin analysis script that bypasses the collector filtering issues.
"""

import pandas as pd
import sys
import os
from pathlib import Path

# Add scripts to path
sys.path.append('scripts')

from neolatin_analyzer import NeoLatinAnalyzer
from digitization_checker import DigitizationChecker
from translation_checker import TranslationChecker
from research_pipeline import NeoLatinResearchPipeline

def analyze_generated_data():
    """Run Neo-Latin analysis directly on our generated dataset."""

    print("🔬 Direct Neo-Latin Analysis Pipeline")
    print("=" * 50)

    # Load the full generated dataset
    input_file = "data/raw/generated/large_neolatin_dataset.json"
    if not os.path.exists(input_file):
        print(f"❌ Input file not found: {input_file}")
        return

    print(f"📂 Loading data from {input_file}")

    # Load JSON data
    import json
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"📊 Loaded {len(data)} records")

    # Convert to DataFrame with proper column names
    df_data = []
    for record in data:
        df_record = {
            'identifier': record.get('archive_id', ''),
            'title': record.get('title', ''),
            'authors': record.get('author', ''),
            'publication_year': record.get('year', ''),
            'publisher': record.get('publisher', ''),
            'publication_place': record.get('place', ''),
            'language': record.get('language', 'lat'),
            'description': record.get('description', ''),
            'source_catalogue': record.get('source_catalogue', 'GeneratedData'),
            'subjects': record.get('subjects', []),
            'digitization_status': record.get('digitization_status', 'metadata_only'),
            'translation_status': record.get('translation_status', 'not_translated')
        }
        df_data.append(df_record)

    df = pd.DataFrame(df_data)
    print(f"📋 Created DataFrame with {len(df)} rows and {len(df.columns)} columns")

    # Initialize analyzers
    print("\n🧠 Initializing Neo-Latin analyzer...")
    neolatin_analyzer = NeoLatinAnalyzer()

    print("🔍 Initializing digitization checker...")
    digitization_checker = DigitizationChecker()

    print("📚 Initializing translation checker...")
    translation_checker = TranslationChecker()

    # Analyze Neo-Latin characteristics
    print(f"\n🔬 Analyzing {len(df)} works for Neo-Latin characteristics...")
    neolatin_results = neolatin_analyzer.batch_analyze_neo_latin(df)

    if neolatin_results.empty:
        print("❌ No Neo-Latin analysis results!")
        return

    print(f"✅ Neo-Latin analysis complete for {len(neolatin_results)} works")

    # Check digitization status
    print("\n🔍 Checking digitization status...")
    digitization_results = digitization_checker.batch_check_digitization(neolatin_results)

    # Check translation status
    print("📚 Checking translation status...")
    translation_results = translation_checker.batch_check_translations(digitization_results)

    # Calculate research priorities
    print("📈 Calculating research priorities...")
    pipeline = NeoLatinResearchPipeline()
    final_results = pipeline._calculate_research_priorities(translation_results)

    # Display results
    print("\n" + "=" * 80)
    print("🎯 LARGE-SCALE NEO-LATIN ANALYSIS RESULTS")
    print("=" * 80)

    print(f"\n📊 Dataset Summary:")
    print(f"  Total records analyzed: {len(df)}")
    print(f"  Neo-Latin works identified: {len(final_results)}")
    print(f"  Year range: {df['publication_year'].min()} - {df['publication_year'].max()}")

    # High confidence Neo-Latin works
    high_confidence = final_results[final_results['neo_latin_score'] >= 0.7]
    print(f"\n🎓 High-Confidence Neo-Latin Works (score ≥ 0.7): {len(high_confidence)}")

    # Digitization status breakdown
    digitization_counts = final_results['digitization_status'].value_counts()
    print(f"\n📱 Digitization Status:")
    for status, count in digitization_counts.items():
        print(f"  {status}: {count}")

    # Translation status breakdown
    translation_counts = final_results['translation_status'].value_counts()
    print(f"\n📖 Translation Status:")
    for status, count in translation_counts.items():
        print(f"  {status}: {count}")

    # Find gaps (not digitized AND not translated)
    gaps = final_results[
        (final_results['digitization_status'].isin(['not_found', 'metadata_only'])) &
        (final_results['translation_status'] == 'not_translated')
    ]
    print(f"\n🎯 Major Research Gaps (not digitized AND not translated): {len(gaps)}")

    # High priority targets
    high_priority = final_results[final_results['research_priority'] >= 7.0]
    print(f"🔥 High Priority Targets (priority ≥ 7.0): {len(high_priority)}")

    if not high_priority.empty:
        print("\n🏆 TOP 10 HIGH PRIORITY TARGETS:")
        top_10 = high_priority.nlargest(10, 'research_priority')
        for i, (_, row) in enumerate(top_10.iterrows(), 1):
            print(f"  {i}. {row['title']} ({row['publication_year']}) - Priority: {row['research_priority']:.2f}")
            print(f"     Author: {row['authors']}")
            print(f"     Status: {row['digitization_status']} / {row['translation_status']}")
            print(f"     Neo-Latin Score: {row['neo_latin_score']:.2f}")
            print()

    # Create output directory
    output_dir = Path("data/processed/large_scale_results")
    output_dir.mkdir(parents=True, exist_ok=True)

    # Save results
    print(f"💾 Saving results to {output_dir}")

    # Save complete analysis
    final_results.to_csv(output_dir / "large_scale_neolatin_analysis.csv", index=False, encoding='utf-8-sig')

    # Save high priority targets
    if not high_priority.empty:
        high_priority.to_csv(output_dir / "high_priority_targets.csv", index=False, encoding='utf-8-sig')

    # Save research gaps
    if not gaps.empty:
        gaps.to_csv(output_dir / "research_gaps.csv", index=False, encoding='utf-8-sig')

    # Save high confidence works
    if not high_confidence.empty:
        high_confidence.to_csv(output_dir / "high_confidence_neolatin.csv", index=False, encoding='utf-8-sig')

    print("\n🎉 SUCCESS! Large-scale Neo-Latin analysis complete!")
    print(f"📁 Results saved to {output_dir}")

    return final_results

if __name__ == "__main__":
    results = analyze_generated_data()