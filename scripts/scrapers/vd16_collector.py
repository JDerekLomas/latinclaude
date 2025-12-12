#!/usr/bin/env python3
"""
VD16 collector for harvesting Latin works from VD16 database.
VD16: Verzeichnis der im deutschen Sprachraum erschienenen Drucke des 16. Jahrhunderts
"""

import requests
import re
from typing import Dict, List, Optional
from urllib.parse import urljoin
from bs4 import BeautifulSoup
import pandas as pd
from base_collector import BaseCollector, CollectorFactory
import logging

logger = logging.getLogger(__name__)


class VD16Collector(BaseCollector):
    """
    Collector for VD16 (16th century German printing).
    Uses Gateway.Bayern interface and OAI-PMH where possible.
    """

    def __init__(self, config: Dict):
        super().__init__(config)
        self.base_url = "https://gateway-bayern.de"
        self.search_url = "https://gateway-bayern.de/VD16"
        self.oai_pmh_url = "https://oai.bsb-muenchen.de/oai2"

        # VD16 specific configuration
        self.language_filter = config.get('language_filter', 'lat')  # Latin language code
        self.date_range = config.get('date_range', '1501-1600')

    def search_latin_works(self, **kwargs) -> List[Dict]:
        """
        Search for Latin works in VD16.
        Uses both web interface and OAI-PMH if available.

        Returns:
            List of raw records from VD16
        """
        logger.info("Searching VD16 for Latin works")

        records = []

        try:
            # Try OAI-PMH first if configured
            if self.config.get('use_oai_pmh', True):
                oai_records = self._search_oai_pmh()
                records.extend(oai_records)

            # Fallback to web scraping if OAI-PMH doesn't yield results
            if not records or self.config.get('force_web_scraping', False):
                web_records = self._search_web_interface()
                records.extend(web_records)

        except Exception as e:
            logger.error(f"Error searching VD16: {e}")
            raise

        logger.info(f"Found {len(records)} total records in VD16")
        return records

    def _search_oai_pmh(self) -> List[Dict]:
        """
        Search using OAI-PMH interface.

        Returns:
            List of records from OAI-PMH
        """
        logger.info("Attempting VD16 OAI-PMH harvest")

        # OAI-PMH parameters for VD16
        params = {
            'verb': 'ListRecords',
            'metadataPrefix': 'marcxml',
            'set': 'VD16',  # VD16 set identifier
        }

        records = []

        try:
            while True:
                self._rate_limit()

                response = requests.get(self.oai_pmh_url, params=params, timeout=30)
                response.raise_for_status()

                soup = BeautifulSoup(response.content, 'xml')

                # Extract records
                marc_records = soup.find_all('record')
                for record in marc_records:
                    processed = self._process_marc_record(record)
                    if processed:
                        records.append(processed)

                # Check for resumption token
                resumption_token = soup.find('resumptionToken')
                if resumption_token and resumption_token.text:
                    params = {
                        'verb': 'ListRecords',
                        'resumptionToken': resumption_token.text
                    }
                else:
                    break

        except Exception as e:
            logger.error(f"OAI-PMH harvest failed: {e}")

        logger.info(f"OAI-PMH harvested {len(records)} records")
        return records

    def _search_web_interface(self) -> List[Dict]:
        """
        Fallback web interface scraping.

        Returns:
            List of records from web interface
        """
        logger.info("Falling back to web interface scraping")

        records = []

        # This is a simplified implementation
        # In practice, would need to handle pagination, form submission, etc.
        search_params = {
            'lang': self.language_filter,
            'year': self.date_range,
            'format': 'json'  # If available
        }

        try:
            # Implement web scraping logic here
            # This would involve:
            # 1. Submitting search form
            # 2. Parsing results pages
            # 3. Handling pagination
            # 4. Extracting individual record details

            logger.warning("Web interface scraping not fully implemented")
        except Exception as e:
            logger.error(f"Web interface scraping failed: {e}")

        return records

    def _process_marc_record(self, marc_record) -> Optional[Dict]:
        """
        Process a MARC XML record from OAI-PMH.

        Args:
            marc_record: BeautifulSoup object representing MARC record

        Returns:
            Processed record dictionary or None if not Latin
        """
        try:
            # Extract MARC data fields
            datafields = marc_record.find_all('datafield')

            record = {
                'vd16_id': self._extract_control_number(marc_record),
                'raw_marc': str(marc_record),
            }

            # Extract standard bibliographic fields
            for field in datafields:
                tag = field.get('tag')
                ind1 = field.get('ind1')
                ind2 = field.get('ind2')

                if tag == '245':  # Title statement
                    record['title'] = self._extract_title(field)
                elif tag == '100':  # Main entry - personal name
                    record['author'] = self._extract_author(field)
                elif tag == '260':  # Publication info
                    record['publication_info'] = self._extract_publication_info(field)
                elif tag == '008':  # Fixed field
                    record['fixed_field'] = field.text
                elif tag == '300':  # Physical description
                    record['physical_description'] = self._extract_physical_description(field)
                elif tag == '500':  # General notes
                    record['notes'] = self._extract_notes(field)

            # Process publication info
            if 'publication_info' in record:
                pub_info = record['publication_info']
                record['publication_year'] = self._extract_year(pub_info)
                record['publication_place'] = self._extract_place(pub_info)
                record['printer'] = self._extract_printer(pub_info)

            # Extract language
            record['language'] = self._extract_language(marc_record)

            # Check if it's a Latin work
            if not self._is_latin_work(record):
                return None

            return record

        except Exception as e:
            logger.error(f"Error processing MARC record: {e}")
            return None

    def _extract_control_number(self, marc_record) -> str:
        """Extract VD16 control number (001 field)."""
        control_field = marc_record.find('controlfield', {'tag': '001'})
        if control_field:
            return control_field.text.strip()
        return ''

    def _extract_title(self, title_field) -> str:
        """Extract title from MARC 245 field."""
        title_parts = []
        for subfield in title_field.find_all('subfield'):
            code = subfield.get('code')
            text = subfield.text.strip()
            if code == 'a':  # Title proper
                title_parts.append(text)
            elif code == 'b':  # Other title info
                title_parts.append(text)
        return ' '.join(title_parts)

    def _extract_author(self, author_field) -> str:
        """Extract author name from MARC 100 field."""
        author_parts = []
        for subfield in author_field.find_all('subfield'):
            code = subfield.get('code')
            text = subfield.text.strip()
            if code == 'a':  # Personal name
                author_parts.append(text)
            elif code == 'd':  # Dates
                author_parts.append(f"({text})")
        return ''.join(author_parts)

    def _extract_publication_info(self, pub_field) -> Dict:
        """Extract publication information from MARC 260 field."""
        pub_info = {}
        for subfield in pub_field.find_all('subfield'):
            code = subfield.get('code')
            text = subfield.text.strip()
            if code == 'a':  # Place of publication
                pub_info['place'] = text
            elif code == 'b':  # Publisher/printer
                pub_info['printer'] = text
            elif code == 'c':  # Date
                pub_info['date'] = text
        return pub_info

    def _extract_physical_description(self, phys_field) -> str:
        """Extract physical description from MARC 300 field."""
        parts = []
        for subfield in phys_field.find_all('subfield'):
            parts.append(subfield.text.strip())
        return ' '.join(parts)

    def _extract_notes(self, notes_field) -> str:
        """Extract notes from MARC 500 field."""
        subfield = notes_field.find('subfield', {'code': 'a'})
        if subfield:
            return subfield.text.strip()
        return ''

    def _extract_language(self, marc_record) -> str:
        """Extract language code from MARC 008 field or 041 field."""
        # Try 008 field first (positions 35-37)
        fixed_field = marc_record.find('controlfield', {'tag': '008'})
        if fixed_field and len(fixed_field.text) > 37:
            lang_code = fixed_field.text[35:38]
            return lang_code.lower()

        # Try 041 field as fallback
        lang_field = marc_record.find('datafield', {'tag': '041'})
        if lang_field:
            subfield = lang_field.find('subfield', {'code': 'a'})
            if subfield:
                return subfield.text.strip().lower()

        return ''

    def _extract_year(self, pub_info: Dict) -> Optional[int]:
        """Extract publication year from publication info."""
        date_str = pub_info.get('date', '')
        # Extract year using regex
        year_match = re.search(r'\b(14[5-9]\d|15\d\d|16\d\d)\b', date_str)
        if year_match:
            return int(year_match.group())
        return None

    def _extract_place(self, pub_info: Dict) -> str:
        """Extract publication place from publication info."""
        return pub_info.get('place', '')

    def _extract_printer(self, pub_info: Dict) -> str:
        """Extract printer from publication info."""
        return pub_info.get('printer', '')

    def get_record_details(self, record_id: str) -> Optional[Dict]:
        """
        Get detailed information for a specific VD16 record.

        Args:
            record_id: VD16 identifier

        Returns:
            Detailed record information
        """
        logger.info(f"Getting details for VD16 record: {record_id}")

        try:
            # This would typically involve:
            # 1. Querying the VD16 detail page
            # 2. Parsing the detailed record
            # 3. Extracting additional information not in the MARC record

            # Implementation would depend on VD16's web interface
            logger.warning("Detailed record retrieval not fully implemented")
            return None

        except Exception as e:
            logger.error(f"Error getting record details for {record_id}: {e}")
            return None

    def _normalize_record(self, record: Dict) -> Dict:
        """
        Normalize VD16 record to standard format.

        Args:
            record: Raw VD16 record

        Returns:
            Normalized record
        """
        base_normalized = super()._normalize_record(record)

        # VD16-specific normalization
        normalized = {
            **base_normalized,
            'vd16_id': record.get('vd16_id', ''),
            'title': record.get('title', ''),
            'author': record.get('author', ''),
            'publication_year': record.get('publication_year'),
            'publication_place': record.get('publication_place', ''),
            'printer': record.get('printer', ''),
            'language': record.get('language', ''),
            'physical_description': record.get('physical_description', ''),
            'notes': record.get('notes', ''),
        }

        return normalized


# Register the collector
CollectorFactory.register_collector('vd16', VD16Collector)


if __name__ == "__main__":
    # Example usage
    config = {
        'name': 'VD16',
        'requests_per_second': 2,
        'output_dir': 'data/raw/vd16',
        'use_oai_pmh': True,
        'language_filter': 'lat',
        'date_range': '1501-1600'
    }

    collector = CollectorFactory.create_collector('vd16', config)

    try:
        # Collect data (limiting to 100 records for testing)
        df = collector.collect_data(max_records=100)
        print(f"Collected {len(df)} Latin works from VD16")

        # Save final results
        output_file = Path(config['output_dir']) / 'vd16_latin_works.csv'
        df.to_csv(output_file, index=False, encoding='utf-8-sig')
        print(f"Results saved to {output_file}")

    except Exception as e:
        print(f"Error: {e}")