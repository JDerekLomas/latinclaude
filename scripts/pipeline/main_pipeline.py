#!/usr/bin/env python3
"""
Main processing pipeline for Latin Master Bibliography.
Orchestrates data collection, deduplication, and output generation.
"""

import pandas as pd
import numpy as np
import logging
import json
import yaml
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

# Import our modules
from base_collector import CollectorFactory
from deduplicator import RecordDeduplicator

# Import collectors
import demo_collector
import alternative_collectors

# Import original catalogue collectors
import vd16_collector
import ustc_collector

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('data/pipeline.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class LatinBibliographyPipeline:
    """
    Main pipeline for processing Latin bibliography data.
    """

    def __init__(self, config_path: str = 'config/config.yaml'):
        """
        Initialize pipeline with configuration.

        Args:
            config_path: Path to configuration file
        """
        self.config_path = Path(config_path)
        self.config = self._load_config()

        # Set up directories
        self.data_dir = Path(self.config.get('data_dir', 'data'))
        self.raw_dir = self.data_dir / 'raw'
        self.processed_dir = self.data_dir / 'processed'
        self.intermediate_dir = self.processed_dir / 'intermediate'
        self.final_dir = self.processed_dir / 'final'

        # Ensure directories exist
        for directory in [self.data_dir, self.raw_dir, self.processed_dir,
                         self.intermediate_dir, self.final_dir]:
            directory.mkdir(parents=True, exist_ok=True)

        # Initialize components
        self.collectors = {}
        self.deduplicator = None

        # Pipeline statistics
        self.stats = {
            'start_time': datetime.now(),
            'end_time': None,
            'collection_stats': {},
            'deduplication_stats': {},
            'final_stats': {}
        }

    def _load_config(self) -> Dict:
        """Load configuration from YAML file."""
        try:
            if self.config_path.exists():
                with open(self.config_path, 'r', encoding='utf-8') as f:
                    return yaml.safe_load(f)
            else:
                logger.warning(f"Config file {self.config_path} not found, using defaults")
                return self._get_default_config()
        except Exception as e:
            logger.error(f"Error loading config: {e}, using defaults")
            return self._get_default_config()

    def _get_default_config(self) -> Dict:
        """Get default configuration."""
        return {
            'data_dir': 'data',
            'collectors': {
                'vd16': {
                    'enabled': True,
                    'requests_per_second': 2,
                    'max_records': None,
                    'use_oai_pmh': True,
                    'date_range': '1501-1600'
                },
                'vd17': {
                    'enabled': True,
                    'requests_per_second': 2,
                    'max_records': None,
                    'use_oai_pmh': True,
                    'date_range': '1601-1700'
                },
                'vd18': {
                    'enabled': True,
                    'requests_per_second': 2,
                    'max_records': None,
                    'use_oai_pmh': True,
                    'date_range': '1701-1800'
                },
                'ustc': {
                    'enabled': True,
                    'requests_per_second': 1,
                    'max_records': None,
                    'start_year': 1450,
                    'end_year': 1700
                },
                'estc': {
                    'enabled': False,  # Disabled by default due to access restrictions
                    'requests_per_second': 1,
                    'max_records': None,
                    'start_year': 1473,
                    'end_year': 1800
                }
            },
            'deduplication': {
                'title_threshold': 0.7,
                'author_threshold': 0.8,
                'date_tolerance': 5,
                'overall_threshold': 0.75,
                'weights': {
                    'title': 0.4,
                    'author': 0.3,
                    'date': 0.2,
                    'place': 0.1
                }
            },
            'output': {
                'filename': 'latin_master_bibliography.csv',
                'include_intermediate': True,
                'create_statistics': True
            }
        }

    def initialize_collectors(self):
        """Initialize data collectors based on configuration."""
        logger.info("Initializing data collectors")

        for collector_name, collector_config in self.config['collectors'].items():
            if collector_config.get('enabled', False):
                try:
                    # Set output directory for this collector
                    output_dir = self.raw_dir / collector_name
                    collector_config['output_dir'] = str(output_dir)
                    collector_config['name'] = collector_name.upper()

                    # Create collector instance
                    collector = CollectorFactory.create_collector(
                        collector_name, collector_config
                    )
                    self.collectors[collector_name] = collector
                    logger.info(f"Initialized {collector_name} collector")

                except Exception as e:
                    logger.error(f"Failed to initialize {collector_name} collector: {e}")

        if not self.collectors:
            raise ValueError("No collectors were successfully initialized")

    def initialize_deduplicator(self):
        """Initialize the deduplicator with configuration."""
        logger.info("Initializing deduplicator")
        dedup_config = self.config.get('deduplication', {})
        self.deduplicator = RecordDeduplicator(dedup_config)

    def collect_data(self) -> pd.DataFrame:
        """Collect data from all enabled catalogues."""
        logger.info("Starting data collection phase")

        all_dataframes = []

        for collector_name, collector in self.collectors.items():
            logger.info(f"Collecting data from {collector_name}")

            try:
                # Get max records from config
                max_records = self.config['collectors'][collector_name].get('max_records')

                # Collect data
                df = collector.collect_data(max_records=max_records)

                if not df.empty:
                    all_dataframes.append(df)
                    self.stats['collection_stats'][collector_name] = {
                        'total_records': len(df),
                        'latin_records': len(df),  # All records should be Latin after filtering
                        'collection_time': collector.stats['end_time'] - collector.stats['start_time']
                    }
                    logger.info(f"Collected {len(df)} records from {collector_name}")
                else:
                    logger.warning(f"No records collected from {collector_name}")

            except Exception as e:
                logger.error(f"Error collecting data from {collector_name}: {e}")
                continue

        # Combine all dataframes
        if all_dataframes:
            combined_df = pd.concat(all_dataframes, ignore_index=True)
            logger.info(f"Combined dataset contains {len(combined_df)} records from {len(all_dataframes)} catalogues")
        else:
            combined_df = pd.DataFrame()
            logger.warning("No data collected from any catalogue")

        # Save intermediate combined dataset
        if self.config['output'].get('include_intermediate', True):
            intermediate_file = self.intermediate_dir / 'combined_raw_data.csv'
            combined_df.to_csv(intermediate_file, index=False, encoding='utf-8-sig')
            logger.info(f"Saved combined raw data to {intermediate_file}")

        return combined_df

    def clean_and_normalize_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean and normalize the combined dataset.

        Args:
            df: Combined raw dataframe

        Returns:
            Cleaned and normalized dataframe
        """
        logger.info("Starting data cleaning and normalization")

        if df.empty:
            return df

        # Make a copy to avoid SettingWithCopyWarning
        df_clean = df.copy()

        # Convert publication_year to numeric, handling various formats
        df_clean['publication_year'] = pd.to_numeric(
            df_clean['publication_year'],
            errors='coerce'
        )

        # Filter by date range (1450-1900)
        date_mask = (df_clean['publication_year'] >= 1450) & (df_clean['publication_year'] <= 1900)
        df_clean = df_clean[date_mask]

        # Standardize language codes
        language_mapping = {
            'lat': 'lat',
            'latin': 'lat',
            'la': 'lat',
            'latín': 'lat',
            'latinisch': 'lat'
        }
        df_clean['language'] = df_clean['language'].str.lower().map(language_mapping)

        # Filter for Latin works only
        df_clean = df_clean[df_clean['language'] == 'lat']

        # Normalize text fields
        for field in ['title', 'author', 'publication_place', 'printer']:
            if field in df_clean.columns:
                df_clean[field] = df_clean[field].astype(str).str.strip()
                # Remove excess whitespace
                df_clean[field] = df_clean[field].str.replace(r'\s+', ' ', regex=True)

        # Handle missing values
        critical_fields = ['title']  # Title is required
        df_clean = df_clean.dropna(subset=critical_fields)

        # Remove exact duplicates within the same catalogue
        df_clean = df_clean.drop_duplicates(subset=['title', 'author', 'publication_year', 'source_catalogue'])

        logger.info(f"Data cleaning complete: {len(df)} -> {len(df_clean)} records")

        # Save intermediate cleaned dataset
        if self.config['output'].get('include_intermediate', True):
            cleaned_file = self.intermediate_dir / 'cleaned_data.csv'
            df_clean.to_csv(cleaned_file, index=False, encoding='utf-8-sig')
            logger.info(f"Saved cleaned data to {cleaned_file}")

        return df_clean

    def deduplicate_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Deduplicate the cleaned dataset.

        Args:
            df: Cleaned dataframe

        Returns:
            Deduplicated dataframe
        """
        logger.info("Starting deduplication phase")

        if df.empty:
            return df

        # Perform deduplication
        deduplicated_df = self.deduplicator.deduplicate_dataframe(df)

        # Store deduplication statistics
        self.stats['deduplication_stats'] = self.deduplicator.stats

        # Save deduplication report
        report_file = self.final_dir / 'deduplication_report.json'
        self.deduplicator.save_deduplication_report(df, deduplicated_df, report_file)

        # Save intermediate deduplicated dataset
        if self.config['output'].get('include_intermediate', True):
            deduplicated_file = self.intermediate_dir / 'deduplicated_data.csv'
            deduplicated_df.to_csv(deduplicated_file, index=False, encoding='utf-8-sig')
            logger.info(f"Saved deduplicated data to {deduplicated_file}")

        logger.info(f"Deduplication complete: {len(df)} -> {len(deduplicated_df)} records")

        return deduplicated_df

    def enhance_final_dataset(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Enhance the final dataset with additional processing.

        Args:
            df: Deduplicated dataframe

        Returns:
            Enhanced final dataframe
        """
        logger.info("Enhancing final dataset")

        if df.empty:
            return df

        df_enhanced = df.copy()

        # Add computed fields
        df_enhanced['title_length'] = df_enhanced['title'].str.len()
        df_enhanced['has_digital_facsimile'] = df_enhanced.get('digital_facsimile_urls', '').astype(bool)

        # Add completeness score
        required_fields = ['title', 'author', 'publication_year', 'publication_place']
        df_enhanced['completeness_score'] = (
            df_enhanced[required_fields].notna().sum(axis=1) / len(required_fields)
        )

        # Add century calculation
        df_enhanced['century'] = ((df_enhanced['publication_year'] - 1) // 100) + 1

        # Standardize final column order according to schema
        final_columns = [
            'master_id', 'title', 'title_normalized', 'author', 'author_normalized',
            'author_dates', 'publication_year', 'publication_year_uncertainty',
            'publication_place', 'publication_place_modern', 'printer', 'format',
            'language', 'latinity_level', 'genre', 'keywords',
            'ustc_id', 'vd16_id', 'vd17_id', 'vd18_id', 'estc_id', 'worldcat_id',
            'digital_facsimile_url', 'digital_source', 'digital_access',
            'holding_institutions', 'holding_count', 'deduplication_group',
            'deduplication_confidence', 'source_catalogues', 'primary_source',
            'record_status', 'notes', 'research_interest', 'date_created',
            'date_modified', 'version'
        ]

        # Add any additional columns not in the standard list
        additional_columns = [col for col in df_enhanced.columns if col not in final_columns]
        final_columns.extend(additional_columns)

        # Filter to only existing columns
        final_columns = [col for col in final_columns if col in df_enhanced.columns]

        df_enhanced = df_enhanced[final_columns]

        logger.info(f"Dataset enhancement complete with {len(df_enhanced)} records and {len(df_enhanced.columns)} fields")

        return df_enhanced

    def generate_statistics(self, df: pd.DataFrame):
        """Generate comprehensive statistics for the final dataset."""
        logger.info("Generating final statistics")

        if df.empty:
            return

        stats = {
            'total_records': len(df),
            'date_range': {
                'earliest': int(df['publication_year'].min()),
                'latest': int(df['publication_year'].max())
            },
            'catalogue_coverage': {},
            'language_distribution': df['language'].value_counts().to_dict(),
            'century_distribution': df.get('century', pd.Series()).value_counts().to_dict(),
            'digital_facsimile_coverage': 0,
            'average_completeness': 0.0,
            'top_authors': {},
            'top_places': {},
            'duplicate_reduction_rate': 0.0
        }

        # Catalogue coverage
        if 'source_catalogues' in df.columns:
            catalogues = df['source_catalogues'].str.split(';').explode()
            stats['catalogue_coverage'] = catalogues.value_counts().to_dict()

        # Digital facsimile coverage
        if 'has_digital_facsimile' in df.columns:
            stats['digital_facsimile_coverage'] = df['has_digital_facsimile'].sum() / len(df)

        # Average completeness
        if 'completeness_score' in df.columns:
            stats['average_completeness'] = df['completeness_score'].mean()

        # Top authors
        if 'author' in df.columns:
            stats['top_authors'] = df['author'].value_counts().head(20).to_dict()

        # Top places
        if 'publication_place' in df.columns:
            stats['top_places'] = df['publication_place'].value_counts().head(20).to_dict()

        self.stats['final_stats'] = stats

        # Save statistics
        if self.config['output'].get('create_statistics', True):
            stats_file = self.final_dir / 'dataset_statistics.json'
            with open(stats_file, 'w', encoding='utf-8') as f:
                json.dump(stats, f, indent=2, ensure_ascii=False, default=str)

            logger.info(f"Statistics saved to {stats_file}")

    def run_pipeline(self) -> pd.DataFrame:
        """
        Run the complete processing pipeline.

        Returns:
            Final processed dataframe
        """
        logger.info("Starting Latin Master Bibliography Pipeline")
        self.stats['start_time'] = datetime.now()

        try:
            # Initialize components
            self.initialize_collectors()
            self.initialize_deduplicator()

            # Phase 1: Data Collection
            raw_df = self.collect_data()

            # Phase 2: Data Cleaning
            cleaned_df = self.clean_and_normalize_data(raw_df)

            # Phase 3: Deduplication
            deduplicated_df = self.deduplicate_data(cleaned_df)

            # Phase 4: Final Enhancement
            final_df = self.enhance_final_dataset(deduplicated_df)

            # Phase 5: Statistics and Output
            self.generate_statistics(final_df)

            # Save final output
            output_filename = self.config['output'].get('filename', 'latin_master_bibliography.csv')
            output_file = self.final_dir / output_filename
            final_df.to_csv(output_file, index=False, encoding='utf-8-sig')

            logger.info(f"Pipeline completed successfully!")
            logger.info(f"Final dataset: {len(final_df)} records saved to {output_file}")

            return final_df

        except Exception as e:
            logger.error(f"Pipeline failed: {e}")
            raise

        finally:
            self.stats['end_time'] = datetime.now()
            self.stats['total_duration'] = (
                self.stats['end_time'] - self.stats['start_time']
            ).total_seconds()

            # Save pipeline statistics
            pipeline_stats_file = self.final_dir / 'pipeline_statistics.json'
            with open(pipeline_stats_file, 'w', encoding='utf-8') as f:
                json.dump(self.stats, f, indent=2, ensure_ascii=False, default=str)

    def print_summary(self):
        """Print a summary of the pipeline execution."""
        if not self.stats['end_time']:
            print("Pipeline has not completed yet.")
            return

        duration = self.stats['total_duration']
        collection_stats = self.stats['collection_stats']
        final_stats = self.stats['final_stats']

        print("\n" + "="*60)
        print("LATIN MASTER BIBLIOGRAPHY PIPELINE SUMMARY")
        print("="*60)

        print(f"\nTotal processing time: {duration:.2f} seconds")

        print(f"\nData Collection:")
        for catalogue, stats in collection_stats.items():
            print(f"  {catalogue.upper()}: {stats['latin_records']} records")

        print(f"\nFinal Dataset:")
        if final_stats:
            print(f"  Total records: {final_stats['total_records']}")
            print(f"  Date range: {final_stats['date_range']['earliest']}-{final_stats['date_range']['latest']}")
            print(f"  Digital facsimile coverage: {final_stats['digital_facsimile_coverage']:.1%}")
            print(f"  Average completeness: {final_stats['average_completeness']:.2f}")

        print(f"\nOutput files:")
        print(f"  Main CSV: data/processed/final/latin_master_bibliography.csv")
        print(f"  Statistics: data/processed/final/dataset_statistics.json")
        print(f"  Pipeline log: data/pipeline.log")

        print("\n" + "="*60)


if __name__ == "__main__":
    # Example usage
    pipeline = LatinBibliographyPipeline()

    try:
        # Run the complete pipeline
        final_df = pipeline.run_pipeline()

        # Print summary
        pipeline.print_summary()

        # Display sample of final data
        if not final_df.empty:
            print(f"\nSample of final dataset (first 5 records):")
            display_columns = ['title', 'author', 'publication_year', 'publication_place', 'source_catalogues']
            available_columns = [col for col in display_columns if col in final_df.columns]
            print(final_df[available_columns].head().to_string())

    except Exception as e:
        print(f"Pipeline execution failed: {e}")
        logger.exception("Pipeline failed")