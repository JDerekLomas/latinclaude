#!/usr/bin/env python3
"""
Base class for catalogue data collectors.
Provides common functionality for harvesting bibliographic records.
"""

import abc
import time
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
import json
import pandas as pd
from tqdm import tqdm

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('data/collection.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class BaseCollector(abc.ABC):
    """
    Abstract base class for catalogue data collectors.
    Each catalogue (USTC, VD16, VD17, VD18, ESTC) should implement this interface.
    """

    def __init__(self, config: Dict[str, Any]):
        """
        Initialize collector with configuration.

        Args:
            config: Dictionary containing collector-specific configuration
        """
        self.config = config
        self.name = config.get('name', self.__class__.__name__)
        self.base_url = config.get('base_url', '')
        self.output_dir = Path(config.get('output_dir', 'data/raw'))
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Rate limiting settings
        self.requests_per_second = config.get('requests_per_second', 1)
        self.min_delay = 1.0 / self.requests_per_second
        self.last_request_time = 0

        # Session and headers
        self.session_headers = config.get('headers', {})

        # Statistics
        self.stats = {
            'total_records': 0,
            'latin_records': 0,
            'errors': 0,
            'start_time': datetime.now(),
            'end_time': None
        }

    def _rate_limit(self):
        """Implement rate limiting between requests."""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time

        if time_since_last < self.min_delay:
            sleep_time = self.min_delay - time_since_last
            time.sleep(sleep_time)

        self.last_request_time = time.time()

    def _save_progress(self, records: List[Dict], batch_id: Optional[str] = None):
        """
        Save intermediate progress to avoid data loss.

        Args:
            records: List of records to save
            batch_id: Optional batch identifier for filename
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        batch_id = batch_id or "batch"

        # Save as JSON for intermediate processing
        json_file = self.output_dir / f"{self.name}_{batch_id}_{timestamp}.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(records, f, ensure_ascii=False, indent=2)

        # Also save as CSV for easier inspection
        if records:
            csv_file = self.output_dir / f"{self.name}_{batch_id}_{timestamp}.csv"
            df = pd.DataFrame(records)
            df.to_csv(csv_file, index=False, encoding='utf-8-sig')

        logger.info(f"Saved {len(records)} records to {json_file}")

    def _normalize_record(self, record: Dict) -> Dict:
        """
        Normalize a single record to standard format.
        Should be implemented by each collector for their specific format.

        Args:
            record: Raw record from catalogue

        Returns:
            Normalized record with standard field names
        """
        # Base normalization - can be overridden by subclasses
        normalized = {
            'source_catalogue': self.name,
            'raw_record': record,
            'collection_date': datetime.now().isoformat(),
            'collector_version': '1.0.0'
        }

        # Extract common fields (implement as needed for each catalogue)
        for field in ['title', 'author', 'publication_year', 'publication_place']:
            if field in record:
                normalized[field] = record[field]

        return normalized

    def _is_latin_work(self, record: Dict) -> bool:
        """
        Determine if a record represents a Latin work.
        Should be implemented based on each catalogue's language encoding.

        Args:
            record: Normalized record

        Returns:
            True if record is likely a Latin work
        """
        # Default implementation - can be overridden
        language = record.get('language', '').lower()
        return language in ['lat', 'latin', 'la', 'latín', 'latinisch']

    def _validate_date_range(self, year: Optional[int]) -> bool:
        """
        Validate that a publication year falls within our target range.

        Args:
            year: Publication year to validate

        Returns:
            True if year is within 1450-1900 range
        """
        if year is None:
            return False
        return 1450 <= year <= 1900

    @abc.abstractmethod
    def search_latin_works(self, **kwargs) -> List[Dict]:
        """
        Search for Latin works in the catalogue.
        Should implement catalogue-specific search logic.

        Returns:
            List of raw records from the catalogue
        """
        pass

    @abc.abstractmethod
    def get_record_details(self, record_id: str) -> Optional[Dict]:
        """
        Get detailed information for a specific record.

        Args:
            record_id: Identifier for the record in the catalogue

        Returns:
            Detailed record information or None if not found
        """
        pass

    def collect_data(self, max_records: Optional[int] = None,
                    save_batches: bool = True, batch_size: int = 1000) -> pd.DataFrame:
        """
        Main method to collect data from the catalogue.

        Args:
            max_records: Maximum number of records to collect (None for unlimited)
            save_batches: Whether to save intermediate batches
            batch_size: Number of records per batch

        Returns:
            DataFrame containing all collected records
        """
        logger.info(f"Starting data collection from {self.name}")
        self.stats['start_time'] = datetime.now()

        all_records = []
        batch_count = 0

        try:
            # Get initial search results
            raw_records = self.search_latin_works(**self.config.get('search_params', {}))
            logger.info(f"Found {len(raw_records)} total records from initial search")

            # Process records
            for i, raw_record in enumerate(tqdm(raw_records, desc=f"Processing {self.name}")):
                if max_records and len(all_records) >= max_records:
                    logger.info(f"Reached maximum record limit: {max_records}")
                    break

                try:
                    # Normalize record
                    normalized = self._normalize_record(raw_record)

                    # Filter for Latin works within date range
                    if self._is_latin_work(normalized):
                        year = normalized.get('publication_year')
                        if year is None or self._validate_date_range(year):
                            all_records.append(normalized)
                            self.stats['latin_records'] += 1

                    self.stats['total_records'] += 1

                    # Save batches if enabled
                    if save_batches and len(all_records) % batch_size == 0:
                        batch_count += 1
                        self._save_progress(all_records[-batch_size:], f"batch_{batch_count}")

                except Exception as e:
                    logger.error(f"Error processing record {i}: {e}")
                    self.stats['errors'] += 1
                    continue

            # Save final batch
            if save_batches and all_records:
                batch_count += 1
                self._save_progress(all_records[-(len(all_records) % batch_size):], f"batch_{batch_count}")

        except Exception as e:
            logger.error(f"Error in data collection: {e}")
            raise

        # Create final DataFrame
        if all_records:
            df = pd.DataFrame(all_records)
            logger.info(f"Collected {len(df)} Latin works from {self.name}")
        else:
            df = pd.DataFrame()
            logger.warning("No Latin records collected")

        # Update statistics
        self.stats['end_time'] = datetime.now()
        self._save_stats()

        return df

    def _save_stats(self):
        """Save collection statistics to file."""
        stats_file = self.output_dir / f"{self.name}_stats.json"

        # Convert datetime objects to strings for JSON serialization
        stats_to_save = self.stats.copy()
        stats_to_save['start_time'] = stats_to_save['start_time'].isoformat()
        if stats_to_save['end_time']:
            stats_to_save['end_time'] = stats_to_save['end_time'].isoformat()

        with open(stats_file, 'w', encoding='utf-8') as f:
            json.dump(stats_to_save, f, indent=2)

        logger.info(f"Collection complete. Statistics saved to {stats_file}")
        logger.info(f"Total records processed: {self.stats['total_records']}")
        logger.info(f"Latin records collected: {self.stats['latin_records']}")
        logger.info(f"Errors encountered: {self.stats['errors']}")


class CollectorFactory:
    """Factory class to create catalogue-specific collectors."""

    _collectors = {}

    @classmethod
    def register_collector(cls, name: str, collector_class):
        """Register a collector class."""
        cls._collectors[name] = collector_class

    @classmethod
    def create_collector(cls, name: str, config: Dict) -> BaseCollector:
        """
        Create a collector instance.

        Args:
            name: Name of the collector to create
            config: Configuration dictionary

        Returns:
            Collector instance
        """
        if name not in cls._collectors:
            raise ValueError(f"Unknown collector: {name}. Available: {list(cls._collectors.keys())}")

        return cls._collectors[name](config)

    @classmethod
    def list_collectors(cls) -> List[str]:
        """List available collector names."""
        return list(cls._collectors.keys())