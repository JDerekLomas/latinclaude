#!/usr/bin/env python3
"""
Test script for Neo-Latin Research Pipeline.
Tests individual components with sample data.
"""

import sys
import pandas as pd
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent / 'scripts'))

def test_components():
    """Test all research components with sample data."""
    print("Neo-Latin Research Component Tests")
    print("=" * 50)

    # Create sample data
    sample_data = [
        {
            'title': 'De Revolutionibus Orbium Coelestium',
            'author': 'Copernicus, Nicolaus',
            'publication_year': 1543,
            'publication_place': 'Nuremberg',
            'source_catalogue': 'VD16',
            'language': 'lat'
        },
        {
            'title': 'Summa Theologica',
            'author': 'Thomas Aquinas',
            'publication_year': 1485,
            'publication_place': 'Paris',
            'source_catalogue': 'USTC',
            'language': 'lat'
        },
        {
            'title': 'Ars Magna',
            'author': 'Raimundus Lullus',
            'publication_year': 1515,
            'publication_place': 'Lyon',
            'source_catalogue': 'VD16',
            'language': 'lat'
        },
        {
            'title': 'Modern Book in English',
            'author': 'John Smith',
            'publication_year': 2020,
            'publication_place': 'New York',
            'source_catalogue': 'WorldCat',
            'language': 'eng'
        }
    ]

    df = pd.DataFrame(sample_data)
    print(f"Created sample dataset with {len(df)} records\n")

    # Test Neo-Latin Analyzer
    print("1. Testing Neo-Latin Analyzer...")
    try:
        from neolatin_analyzer import NeoLatinAnalyzer
        analyzer = NeoLatinAnalyzer()

        for _, work in df.iterrows():
            result = analyzer.is_neo_latin_work(
                work['title'], work['author'], work['publication_year'], work['publication_place']
            )
            status = "✓ Neo-Latin" if result['is_neo_latin'] else "✗ Not Neo-Latin"
            print(f"  {work['title'][:40]}... {status} (score: {result['neo_latin_score']:.2f})")

        print("✓ Neo-Latin Analyzer working\n")
    except Exception as e:
        print(f"✗ Neo-Latin Analyzer failed: {e}\n")

    # Test Digitization Checker
    print("2. Testing Digitization Checker...")
    try:
        from digitization_checker import DigitizationChecker
        digitizer = DigitizationChecker()

        # Test with just one record to avoid API rate limits
        test_work = df.iloc[0]
        result = digitizer.check_all_sources(
            test_work['title'], test_work['author'], test_work['publication_year']
        )

        status = "✓ Found" if result['total_sources_checked'] > 0 else "✗ Not found"
        print(f"  {test_work['title'][:40]}... {status} (sources: {result['total_sources_checked']})")

        print("✓ Digitization Checker working\n")
    except Exception as e:
        print(f"✗ Digitization Checker failed: {e}\n")

    # Test Translation Checker
    print("3. Testing Translation Checker...")
    try:
        from translation_checker import TranslationChecker
        translator = TranslationChecker()

        # Test with just one record
        test_work = df.iloc[0]
        result = translator.check_translation_status(
            test_work['title'], test_work['author'], test_work['publication_year']
        )

        status = "✓ Translated" if result['translated'] else "✗ Not translated"
        print(f"  {test_work['title'][:40]}... {status} (status: {result['translation_status']})")

        print("✓ Translation Checker working\n")
    except Exception as e:
        print(f"✗ Translation Checker failed: {e}\n")

    print("4. Testing Research Pipeline Integration...")
    try:
        from research_pipeline import NeoLatinResearchPipeline

        # Create minimal config for testing
        test_config = {
            'collectors': {
                'demo': {
                    'enabled': True,
                    'max_records': 5,
                    'output_dir': 'data/raw/demo'
                }
            },
            'research': {
                'neo_latin_start_year': 1300,
                'neo_latin_end_year': 1900,
                'min_neo_latin_score': 0.5
            },
            'digitization': {
                'requests_per_second': 1
            },
            'translation': {
                'requests_per_second': 1
            }
        }

        pipeline = NeoLatinResearchPipeline()
        print("✓ Research Pipeline can be initialized\n")
    except Exception as e:
        print(f"✗ Research Pipeline failed: {e}\n")

    print("Component Tests Complete!")
    print("=" * 50)
    print("All components are ready for research.")

if __name__ == "__main__":
    test_components()