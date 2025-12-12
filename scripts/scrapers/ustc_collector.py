#!/usr/bin/env python3
"""
USTC collector for harvesting Latin works from Universal Short Title Catalogue.
USTC: Universal Short Title Catalogue
"""

import requests
import re
import time
from typing import Dict, List, Optional
from urllib.parse import urljoin
from bs4 import BeautifulSoup
import pandas as pd
from base_collector import BaseCollector, CollectorFactory
import logging

logger = logging.getLogger(__name__)


class USTCCollector(BaseCollector):
    """
    Collector for USTC (Universal Short Title Catalogue).
    Uses web interface due to limited API availability.
    """

    def __init__(self, config: Dict):
        super().__init__(config)
        self.base_url = "https://ustc.ac.uk"
        self.search_url = "https://ustc.ac.uk/search"
        self.detail_url = "https://ustc.ac.uk/record"

        # USTC specific configuration
        self.language_filter = config.get('language_filter', 'Latin')
        self.start_year = config.get('start_year', 1450)
        self.end_year = config.get('end_year', 1600)

        # Session setup
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; LatinBibliographyBot/1.0)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        })

    def search_latin_works(self, **kwargs) -> List[Dict]:
        """
        Search for Latin works in USTC.
        Uses web interface with pagination.

        Returns:
            List of raw records from USTC
        """
        logger.info(f"Searching USTC for Latin works ({self.start_year}-{self.end_year})")

        records = []
        page = 1
        max_pages = self.config.get('max_pages', 100)

        try:
            while page <= max_pages:
                logger.info(f"Processing page {page}")

                # Construct search parameters
                search_params = self._build_search_params(page, **kwargs)

                # Make search request
                search_results = self._perform_search(search_params)
                if not search_results:
                    logger.info("No more results found")
                    break

                # Extract record IDs from search results
                record_ids = self._extract_record_ids(search_results)
                if not record_ids:
                    logger.info("No record IDs found on page")
                    break

                # Get detailed information for each record
                for record_id in record_ids:
                    try:
                        detailed_record = self.get_record_details(record_id)
                        if detailed_record:
                            records.append(detailed_record)
                    except Exception as e:
                        logger.error(f"Error getting details for record {record_id}: {e}")
                        continue

                # Check if we should continue pagination
                if len(record_ids) < self.config.get('records_per_page', 20):
                    logger.info("Fewer records than expected, assuming last page")
                    break

                page += 1

        except Exception as e:
            logger.error(f"Error in USTC search: {e}")
            raise

        logger.info(f"Found {len(records)} total records in USTC")
        return records

    def _build_search_params(self, page: int = 1, **kwargs) -> Dict:
        """
        Build search parameters for USTC.

        Args:
            page: Page number
            **kwargs: Additional search parameters

        Returns:
            Dictionary of search parameters
        """
        params = {
            'q': '',  # Basic query
            'language': self.language_filter,
            'date_from': self.start_year,
            'date_to': self.end_year,
            'page': page,
            'per_page': self.config.get('records_per_page', 20),
            'sort': 'date_asc',  # Sort by date
        }

        # Add additional parameters from kwargs
        params.update(kwargs)

        return params

    def _perform_search(self, params: Dict) -> Optional[BeautifulSoup]:
        """
        Perform search request and return parsed results.

        Args:
            params: Search parameters

        Returns:
            BeautifulSoup object with search results or None
        """
        try:
            self._rate_limit()

            response = self.session.get(self.search_url, params=params, timeout=30)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')
            return soup

        except Exception as e:
            logger.error(f"Error performing search: {e}")
            return None

    def _extract_record_ids(self, search_results: BeautifulSoup) -> List[str]:
        """
        Extract USTC record IDs from search results page.

        Args:
            search_results: BeautifulSoup object of search results

        Returns:
            List of record IDs
        """
        record_ids = []

        try:
            # Look for record links - this depends on USTC's HTML structure
            record_links = search_results.find_all('a', href=re.compile(r'/record/\d+'))

            for link in record_links:
                href = link.get('href', '')
                # Extract ID from URL pattern
                match = re.search(r'/record/(\d+)', href)
                if match:
                    record_id = match.group(1)
                    if record_id not in record_ids:
                        record_ids.append(record_id)

        except Exception as e:
            logger.error(f"Error extracting record IDs: {e}")

        return record_ids

    def get_record_details(self, record_id: str) -> Optional[Dict]:
        """
        Get detailed information for a specific USTC record.

        Args:
            record_id: USTC record identifier

        Returns:
            Detailed record information or None if not found
        """
        logger.debug(f"Getting details for USTC record: {record_id}")

        try:
            self._rate_limit()

            # Get record detail page
            detail_url = f"{self.detail_url}/{record_id}"
            response = self.session.get(detail_url, timeout=30)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')

            # Extract detailed information
            record = {
                'ustc_id': record_id,
                'detail_url': detail_url,
                'raw_html': str(soup),
            }

            # Extract bibliographic information
            record.update(self._extract_bibliographic_details(soup))

            # Check if it's a Latin work and within date range
            if not self._is_latin_work(record):
                return None

            year = record.get('publication_year')
            if year and not self._validate_date_range(year):
                return None

            return record

        except Exception as e:
            logger.error(f"Error getting record details for {record_id}: {e}")
            return None

    def _extract_bibliographic_details(self, soup: BeautifulSoup) -> Dict:
        """
        Extract bibliographic details from USTC record page.

        Args:
            soup: BeautifulSoup object of record page

        Returns:
            Dictionary of bibliographic information
        """
        details = {}

        try:
            # Extract title
            title_elem = soup.find('h1', class_='title') or soup.find('h1')
            if title_elem:
                details['title'] = title_elem.get_text(strip=True)

            # Extract bibliographic metadata
            # This depends heavily on USTC's HTML structure
            metadata_sections = soup.find_all('div', class_='metadata') or soup.find_all('td')

            for section in metadata_sections:
                text = section.get_text(strip=True)

                # Look for author information
                if any(keyword in text.lower() for keyword in ['author:', 'by']):
                    author = self._clean_author_name(text)
                    if author:
                        details['author'] = author

                # Look for publication information
                elif any(keyword in text.lower() for keyword in ['published:', 'place:', 'date:']):
                    pub_info = self._parse_publication_info(text)
                    details.update(pub_info)

                # Look for language information
                elif 'language:' in text.lower():
                    language = self._extract_language_from_text(text)
                    if language:
                        details['language'] = language

                # Look for physical description
                elif any(keyword in text.lower() for keyword in ['format:', 'pages:', 'illust']):
                    details['physical_description'] = text

            # Extract additional notes
            notes_section = soup.find('div', class_='notes')
            if notes_section:
                details['notes'] = notes_section.get_text(strip=True)

            # Extract digital facsimile links
            facsimile_links = soup.find_all('a', href=re.compile(r'digital|facsimile|view'))
            if facsimile_links:
                details['digital_links'] = [link.get('href') for link in facsimile_links]

        except Exception as e:
            logger.error(f"Error extracting bibliographic details: {e}")

        return details

    def _clean_author_name(self, author_text: str) -> str:
        """Clean and normalize author name."""
        # Remove common prefixes and suffixes
        author_text = re.sub(r'(?i)author[:\s]*', '', author_text)
        author_text = re.sub(r'(?i)by[:\s]*', '', author_text)
        author_text = re.sub(r'[:\d\[\]()]', '', author_text)
        return author_text.strip()

    def _parse_publication_info(self, pub_text: str) -> Dict:
        """Parse publication information."""
        pub_info = {}

        # Extract year
        year_match = re.search(r'\b(14[5-9]\d|15\d\d|16\d\d)\b', pub_text)
        if year_match:
            pub_info['publication_year'] = int(year_match.group())

        # Extract place (simplified)
        place_patterns = [
            r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*[:\[]',
            r'([^:\[\]]+)\s*[\[\:]',
        ]
        for pattern in place_patterns:
            place_match = re.search(pattern, pub_text)
            if place_match:
                place = place_match.group(1).strip()
                if len(place) > 2:  # Avoid single characters
                    pub_info['publication_place'] = place
                    break

        return pub_info

    def _extract_language_from_text(self, text: str) -> str:
        """Extract language information from text."""
        # Look for language indicators
        if re.search(r'\blatin\b', text, re.IGNORECASE):
            return 'lat'
        elif re.search(r'\bgreek\b', text, re.IGNORECASE):
            return 'grc'
        elif re.search(r'\bfrench\b', text, re.IGNORECASE):
            return 'fre'
        elif re.search(r'\bgerman\b', text, re.IGNORECASE):
            return 'ger'
        elif re.search(r'\bitalian\b', text, re.IGNORECASE):
            return 'ita'
        elif re.search(r'\benglish\b', text, re.IGNORECASE):
            return 'eng'

        return ''

    def _normalize_record(self, record: Dict) -> Dict:
        """
        Normalize USTC record to standard format.

        Args:
            record: Raw USTC record

        Returns:
            Normalized record
        """
        base_normalized = super()._normalize_record(record)

        # USTC-specific normalization
        normalized = {
            **base_normalized,
            'ustc_id': record.get('ustc_id', ''),
            'title': record.get('title', ''),
            'author': record.get('author', ''),
            'publication_year': record.get('publication_year'),
            'publication_place': record.get('publication_place', ''),
            'language': record.get('language', ''),
            'physical_description': record.get('physical_description', ''),
            'notes': record.get('notes', ''),
            'detail_url': record.get('detail_url', ''),
        }

        # Extract digital facsimile URLs
        digital_links = record.get('digital_links', [])
        if digital_links:
            normalized['digital_facsimile_urls'] = digital_links

        return normalized


# Register the collector
CollectorFactory.register_collector('ustc', USTCCollector)


if __name__ == "__main__":
    # Example usage
    config = {
        'name': 'USTC',
        'requests_per_second': 1,
        'output_dir': 'data/raw/ustc',
        'language_filter': 'Latin',
        'start_year': 1450,
        'end_year': 1600,
        'max_pages': 10,
        'records_per_page': 20
    }

    collector = CollectorFactory.create_collector('ustc', config)

    try:
        # Collect data (limiting for testing)
        df = collector.collect_data(max_records=50)
        print(f"Collected {len(df)} Latin works from USTC")

        # Save final results
        output_file = Path(config['output_dir']) / 'ustc_latin_works.csv'
        df.to_csv(output_file, index=False, encoding='utf-8-sig')
        print(f"Results saved to {output_file}")

    except Exception as e:
        print(f"Error: {e}")