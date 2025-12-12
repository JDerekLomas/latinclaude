#!/usr/bin/env python3
"""
Deduplication logic for Latin master bibliography.
Implements record matching and merging across multiple catalogues.
"""

import re
import hashlib
import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional, Set
from rapidfuzz import fuzz, process
from unidecode import unidecode
import logging
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)


class RecordDeduplicator:
    """
    Handles deduplication of bibliographic records across multiple catalogues.
    """

    def __init__(self, config: Dict = None):
        """
        Initialize deduplicator with configuration.

        Args:
            config: Configuration dictionary for deduplication parameters
        """
        self.config = config or {}

        # Matching thresholds
        self.title_similarity_threshold = self.config.get('title_threshold', 0.7)
        self.author_similarity_threshold = self.config.get('author_threshold', 0.8)
        self.date_tolerance_years = self.config.get('date_tolerance', 5)
        self.overall_score_threshold = self.config.get('overall_threshold', 0.75)

        # Field weights for overall scoring
        self.weights = self.config.get('weights', {
            'title': 0.4,
            'author': 0.3,
            'date': 0.2,
            'place': 0.1
        })

        # Statistics
        self.stats = {
            'total_records': 0,
            'duplicate_groups': 0,
            'unique_records': 0,
            'processing_time': None
        }

    def normalize_text(self, text: str) -> str:
        """
        Normalize text for comparison.

        Args:
            text: Input text

        Returns:
            Normalized text
        """
        if pd.isna(text) or text is None:
            return ""

        # Convert to lowercase and remove accents
        text = str(text).lower()
        text = unidecode(text)

        # Remove punctuation and extra whitespace
        text = re.sub(r'[^\w\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()

        return text

    def extract_keywords(self, title: str) -> Set[str]:
        """
        Extract significant keywords from title.

        Args:
            title: Title text

        Returns:
            Set of keywords
        """
        normalized = self.normalize_text(title)

        # Remove common stop words
        stop_words = {
            'de', 'der', 'die', 'das', 'des', 'dem', 'den', 'ein', 'eine', 'einer',
            'einem', 'einen', 'et', 'ad', 'in', 'a', 'ab', 'ex', 'per', 'pro',
            'cum', 'sine', 'sub', 'super', 'inter', 'contra', 'the', 'a', 'an'
        }

        words = [word for word in normalized.split()
                if len(word) > 2 and word not in stop_words]

        return set(words)

    def calculate_title_similarity(self, title1: str, title2: str) -> float:
        """
        Calculate similarity between two titles.

        Args:
            title1: First title
            title2: Second title

        Returns:
            Similarity score between 0 and 1
        """
        if pd.isna(title1) or pd.isna(title2):
            return 0.0

        # Normalize both titles
        norm1 = self.normalize_text(title1)
        norm2 = self.normalize_text(title2)

        # Direct string similarity
        direct_similarity = fuzz.ratio(norm1, norm2) / 100.0

        # Token-based similarity
        token_similarity = fuzz.token_set_ratio(norm1, norm2) / 100.0

        # Keyword overlap
        keywords1 = self.extract_keywords(title1)
        keywords2 = self.extract_keywords(title2)

        if not keywords1 and not keywords2:
            keyword_similarity = 1.0
        elif not keywords1 or not keywords2:
            keyword_similarity = 0.0
        else:
            intersection = keywords1 & keywords2
            union = keywords1 | keywords2
            keyword_similarity = len(intersection) / len(union) if union else 0.0

        # Weighted combination
        return (direct_similarity * 0.3 +
                token_similarity * 0.4 +
                keyword_similarity * 0.3)

    def calculate_author_similarity(self, author1: str, author2: str) -> float:
        """
        Calculate similarity between two author names.

        Args:
            author1: First author name
            author2: Second author name

        Returns:
            Similarity score between 0 and 1
        """
        if pd.isna(author1) or pd.isna(author2):
            return 0.0

        # Normalize author names
        norm1 = self.normalize_text(author1)
        norm2 = self.normalize_text(author2)

        # Extract surnames (last word typically)
        words1 = norm1.split()
        words2 = norm2.split()

        surname1 = words1[-1] if words1 else ""
        surname2 = words2[-1] if words2 else ""

        # Check for exact surname match
        if surname1 == surname2 and surname1:
            return 1.0

        # Check for partial matches and initials
        similarity = fuzz.ratio(norm1, norm2) / 100.0

        # Bonus for matching first letters of words
        bonus = 0.0
        if len(words1) == len(words2):
            matching_initials = sum(1 for w1, w2 in zip(words1, words2)
                                   if w1[0] == w2[0])
            bonus = (matching_initials / len(words1)) * 0.2

        return min(1.0, similarity + bonus)

    def calculate_date_similarity(self, year1: int, year2: int) -> float:
        """
        Calculate similarity between publication years.

        Args:
            year1: First year
            year2: Second year

        Returns:
            Similarity score between 0 and 1
        """
        if pd.isna(year1) or pd.isna(year2):
            return 0.0

        if year1 == year2:
            return 1.0

        diff = abs(year1 - year2)

        if diff <= 1:
            return 0.9
        elif diff <= 2:
            return 0.7
        elif diff <= self.date_tolerance_years:
            return 0.5
        elif diff <= self.date_tolerance_years * 2:
            return 0.3
        else:
            return 0.1

    def calculate_place_similarity(self, place1: str, place2: str) -> float:
        """
        Calculate similarity between publication places.

        Args:
            place1: First place
            place2: Second place

        Returns:
            Similarity score between 0 and 1
        """
        if pd.isna(place1) or pd.isna(place2):
            return 0.0

        norm1 = self.normalize_text(place1)
        norm2 = self.normalize_text(place2)

        # Direct similarity
        similarity = fuzz.ratio(norm1, norm2) / 100.0

        # Bonus for exact word matches
        words1 = set(norm1.split())
        words2 = set(norm2.split())

        if words1 and words2:
            word_overlap = len(words1 & words2) / len(words1 | words2)
            similarity = max(similarity, word_overlap)

        return similarity

    def calculate_overall_similarity(self, record1: Dict, record2: Dict) -> Dict:
        """
        Calculate overall similarity score between two records.

        Args:
            record1: First record
            record2: Second record

        Returns:
            Dictionary with individual and overall similarity scores
        """
        scores = {}

        # Title similarity
        scores['title'] = self.calculate_title_similarity(
            record1.get('title', ''), record2.get('title', '')
        )

        # Author similarity
        scores['author'] = self.calculate_author_similarity(
            record1.get('author', ''), record2.get('author', '')
        )

        # Date similarity
        year1 = record1.get('publication_year')
        year2 = record2.get('publication_year')
        scores['date'] = self.calculate_date_similarity(year1, year2)

        # Place similarity
        scores['place'] = self.calculate_place_similarity(
            record1.get('publication_place', ''), record2.get('publication_place', '')
        )

        # Calculate weighted overall score
        overall_score = sum(scores[field] * weight
                          for field, weight in self.weights.items())
        scores['overall'] = overall_score

        return scores

    def is_duplicate_pair(self, record1: Dict, record2: Dict) -> Tuple[bool, Dict]:
        """
        Determine if two records are duplicates.

        Args:
            record1: First record
            record2: Second record

        Returns:
            Tuple of (is_duplicate, similarity_scores)
        """
        scores = self.calculate_overall_similarity(record1, record2)

        # Apply threshold logic
        title_pass = scores['title'] >= self.title_similarity_threshold
        author_pass = scores['author'] >= self.author_similarity_threshold

        # Overall score must meet threshold
        is_duplicate = (scores['overall'] >= self.overall_score_threshold and
                       title_pass and author_pass)

        return is_duplicate, scores

    def find_duplicate_groups(self, df: pd.DataFrame) -> List[List[int]]:
        """
        Find groups of duplicate records.

        Args:
            df: DataFrame of records to deduplicate

        Returns:
            List of groups, each containing indices of duplicate records
        """
        logger.info(f"Finding duplicate groups in {len(df)} records")
        start_time = datetime.now()

        # Create normalized versions for faster matching
        df['title_normalized'] = df['title'].apply(self.normalize_text)
        df['author_normalized'] = df['author'].apply(self.normalize_text)

        # Group by basic criteria first (year, first letter of title/author)
        df['title_first'] = df['title_normalized'].str[:3]
        df['author_first'] = df['author_normalized'].str[:3]
        df['year_bucket'] = df['publication_year'].fillna(0).astype(int) // 5

        # Find potential matches within groups
        groups = []
        processed = set()

        for idx, record in df.iterrows():
            if idx in processed:
                continue

            # Find potential matches
            matches = [idx]
            processed.add(idx)

            # Filter potential matches by basic criteria
            potential_matches = df[
                (df.index != idx) &
                (~df.index.isin(processed)) &
                (df['year_bucket'] == record['year_bucket']) &
                (df['title_first'] == record['title_first'])
            ]

            # Check each potential match
            for match_idx, match_record in potential_matches.iterrows():
                is_duplicate, scores = self.is_duplicate_pair(
                    record.to_dict(), match_record.to_dict()
                )

                if is_duplicate:
                    matches.append(match_idx)
                    processed.add(match_idx)

            if len(matches) > 1:
                groups.append(matches)

        # Add single records (non-duplicates)
        all_indices = set(df.index)
        duplicate_indices = set(idx for group in groups for idx in group)
        single_indices = list(all_indices - duplicate_indices)

        for idx in single_indices:
            groups.append([idx])

        end_time = datetime.now()
        self.stats['processing_time'] = (end_time - start_time).total_seconds()
        self.stats['total_records'] = len(df)
        self.stats['duplicate_groups'] = len([g for g in groups if len(g) > 1])
        self.stats['unique_records'] = len(groups)

        logger.info(f"Found {self.stats['duplicate_groups']} duplicate groups "
                   f"and {len(single_indices)} unique records "
                   f"in {self.stats['processing_time']:.2f} seconds")

        return groups

    def merge_duplicate_group(self, group: List[int], df: pd.DataFrame) -> Dict:
        """
        Merge a group of duplicate records into a single master record.

        Args:
            group: List of indices representing duplicate records
            df: Original DataFrame

        Returns:
            Merged master record
        """
        if len(group) == 1:
            return df.iloc[group[0]].to_dict()

        # Get records in the group
        group_records = df.loc[group].copy()

        # Determine primary record (most complete or from preferred source)
        primary_idx = self._select_primary_record(group_records)
        primary_record = group_records.loc[primary_idx].to_dict()

        # Merge information from all records
        merged_record = primary_record.copy()

        # Create unique master ID
        merged_record['master_id'] = self._generate_master_id(group, df)

        # Collect all catalogue IDs
        catalogue_ids = {}
        for idx, record in group_records.iterrows():
            catalogue = record.get('source_catalogue', '').lower()
            if catalogue:
                id_field = f"{catalogue}_id"
                if id_field in record and pd.notna(record[id_field]):
                    catalogue_ids[id_field] = record[id_field]

        merged_record.update(catalogue_ids)

        # Merge fields with conflict resolution
        merged_record['title'] = self._merge_field(group_records, 'title', 'string')
        merged_record['author'] = self._merge_field(group_records, 'author', 'string')
        merged_record['publication_place'] = self._merge_field(group_records, 'publication_place', 'string')
        merged_record['printer'] = self._merge_field(group_records, 'printer', 'string')

        # Numeric fields (use most specific/complete)
        merged_record['publication_year'] = self._merge_field(group_records, 'publication_year', 'numeric')

        # Collect digital facsimile URLs
        all_urls = []
        for idx, record in group_records.iterrows():
            urls = record.get('digital_facsimile_urls', [])
            if isinstance(urls, str):
                urls = [urls]
            all_urls.extend(urls)

        if all_urls:
            merged_record['digital_facsimile_urls'] = list(set(all_urls))

        # Deduplication metadata
        merged_record['deduplication_group'] = f"GROUP_{hash(tuple(sorted(group)))}"
        merged_record['deduplication_confidence'] = self._calculate_group_confidence(group, df)
        merged_record['source_catalogues'] = ';'.join(group_records['source_catalogue'].unique())
        merged_record['primary_source'] = primary_record.get('source_catalogue', '')
        merged_record['record_status'] = 'Deduplicated'

        return merged_record

    def _select_primary_record(self, group_records: pd.DataFrame) -> int:
        """
        Select the primary record from a duplicate group.

        Args:
            group_records: DataFrame of duplicate records

        Returns:
            Index of the primary record
        """
        # Define source priority
        source_priority = {
            'ustc': 1,
            'vd16': 2,
            'vd17': 3,
            'vd18': 4,
            'estc': 5,
            'worldcat': 6
        }

        # Score each record
        scores = []
        for idx, record in group_records.iterrows():
            score = 0

            # Source priority
            source = record.get('source_catalogue', '').lower()
            score += (10 - source_priority.get(source, 10)) * 0.3

            # Completeness
            completeness = sum(1 for field in ['title', 'author', 'publication_year', 'publication_place']
                             if pd.notna(record.get(field)))
            score += (completeness / 4) * 0.4

            # Field length (longer usually means more complete)
            title_length = len(str(record.get('title', '')))
            author_length = len(str(record.get('author', '')))
            score += min(title_length / 100, 1) * 0.15
            score += min(author_length / 50, 1) * 0.15

            scores.append((idx, score))

        # Return record with highest score
        return max(scores, key=lambda x: x[1])[0]

    def _merge_field(self, group_records: pd.DataFrame, field: str, field_type: str) -> any:
        """
        Merge a specific field from multiple records.

        Args:
            group_records: DataFrame of duplicate records
            field: Field name to merge
            field_type: Type of field ('string', 'numeric', 'list')

        Returns:
            Merged field value
        """
        values = group_records[field].dropna().tolist()

        if not values:
            return None

        if field_type == 'numeric':
            # For numeric fields, use the most specific (non-zero) value
            for value in values:
                if value and value != 0:
                    return value
            return values[0] if values else None

        elif field_type == 'string':
            # For string fields, use the longest non-empty value
            if isinstance(values[0], list):
                values = [item for sublist in values for item in (sublist if isinstance(sublist, list) else [sublist])]

            # Filter out empty strings
            non_empty = [str(v) for v in values if str(v).strip()]
            if non_empty:
                return max(non_empty, key=len)
            return None

        elif field_type == 'list':
            # For list fields, combine all unique values
            all_values = []
            for value in values:
                if isinstance(value, list):
                    all_values.extend(value)
                else:
                    all_values.append(value)
            return list(set(all_values))

        return values[0]

    def _generate_master_id(self, group: List[int], df: pd.DataFrame) -> str:
        """Generate unique master ID for a duplicate group."""
        group_str = ','.join(map(str, sorted(group)))
        hash_obj = hashlib.md5(group_str.encode())
        return f"LATIN_{hash_obj.hexdigest()[:12].upper()}"

    def _calculate_group_confidence(self, group: List[int], df: pd.DataFrame) -> float:
        """Calculate confidence score for a duplicate group."""
        if len(group) == 1:
            return 1.0

        # Calculate pairwise similarities within the group
        similarities = []
        group_records = df.loc[group]

        for i in range(len(group)):
            for j in range(i + 1, len(group)):
                record1 = group_records.iloc[group[i]].to_dict()
                record2 = group_records.iloc[group[j]].to_dict()
                scores = self.calculate_overall_similarity(record1, record2)
                similarities.append(scores['overall'])

        # Return average similarity as confidence
        return np.mean(similarities) if similarities else 0.0

    def deduplicate_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Main deduplication method.

        Args:
            df: DataFrame of records to deduplicate

        Returns:
            Deduplicated DataFrame
        """
        logger.info(f"Starting deduplication of {len(df)} records")

        # Find duplicate groups
        groups = self.find_duplicate_groups(df)

        # Merge each group
        merged_records = []
        for group in groups:
            merged_record = self.merge_duplicate_group(group, df)
            merged_records.append(merged_record)

        # Create final DataFrame
        deduplicated_df = pd.DataFrame(merged_records)

        logger.info(f"Deduplication complete: {len(df)} -> {len(deduplicated_df)} records")

        return deduplicated_df

    def save_deduplication_report(self, df_original: pd.DataFrame,
                                 df_deduplicated: pd.DataFrame,
                                 output_path: str):
        """
        Save detailed deduplication report.

        Args:
            df_original: Original DataFrame
            df_deduplicated: Deduplicated DataFrame
            output_path: Path for report file
        """
        report = {
            'timestamp': datetime.now().isoformat(),
            'statistics': self.stats,
            'original_count': len(df_original),
            'deduplicated_count': len(df_deduplicated),
            'duplicate_reduction_rate': (len(df_original) - len(df_deduplicated)) / len(df_original) if len(df_original) > 0 else 0,
            'catalogue_breakdown': df_original['source_catalogue'].value_counts().to_dict()
        }

        # Add catalogue survival info if available
        if 'primary_source' in df_deduplicated.columns:
            report['catalogue_survival'] = df_deduplicated['primary_source'].value_counts().to_dict()
        elif 'source_catalogue' in df_deduplicated.columns:
            report['catalogue_survival'] = df_deduplicated['source_catalogue'].value_counts().to_dict()

        # Add detailed group information
        if 'deduplication_group' in df_deduplicated.columns:
            group_sizes = df_deduplicated['deduplication_group'].value_counts()
            report['group_statistics'] = {
                'total_groups': len(group_sizes),
                'average_group_size': group_sizes.mean(),
                'max_group_size': group_sizes.max(),
                'groups_with_multiple_records': (group_sizes > 1).sum()
            }

        with open(output_path, 'w', encoding='utf-8') as f:
            import json
            json.dump(report, f, indent=2, ensure_ascii=False)

        logger.info(f"Deduplication report saved to {output_path}")


if __name__ == "__main__":
    # Example usage
    # Create sample data for testing
    sample_data = [
        {
            'title': 'De Revolutionibus Orbium Coelestium',
            'author': 'Copernicus, Nicolaus',
            'publication_year': 1543,
            'publication_place': 'Nuremberg',
            'source_catalogue': 'VD16',
            'vd16_id': 'VD16_123456'
        },
        {
            'title': 'DE REVOLUTIONIBUS ORBIVM COELESTIVM',
            'author': 'N. Copernicus',
            'publication_year': 1543,
            'publication_place': 'Norimbergae',
            'source_catalogue': 'USTC',
            'ustc_id': 'USTC_789012'
        },
        {
            'title': 'Different Work',
            'author': 'Other Author',
            'publication_year': 1550,
            'publication_place': 'Paris',
            'source_catalogue': 'ESTC',
            'estc_id': 'ESTC_345678'
        }
    ]

    df = pd.DataFrame(sample_data)

    # Initialize deduplicator
    deduplicator = RecordDeduplicator()

    # Perform deduplication
    deduplicated_df = deduplicator.deduplicate_dataframe(df)

    print(f"Original records: {len(df)}")
    print(f"Deduplicated records: {len(deduplicated_df)}")
    print("\nDeduplicated records:")
    for _, record in deduplicated_df.iterrows():
        print(f"- {record['title']} by {record['author']} ({record['publication_year']})")
        print(f"  Sources: {record['source_catalogues']}")
        print(f"  Confidence: {record['deduplication_confidence']:.2f}")