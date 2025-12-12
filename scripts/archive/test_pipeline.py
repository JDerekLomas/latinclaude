#!/usr/bin/env python3
"""
Test script to verify the pipeline setup without external connections.
"""

import sys
import pandas as pd
import numpy as np
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent / 'scripts'))

def test_imports():
    """Test that all required modules can be imported."""
    print("Testing imports...")

    try:
        import requests
        print("✓ requests imported")
    except ImportError as e:
        print(f"✗ requests failed: {e}")
        return False

    try:
        import pandas as pd
        print("✓ pandas imported")
    except ImportError as e:
        print(f"✗ pandas failed: {e}")
        return False

    try:
        from base_collector import BaseCollector, CollectorFactory
        print("✓ base_collector imported")
    except ImportError as e:
        print(f"✗ base_collector failed: {e}")
        return False

    try:
        from deduplicator import RecordDeduplicator
        print("✓ deduplicator imported")
    except ImportError as e:
        print(f"✗ deduplicator failed: {e}")
        return False

    try:
        from main_pipeline import LatinBibliographyPipeline
        print("✓ main_pipeline imported")
    except ImportError as e:
        print(f"✗ main_pipeline failed: {e}")
        return False

    return True

def test_sample_data():
    """Test processing with sample data."""
    print("\nTesting with sample data...")

    # Import deduplicator here to make sure it's available
    from deduplicator import RecordDeduplicator

    # Create sample data that mimics the expected structure
    sample_data = [
        {
            'title': 'De Revolutionibus Orbium Coelestium',
            'author': 'Copernicus, Nicolaus',
            'publication_year': 1543,
            'publication_place': 'Nuremberg',
            'printer': 'Johannes Petreius',
            'language': 'lat',
            'source_catalogue': 'VD16',
            'vd16_id': 'VD16_123456',
            'digital_facsimile_urls': []
        },
        {
            'title': 'DE REVOLUTIONIBUS ORBIVM COELESTIVM',
            'author': 'N. Copernicus',
            'publication_year': 1543,
            'publication_place': 'Norimbergae',
            'printer': 'I. Petreium',
            'language': 'lat',
            'source_catalogue': 'USTC',
            'ustc_id': 'USTC_789012',
            'digital_facsimile_urls': ['https://example.com/facsimile']
        },
        {
            'title': 'Ars Magna',
            'author': 'Lullus, Raimundus',
            'publication_year': 1515,
            'publication_place': 'Paris',
            'language': 'lat',
            'source_catalogue': 'VD16',
            'vd16_id': 'VD16_234567',
            'digital_facsimile_urls': []
        },
        {
            'title': 'Summa Theologica',
            'author': 'Thomas Aquinas',
            'publication_year': 1485,
            'publication_place': 'Basel',
            'language': 'lat',
            'source_catalogue': 'USTC',
            'ustc_id': 'USTC_345678',
            'digital_facsimile_urls': []
        }
    ]

    df = pd.DataFrame(sample_data)
    print(f"✓ Created sample dataset with {len(df)} records")

    # Test deduplication
    try:
        deduplicator = RecordDeduplicator()
        print("✓ Deduplicator initialized")

        # Test deduplication
        deduplicated_df = deduplicator.deduplicate_dataframe(df)
        print(f"✓ Deduplication complete: {len(df)} -> {len(deduplicated_df)} records")

        # Save test output
        output_dir = Path('data/processed/test')
        output_dir.mkdir(parents=True, exist_ok=True)

        output_file = output_dir / 'test_output.csv'
        deduplicated_df.to_csv(output_file, index=False, encoding='utf-8-sig')
        print(f"✓ Test output saved to {output_file}")

        # Show results
        print("\nDeduplication results:")
        for _, record in deduplicated_df.iterrows():
            sources = record.get('source_catalogues', record.get('source_catalogue', ''))
            confidence = record.get('deduplication_confidence', 1.0)
            print(f"  - {record['title'][:50]}... | Sources: {sources} | Confidence: {confidence:.2f}")

        return True

    except Exception as e:
        print(f"✗ Deduplication failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_configuration():
    """Test configuration loading."""
    print("\nTesting configuration...")

    try:
        config_path = Path('config/config.yaml')
        if config_path.exists():
            import yaml
            with open(config_path, 'r') as f:
                config = yaml.safe_load(f)
            print(f"✓ Configuration loaded from {config_path}")
            print(f"  - Enabled collectors: {list(config['collectors'].keys())}")
            return True
        else:
            print(f"✗ Configuration file not found at {config_path}")
            return False
    except Exception as e:
        print(f"✗ Configuration loading failed: {e}")
        return False

def main():
    """Run all tests."""
    print("Latin Bibliography Pipeline Test Suite")
    print("=" * 50)

    tests = [
        ("Import Tests", test_imports),
        ("Configuration Tests", test_configuration),
        ("Sample Data Tests", test_sample_data)
    ]

    results = []

    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        print("-" * len(test_name))

        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"✗ {test_name} failed with exception: {e}")
            results.append((test_name, False))

    # Summary
    print("\n" + "=" * 50)
    print("TEST SUMMARY")
    print("=" * 50)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "PASS" if result else "FAIL"
        print(f"{test_name:25} {status}")

    print(f"\nOverall: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All tests passed! The pipeline is ready to use.")
        print("\nTo run the actual pipeline:")
        print("  1. Activate virtual environment: source venv/bin/activate")
        print("  2. Run pipeline: python run_pipeline.py --max-records 10")
        return True
    else:
        print("❌ Some tests failed. Please check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)