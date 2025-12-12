#!/usr/bin/env python3
"""
Demo collector for testing the pipeline without external connections.
Generates sample Latin works data for demonstration purposes.
"""

import random
import logging
from typing import Dict, List, Optional
from pathlib import Path
from base_collector import BaseCollector, CollectorFactory
import pandas as pd

logger = logging.getLogger(__name__)

class DemoCollector(BaseCollector):
    """
    Demo collector that generates sample data for testing.
    """

    def __init__(self, config: Dict):
        super().__init__(config)
        self.name = 'DEMO'

        # Sample data for demonstration
        self.sample_titles = [
            'De Revolutionibus Orbium Coelestium',
            'Summa Theologica',
            'Ars Magna',
            'Divina Commedia',
            'De Anima',
            'Ethica Nicomachea',
            'De Civitate Dei',
            'Historia Naturalis',
            'De Rerum Natura',
            'Institutio Oratoria'
        ]

        self.sample_authors = [
            'Copernicus, Nicolaus',
            'Thomas Aquinas',
            'Lullus, Raimundus',
            'Dante Alighieri',
            'Aristoteles',
            'Cicero, Marcus Tullius',
            'Augustinus, Aurelius',
            'Plinius Secundus, Gaius',
            'Lucretius, Titus',
            'Quintilianus, Marcus Fabius'
        ]

        self.sample_places = [
            'Nuremberg', 'Paris', 'Venice', 'Basel', 'Rome',
            'Lyon', 'Cologne', 'Antwerp', 'London', 'Wittenberg'
        ]

        self.sample_printers = [
            'Johannes Petreius', 'Henri Estienne', 'Aldus Manutius',
            'Johann Froben', 'Anton Koberger', 'Sebastian Gryphius',
            'Johann Fust', 'Christopher Plantin', 'William Caxton',
            'Johann Weinreich'
        ]

    def search_latin_works(self, **kwargs) -> List[Dict]:
        """
        Generate sample Latin works for demonstration.

        Returns:
            List of sample records
        """
        logger.info(f"Generating {self.config.get('max_records', 20)} sample Latin works")

        records = []
        max_records = self.config.get('max_records', 20)

        for i in range(max_records):
            record = {
                'demo_id': f'DEMO_{i+1:06d}',
                'title': random.choice(self.sample_titles),
                'author': random.choice(self.sample_authors),
                'publication_year': random.randint(1450, 1600),
                'publication_place': random.choice(self.sample_places),
                'printer': random.choice(self.sample_printers),
                'language': 'lat',
                'format': random.choice(['Folio', 'Quarto', 'Octavo']),
                'digital_facsimile_urls': random.choice([
                    [],
                    ['https://example.com/facsimile'],
                    ['https://books.google.com/books/sample']
                ]),
                'source_catalogue': 'DEMO'
            }
            records.append(record)

        return records

    def get_record_details(self, record_id: str) -> Optional[Dict]:
        """
        Get detailed information for a specific record (simulated).

        Args:
            record_id: Demo record identifier

        Returns:
            Detailed record information
        """
        # For demo purposes, return basic info
        record_num = int(record_id.split('_')[1])
        if 1 <= record_num <= len(self.sample_titles):
            return {
                'demo_id': record_id,
                'title': self.sample_titles[record_num - 1],
                'author': self.sample_authors[record_num - 1],
                'language': 'lat',
                'source_catalogue': 'DEMO'
            }
        return None

    def _normalize_record(self, record: Dict) -> Dict:
        """
        Normalize demo record to standard format.

        Args:
            record: Demo record

        Returns:
            Normalized record
        """
        base_normalized = super()._normalize_record(record)

        # Demo-specific normalization
        normalized = {
            **base_normalized,
            'demo_id': record.get('demo_id', ''),
            'title': record.get('title', ''),
            'author': record.get('author', ''),
            'publication_year': record.get('publication_year'),
            'publication_place': record.get('publication_place', ''),
            'printer': record.get('printer', ''),
            'language': record.get('language', ''),
            'format': record.get('format', ''),
            'digital_facsimile_urls': record.get('digital_facsimile_urls', []),
        }

        return normalized


# Register the demo collector
CollectorFactory.register_collector('demo', DemoCollector)


if __name__ == "__main__":
    # Example usage
    config = {
        'name': 'DEMO',
        'requests_per_second': 1,
        'output_dir': 'data/raw/demo',
        'max_records': 15
    }

    collector = CollectorFactory.create_collector('demo', config)

    try:
        df = collector.collect_data()
        print(f"Generated {len(df)} sample Latin works")

        if not df.empty:
            output_file = Path(config['output_dir']) / 'demo_sample_data.csv'
            df.to_csv(output_file, index=False, encoding='utf-8-sig')
            print(f"Sample data saved to {output_file}")

    except Exception as e:
        print(f"Error: {e}")