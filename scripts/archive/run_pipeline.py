#!/usr/bin/env python3
"""
Simple runner script for the Latin Master Bibliography pipeline.
"""

import sys
import argparse
from pathlib import Path
import logging

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent / 'scripts'))

from main_pipeline import LatinBibliographyPipeline

def main():
    """Main entry point for running the pipeline."""
    parser = argparse.ArgumentParser(
        description='Latin Master Bibliography Processing Pipeline'
    )
    parser.add_argument(
        '--config', '-c',
        default='config/config.yaml',
        help='Path to configuration file'
    )
    parser.add_argument(
        '--collectors',
        nargs='+',
        help='Specific collectors to run (e.g., vd16 vd17 ustc)'
    )
    parser.add_argument(
        '--max-records',
        type=int,
        help='Maximum records to collect per catalogue'
    )
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable verbose logging'
    )

    args = parser.parse_args()

    # Set up logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    print("Latin Master Bibliography Pipeline")
    print("=" * 50)

    try:
        # Initialize pipeline
        pipeline = LatinBibliographyPipeline(args.config)

        # Override config with command line arguments
        if args.collectors:
            # Disable all collectors first
            for collector in pipeline.config['collectors']:
                pipeline.config['collectors'][collector]['enabled'] = False

            # Enable specified collectors
            for collector in args.collectors:
                if collector in pipeline.config['collectors']:
                    pipeline.config['collectors'][collector]['enabled'] = True
                    print(f"Enabled collector: {collector}")
                else:
                    print(f"Warning: Unknown collector '{collector}'")

        if args.max_records:
            for collector in pipeline.config['collectors']:
                pipeline.config['collectors'][collector]['max_records'] = args.max_records
            print(f"Set max records to {args.max_records} for all collectors")

        # Run the pipeline
        print("\nStarting pipeline...")
        final_df = pipeline.run_pipeline()

        # Print summary
        pipeline.print_summary()

        print(f"\nPipeline completed successfully!")
        print(f"Final dataset contains {len(final_df)} records")
        print(f"Main output: data/processed/final/latin_master_bibliography.csv")

    except KeyboardInterrupt:
        print("\nPipeline interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\nPipeline failed with error: {e}")
        logging.exception("Pipeline failed")
        sys.exit(1)

if __name__ == "__main__":
    main()