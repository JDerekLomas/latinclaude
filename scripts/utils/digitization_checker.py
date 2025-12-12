#!/usr/bin/env python3
"""
Digitization Status Checker - Identifies which works have digital facsimiles
and which are missing from major digital libraries.
"""

import requests
import time
import logging
from typing import Dict, List, Optional, Set
from urllib.parse import quote
import pandas as pd

logger = logging.getLogger(__name__)


class DigitizationChecker:
    """
    Checks digitization status across major digital libraries.
    """

    def __init__(self, config: Dict = None):
        """
        Initialize digitization checker.

        Args:
            config: Configuration dictionary for rate limiting and APIs
        """
        self.config = config or {}
        self.requests_per_second = self.config.get('requests_per_second', 2)
        self.last_request_time = 0

        # Digital library APIs and search patterns
        self.digital_sources = {
            'google_books': {
                'base_url': 'https://www.googleapis.com/books/v1/volumes',
                'search_keys': ['intitle:', 'inauthor:', 'inpublisher:'],
                'full_text_indicators': ['preview', 'full_view', 'public_domain']
            },
            'internet_archive': {
                'base_url': 'https://archive.org/advancedsearch.php',
                'full_text_indicators': ['full_text', 'has_friendly_format']
            },
            'hathitrust': {
                'base_url': 'https://catalog.hathitrust.org/Search/Home',
                'full_text_indicators': ['full view', 'public domain']
            },
            'gallica': {
                'base_url': 'https://gallica.bnf.fr/services/Search',
                'full_text_indicators': ['texte intégral', 'facsimilé']
            },
            'digital_mvs': {
                'base_url': 'https://digitalmvs.com/Search',
                'full_text_indicators': ['full text', 'digital copy']
            }
        }

    def _rate_limit(self):
        """Implement rate limiting."""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        min_delay = 1.0 / self.requests_per_second

        if time_since_last < min_delay:
            time.sleep(min_delay - time_since_last)

        self.last_request_time = time.time()

    def check_google_books(self, title: str, author: str, year: int = None) -> Dict:
        """
        Check Google Books for digitization status.

        Args:
            title: Work title
            author: Work author
            year: Publication year

        Returns:
            Dictionary with digitization status information
        """
        result = {
            'source': 'google_books',
            'found': False,
            'full_text_available': False,
            'preview_available': False,
            'record_count': 0,
            'records': []
        }

        try:
            self._rate_limit()

            # Build search queries
            queries = []

            # Title + Author search (most specific)
            if title and author:
                clean_title = self._clean_search_term(title)
                clean_author = self._clean_search_term(author)
                queries.append(f'intitle:{clean_title}+inauthor:{clean_author}')

            # Title only search
            if title:
                queries.append(f'intitle:{self._clean_search_term(title)}')

            # Author + date search (for known authors)
            if author and year:
                clean_author = self._clean_search_term(author)
                queries.append(f'inauthor:{clean_author}+date:{year}')

            for query in queries:
                params = {
                    'q': query,
                    'maxResults': 20,
                    'printType': 'books',
                    'orderBy': 'relevance'
                }

                response = requests.get(
                    self.digital_sources['google_books']['base_url'],
                    params=params,
                    timeout=30
                )
                response.raise_for_status()

                data = response.json()

                if 'items' in data:
                    result['found'] = True
                    result['record_count'] = len(data['items'])

                    for item in data['items']:
                        volume_info = item.get('volumeInfo', {})
                        access_info = item.get('accessInfo', {})

                        # Check for full text or preview
                        viewability = access_info.get('viewability', '')
                        text_to_speech = access_info.get('textToSpeechPermission', '')
                        web_reader_link = access_info.get('webReaderLink', '')

                        is_full_text = viewability in ['ALL_PAGES', 'PUBLIC_DOMAIN']
                        is_preview = viewability in ['PARTIAL', 'NO_PAGES'] and web_reader_link

                        record = {
                            'id': item.get('id', ''),
                            'title': volume_info.get('title', ''),
                            'authors': volume_info.get('authors', []),
                            'published_date': volume_info.get('publishedDate', ''),
                            'viewability': viewability,
                            'preview_link': access_info.get('previewLink', ''),
                            'web_reader_link': web_reader_link,
                            'pdf_download': access_info.get('downloadAccess', ''),
                            'full_text': is_full_text,
                            'preview': is_preview
                        }
                        result['records'].append(record)

                        if is_full_text:
                            result['full_text_available'] = True
                        elif is_preview:
                            result['preview_available'] = True

        except Exception as e:
            logger.error(f"Google Books search failed for '{title}': {e}")

        return result

    def check_internet_archive(self, title: str, author: str, year: int = None) -> Dict:
        """
        Check Internet Archive for digitization status.

        Args:
            title: Work title
            author: Work author
            year: Publication year

        Returns:
            Dictionary with digitization status information
        """
        result = {
            'source': 'internet_archive',
            'found': False,
            'full_text_available': False,
            'preview_available': False,
            'record_count': 0,
            'records': []
        }

        try:
            self._rate_limit()

            # Build search queries
            search_terms = []
            if title:
                search_terms.append(self._clean_search_term(title))
            if author:
                search_terms.append(self._clean_search_term(author))

            # Include year for better precision
            if year:
                search_terms.append(str(year))

            if not search_terms:
                return result

            query = ' AND '.join(search_terms)

            params = {
                'q': query,
                'fl[]': 'identifier,title,creator,date,description,mediatype',
                'output': 'json',
                'rows': 20
            }

            response = requests.get(
                self.digital_sources['internet_archive']['base_url'],
                params=params,
                timeout=30
            )
            response.raise_for_status()

            data = response.json()

            if 'response' in data and 'docs' in data['response']:
                docs = data['response']['docs']
                result['found'] = True
                result['record_count'] = len(docs)

                for doc in docs:
                    identifier = doc.get('identifier', '')

                    # Check if it's a full text or scanned book
                    mediatype = doc.get('mediatype', '')
                    is_full_text = mediatype == 'texts' and 'full text' in doc.get('description', '').lower()
                    is_scanned = identifier and (doc.get('description', '').lower().find('scanned') >= 0 or
                                               doc.get('title', '').lower().find('facsimile') >= 0)

                    record = {
                        'identifier': identifier,
                        'title': doc.get('title', [''])[0] if doc.get('title') else '',
                        'author': doc.get('creator', [''])[0] if doc.get('creator') else '',
                        'date': doc.get('date', [''])[0] if doc.get('date') else '',
                        'mediatype': mediatype,
                        'description': doc.get('description', [''])[0] if doc.get('description') else '',
                        'full_text': is_full_text or is_scanned,
                        'preview': True,  # IA always provides preview
                        'download_url': f"https://archive.org/download/{identifier}" if identifier else ''
                    }
                    result['records'].append(record)

                    if is_full_text or is_scanned:
                        result['full_text_available'] = True
                    else:
                        result['preview_available'] = True

        except Exception as e:
            logger.error(f"Internet Archive search failed for '{title}': {e}")

        return result

    def check_hathitrust(self, title: str, author: str, year: int = None) -> Dict:
        """
        Check HathiTrust for digitization status.

        Args:
            title: Work title
            author: Work author
            year: Publication year

        Returns:
            Dictionary with digitization status information
        """
        result = {
            'source': 'hathitrust',
            'found': False,
            'full_text_available': False,
            'preview_available': False,
            'record_count': 0,
            'records': []
        }

        # HathiTrust requires institutional access for API
        # Return placeholder for manual checking
        logger.warning("HathiTrust requires institutional API access")

        return result

    def check_gallica(self, title: str, author: str, year: int = None) -> Dict:
        """
        Check Gallica (BnF) for digitization status.

        Args:
            title: Work title
            author: Work author
            year: Publication year

        Returns:
            Dictionary with digitization status information
        """
        result = {
            'source': 'gallica',
            'found': False,
            'full_text_available': False,
            'preview_available': False,
            'record_count': 0,
            'records': []
        }

        try:
            self._rate_limit()

            # Build search query for Gallica API
            search_terms = []
            if title:
                search_terms.append(f'title all "{title}"')
            if author:
                search_terms.append(f'creator all "{author}"')

            if not search_terms:
                return result

            query = ' and '.join(search_terms)

            # Gallica SRU API
            sru_url = "https://gallica.bnf.fr/services/api/sru"
            params = {
                'version': '1.2',
                'operation': 'searchRetrieve',
                'query': query,
                'startRecord': 1,
                'maximumRecords': 10
            }

            response = requests.get(sru_url, params=params, timeout=30)
            response.raise_for_status()

            # Parse Gallica SRU response (XML format)
            # This is simplified - would need proper XML parsing
            if response.text and '<zs:numberOfRecords>' in response.text:
                result['found'] = True
                # Extract record count (simplified)
                import re
                match = re.search(r'<zs:numberOfRecords>(\d+)</zs:numberOfRecords>', response.text)
                if match:
                    result['record_count'] = int(match.group(1))

        except Exception as e:
            logger.error(f"Gallica search failed for '{title}': {e}")

        return result

    def _clean_search_term(self, term: str) -> str:
        """
        Clean search term for API queries.

        Args:
            term: Raw search term

        Returns:
            Cleaned search term
        """
        if not term:
            return ""

        # Remove problematic characters
        term = str(term).strip()

        # Remove common punctuation that breaks searches
        term = re.sub(r'[^\w\s]', ' ', term)

        # Collapse multiple spaces
        term = re.sub(r'\s+', ' ', term)

        # Return if reasonable length
        return term[:100] if len(term) > 100 else term

    def check_all_sources(self, title: str, author: str, year: int = None) -> Dict:
        """
        Check digitization status across all major digital libraries.

        Args:
            title: Work title
            author: Work author
            year: Publication year

        Returns:
            Dictionary with comprehensive digitization status
        """
        results = {
            'title': title,
            'author': author,
            'year': year,
            'total_sources_checked': 0,
            'sources_found': 0,
            'full_text_available': False,
            'preview_available': False,
            'digitization_status': 'unknown',
            'digital_records': {}
        }

        # Check each source
        for source_name in ['google_books', 'internet_archive', 'gallica']:
            try:
                if source_name == 'google_books':
                    source_result = self.check_google_books(title, author, year)
                elif source_name == 'internet_archive':
                    source_result = self.check_internet_archive(title, author, year)
                elif source_name == 'gallica':
                    source_result = self.check_gallica(title, author, year)
                else:
                    continue

                results['total_sources_checked'] += 1
                results['digital_records'][source_name] = source_result

                if source_result['found']:
                    results['sources_found'] += 1

                if source_result['full_text_available']:
                    results['full_text_available'] = True

                if source_result['preview_available']:
                    results['preview_available'] = True

                # Rate limit between sources
                time.sleep(1)

            except Exception as e:
                logger.error(f"Error checking {source_name}: {e}")

        # Determine overall digitization status
        if results['full_text_available']:
            results['digitization_status'] = 'digitized'
        elif results['preview_available']:
            results['digitization_status'] = 'preview_only'
        elif results['sources_found'] > 0:
            results['digitization_status'] = 'metadata_only'
        else:
            results['digitization_status'] = 'not_found'

        return results

    def batch_check_digitization(self, works_df: pd.DataFrame, limit: int = None) -> pd.DataFrame:
        """
        Check digitization status for a batch of works.

        Args:
            works_df: DataFrame of works to check
            limit: Maximum number of works to check (None for all)

        Returns:
            DataFrame with digitization status added
        """
        if limit:
            works_df = works_df.head(limit)

        digitization_results = []

        logger.info(f"Checking digitization status for {len(works_df)} works")

        for idx, work in works_df.iterrows():
            title = work.get('title', '')
            author = work.get('author', '')
            year = work.get('publication_year')

            if not title:
                logger.warning(f"Skipping record {idx} - no title")
                continue

            try:
                digitization_result = self.check_all_sources(title, author, year)
                digitization_results.append(digitization_result)

                # Progress logging
                if (len(digitization_results) % 10 == 0):
                    logger.info(f"Checked {len(digitization_results)} works")

            except Exception as e:
                logger.error(f"Error checking digitization for record {idx}: {e}")
                # Add result with error status
                digitization_results.append({
                    'title': title,
                    'author': author,
                    'year': year,
                    'digitization_status': 'error',
                    'error': str(e)
                })

        # Convert to DataFrame
        digitization_df = pd.DataFrame(digitization_results)

        logger.info(f"Digitization check complete for {len(digitization_df)} works")

        # Generate summary statistics
        status_counts = digitization_df['digitization_status'].value_counts()
        logger.info(f"Digitization status summary: {status_counts.to_dict()}")

        return digitization_df