#!/usr/bin/env python3
"""
Translation Status Checker - Identifies which Latin works have been translated
into modern languages.
"""

import requests
import time
import logging
import re
from typing import Dict, List, Optional, Set
from urllib.parse import quote
import pandas as pd

logger = logging.getLogger(__name__)


class TranslationChecker:
    """
    Checks translation status across major bibliographic sources.
    """

    def __init__(self, config: Dict = None):
        """
        Initialize translation checker.

        Args:
            config: Configuration dictionary for rate limiting and APIs
        """
        self.config = config or {}
        self.requests_per_second = self.config.get('requests_per_second', 2)
        self.last_request_time = 0

        # Translation databases and sources
        self.translation_sources = {
            'worldcat': {
                'base_url': 'https://www.worldcat.org/webservices/catalog/search/worldcat/opensearch',
                'translation_indicators': ['translation', 'translated', 'english translation', 'modern translation']
            },
            'goodreads': {
                'base_url': 'https://www.goodreads.com/api',
                'translation_indicators': ['translation', 'english', 'modern']
            },
            'google_books': {
                'base_url': 'https://www.googleapis.com/books/v1/volumes',
                'translation_indicators': ['translation', 'english', 'modern', 'translated']
            },
            'library_of_congress': {
                'base_url': 'https://www.loc.gov',
                'translation_indicators': ['translation', 'english', 'modern']
            }
        }

        # Common Neo-Latin authors with known translations
        self.translation_map = self._load_translation_map()

        # Common Latin work titles and their English translations
        self.work_translation_map = self._load_work_translation_map()

    def _rate_limit(self):
        """Implement rate limiting."""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        min_delay = 1.0 / self.requests_per_second

        if time_since_last < min_delay:
            time.sleep(min_delay - time_since_last)

        self.last_request_time = time.time()

    def _load_translation_map(self) -> Dict:
        """
        Load known translations for major Neo-Latin authors.

        Returns:
            Dictionary mapping authors to their translation status
        """
        return {
            # Neo-Latin humanists with known translations
            'erasmus, desiderius': {
                'translated': True,
                'works': ['praise of folly', 'handbook of the christian knight', 'colloquies'],
                'quality': 'excellent',
                'modernity': 'modern'
            },
            'thomas more': {
                'translated': True,
                'works': ['utopia'],
                'quality': 'excellent',
                'modernity': 'modern'
            },
            'petrarca, francesco': {
                'translated': True,
                'works': ['canzoniere', 'secretum'],
                'quality': 'excellent',
                'modernity': 'modern'
            },
            'luther, martin': {
                'translated': True,
                'works': ['ninety-five theses', 'translation of bible'],
                'quality': 'excellent',
                'modernity': 'modern'
            },
            'calvin, jean': {
                'translated': True,
                'works': ['institutes of the christian religion'],
                'quality': 'excellent',
                'modernity': 'modern'
            },
            'copernicus, nicolaus': {
                'translated': True,
                'works': ['on the revolutions of the heavenly spheres'],
                'quality': 'excellent',
                'modernity': 'modern'
            },
            'galilei, galileo': {
                'translated': True,
                'works': ['dialogue concerning the two chief world systems'],
                'quality': 'excellent',
                'modernity': 'modern'
            },
            'kepler, johannes': {
                'translated': True,
                'works': ['harmonices mundi'],
                'quality': 'good',
                'modernity': 'modern'
            },
            'thomas aquinas': {
                'translated': True,
                'works': ['summa theologica'],
                'quality': 'excellent',
                'modernity': 'modern'
            },
            'spinoza, baruch': {
                'translated': True,
                'works': ['ethics'],
                'quality': 'excellent',
                'modernity': 'modern'
            },
            'descartes, rené': {
                'translated': True,
                'works': ['meditations on first philosophy', 'discourse on method'],
                'quality': 'excellent',
                'modernity': 'modern'
            }
        }

    def _load_work_translation_map(self) -> Dict:
        """
        Load known translations for major Latin works.

        Returns:
            Dictionary mapping Latin work titles to translation status
        """
        return {
            # Famous Latin works and their translation status
            'de revolutionibus orbium coelestium': {
                'translated': True,
                'english_title': 'On the Revolutions of the Heavenly Spheres',
                'author': 'copernicus',
                'year_translated': '1995',
                'translator': 'Edward Rosen'
            },
            'de civitate dei': {
                'translated': True,
                'english_title': 'The City of God',
                'author': 'augustine',
                'year_translated': '2003',
                'translator': 'Henry Bettenson'
            },
            'summa theologica': {
                'translated': True,
                'english_title': 'Summa Theologica',
                'author': 'aquinas',
                'year_translated': '1920',
                'translator': 'Fathers of the English Dominican Province'
            },
            'utopia': {
                'translated': True,
                'english_title': 'Utopia',
                'author': 'more',
                'year_translated': '2003',
                'translator': 'Clarence Miller'
            },
            'laus stultitiae': {
                'translated': True,
                'english_title': 'The Praise of Folly',
                'author': 'erasmus',
                'year_translated': '1993',
                'translator': 'Betty Radice'
            }
        }

    def normalize_author_name(self, author: str) -> str:
        """
        Normalize author name for lookup.

        Args:
            author: Original author name

        Returns:
            Normalized author name
        """
        if not author:
            return ""

        # Convert to lowercase and clean
        author = str(author).lower().strip()

        # Remove common title words and punctuation
        author = re.sub(r'\b(?:mr|dr|prof|sir)\b\.?', '', author)
        author = re.sub(r'[^\w\s]', '', author)
        author = re.sub(r'\s+', ' ', author)

        # Handle common Latin name formats
        author = re.sub(r'\b(?:johannes|ioannes|john)\b', 'john', author)
        author = re.sub(r'\b(?:jacobus|iacobus|james)\b', 'james', author)
        author = re.sub(r'\b(?:michael|michaël)\b', 'michael', author)

        return author.strip()

    def normalize_title(self, title: str) -> str:
        """
        Normalize title for lookup.

        Args:
            title: Original title

        Returns:
            Normalized title
        """
        if not title:
            return ""

        # Convert to lowercase and clean
        title = str(title).lower().strip()

        # Remove common words that don't affect identity
        stop_words = {'de', 'der', 'die', 'das', 'in', 'ad', 'per', 'pro', 'cum', 'sine',
                     'the', 'a', 'an', 'and', 'or', 'of', 'in', 'to', 'for'}

        words = title.split()
        title_words = [word for word in words if word not in stop_words and len(word) > 2]

        # Normalize Latin characters
        title = ' '.join(title_words)

        return title.strip()

    def check_known_translations(self, title: str, author: str) -> Dict:
        """
        Check against known translation database.

        Args:
            title: Work title
            author: Work author

        Returns:
            Dictionary with known translation information
        """
        result = {
            'source': 'known_translations',
            'translated': False,
            'translation_quality': 'unknown',
            'modern_translation': False,
            'english_title': '',
            'translation_year': None,
            'translator': '',
            'notes': []
        }

        # Normalize inputs for comparison
        norm_author = self.normalize_author_name(author)
        norm_title = self.normalize_title(title)

        # Check author-based translations
        for known_author, info in self.translation_map.items():
            if norm_author in known_author or known_author in norm_author:
                if info['translated']:
                    result['translated'] = True
                    result['translation_quality'] = info['quality']
                    result['modern_translation'] = info['modernity'] == 'modern'
                    result['notes'].append(f"Author {known_author} has known translations")
                    result['notes'].extend(info['works'])

        # Check work-specific translations
        for known_title, info in self.work_translation_map.items():
            # More flexible matching for titles
            title_similarity = self._calculate_title_similarity(norm_title, known_title)

            if title_similarity > 0.7:  # High similarity threshold
                result.update({
                    'translated': True,
                    'translation_quality': 'excellent',  # Known translations are usually excellent
                    'modern_translation': True,
                    'english_title': info['english_title'],
                    'translation_year': info['year_translated'],
                    'translator': info.get('translator', ''),
                    'notes': result.get('notes', [])
                })
                result['notes'].append(f"Work {known_title} has known translation by {info.get('translator', 'unknown')}")

        return result

    def _calculate_title_similarity(self, title1: str, title2: str) -> float:
        """
        Calculate similarity between two normalized titles.

        Args:
            title1: First normalized title
            title2: Second normalized title

        Returns:
            Similarity score between 0 and 1
        """
        if not title1 or not title2:
            return 0.0

        # Simple word overlap calculation
        words1 = set(title1.split())
        words2 = set(title2.split())

        if not words1 or not words2:
            return 0.0

        intersection = words1 & words2
        union = words1 | words2

        return len(intersection) / len(union)

    def check_google_books_translations(self, title: str, author: str) -> Dict:
        """
        Check Google Books for translations.

        Args:
            title: Latin work title
            author: Latin work author

        Returns:
            Dictionary with translation information
        """
        result = {
            'source': 'google_books',
            'translated': False,
            'translation_count': 0,
            'modern_translations': 0,
            'english_translations': 0,
            'records': []
        }

        try:
            self._rate_limit()

            # Search for translations
            translation_queries = [
                f'intitle:"{title}" translation',
                f'inauthor:"{author}" translation english',
                f'"{title}" english translation',
                f'"{title}" modern translation'
            ]

            for query in translation_queries:
                params = {
                    'q': query,
                    'maxResults': 10,
                    'printType': 'books'
                }

                response = requests.get(
                    self.translation_sources['google_books']['base_url'],
                    params=params,
                    timeout=30
                )
                response.raise_for_status()

                data = response.json()

                if 'items' in data:
                    for item in data['items']:
                        volume_info = item.get('volumeInfo', {})

                        # Check if this looks like a translation
                        title_lower = volume_info.get('title', '').lower()
                        description = volume_info.get('description', '').lower()

                        is_translation = any(indicator in title_lower + description
                                           for indicator in ['translation', 'translated', 'english', 'modern'])

                        if is_translation:
                            result['translated'] = True
                            result['translation_count'] += 1

                            if 'english' in title_lower + description:
                                result['english_translations'] += 1
                            if 'modern' in title_lower + description:
                                result['modern_translations'] += 1

                            record = {
                                'id': item.get('id', ''),
                                'title': volume_info.get('title', ''),
                                'authors': volume_info.get('authors', []),
                                'published_date': volume_info.get('publishedDate', ''),
                                'description': volume_info.get('description', ''),
                                'language': volume_info.get('language', ''),
                                'preview_link': item.get('accessInfo', {}).get('previewLink', '')
                            }
                            result['records'].append(record)

        except Exception as e:
            logger.error(f"Google Books translation search failed for '{title}': {e}")

        return result

    def check_worldcat_translations(self, title: str, author: str) -> Dict:
        """
        Check WorldCat for translations.

        Args:
            title: Latin work title
            author: Latin work author

        Returns:
            Dictionary with translation information
        """
        result = {
            'source': 'worldcat',
            'translated': False,
            'record_count': 0,
            'notes': []
        }

        # WorldCat requires API key - for now, return basic info
        # In practice, would implement OCLC API calls

        # Add note about API requirement
        result['notes'].append("WorldCat translation checking requires OCLC API key")

        return result

    def estimate_translation_status(self, title: str, author: str, year: int) -> Dict:
        """
        Estimate translation status based on heuristics.

        Args:
            title: Work title
            author: Work author
            year: Publication year

        Returns:
            Dictionary with estimated translation status
        """
        result = {
            'source': 'heuristic',
            'translated': False,
            'likelihood': 'unknown',
            'factors': [],
            'confidence': 'low'
        }

        # Heuristic factors that increase likelihood of translation

        # Famous authors
        norm_author = self.normalize_author_name(author)
        famous_authors = ['copernicus', 'galileo', 'kepler', 'newton', 'descartes', 'spinoza',
                         'thomas aquinas', 'augustine', 'erasmus', 'thomas more', 'luther', 'calvin']

        if any(famous_author in norm_author for famous_author in famous_authors):
            result['translated'] = True
            result['likelihood'] = 'high'
            result['factors'].append('Famous author likely to have translations')
            result['confidence'] = 'high'

        # Famous works (title-based)
        norm_title = self.normalize_title(title)
        famous_works = ['revolutionibus', 'civitate dei', 'summa theologica', 'utopia', 'laus stultitiae',
                        'principia mathematica', 'meditationes', 'dialogue', 'ethica']

        if any(famous_work in norm_title for famous_work in famous_works):
            result['translated'] = True
            result['likelihood'] = 'high'
            result['factors'].append('Famous work likely to have translations')
            result['confidence'] = 'high'

        # Early works (more likely to be translated)
        if year and year < 1600:
            result['factors'].append('Early work (pre-1600) more likely to be studied and translated')

        # Length considerations (shorter works more likely to be translated)
        if title and len(title) < 50:
            result['factors'].append('Shorter work more likely to be translated')

        # Genre indicators
        title_lower = title.lower() if title else ''
        if any(genre in title_lower for genre in ['poetry', 'poem', 'ode', 'epic', 'dialogue']):
            result['factors'].append('Literary work more likely to be translated')

        # Scientific works
        if any(scientific in title_lower for scientific in ['mathematica', 'physica', 'astronomia', 'geometria']):
            result['factors'].append('Scientific work likely to be translated')

        return result

    def check_translation_status(self, title: str, author: str, year: int = None) -> Dict:
        """
        Comprehensive translation status check.

        Args:
            title: Work title
            author: Work author
            year: Publication year

        Returns:
            Dictionary with comprehensive translation status
        """
        results = {
            'title': title,
            'author': author,
            'year': year,
            'translated': False,
            'translation_status': 'unknown',
            'translation_quality': 'unknown',
            'modern_translation': False,
            'english_translation': False,
            'sources_checked': 0,
            'translation_records': {},
            'likelihood_score': 0.0,
            'confidence': 'low'
        }

        # Check all sources
        sources = ['known_translations', 'google_books', 'heuristic']

        for source in sources:
            try:
                if source == 'known_translations':
                    source_result = self.check_known_translations(title, author)
                elif source == 'google_books':
                    source_result = self.check_google_books_translations(title, author)
                elif source == 'heuristic':
                    source_result = self.estimate_translation_status(title, author, year)

                results['translation_records'][source] = source_result
                results['sources_checked'] += 1

                # Update overall status
                if source_result.get('translated', False):
                    results['translated'] = True

                # Rate limit between sources
                time.sleep(1)

            except Exception as e:
                logger.error(f"Error checking translations in {source}: {e}")

        # Determine overall translation status
        if results['translated']:
            results['translation_status'] = 'translated'
        else:
            # Check likelihood heuristics
            heuristic_result = results['translation_records'].get('heuristic', {})
            likelihood = heuristic_result.get('likelihood', 'unknown')

            if likelihood == 'high':
                results['translation_status'] = 'likely_translated'
            elif likelihood == 'medium':
                results['translation_status'] = 'possibly_translated'
            else:
                results['translation_status'] = 'not_translated'

        return results

    def batch_check_translations(self, works_df: pd.DataFrame, limit: int = None) -> pd.DataFrame:
        """
        Check translation status for a batch of works.

        Args:
            works_df: DataFrame of works to check
            limit: Maximum number of works to check (None for all)

        Returns:
            DataFrame with translation status added
        """
        if limit:
            works_df = works_df.head(limit)

        translation_results = []

        logger.info(f"Checking translation status for {len(works_df)} works")

        for idx, work in works_df.iterrows():
            title = work.get('title', '')
            author = work.get('author', '')
            year = work.get('publication_year')

            if not title:
                logger.warning(f"Skipping record {idx} - no title")
                continue

            try:
                translation_result = self.check_translation_status(title, author, year)
                translation_results.append(translation_result)

                # Progress logging
                if (len(translation_results) % 10 == 0):
                    logger.info(f"Checked translations for {len(translation_results)} works")

            except Exception as e:
                logger.error(f"Error checking translations for record {idx}: {e}")
                # Add result with error status
                translation_results.append({
                    'title': title,
                    'author': author,
                    'year': year,
                    'translated': False,
                    'translation_status': 'error',
                    'error': str(e)
                })

        # Convert to DataFrame
        translation_df = pd.DataFrame(translation_results)

        logger.info(f"Translation check complete for {len(translation_df)} works")

        # Generate summary statistics
        status_counts = translation_df['translation_status'].value_counts()
        logger.info(f"Translation status summary: {status_counts.to_dict()}")

        return translation_df