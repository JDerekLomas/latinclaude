#!/usr/bin/env python3
"""
Matching Experiment Framework

Different strategies for matching BPH works to Internet Archive:
1. year_first: Filter by year range, then match titles
2. author_first: Filter by author surname, then match titles
3. exact_title: Only accept very high title similarity (>0.95)
4. fuzzy_multi: Combine fuzzy title + author + year signals
5. llm_verify: Use Claude to verify candidate matches

Run strategies and compare against ground truth validations.
"""

import os
import json
import re
from collections import defaultdict
from dataclasses import dataclass
from typing import Optional, List, Dict, Tuple
from supabase import create_client
from rapidfuzz import fuzz
import numpy as np

# Supabase setup
SUPABASE_URL = "https://ykhxaecbbxaaqlujuzde.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlraHhhZWNiYnhhYXFsdWp1emRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjExMDEsImV4cCI6MjA4MDYzNzEwMX0.O2chfnHGQWLOaVSFQ-F6UJMlya9EzPbsUh848SEOPj4"


@dataclass
class Work:
    id: str
    title: str
    author: Optional[str]
    year: Optional[int]
    source: str  # 'bph' or 'ia'
    identifier: Optional[str] = None  # IA identifier


@dataclass
class Match:
    bph: Work
    ia: Work
    score: float
    strategy: str
    confidence: str  # 'high', 'medium', 'low'
    signals: Dict[str, any]  # What signals contributed


@dataclass
class StrategyResult:
    name: str
    matches: List[Match]
    precision: Optional[float] = None  # vs ground truth
    recall: Optional[float] = None
    f1: Optional[float] = None


def normalize_title(title: str) -> str:
    """Normalize title for comparison."""
    if not title:
        return ""
    # Lowercase
    t = title.lower()
    # Remove punctuation except spaces
    t = re.sub(r'[^\w\s]', ' ', t)
    # Collapse whitespace
    t = ' '.join(t.split())
    return t


def extract_surname(name: str) -> Optional[str]:
    """Extract likely surname from author string."""
    if not name:
        return None
    # Remove dates in parentheses
    name = re.sub(r'\([^)]+\)', '', name)
    # Take first word before comma (often surname)
    if ',' in name:
        name = name.split(',')[0]
    # Get first capitalized word > 3 chars
    words = name.split()
    for word in words:
        if len(word) > 3 and word[0].isupper():
            return word.lower()
    return None


def extract_year(year_val) -> Optional[int]:
    """Extract year as integer."""
    if not year_val:
        return None
    try:
        return int(year_val)
    except:
        # Try to extract 4-digit year from string
        match = re.search(r'\b(1[4-9]\d{2})\b', str(year_val))
        if match:
            return int(match.group(1))
    return None


class MatchingStrategy:
    """Base class for matching strategies."""

    def __init__(self, name: str):
        self.name = name

    def find_matches(self, bph_works: List[Work], ia_works: List[Work]) -> List[Match]:
        raise NotImplementedError


class YearFirstStrategy(MatchingStrategy):
    """
    Strategy: Filter by year first (exact or +-5), then fuzzy title match.
    Rationale: Year is often reliable; reduces false positives from generic titles.
    """

    def __init__(self, year_tolerance: int = 5, title_threshold: float = 0.7):
        super().__init__("year_first")
        self.year_tolerance = year_tolerance
        self.title_threshold = title_threshold

    def find_matches(self, bph_works: List[Work], ia_works: List[Work]) -> List[Match]:
        matches = []

        # Index IA by year
        ia_by_year = defaultdict(list)
        for ia in ia_works:
            year = extract_year(ia.year)
            if year:
                ia_by_year[year].append(ia)

        for bph in bph_works:
            bph_year = extract_year(bph.year)
            if not bph_year:
                continue

            # Get candidates within year tolerance
            candidates = []
            for y in range(bph_year - self.year_tolerance, bph_year + self.year_tolerance + 1):
                candidates.extend(ia_by_year.get(y, []))

            if not candidates:
                continue

            # Find best title match among candidates
            bph_title_norm = normalize_title(bph.title)
            best_match = None
            best_score = 0

            for ia in candidates:
                ia_title_norm = normalize_title(ia.title)
                score = fuzz.ratio(bph_title_norm, ia_title_norm) / 100

                if score > best_score and score >= self.title_threshold:
                    best_score = score
                    best_match = ia

            if best_match:
                confidence = 'high' if best_score > 0.85 else ('medium' if best_score > 0.75 else 'low')
                matches.append(Match(
                    bph=bph,
                    ia=best_match,
                    score=best_score,
                    strategy=self.name,
                    confidence=confidence,
                    signals={
                        'year_match': True,
                        'year_diff': abs(bph_year - extract_year(best_match.year)),
                        'title_score': best_score,
                    }
                ))

        return matches


class AuthorFirstStrategy(MatchingStrategy):
    """
    Strategy: Filter by author surname first, then fuzzy title match.
    Rationale: Author is strong signal; reduces matching different authors' works.
    """

    def __init__(self, author_threshold: float = 0.8, title_threshold: float = 0.6):
        super().__init__("author_first")
        self.author_threshold = author_threshold
        self.title_threshold = title_threshold

    def find_matches(self, bph_works: List[Work], ia_works: List[Work]) -> List[Match]:
        matches = []

        # Index IA by author surname (fuzzy)
        ia_by_surname = defaultdict(list)
        for ia in ia_works:
            surname = extract_surname(ia.author)
            if surname:
                ia_by_surname[surname].append(ia)

        for bph in bph_works:
            bph_surname = extract_surname(bph.author)
            if not bph_surname:
                continue

            # Find similar surnames
            candidates = []
            for ia_surname, works in ia_by_surname.items():
                author_score = fuzz.ratio(bph_surname, ia_surname) / 100
                if author_score >= self.author_threshold:
                    for w in works:
                        candidates.append((w, author_score))

            if not candidates:
                continue

            # Find best title match among candidates
            bph_title_norm = normalize_title(bph.title)
            best_match = None
            best_score = 0
            best_author_score = 0

            for ia, author_score in candidates:
                ia_title_norm = normalize_title(ia.title)
                title_score = fuzz.ratio(bph_title_norm, ia_title_norm) / 100

                # Combined score: weight author and title
                combined = (author_score * 0.3) + (title_score * 0.7)

                if combined > best_score and title_score >= self.title_threshold:
                    best_score = combined
                    best_match = ia
                    best_author_score = author_score

            if best_match:
                confidence = 'high' if best_score > 0.85 else ('medium' if best_score > 0.7 else 'low')
                matches.append(Match(
                    bph=bph,
                    ia=best_match,
                    score=best_score,
                    strategy=self.name,
                    confidence=confidence,
                    signals={
                        'author_match': True,
                        'author_score': best_author_score,
                        'title_score': best_score,
                    }
                ))

        return matches


class ExactTitleStrategy(MatchingStrategy):
    """
    Strategy: Only accept very high title similarity (>0.95).
    Rationale: High precision, low recall - good for automated acceptance.
    """

    def __init__(self, threshold: float = 0.95):
        super().__init__("exact_title")
        self.threshold = threshold

    def find_matches(self, bph_works: List[Work], ia_works: List[Work]) -> List[Match]:
        matches = []

        # Precompute normalized titles
        ia_titles = [(ia, normalize_title(ia.title)) for ia in ia_works]

        for bph in bph_works:
            bph_title_norm = normalize_title(bph.title)

            for ia, ia_title_norm in ia_titles:
                score = fuzz.ratio(bph_title_norm, ia_title_norm) / 100

                if score >= self.threshold:
                    matches.append(Match(
                        bph=bph,
                        ia=ia,
                        score=score,
                        strategy=self.name,
                        confidence='high',
                        signals={
                            'title_score': score,
                            'exact_match': score > 0.99,
                        }
                    ))
                    break  # Take first match above threshold

        return matches


class YearAuthorTitleStrategy(MatchingStrategy):
    """
    Strategy: Require year match AND (author OR high title similarity).
    Rationale: Year is most reliable; combine with other signals.
    """

    def __init__(self, year_tolerance: int = 10, author_threshold: float = 0.7,
                 title_threshold: float = 0.6, title_only_threshold: float = 0.85):
        super().__init__("year_author_title")
        self.year_tolerance = year_tolerance
        self.author_threshold = author_threshold
        self.title_threshold = title_threshold
        self.title_only_threshold = title_only_threshold

    def find_matches(self, bph_works: List[Work], ia_works: List[Work]) -> List[Match]:
        matches = []

        # Index IA by year
        ia_by_year = defaultdict(list)
        for ia in ia_works:
            year = extract_year(ia.year)
            if year:
                ia_by_year[year].append(ia)

        for bph in bph_works:
            bph_year = extract_year(bph.year)
            if not bph_year:
                continue

            bph_surname = extract_surname(bph.author)
            bph_title_norm = normalize_title(bph.title)

            # Get candidates within year tolerance
            candidates = []
            for y in range(bph_year - self.year_tolerance, bph_year + self.year_tolerance + 1):
                candidates.extend(ia_by_year.get(y, []))

            best_match = None
            best_score = 0
            best_signals = {}

            for ia in candidates:
                ia_surname = extract_surname(ia.author)
                ia_title_norm = normalize_title(ia.title)

                title_score = fuzz.ratio(bph_title_norm, ia_title_norm) / 100

                # Check author match
                author_match = False
                author_score = 0
                if bph_surname and ia_surname:
                    author_score = fuzz.ratio(bph_surname, ia_surname) / 100
                    author_match = author_score >= self.author_threshold

                # Accept if: (author matches AND title is decent) OR (title is very good)
                if author_match and title_score >= self.title_threshold:
                    combined = (author_score * 0.3) + (title_score * 0.7)
                    if combined > best_score:
                        best_score = combined
                        best_match = ia
                        best_signals = {
                            'year_match': True,
                            'author_match': True,
                            'author_score': author_score,
                            'title_score': title_score,
                        }
                elif title_score >= self.title_only_threshold:
                    if title_score > best_score:
                        best_score = title_score
                        best_match = ia
                        best_signals = {
                            'year_match': True,
                            'author_match': False,
                            'title_score': title_score,
                        }

            if best_match:
                confidence = 'high' if best_score > 0.85 else ('medium' if best_score > 0.7 else 'low')
                matches.append(Match(
                    bph=bph,
                    ia=best_match,
                    score=best_score,
                    strategy=self.name,
                    confidence=confidence,
                    signals=best_signals
                ))

        return matches


def load_data():
    """Load BPH and IA works from Supabase."""
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    print("Loading BPH works...")
    bph_works = []
    offset = 0
    while True:
        result = supabase.table('bph_works').select(
            'id, title, author, year'
        ).eq('detected_language', 'Latin').range(offset, offset + 999).execute()
        if not result.data:
            break
        for r in result.data:
            bph_works.append(Work(
                id=r['id'],
                title=r.get('title', ''),
                author=r.get('author'),
                year=r.get('year'),
                source='bph'
            ))
        offset += 1000
    print(f"  Loaded {len(bph_works)} BPH Latin works")

    print("Loading IA works...")
    ia_works = []
    offset = 0
    while True:
        result = supabase.table('ia_latin_texts').select(
            'identifier, title, creator, year'
        ).range(offset, offset + 999).execute()
        if not result.data:
            break
        for r in result.data:
            ia_works.append(Work(
                id=r['identifier'],
                title=r.get('title', ''),
                author=r.get('creator'),
                year=r.get('year'),
                source='ia',
                identifier=r['identifier']
            ))
        offset += 1000
    print(f"  Loaded {len(ia_works)} IA works")

    return bph_works, ia_works


def load_ground_truth():
    """Load validated matches from Supabase."""
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    result = supabase.table('match_validations').select('*').not_.is_('is_same_work', 'null').execute()

    ground_truth = {}
    for r in result.data:
        key = (r['bph_id'], r['ia_identifier'])
        ground_truth[key] = {
            'is_same_work': r['is_same_work'],
            'is_same_edition': r.get('is_same_edition'),
        }

    print(f"Loaded {len(ground_truth)} validated matches")
    return ground_truth


def evaluate_strategy(matches: List[Match], ground_truth: Dict) -> Tuple[float, float, float]:
    """Evaluate strategy against ground truth."""
    if not ground_truth:
        return None, None, None

    # Only evaluate matches that have ground truth
    tp = fp = fn = 0

    matched_pairs = set()
    for m in matches:
        pair = (m.bph.id, m.ia.identifier)
        matched_pairs.add(pair)

        if pair in ground_truth:
            if ground_truth[pair]['is_same_work']:
                tp += 1
            else:
                fp += 1

    # False negatives: ground truth positives we didn't match
    for pair, truth in ground_truth.items():
        if truth['is_same_work'] and pair not in matched_pairs:
            fn += 1

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0

    return precision, recall, f1


def run_experiment(sample_size: int = None):
    """Run all strategies and compare results."""
    print("="*70)
    print("MATCHING EXPERIMENT")
    print("="*70)

    # Load data
    bph_works, ia_works = load_data()
    ground_truth = load_ground_truth()

    # Sample if requested
    if sample_size and len(bph_works) > sample_size:
        import random
        random.seed(42)
        bph_works = random.sample(bph_works, sample_size)
        print(f"\nUsing sample of {sample_size} BPH works")

    # Define strategies
    strategies = [
        YearFirstStrategy(year_tolerance=5, title_threshold=0.7),
        YearFirstStrategy(year_tolerance=10, title_threshold=0.6),
        AuthorFirstStrategy(author_threshold=0.8, title_threshold=0.6),
        ExactTitleStrategy(threshold=0.95),
        ExactTitleStrategy(threshold=0.90),
        YearAuthorTitleStrategy(),
    ]

    results = []

    for strategy in strategies:
        print(f"\nRunning {strategy.name}...")
        matches = strategy.find_matches(bph_works, ia_works)

        precision, recall, f1 = evaluate_strategy(matches, ground_truth)

        result = StrategyResult(
            name=strategy.name,
            matches=matches,
            precision=precision,
            recall=recall,
            f1=f1
        )
        results.append(result)

        # Print summary
        print(f"  Found {len(matches)} matches")
        by_confidence = defaultdict(int)
        for m in matches:
            by_confidence[m.confidence] += 1
        print(f"  By confidence: {dict(by_confidence)}")
        if precision is not None:
            print(f"  Precision: {precision:.2%}, Recall: {recall:.2%}, F1: {f1:.2%}")

    # Summary table
    print("\n" + "="*70)
    print("STRATEGY COMPARISON")
    print("="*70)
    print(f"{'Strategy':<25} {'Matches':>8} {'High':>6} {'Med':>6} {'Low':>6} {'P':>6} {'R':>6} {'F1':>6}")
    print("-"*70)

    for r in results:
        high = sum(1 for m in r.matches if m.confidence == 'high')
        med = sum(1 for m in r.matches if m.confidence == 'medium')
        low = sum(1 for m in r.matches if m.confidence == 'low')
        p = f"{r.precision:.0%}" if r.precision else "-"
        rec = f"{r.recall:.0%}" if r.recall else "-"
        f1 = f"{r.f1:.0%}" if r.f1 else "-"
        print(f"{r.name:<25} {len(r.matches):>8} {high:>6} {med:>6} {low:>6} {p:>6} {rec:>6} {f1:>6}")

    return results


def generate_validation_samples(strategy_name: str, n_samples: int = 20):
    """Generate samples for human validation from a specific strategy."""
    print(f"\nGenerating {n_samples} samples for validation using {strategy_name}...")

    bph_works, ia_works = load_data()

    # Find the strategy
    strategies = {
        'year_first': YearFirstStrategy(year_tolerance=5, title_threshold=0.7),
        'year_first_loose': YearFirstStrategy(year_tolerance=10, title_threshold=0.6),
        'author_first': AuthorFirstStrategy(),
        'exact_title': ExactTitleStrategy(threshold=0.90),
        'year_author_title': YearAuthorTitleStrategy(),
    }

    if strategy_name not in strategies:
        print(f"Unknown strategy: {strategy_name}")
        print(f"Available: {list(strategies.keys())}")
        return

    strategy = strategies[strategy_name]
    matches = strategy.find_matches(bph_works, ia_works)

    # Sample across confidence levels
    import random
    random.seed(42)

    by_conf = defaultdict(list)
    for m in matches:
        by_conf[m.confidence].append(m)

    samples = []
    for conf in ['high', 'medium', 'low']:
        conf_matches = by_conf.get(conf, [])
        n = min(n_samples // 3, len(conf_matches))
        samples.extend(random.sample(conf_matches, n))

    # Insert into Supabase
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    print(f"Inserting {len(samples)} samples into match_validations...")
    for m in samples:
        try:
            data = {
                'bph_id': m.bph.id,
                'bph_title': m.bph.title,
                'bph_author': m.bph.author,
                'bph_year': m.bph.year,
                'ia_identifier': m.ia.identifier,
                'ia_title': m.ia.title,
                'ia_creator': m.ia.author,
                'ia_year': m.ia.year,
                'match_score': m.score,
                'match_type': f'{strategy_name}_{m.confidence}',
            }
            supabase.table('match_validations').insert(data).execute()
            print(f"  Added: {m.bph.title[:50]}...")
        except Exception as e:
            print(f"  Error: {e}")

    print("Done!")


if __name__ == '__main__':
    import sys

    if len(sys.argv) > 1:
        if sys.argv[1] == 'generate':
            strategy = sys.argv[2] if len(sys.argv) > 2 else 'year_author_title'
            n = int(sys.argv[3]) if len(sys.argv) > 3 else 20
            generate_validation_samples(strategy, n)
        else:
            print("Usage: python matching_experiment.py [generate <strategy> <n_samples>]")
    else:
        # Run experiment with sample
        run_experiment(sample_size=500)
