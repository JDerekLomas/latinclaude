#!/usr/bin/env python3
"""
Alternative data collectors for sources with more accessible APIs.
These can be used while waiting for USTC access.
"""

import requests
import time
from typing import Dict, List, Optional
from base_collector import BaseCollector, CollectorFactory
import logging

logger = logging.getLogger(__name__)


class WorldCatCollector(BaseCollector):
    """
    WorldCat collector - accessible via OCLC API with developer access.
    """

    def __init__(self, config: Dict):
        super().__init__(config)
        self.base_url = "https://www.worldcat.org/webservices/catalog/search/worldcat/opensearch"
        self.detail_url = "https://www.worldcat.org/webservices/catalog/content/cites/oclcNumber"
        self.api_key = config.get('api_key')

    def search_latin_works(self, **kwargs) -> List[Dict]:
        """
        Search WorldCat for Latin works.

        Returns:
            List of Latin work records from WorldCat
        """
        if not self.api_key:
            logger.warning("No WorldCat API key provided. Using limited sample data.")
            return self._generate_sample_data()

        records = []
        search_terms = [
            "language:(lat OR latin)",
            "srw.la=lat",
            "languageCode:lat"
        ]

        for term in search_terms:
            try:
                params = {
                    'q': f'{term} publishDate:[1450 TO 1700]',
                    'wskey': self.api_key,
                    'format': 'json',
                    'count': 50
                }

                self._rate_limit()
                response = requests.get(self.base_url, params=params, timeout=30)
                response.raise_for_status()

                data = response.json()
                # Process WorldCat response format
                # This would need WorldCat-specific parsing logic

            except Exception as e:
                logger.error(f"WorldCat search failed: {e}")
                continue

        return records

    def _generate_sample_data(self) -> List[Dict]:
        """Generate sample WorldCat data for testing."""
        return [
            {
                'worldcat_id': '123456789',
                'title': 'De revolutionibus orbium coelestium',
                'author': 'Copernicus, Nicolaus',
                'publication_year': 1543,
                'language': 'lat',
                'source_catalogue': 'WorldCat'
            }
        ]

    def get_record_details(self, record_id: str) -> Optional[Dict]:
        """Get detailed WorldCat record information."""
        return None


class GoogleBooksCollector(BaseCollector):
    """
    Google Books API collector - free tier available.
    """

    def __init__(self, config: Dict):
        super().__init__(config)
        self.base_url = "https://www.googleapis.com/books/v1/volumes"
        self.api_key = config.get('api_key')  # Optional for free tier

    def search_latin_works(self, **kwargs) -> List[Dict]:
        """
        Search Google Books for Latin works.

        Returns:
            List of Latin work records from Google Books
        """
        records = []

        # Search queries for early printed Latin works
        queries = [
            'language:lat date:1450-1700',
            'subject:Latin literature date:1450-1700',
            'inauthor:latin date:1450-1700'
        ]

        for query in queries:
            try:
                params = {
                    'q': query,
                    'maxResults': 40,  # Free tier limit
                    'orderBy': 'newest'
                }

                if self.api_key:
                    params['key'] = self.api_key

                self._rate_limit()
                response = requests.get(self.base_url, params=params, timeout=30)
                response.raise_for_status()

                data = response.json()
                if 'items' in data:
                    for item in data['items']:
                        record = self._parse_google_books_record(item)
                        if record:
                            records.append(record)

            except Exception as e:
                logger.error(f"Google Books search failed: {e}")
                continue

        return records

    def _parse_google_books_record(self, item: Dict) -> Optional[Dict]:
        """Parse Google Books API response."""
        try:
            volume_info = item.get('volumeInfo', {})

            # Only include published books (not modern reprints)
            publish_date = volume_info.get('publishedDate', '')
            if not self._is_historical_date(publish_date):
                return None

            # Check for Latin language
            languages = volume_info.get('language', [])
            if 'la' not in languages and 'lat' not in languages:
                return None

            return {
                'google_books_id': item.get('id', ''),
                'title': volume_info.get('title', ''),
                'authors': ', '.join(volume_info.get('authors', [])),
                'publication_year': self._extract_year(publish_date),
                'publisher': volume_info.get('publisher', ''),
                'language': ', '.join(languages),
                'digital_facsimile_urls': [
                    volume_info.get('previewLink', ''),
                    volume_info.get('infoLink', '')
                ],
                'source_catalogue': 'GoogleBooks'
            }

        except Exception as e:
            logger.error(f"Error parsing Google Books record: {e}")
            return None

    def _is_historical_date(self, date_str: str) -> bool:
        """Check if publication date indicates historical work."""
        if not date_str:
            return False

        try:
            year = int(date_str[:4])
            return 1450 <= year <= 1700
        except:
            return False

    def _extract_year(self, date_str: str) -> Optional[int]:
        """Extract year from publication date."""
        if not date_str:
            return None
        try:
            return int(date_str[:4])
        except:
            return None

    def get_record_details(self, record_id: str) -> Optional[Dict]:
        """Get detailed Google Books record."""
        return None


class InternetArchiveCollector(BaseCollector):
    """
    Internet Archive collector - extensive early printed works collection.
    """

    def __init__(self, config: Dict):
        super().__init__(config)
        self.base_url = "https://archive.org/advancedsearch.php"

    def search_latin_works(self, **kwargs) -> List[Dict]:
        """
        Search Internet Archive for Latin works.

        Returns:
            List of Latin work records from Internet Archive
        """
        records = []

        # Multiple queries to find different types of early Latin works
        queries = [
            'title:"De" AND language:lat AND date:[1450 TO 1700]',
            'title:"In" AND language:lat AND date:[1450 TO 1700]',
            'title:"Ad" AND language:lat AND date:[1450 TO 1700]',
            'creator:"Cicero" AND language:lat',
            'creator:"Virgil" AND language:lat',
            'creator:"Ovid" AND language:lat',
            'subject:"Latin literature" AND date:[1450 TO 1800]',
            'language:lat AND (date:[1450 TO 1700] OR publisher:"*" AND title:"*")'
        ]

        for query_str in queries:
            try:
                query = {
                    'q': query_str,
                    'fl[]': 'identifier,title,creator,date,publisher,language,description',
                    'output': 'json',
                    'rows': 50
                }

                self._rate_limit()
                response = requests.get(self.base_url, params=query, timeout=30)
                response.raise_for_status()

                data = response.json()
                if 'response' in data and 'docs' in data['response']:
                    for doc in data['response']['docs']:
                        record = self._parse_ia_record(doc)
                        if record:
                            records.append(record)

                logger.info(f"Query '{query_str[:30]}...' found {len(records)} records")

            except Exception as e:
                logger.error(f"Internet Archive search failed for query '{query_str[:30]}...': {e}")
                continue

        return records

    def _parse_ia_record(self, doc: Dict) -> Optional[Dict]:
        """Parse Internet Archive record."""
        try:
            # Extract basic fields
            title_list = doc.get('title', [])
            creator_list = doc.get('creator', [])
            date_list = doc.get('date', [])
            publisher_list = doc.get('publisher', [])
            language_list = doc.get('language', [])

            # Quality filtering - must have meaningful title
            title = title_list[0] if title_list else ''
            if not title or len(title.strip()) < 3:
                return None

            # Skip clearly modern/metadata records
            if any(pattern in title.lower() for pattern in ['sh ', 'kjhgf', 'at panel', 'pags']):
                return None

            # Extract author
            author = creator_list[0] if creator_list else ''

            # Extract and validate year
            year = None
            if date_list:
                year = self._extract_year(date_list[0])

            # Only include if we have a historical year OR it looks like a real historical work
            if year and (year < 1000 or year > 1900):
                # Not in our target period, but might still be valuable if title looks classical
                if not any(word in title.lower() for word in ['de ', 'in ', 'ad ', 'commentarii', 'opera', 'libri']):
                    return None

            # Extract publisher
            publisher = publisher_list[0] if publisher_list else ''

            # Extract language
            language = ', '.join(language_list) if language_list else ''

            return {
                'archive_id': doc.get('identifier', ''),
                'title': title,
                'author': author,
                'publication_year': year,
                'publisher': publisher,
                'language': language,
                'description': doc.get('description', [''])[0] if doc.get('description') else '',
                'digital_facsimile_urls': [f"https://archive.org/details/{doc.get('identifier', '')}"],
                'source_catalogue': 'InternetArchive'
            }

        except Exception as e:
            logger.error(f"Error parsing Internet Archive record: {e}")
            return None

    def _extract_year(self, year_str: str) -> Optional[int]:
        """Extract year from year string."""
        if not year_str:
            return None
        try:
            # Handle formats like "1543", "1543?", "c1543", "1543/44"
            year = ''.join(filter(str.isdigit, year_str))
            return int(year) if len(year) == 4 else None
        except:
            return None

    def get_record_details(self, record_id: str) -> Optional[Dict]:
        """Get detailed Internet Archive record."""
        return None


class HathiTrustCollector(BaseCollector):
    """
    HathiTrust Digital Library collector - academic access.
    """

    def __init__(self, config: Dict):
        super().__init__(config)
        self.base_url = "https://catalog.hathitrust.org/Search/Home"
        # HathiTrust requires library affiliation for API access

    def search_latin_works(self, **kwargs) -> List[Dict]:
        """
        Search HathiTrust for Latin works.

        Returns:
            List of Latin work records from HathiTrust
        """
        logger.warning("HathiTrust API requires institutional access. Returning sample data.")
        return self._generate_sample_data()

    def _generate_sample_data(self) -> List[Dict]:
        """Generate sample HathiTrust data for testing."""
        return [
            {
                'hathi_id': 'mdp.39015012345678',
                'title': 'De revolutionibus orbium coelestium',
                'author': 'Copernicus, Nicolaus',
                'publication_year': 1543,
                'language': 'lat',
                'digital_facsimile_urls': ['https://babel.hathitrust.org/cgi/pt?id=mdp.39015012345678'],
                'source_catalogue': 'HathiTrust'
            }
        ]

    def get_record_details(self, record_id: str) -> Optional[Dict]:
        """Get detailed HathiTrust record."""
        return None


class GeneratedDataCollector(BaseCollector):
    """
    Collector for generated high-quality Neo-Latin dataset.
    """

    def __init__(self, config: Dict):
        super().__init__(config)
        self.data_file = config.get('data_file', 'data/raw/generated/large_neolatin_dataset.json')

    def search_latin_works(self, **kwargs) -> List[Dict]:
        """
        Load generated Neo-Latin data.

        Returns:
            List of Neo-Latin work records from generated dataset
        """
        try:
            import json
            import os

            if not os.path.exists(self.data_file):
                logger.error(f"Generated data file not found: {self.data_file}")
                return []

            with open(self.data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            # Convert to standard format
            records = []
            for record in data:
                converted = {
                    'identifier': record.get('archive_id', ''),
                    'title': record.get('title', ''),
                    'creator': [record.get('author', '')] if record.get('author') else [],
                    'date': [str(record.get('year', ''))] if record.get('year') else [],
                    'publisher': [record.get('publisher', '')] if record.get('publisher') else [],
                    'language': [record.get('language', 'lat')] if record.get('language') else [],
                    'description': [record.get('description', '')] if record.get('description') else [],
                    'source_catalogue': 'GeneratedData',
                    'digitization_status': record.get('digitization_status', 'metadata_only'),
                    'translation_status': record.get('translation_status', 'not_translated'),
                    'publication_place': record.get('place', ''),
                    'subjects': record.get('subjects', [])
                }
                records.append(converted)

            logger.info(f"Loaded {len(records)} records from generated dataset")
            return records

        except Exception as e:
            logger.error(f"Failed to load generated data: {e}")
            return []

    def get_record_details(self, record_id: str) -> Optional[Dict]:
        """Get detailed record from generated dataset."""
        return None


# Register alternative collectors
CollectorFactory.register_collector('worldcat', WorldCatCollector)
CollectorFactory.register_collector('googlebooks', GoogleBooksCollector)
CollectorFactory.register_collector('internetarchive', InternetArchiveCollector)
CollectorFactory.register_collector('hathitrust', HathiTrustCollector)
CollectorFactory.register_collector('generated', GeneratedDataCollector)


if __name__ == "__main__":
    # Test the alternative collectors
    config = {'requests_per_second': 1, 'output_dir': 'data/raw/alternative'}

    # Test Google Books (no API key needed for free tier)
    try:
        collector = CollectorFactory.create_collector('googlebooks', config)
        records = collector.search_latin_works()
        print(f"Google Books found {len(records)} records")
    except Exception as e:
        print(f"Google Books test failed: {e}")

    # Test Internet Archive
    try:
        collector = CollectorFactory.create_collector('internetarchive', config)
        records = collector.search_latin_works()
        print(f"Internet Archive found {len(records)} records")
    except Exception as e:
        print(f"Internet Archive test failed: {e}")