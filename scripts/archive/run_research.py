#!/usr/bin/env python3
"""
Runner script for Neo-Latin Research Pipeline.
Identifies uns-digitized and untranslated Neo-Latin works.
"""

import sys
import argparse
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent / 'scripts'))

def main():
    """Main entry point for Neo-Latin research."""
    parser = argparse.ArgumentParser(
        description='Neo-Latin Research Pipeline - Identify uns-digitized and untranslated works',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  # Run with default settings (limited to 100 records for testing)
  python run_research.py

  # Run with larger dataset
  python run_research.py --max-bibliography 500 --max-analysis 200

  # Run with specific data sources
  python run_research.py --collectors vd16 vd17 --max-analysis 100

  # Focus on specific period
  python run_research.py --start-year 1400 --end-year 1700
        '''
    )

    parser.add_argument(
        '--config', '-c',
        default='config/config.yaml',
        help='Path to configuration file'
    )
    parser.add_argument(
        '--max-bibliography',
        type=int,
        default=100,
        help='Maximum bibliographic records to collect (default: 100 for testing)'
    )
    parser.add_argument(
        '--max-analysis',
        type=int,
        default=50,
        help='Maximum records to analyze for digitization/translation (default: 50 for testing)'
    )
    parser.add_argument(
        '--collectors',
        nargs='+',
        help='Specific catalogues to use (e.g., vd16 vd17 googlebooks)'
    )
    parser.add_argument(
        '--start-year',
        type=int,
        default=1300,
        help='Start year for Neo-Latin period (default: 1300)'
    )
    parser.add_argument(
        '--end-year',
        type=int,
        default=1900,
        help='End year for Neo-Latin period (default: 1900)'
    )
    parser.add_argument(
        '--min-neo-latin-score',
        type=float,
        default=0.5,
        help='Minimum Neo-Latin confidence score (0.0-1.0, default: 0.5)'
    )
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable verbose logging'
    )

    args = parser.parse_args()

    print("Neo-Latin Research Pipeline")
    print("=" * 50)
    print("Identifying uns-digitized and untranslated Neo-Latin works...")
    print()

    try:
        from research_pipeline import NeoLatinResearchPipeline

        # Initialize pipeline
        pipeline = NeoLatinResearchPipeline(args.config)

        # Update configuration based on command line arguments
        if args.collectors:
            # Disable all collectors first
            for collector in pipeline.config['collectors']:
                pipeline.config['collectors'][collector]['enabled'] = False

            # Enable specified collectors
            for collector in args.collectors:
                if collector in pipeline.config['collectors']:
                    pipeline.config['collectors'][collector]['enabled'] = True
                    print(f"✓ Enabled collector: {collector}")
                else:
                    print(f"⚠ Unknown collector: {collector}")

        # Update research parameters
        pipeline.config['research']['neo_latin_start_year'] = args.start_year
        pipeline.config['research']['neo_latin_end_year'] = args.end_year
        pipeline.config['research']['min_neo_latin_score'] = args.min_neo_latin_score

        print()
        print("Configuration:")
        print(f"  Bibliography limit: {args.max_bibliography}")
        print(f"  Analysis limit: {args.max_analysis}")
        print(f"  Time period: {args.start_year}-{args.end_year}")
        print(f"  Min Neo-Latin score: {args.min_neo_latin_score}")
        print()

        # Run the research pipeline
        print("Starting research pipeline...")
        print("This may take several minutes depending on the limits set.")
        print()

        results = pipeline.run_complete_research(
            max_bibliography_records=args.max_bibliography,
            max_analysis_records=args.max_analysis
        )

        print()
        print("🎉 Research pipeline completed successfully!")
        print()
        print("Results Summary:")
        if not results.empty:
            total_works = len(results)
            high_priority = len(results[results['research_priority'] >= 8])
            missing_digitization = len(results[results['digitization_status'] == 'not_found'])
            missing_translations = len(results[results['translation_status'] == 'not_translated'])
            completely_missing = len(results[
                (results['digitization_status'] == 'not_found') &
                (results['translation_status'] == 'not_translated')
            ])

            print(f"  Total Neo-Latin works analyzed: {total_works}")
            print(f"  High priority research targets: {high_priority}")
            print(f"  Missing digitization: {missing_digitization} ({missing_digitization/total_works*100:.1f}%)")
            print(f"  Missing translations: {missing_translations} ({missing_translations/total_works*100:.1f}%)")
            print(f"  Completely missing (both): {completely_missing} ({completely_missing/total_works*100:.1f}%)")
        else:
            print("  No results to analyze")
        print()

        print("Output files:")
        print(f"  Main results: {pipeline.output_dir}/neo_latin_research_results.csv")
        print(f"  High priority targets: {pipeline.output_dir}/high_priority_research_targets.csv")
        print(f"  Missing works: {pipeline.output_dir}/missing_neo_latin_works.csv")
        print(f"  Summary report: {pipeline.output_dir}/research_summary.txt")
        print(f"  Full data: {pipeline.output_dir}/research_summary_report.json")
        print()

        print("📋 Next Steps:")
        print("1. Review the high priority targets CSV for detailed information")
        print("2. Examine the missing works file for digitization opportunities")
        print("3. Read the summary report for analysis and recommendations")
        print("4. Contact libraries about specific missing works for digitization")
        print("5. Consider translation projects for high-value untranslated works")
        print()

        print("🔬 For scholarly research:")
        print("• Cite this analysis in your research")
        print("• Share findings with the Neo-Latin scholarly community")
        print("• Consider publishing the gap analysis")
        print("• Use results to prioritize digitization/translation projects")

    except KeyboardInterrupt:
        print("\nResearch pipeline interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Research pipeline failed: {e}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()