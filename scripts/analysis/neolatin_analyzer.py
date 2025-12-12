#!/usr/bin/env python3
"""
Neo-Latin Analyzer - Identifies and analyzes Neo-Latin works (post-Classical Latin).
Focuses on 15th-19th century Latin literature, philosophy, science, etc.
"""

import re
import logging
from typing import Dict, List, Optional, Set, Tuple
from datetime import datetime
import pandas as pd

logger = logging.getLogger(__name__)


class NeoLatinAnalyzer:
    """
    Identifies Neo-Latin works and analyzes their characteristics.
    """

    def __init__(self):
        """Initialize Neo-Latin analyzer."""
        # Neo-Latin period definition (roughly 14th-19th century)
        self.neo_latin_start_year = 1300
        self.neo_latin_end_year = 1900

        # Known Neo-Latin authors and their periods
        self.neo_latin_authors = self._load_neo_latin_authors()

        # Neo-Latin genres and keywords
        self.neo_latin_genres = self._load_neo_latin_genres()

        # Neo-Latin characteristics and language features
        self.neo_latin_characteristics = self._load_neo_latin_characteristics()

        # Renaissance humanist centers
        self.humanist_centers = self._load_humanist_centers()

        # Printing centers (where Neo-Latin works were published)
        self.printing_centers = self._load_printing_centers()

    def _load_neo_latin_authors(self) -> Dict:
        """
        Load database of major Neo-Latin authors.

        Returns:
            Dictionary mapping authors to their Neo-Latin profiles
        """
        return {
            # Italian Renaissance (14th-16th century)
            'petrarca, francesco': {
                'period': 'early_renaissance',
                'century': 14,
                'region': 'italy',
                'specialty': 'humanism',
                'works': ['canzoniere', 'secretum'],
                'neo_latin_score': 0.9
            },
            'boccaccio, giovanni': {
                'period': 'early_renaissance',
                'century': 14,
                'region': 'italy',
                'specialty': 'humanism',
                'works': ['genealogia deorum gentilium'],
                'neo_latin_score': 0.8
            },
            'erasmus, desiderius': {
                'period': 'northern_renaissance',
                'century': 16,
                'region': 'netherlands',
                'specialty': 'humanism',
                'works': ['praise of folly', 'colloquies'],
                'neo_latin_score': 1.0
            },
            'thomas more': {
                'period': 'northern_renaissance',
                'century': 16,
                'region': 'england',
                'specialty': 'humanism',
                'works': ['utopia'],
                'neo_latin_score': 0.9
            },
            'thomas linacre': {
                'period': 'northern_renaissance',
                'century': 16,
                'region': 'england',
                'specialty': 'humanism',
                'works': ['translations of galen'],
                'neo_latin_score': 0.9
            },

            # German Humanists
            'reuchlin, johann': {
                'period': 'german_renaissance',
                'century': 15,
                'region': 'germany',
                'specialty': 'humanism',
                'works': ['de rudimentis hebraicis'],
                'neo_latin_score': 0.9
            },
            'wimpfeling, jakob': {
                'period': 'german_renaissance',
                'century': 15,
                'region': 'germany',
                'specialty': 'humanism',
                'works': ['germania'],
                'neo_latin_score': 0.8
            },

            # Scientists and Philosophers (16th-17th century)
            'copernicus, nicolaus': {
                'period': 'scientific_revolution',
                'century': 16,
                'region': 'poland',
                'specialty': 'astronomy',
                'works': ['de revolutionibus orbium coelestium'],
                'neo_latin_score': 1.0
            },
            'galilei, galileo': {
                'period': 'scientific_revolution',
                'century': 17,
                'region': 'italy',
                'specialty': 'physics astronomy',
                'works': ['dialogo', 'discorsi'],
                'neo_latin_score': 0.9
            },
            'kepler, johannes': {
                'period': 'scientific_revolution',
                'century': 17,
                'region': 'germany',
                'specialty': 'astronomy mathematics',
                'works': ['astronomia nova', 'harmonices mundi'],
                'neo_latin_score': 0.9
            },
            'descartes, rené': {
                'period': 'rationalist_philosophy',
                'century': 17,
                'region': 'france',
                'specialty': 'philosophy',
                'works': ['meditationes', 'principia philosophiae'],
                'neo_latin_score': 0.8
            },
            'spinoza, baruch': {
                'period': 'rationalist_philosophy',
                'century': 17,
                'region': 'netherlands',
                'specialty': 'philosophy',
                'works': ['ethica'],
                'neo_latin_score': 0.9
            },

            # Protestant Reformation
            'luther, martin': {
                'period': 'reformation',
                'century': 16,
                'region': 'germany',
                'specialty': 'theology',
                'works': ['translation of bible', 'ninety-five theses'],
                'neo_latin_score': 0.9
            },
            'calvin, jean': {
                'period': 'reformation',
                'century': 16,
                'region': 'switzerland',
                'specialty': 'theology',
                'works': ['institutio christianae religionis'],
                'neo_latin_score': 0.9
            },

            # Catholic Counter-Reformation
            'bellarmine, robert': {
                'period': 'counter_reformation',
                'century': 16,
                'region': 'italy',
                'specialty': 'theology',
                'works': ['disputationes de controversiis'],
                'neo_latin_score': 0.9
            },

            # Early Modern Period (17th-18th century)
            'hugo grotius': {
                'period': 'early_modern',
                'century': 17,
                'region': 'netherlands',
                'specialty': 'law international',
                'works': ['de jure belli ac pacis'],
                'neo_latin_score': 0.9
            },
            'samuel von pufendorf': {
                'period': 'early_modern',
                'century': 17,
                'region': 'germany',
                'specialty': 'law natural',
                'works': ['de jure naturali et gentium'],
                'neo_latin_score': 0.8
            },

            # 18th Century Enlightenment
            'christian thomasius': {
                'period': 'enlightenment',
                'century': 18,
                'region': 'germany',
                'specialty': 'philosophy law',
                'works': ['institutio philosophiae'],
                'neo_latin_score': 0.7
            },
            'christian wolff': {
                'period': 'enlightenment',
                'century': 18,
                'region': 'germany',
                'specialty': 'philosophy',
                'works': ['philosophia rationalis'],
                'neo_latin_score': 0.8
            }
        }

    def _load_neo_latin_genres(self) -> Dict:
        """
        Load Neo-Latin genres and characteristic titles.

        Returns:
            Dictionary of Neo-Latin genres
        """
        return {
            'humanist_treatises': {
                'keywords': ['de', 'ad', 'in', 'de...', 'ad...', 'liber', 'tractatus', 'commentarii'],
                'patterns': [r'^de \w+', r'^ad \w+', r'^in \w+', r'^commentarii \w+'],
                'examples': ['de copia', 'adagia', 'de civitate dei']
            },
            'scientific_works': {
                'keywords': ['mathematica', 'physica', 'astronomia', 'mechanica', 'philosophia naturalis'],
                'patterns': [r'mathematica', r'physica', r'astronomia', r'geometria'],
                'examples': ['philosophia naturalis principia mathematica', 'astronomia nova']
            },
            'theological_works': {
                'keywords': ['theologia', 'institutio', 'commentarii', 'enarrationes', 'sermones'],
                'patterns': [r'theologia', r'institutio', r'commentarii in'],
                'examples': ['institutio theologiae', 'commentarii in genesis']
            },
            'poetry': {
                'keywords': ['carmina', 'poemata', 'odes', 'elegiae', 'epigrammata'],
                'patterns': [r'carmina', r'poemata', r'odes', r'elegiae'],
                'examples': ['carmina burana', 'poemata', 'odes']
            },
            'drama': {
                'keywords': ['tragoedia', 'comoedia', 'drama', 'theatrum'],
                'patterns': [r'tragoedia', r'comoedia', r'drama'],
                'examples': ['tragoedia', 'comoedia nova']
            },
            'correspondence': {
                'keywords': ['epistolae', 'litterae', 'correspondentia'],
                'patterns': [r'epistolae', r'litterae'],
                'examples': ['epistolae', 'litterae ad familiares']
            },
            'dialogues': {
                'keywords': ['dialogus', 'colloquium', 'disputatio'],
                'patterns': [r'dialogus', r'colloquium', r'disputatio'],
                'examples': ['dialogus de vita', 'colloquia']
            }
        }

    def _load_neo_latin_characteristics(self) -> Dict:
        """
        Load linguistic and thematic characteristics of Neo-Latin.

        Returns:
            Dictionary of Neo-Latin characteristics
        """
        return {
            'classical_influences': {
                'ciceronian_style': 'Emulation of Cicero rhetorical style',
                'virgilian_epic': 'Influence of Virgil on epic poetry',
                'horatian_lyric': 'Influence of Horace on lyric poetry'
            },
            'neo_latin_innovations': {
                'modern_vocabulary': 'Latin words for new concepts (scientific, philosophical)',
                'classical_renaissance': 'Rediscovery and adaptation of classical texts',
                'humanist_education': 'Educational manuals and grammars'
            },
            'thematic_focus': {
                'humanism': 'Classical learning, moral philosophy, education',
                'reformation': 'Religious controversy, biblical exegesis',
                'scientific_revolution': 'Natural philosophy, mathematics, astronomy',
                'enlightenment': 'Rational philosophy, natural law',
                'national_history': 'Historical works about specific regions'
            }
        }

    def _load_humanist_centers(self) -> List[str]:
        """
        Load major humanist centers and schools.

        Returns:
            List of humanist center locations
        """
        return [
            'florence', 'rome', 'padua', 'venice', 'naples', 'milan',  # Italy
            'paris', 'lyon', 'bordeaux', 'toulouse',                # France
            'oxford', 'cambridge', 'london',                         # England
            'leuven', 'antwerp', 'bruges',                           # Low Countries
            'wittenberg', 'heidelberg', 'ingolstadt', 'tübingen',   # Germany
            'basel', 'zürich', 'geneva',                             # Switzerland
            'cracow', 'prague',                                      # Eastern Europe
            'salamanca', 'alcalá',                                  # Spain
            'coimbra',                                               # Portugal
            'uppsala', 'copenhagen',                                 # Scandinavia
        ]

    def _load_printing_centers(self) -> Dict:
        """
        Load major Neo-Latin printing centers.

        Returns:
            Dictionary of printing centers with their periods of activity
        """
        return {
            'venice': {'active': 1469-1700, 'specialty': 'humanist texts', 'printers': ['aldus manutius']},
            'paris': {'active': 1470-1700, 'specialty': 'humanist theological', 'printers': ['henri estienne']},
            'lyon': {'active': 1473-1600, 'specialty': 'humanist medical', 'printers': ['sebastian gryphius']},
            'basel': {'active': 1468-1700, 'specialty': 'reformation texts', 'printers': ['johann froben']},
            'antwerp': {'active': 1476-1700, 'specialty': 'humanist scientific', 'printers': ['christopher plantin']},
            'wittenberg': {'active': 1502-1700, 'specialty': 'reformation', 'printers': ['johann rhoes']},
            'leipzig': {'active': 1481-1700, 'specialty': 'university texts', 'printers': ['jacob thanner']},
            'oxford': {'active': 1478-1700, 'specialty': 'academic', 'printers': ['theodoric ruding']},
            'cambridge': {'active': 1521-1700, 'specialty': 'academic', 'printers': ['john Siberch']},
            'london': {'active': 1476-1700, 'specialty': 'renaissance texts', 'printers': ['william caxton']},
            'rome': {'active': 1467-1700, 'specialty': 'papal texts', 'printers': ['sweynheim and pannartz']},
            'florence': {'active': 1471-1700, 'specialty': 'classical texts', 'printers': ['bernardo cennini']}
        }

    def normalize_author_name(self, author: str) -> str:
        """
        Normalize author name for Neo-Latin identification.

        Args:
            author: Original author name

        Returns:
            Normalized author name
        """
        if not author:
            return ""

        # Convert to lowercase and clean
        author = str(author).lower().strip()

        # Remove common title words
        author = re.sub(r'\b(?:mr|dr|prof|sir|frater|dominus|magister)\b\.?', '', author)

        # Remove punctuation and extra spaces
        author = re.sub(r'[^\w\s]', ' ', author)
        author = re.sub(r'\s+', ' ', author)

        return author.strip()

    def analyze_publication_date(self, year: int) -> Dict:
        """
        Analyze publication date for Neo-Latin period.

        Args:
            year: Publication year

        Returns:
            Dictionary with Neo-Latin period analysis
        """
        result = {
            'neo_latin_period': False,
            'period_name': 'unknown',
            'century': None,
            'neo_latin_likelihood': 0.0,
            'historical_context': []
        }

        if not year:
            return result

        # Determine century and period
        result['century'] = (year - 1) // 100 + 1

        # Neo-Latin period spans approximately 1300-1900
        if self.neo_latin_start_year <= year <= self.neo_latin_end_year:
            result['neo_latin_period'] = True

            # Determine specific period
            if 1300 <= year < 1400:
                result['period_name'] = 'late_medieval'
                result['neo_latin_likelihood'] = 0.3
                result['historical_context'] = ['proto-renaissance', 'early humanism']
            elif 1400 <= year < 1500:
                result['period_name'] = 'early_renaissance'
                result['neo_latin_likelihood'] = 0.7
                result['historical_context'] = ['italian renaissance', 'printing press invention', 'humanism']
            elif 1500 <= year < 1600:
                result['period_name'] = 'high_renaissance'
                result['neo_latin_likelihood'] = 0.9
                result['historical_context'] = ['northern renaissance', 'reformation', 'scientific revolution']
            elif 1600 <= year < 1700:
                result['period_name'] = 'baroque'
                result['neo_latin_likelihood'] = 0.8
                result['historical_context'] = ['scientific revolution', 'baroque culture', 'enlightenment beginnings']
            elif 1700 <= year < 1800:
                result['period_name'] = 'enlightenment'
                result['neo_latin_likelihood'] = 0.6
                result['historical_context'] = ['enlightenment', 'academic latin', 'scientific publications']
            elif 1800 <= year <= 1900:
                result['period_name'] = 'late_modern'
                result['neo_latin_likelihood'] = 0.4
                result['historical_context'] = ['academic use', 'declining literary use', 'scientific latin']
        else:
            # Outside Neo-Latin period
            if year < self.neo_latin_start_year:
                result['period_name'] = 'classical'
                result['historical_context'] = ['classical latin', 'medieval latin']
            else:
                result['period_name'] = 'contemporary'
                result['historical_context'] = ['modern latin revival', 'academic use']

        return result

    def analyze_author(self, author: str) -> Dict:
        """
        Analyze author for Neo-Latin characteristics.

        Args:
            author: Author name

        Returns:
            Dictionary with author Neo-Latin analysis
        """
        result = {
            'neo_latin_author': False,
            'neo_latin_score': 0.0,
            'period': 'unknown',
            'region': 'unknown',
            'specialty': 'unknown',
            'known_works': [],
            'evidence': []
        }

        if not author:
            return result

        norm_author = self.normalize_author_name(author)

        # Check against known Neo-Latin authors
        for known_author, author_info in self.neo_latin_authors.items():
            norm_known = self.normalize_author_name(known_author)

            # Check for exact match or partial match
            if norm_author == norm_known or norm_known in norm_author or norm_author in norm_known:
                result.update(author_info)
                result['neo_latin_author'] = True
                result['evidence'].append(f"Known Neo-Latin author: {known_author}")
                break

        return result

    def analyze_title(self, title: str) -> Dict:
        """
        Analyze title for Neo-Latin characteristics.

        Args:
            title: Work title

        Returns:
            Dictionary with title Neo-Latin analysis
        """
        result = {
            'neo_latin_indicators': 0,
            'genre_suggestions': [],
            'neo_latin_score': 0.0,
            'evidence': [],
            'neo_latin_patterns': []
        }

        if not title:
            return result

        title_lower = title.lower()

        # Check for Neo-Latin title patterns
        for genre_name, genre_info in self.neo_latin_genres.items():
            genre_matches = 0
            pattern_matches = 0

            # Check keywords
            for keyword in genre_info['keywords']:
                if keyword in title_lower:
                    genre_matches += 1
                    result['evidence'].append(f"Genre keyword '{keyword}' found")

            # Check patterns
            for pattern in genre_info['patterns']:
                if re.search(pattern, title_lower):
                    pattern_matches += 1
                    result['neo_latin_patterns'].append(pattern)
                    result['evidence'].append(f"Genre pattern '{pattern}' matched")

            if genre_matches > 0 or pattern_matches > 0:
                result['genre_suggestions'].append(genre_name)
                result['neo_latin_indicators'] += (genre_matches + pattern_matches)

        # Specific Neo-Latin title characteristics
        neo_latin_patterns = [
            r'^de \w+',           # "De" + noun (very common)
            r'^ad \w+',           # "Ad" + person/thing
            r'^in \w+',           # "In" + thing
            r'^commentarii \w+',  # Commentaries
            r'^dialogus',         # Dialogues
            r'^epistolae',        # Letters
            r'^carmina',          # Poems
            r'^tractatus',        # Treatises
            r'^disputatio',       # Disputations
            r'^philosophia',      # Philosophy
            r'^theologia',        # Theology
            r'^grammatica',       # Grammar
            r'^rhetorica',        # Rhetoric
        ]

        for pattern in neo_latin_patterns:
            if re.search(pattern, title_lower):
                result['neo_latin_indicators'] += 1
                result['neo_latin_patterns'].append(pattern)

        # Calculate Neo-Latin score
        if result['neo_latin_indicators'] >= 2:
            result['neo_latin_score'] = min(0.8, result['neo_latin_indicators'] * 0.2)
            result['evidence'].append(f"Multiple Neo-Latin indicators: {result['neo_latin_indicators']}")
        elif result['neo_latin_indicators'] == 1:
            result['neo_latin_score'] = 0.3

        return result

    def analyze_publication_place(self, place: str) -> Dict:
        """
        Analyze publication place for Neo-Latin characteristics.

        Args:
            place: Publication place

        Returns:
            Dictionary with place Neo-Latin analysis
        """
        result = {
            'neo_latin_center': False,
            'humanist_center': False,
            'printing_center': False,
            'region': 'unknown',
            'neo_latin_likelihood': 0.0,
            'evidence': []
        }

        if not place:
            return result

        place_lower = str(place).lower().strip()

        # Check humanist centers
        for center in self.humanist_centers:
            if center in place_lower or place_lower in center:
                result['humanist_center'] = True
                result['neo_latin_likelihood'] += 0.3
                result['evidence'].append(f"Humanist center: {center}")

        # Check printing centers
        for center, info in self.printing_centers.items():
            if center in place_lower or place_lower in center:
                result['printing_center'] = True
                result['neo_latin_likelihood'] += 0.4
                result['evidence'].append(f"Major printing center: {center} ({info['specialty']})")

                # Check if active during Neo-Latin period
                if isinstance(info['active'], tuple):
                    start, end = info['active']
                else:
                    start, end = info['active'].split('-')
                    start, end = int(start), int(end)

                # (Would need year parameter to check active period)

        # Determine region
        regions = {
            'italy': ['roma', 'venezia', 'firenze', 'napoli', 'milano', 'bologna', 'padova'],
            'france': ['paris', 'lyon', 'bordeaux', 'toulouse', 'rouen'],
            'germany': ['leipzig', 'wittenberg', 'heidelberg', 'ingolstadt', 'tübingen', 'nürnberg'],
            'netherlands': ['amsterdam', 'leiden', 'antwerp', 'brugge'],
            'england': ['london', 'oxford', 'cambridge', 'cantuaria'],
            'spain': ['madrid', 'salamanca', 'alcalá', 'barcelona'],
            'portugal': ['lisboa', 'coimbra'],
            'switzerland': ['genève', 'basel', 'zürich'],
            'poland': ['cracovia', 'warszawa'],
            'scandinavia': ['copenhagen', 'uppsala', 'stockholm']
        }

        for region, cities in regions.items():
            if any(city in place_lower for city in cities):
                result['region'] = region
                break

        if result['humanist_center'] or result['printing_center']:
            result['neo_latin_center'] = True

        return result

    def is_neo_latin_work(self, title: str, author: str, year: int = None, place: str = None) -> Dict:
        """
        Comprehensive Neo-Latin work analysis.

        Args:
            title: Work title
            author: Work author
            year: Publication year
            place: Publication place

        Returns:
            Dictionary with comprehensive Neo-Latin analysis
        """
        result = {
            'title': title,
            'author': author,
            'year': year,
            'place': place,
            'is_neo_latin': False,
            'neo_latin_score': 0.0,
            'confidence': 'low',
            'evidence': [],
            'period': 'unknown',
            'genre': 'unknown',
            'characteristics': {}
        }

        # Analyze each component
        author_analysis = self.analyze_author(author)
        title_analysis = self.analyze_title(title)
        date_analysis = self.analyze_publication_date(year)
        place_analysis = self.analyze_publication_place(place)

        result['characteristics'] = {
            'author': author_analysis,
            'title': title_analysis,
            'date': date_analysis,
            'place': place_analysis
        }

        # Calculate overall Neo-Latin score
        scores = [
            author_analysis.get('neo_latin_score', 0.0) * 2.0,  # Author is most important
            title_analysis.get('neo_latin_score', 0.0) * 1.5,  # Title is important
            date_analysis.get('neo_latin_likelihood', 0.0),       # Date is contextual
            place_analysis.get('neo_latin_likelihood', 0.0)       # Place is contextual
        ]

        result['neo_latin_score'] = sum(scores) / len(scores)

        # Determine if it's Neo-Latin
        if result['neo_latin_score'] >= 0.7:
            result['is_neo_latin'] = True
            result['confidence'] = 'high'
        elif result['neo_latin_score'] >= 0.5:
            result['is_neo_latin'] = True
            result['confidence'] = 'medium'
        elif result['neo_latin_score'] >= 0.3:
            result['is_neo_latin'] = True
            result['confidence'] = 'low'

        # Extract additional information
        if author_analysis.get('neo_latin_author'):
            result['evidence'].append("Known Neo-Latin author")
            result['period'] = author_analysis.get('period', 'unknown')

        if title_analysis.get('genre_suggestions'):
            result['genre'] = title_analysis['genre_suggestions'][0]

        if date_analysis.get('neo_latin_period'):
            result['period'] = date_analysis.get('period_name', 'unknown')

        # Combine all evidence
        for analysis in [author_analysis, title_analysis, date_analysis, place_analysis]:
            result['evidence'].extend(analysis.get('evidence', []))

        return result

    def batch_analyze_neo_latin(self, works_df: pd.DataFrame, limit: int = None) -> pd.DataFrame:
        """
        Analyze a batch of works for Neo-Latin characteristics.

        Args:
            works_df: DataFrame of works to analyze
            limit: Maximum number of works to analyze (None for all)

        Returns:
            DataFrame with Neo-Latin analysis added
        """
        if limit:
            works_df = works_df.head(limit)

        neo_latin_results = []

        logger.info(f"Analyzing {len(works_df)} works for Neo-Latin characteristics")

        for idx, work in works_df.iterrows():
            title = work.get('title', '')
            author = work.get('author', '')
            year = work.get('publication_year')
            place = work.get('publication_place')

            if not title:
                logger.warning(f"Skipping record {idx} - no title")
                continue

            try:
                neo_latin_analysis = self.is_neo_latin_work(title, author, year, place)

                # Flatten analysis results for DataFrame
                flattened = {
                    'title': title,
                    'author': author,
                    'year': year,
                    'place': place,
                    'is_neo_latin': neo_latin_analysis['is_neo_latin'],
                    'neo_latin_score': neo_latin_analysis['neo_latin_score'],
                    'confidence': neo_latin_analysis['confidence'],
                    'period': neo_latin_analysis['period'],
                    'genre': neo_latin_analysis['genre'],
                    'evidence_count': len(neo_latin_analysis['evidence']),
                    'evidence': '; '.join(neo_latin_analysis['evidence'][:5])  # Limit evidence
                }

                # Add author-specific info
                if neo_latin_analysis['characteristics']['author'].get('neo_latin_author'):
                    flattened['author_period'] = neo_latin_analysis['characteristics']['author'].get('period', 'unknown')
                    flattened['author_specialty'] = neo_latin_analysis['characteristics']['author'].get('specialty', 'unknown')
                    flattened['author_region'] = neo_latin_analysis['characteristics']['author'].get('region', 'unknown')

                # Add title-specific info
                if neo_latin_analysis['characteristics']['title'].get('genre_suggestions'):
                    flattened['title_genres'] = '; '.join(neo_latin_analysis['characteristics']['title']['genre_suggestions'])

                # Add date-specific info
                if neo_latin_analysis['characteristics']['date'].get('neo_latin_period'):
                    flattened['date_period'] = neo_latin_analysis['characteristics']['date']['period_name']

                # Add place-specific info
                if neo_latin_analysis['characteristics']['place'].get('neo_latin_center'):
                    flattened['neo_latin_center'] = True

                neo_latin_results.append(flattened)

                # Progress logging
                if (len(neo_latin_results) % 50 == 0):
                    logger.info(f"Analyzed {len(neo_latin_results)} works for Neo-Latin characteristics")

            except Exception as e:
                logger.error(f"Error analyzing Neo-Latin for record {idx}: {e}")
                # Add result with error status
                neo_latin_results.append({
                    'title': title,
                    'author': author,
                    'is_neo_latin': False,
                    'neo_latin_score': 0.0,
                    'confidence': 'error',
                    'error': str(e)
                })

        # Convert to DataFrame
        neo_latin_df = pd.DataFrame(neo_latin_results)

        logger.info(f"Neo-Latin analysis complete for {len(neo_latin_df)} works")

        # Generate summary statistics
        if not neo_latin_df.empty:
            neo_latin_counts = neo_latin_df['is_neo_latin'].value_counts()
            logger.info(f"Neo-Latin summary: {neo_latin_counts.to_dict()}")

            if neo_latin_df['is_neo_latin'].any():
                confidence_counts = neo_latin_df[neo_latin_df['is_neo_latin']]['confidence'].value_counts()
                logger.info(f"Confidence breakdown: {confidence_counts.to_dict()}")

        return neo_latin_df