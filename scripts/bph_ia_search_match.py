#!/usr/bin/env python3
"""
BPH-IA Search-Based Record Matching

Instead of loading the entire IA corpus into memory, this approach:
1. Takes each BPH work and searches Internet Archive directly
2. Evaluates top candidates using multiple signals (title, author, year)
3. Optionally uses LLM for ambiguous matches

This is more efficient and scalable than the embedding-based approach.

Usage:
    python bph_ia_search_match.py [--mode fast|hybrid|full] [--sample N]
"""

import os
import re
import json
import argparse
import time
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, asdict
import unicodedata

import httpx
from anthropic import Anthropic
from supabase import create_client, Client
from rapidfuzz import fuzz

# Configuration
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "search_matching"
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ykhxaecbbxaaqlujuzde.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlraHhhZWNiYnhhYXFsdWp1emRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjExMDEsImV4cCI6MjA4MDYzNzEwMX0.O2chfnHGQWLOaVSFQ-F6UJMlya9EzPbsUh848SEOPj4")

# Model settings
CLAUDE_MODEL = "claude-sonnet-4-20250514"

# Thresholds
FUZZY_THRESHOLD_HIGH = 90    # High confidence match
FUZZY_THRESHOLD_MEDIUM = 80  # Medium confidence, check other signals
FUZZY_THRESHOLD_LOW = 70     # Low confidence, needs LLM

# Internet Archive API
IA_SEARCH_URL = "https://archive.org/advancedsearch.php"
IA_METADATA_URL = "https://archive.org/metadata"


@dataclass
class BPHWork:
    id: str
    title: str
    author: Optional[str]
    year: Optional[int]
    publisher: Optional[str]
    place: Optional[str]
    ubn: Optional[str]


@dataclass
class IAWork:
    identifier: str
    title: str
    creator: Optional[str]
    year: Optional[int]
    description: Optional[str] = None
    language: Optional[str] = None


@dataclass
class MatchResult:
    bph_work: BPHWork
    ia_work: Optional[IAWork]
    is_match: bool
    confidence: str  # 'high', 'medium', 'low'
    match_type: str  # 'same_edition', 'same_work', 'different_work', 'no_candidates'
    reasoning: str
    title_similarity: float
    author_match: bool
    year_match: bool
    method: str  # 'search', 'llm'


def get_supabase_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def normalize_text(text: str) -> str:
    """Normalize text for comparison."""
    if not text:
        return ""
    text = text.lower()
    text = unicodedata.normalize('NFKD', text)
    text = text.replace('æ', 'ae').replace('œ', 'oe')
    text = re.sub(r'[^\w\s]', ' ', text)
    text = ' '.join(text.split())
    return text


def extract_surname(name: str) -> Optional[str]:
    """Extract author surname for matching."""
    if not name:
        return None
    # Remove brackets and dates
    name = re.sub(r'\[|\]', '', name)
    name = re.sub(r'\([^)]*\)', '', name)
    name = re.sub(r'\d{4}', '', name)
    # Get first part before comma (usually surname)
    if ',' in name:
        name = name.split(',')[0]
    name = name.strip()
    # Return first word > 3 chars
    for word in name.split():
        cleaned = re.sub(r'[^\w]', '', word)
        if len(cleaned) > 3:
            return cleaned.lower()
    return normalize_text(name)[:20] if name else None


def extract_year(text: Any) -> Optional[int]:
    """Extract year from various formats."""
    if isinstance(text, int):
        return text if 1400 <= text <= 2000 else None
    if isinstance(text, str):
        match = re.search(r'(\d{4})', text)
        if match:
            year = int(match.group(1))
            return year if 1400 <= year <= 2000 else None
    return None


def build_search_query(bph_work: BPHWork) -> str:
    """Build an IA search query from BPH work metadata."""
    # Extract key title words (remove common Latin stopwords)
    stopwords = {
        'de', 'in', 'ad', 'et', 'ex', 'pro', 'per', 'cum', 'ab', 'a', 'ut',
        'liber', 'libri', 'libro', 'libros', 'opus', 'opera', 'tractatus',
        'seu', 'sive', 'quae', 'quod', 'que', 'qui', 'quibus', 'item'
    }

    title_words = normalize_text(bph_work.title).split()
    key_words = [w for w in title_words if len(w) > 3 and w not in stopwords][:5]

    query_parts = []

    # Add title keywords
    if key_words:
        query_parts.append(' '.join(key_words))

    # Add author surname if available
    if bph_work.author:
        surname = extract_surname(bph_work.author)
        if surname:
            query_parts.append(surname)

    return ' '.join(query_parts)


def search_internet_archive(query: str, language: str = "lat", max_results: int = 20) -> List[Dict]:
    """Search Internet Archive for matching works."""
    params = {
        'q': f'{query} AND language:{language}',
        'fl[]': ['identifier', 'title', 'creator', 'date', 'description', 'language'],
        'sort[]': 'downloads desc',
        'rows': max_results,
        'page': 1,
        'output': 'json'
    }

    try:
        response = httpx.get(IA_SEARCH_URL, params=params, timeout=30.0)
        response.raise_for_status()
        data = response.json()
        return data.get('response', {}).get('docs', [])
    except Exception as e:
        print(f"  IA search error: {e}")
        return []


def search_ia_for_work(bph_work: BPHWork) -> List[IAWork]:
    """Search Internet Archive for candidates matching a BPH work."""
    query = build_search_query(bph_work)

    if not query.strip():
        return []

    # Search with language filter
    results = search_internet_archive(query, language="lat", max_results=15)

    # If no results, try broader search without language filter
    if not results:
        results = search_internet_archive(query, language="*", max_results=10)

    candidates = []
    for doc in results:
        # Parse creator (can be string or list)
        creator = doc.get('creator')
        if isinstance(creator, list):
            creator = creator[0] if creator else None

        # Parse date
        year = extract_year(doc.get('date'))

        # Parse description
        desc = doc.get('description')
        if isinstance(desc, list):
            desc = ' '.join(desc)

        candidates.append(IAWork(
            identifier=doc.get('identifier', ''),
            title=doc.get('title', ''),
            creator=creator,
            year=year,
            description=desc[:500] if desc else None,
            language=doc.get('language')
        ))

    return candidates


def evaluate_candidate(bph_work: BPHWork, ia_work: IAWork) -> Dict[str, Any]:
    """Evaluate how well an IA work matches a BPH work."""
    # Title similarity (fuzzy match)
    bph_title_norm = normalize_text(bph_work.title)
    ia_title_norm = normalize_text(ia_work.title)

    title_ratio = fuzz.ratio(bph_title_norm, ia_title_norm)
    title_partial = fuzz.partial_ratio(bph_title_norm, ia_title_norm)
    title_token_sort = fuzz.token_sort_ratio(bph_title_norm, ia_title_norm)
    title_token_set = fuzz.token_set_ratio(bph_title_norm, ia_title_norm)

    # Use best score
    title_similarity = max(title_ratio, title_partial, title_token_sort, title_token_set)

    # Author match
    bph_surname = extract_surname(bph_work.author)
    ia_surname = extract_surname(ia_work.creator)

    author_match = False
    author_similarity = 0
    if bph_surname and ia_surname:
        author_similarity = fuzz.ratio(bph_surname, ia_surname)
        author_match = author_similarity >= 80

    # Year match (within 30 years tolerance)
    year_match = False
    year_diff = None
    if bph_work.year and ia_work.year:
        year_diff = abs(bph_work.year - ia_work.year)
        year_match = year_diff <= 30

    # Compute overall confidence
    if title_similarity >= FUZZY_THRESHOLD_HIGH and (author_match or year_match):
        confidence = 'high'
    elif title_similarity >= FUZZY_THRESHOLD_HIGH:
        confidence = 'medium'
    elif title_similarity >= FUZZY_THRESHOLD_MEDIUM and (author_match and year_match):
        confidence = 'high'
    elif title_similarity >= FUZZY_THRESHOLD_MEDIUM and (author_match or year_match):
        confidence = 'medium'
    elif title_similarity >= FUZZY_THRESHOLD_LOW:
        confidence = 'low'
    else:
        confidence = 'none'

    return {
        'title_similarity': title_similarity,
        'author_match': author_match,
        'author_similarity': author_similarity,
        'year_match': year_match,
        'year_diff': year_diff,
        'confidence': confidence
    }


class SearchMatcher:
    """Matcher that searches IA for each BPH work."""

    def __init__(self, use_llm: bool = False, llm_mode: str = 'hybrid'):
        self.use_llm = use_llm
        self.llm_mode = llm_mode
        self.anthropic = Anthropic() if use_llm else None
        self.bph_works: List[BPHWork] = []
        self.results: List[MatchResult] = []

    def load_bph_works(self, year_min: int = 1400, year_max: int = 1700, limit: Optional[int] = None):
        """Load BPH Latin works from Supabase."""
        client = get_supabase_client()
        print(f"Loading BPH Latin works ({year_min}-{year_max})...")

        all_works = []
        offset = 0
        batch_size = 1000

        while True:
            query = client.table('bph_works').select(
                'id, title, author, year, publisher, place, ubn'
            ).eq('detected_language', 'Latin')

            if year_min:
                query = query.gte('year', year_min)
            if year_max:
                query = query.lte('year', year_max)

            result = query.order('id').range(offset, offset + batch_size - 1).execute()

            if not result.data:
                break

            all_works.extend(result.data)
            offset += batch_size

            if limit and len(all_works) >= limit:
                all_works = all_works[:limit]
                break

        self.bph_works = [
            BPHWork(
                id=w['id'], title=w.get('title', ''),
                author=w.get('author'), year=w.get('year'),
                publisher=w.get('publisher'), place=w.get('place'),
                ubn=w.get('ubn')
            )
            for w in all_works if w.get('title')
        ]
        print(f"  Loaded {len(self.bph_works)} BPH works")

    def llm_evaluate(self, bph_work: BPHWork, ia_work: IAWork, eval_result: Dict) -> MatchResult:
        """Use Claude to evaluate an ambiguous match."""
        prompt = f"""You are an expert bibliographer evaluating whether two catalog records refer to the same book.

## BPH Catalog Record (Bibliotheca Philosophica Hermetica)
- Title: {bph_work.title}
- Author: {bph_work.author or 'Unknown'}
- Year: {bph_work.year or 'Unknown'}
- Publisher: {bph_work.publisher or 'Unknown'}
- Place: {bph_work.place or 'Unknown'}

## Internet Archive Record
- Title: {ia_work.title}
- Creator: {ia_work.creator or 'Unknown'}
- Year: {ia_work.year or 'Unknown'}
- Identifier: {ia_work.identifier}
- Description: {(ia_work.description or '')[:300]}

## Similarity Scores
- Title similarity: {eval_result['title_similarity']}%
- Author name match: {'Yes' if eval_result['author_match'] else 'No'} (similarity: {eval_result['author_similarity']}%)
- Year match (±30 years): {'Yes' if eval_result['year_match'] else 'No'}

## Your Task
Determine if these records refer to the same work. Consider:
1. Latin titles can vary (abbreviations, word order, spelling)
2. Author names may be latinized or spelled differently
3. Publication years may differ for reprints/editions
4. A work might appear in collected "Opera" volumes

Respond in this exact JSON format:
{{
    "verdict": "SAME_EDITION" | "SAME_WORK" | "DIFFERENT",
    "confidence": "high" | "medium" | "low",
    "reasoning": "Brief explanation"
}}"""

        try:
            response = self.anthropic.messages.create(
                model=CLAUDE_MODEL,
                max_tokens=500,
                messages=[{"role": "user", "content": prompt}]
            )

            content = response.content[0].text
            # Extract JSON from response
            json_match = re.search(r'\{[^{}]*\}', content, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                result = {"verdict": "DIFFERENT", "confidence": "low", "reasoning": "Could not parse response"}

            is_match = result['verdict'] in ['SAME_EDITION', 'SAME_WORK']
            match_type = result['verdict'].lower()

            return MatchResult(
                bph_work=bph_work,
                ia_work=ia_work if is_match else None,
                is_match=is_match,
                confidence=result['confidence'],
                match_type=match_type,
                reasoning=result['reasoning'],
                title_similarity=eval_result['title_similarity'],
                author_match=eval_result['author_match'],
                year_match=eval_result['year_match'],
                method='llm'
            )
        except Exception as e:
            print(f"  LLM evaluation failed: {e}")
            return MatchResult(
                bph_work=bph_work,
                ia_work=None,
                is_match=False,
                confidence='low',
                match_type='error',
                reasoning=f"LLM error: {str(e)}",
                title_similarity=eval_result['title_similarity'],
                author_match=eval_result['author_match'],
                year_match=eval_result['year_match'],
                method='llm_error'
            )

    def match_work(self, bph_work: BPHWork) -> MatchResult:
        """Find the best match for a BPH work by searching IA."""
        # Search Internet Archive
        candidates = search_ia_for_work(bph_work)

        if not candidates:
            return MatchResult(
                bph_work=bph_work,
                ia_work=None,
                is_match=False,
                confidence='high',
                match_type='no_candidates',
                reasoning='No candidates found in Internet Archive search',
                title_similarity=0,
                author_match=False,
                year_match=False,
                method='search'
            )

        # Evaluate all candidates
        evaluations = []
        for ia_work in candidates:
            eval_result = evaluate_candidate(bph_work, ia_work)
            evaluations.append((ia_work, eval_result))

        # Sort by title similarity
        evaluations.sort(key=lambda x: x[1]['title_similarity'], reverse=True)

        best_ia, best_eval = evaluations[0]

        # High confidence - accept match
        if best_eval['confidence'] == 'high':
            match_type = 'same_edition' if best_eval['author_match'] and best_eval['year_match'] else 'same_work'
            reasoning = f"High title similarity ({best_eval['title_similarity']}%)"
            if best_eval['author_match']:
                reasoning += ", author match"
            if best_eval['year_match']:
                reasoning += ", year match"

            return MatchResult(
                bph_work=bph_work,
                ia_work=best_ia,
                is_match=True,
                confidence='high',
                match_type=match_type,
                reasoning=reasoning,
                title_similarity=best_eval['title_similarity'],
                author_match=best_eval['author_match'],
                year_match=best_eval['year_match'],
                method='search'
            )

        # Medium confidence - accept with lower confidence or use LLM
        if best_eval['confidence'] == 'medium':
            if self.use_llm and self.llm_mode == 'full':
                return self.llm_evaluate(bph_work, best_ia, best_eval)

            return MatchResult(
                bph_work=bph_work,
                ia_work=best_ia,
                is_match=True,
                confidence='medium',
                match_type='same_work',
                reasoning=f"Medium title similarity ({best_eval['title_similarity']}%)",
                title_similarity=best_eval['title_similarity'],
                author_match=best_eval['author_match'],
                year_match=best_eval['year_match'],
                method='search'
            )

        # Low confidence - use LLM if available
        if best_eval['confidence'] == 'low' and self.use_llm:
            return self.llm_evaluate(bph_work, best_ia, best_eval)

        # No match
        return MatchResult(
            bph_work=bph_work,
            ia_work=None,
            is_match=False,
            confidence='high',
            match_type='no_match',
            reasoning=f"Best candidate too dissimilar ({best_eval['title_similarity']}%)",
            title_similarity=best_eval['title_similarity'],
            author_match=best_eval['author_match'],
            year_match=best_eval['year_match'],
            method='search'
        )

    def run_matching(self, delay: float = 0.5, save_callback=None, save_interval: int = 100) -> List[MatchResult]:
        """Run matching on all BPH works.

        Args:
            delay: Seconds between IA searches
            save_callback: Optional function to call for incremental saves
            save_interval: How often to call save_callback (every N works)
        """
        print("\n" + "=" * 70)
        print("RUNNING SEARCH-BASED MATCHING")
        print(f"Mode: {self.llm_mode}, LLM enabled: {self.use_llm}")
        if save_callback:
            print(f"Saving to Supabase every {save_interval} works")
        print("=" * 70)

        results = []
        llm_calls = 0
        last_save_idx = 0

        for i, bph_work in enumerate(self.bph_works):
            result = self.match_work(bph_work)
            results.append(result)

            if result.method == 'llm':
                llm_calls += 1

            # Progress
            if (i + 1) % 10 == 0:
                matched = sum(1 for r in results if r.is_match)
                print(f"  {i+1}/{len(self.bph_works)} - Matched: {matched} ({100*matched/(i+1):.1f}%), LLM calls: {llm_calls}")

            # Incremental save
            if save_callback and (i + 1) % save_interval == 0:
                batch = results[last_save_idx:]
                print(f"  Saving batch {last_save_idx+1}-{i+1} to Supabase...")
                save_callback(batch)
                last_save_idx = i + 1

            # Rate limiting for IA API
            time.sleep(delay)

        # Save any remaining results
        if save_callback and last_save_idx < len(results):
            batch = results[last_save_idx:]
            print(f"  Saving final batch {last_save_idx+1}-{len(results)} to Supabase...")
            save_callback(batch)

        return results


def save_results(results: List[MatchResult], output_dir: Path):
    """Save results to files."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir.mkdir(parents=True, exist_ok=True)

    # Summary stats
    total = len(results)
    matched = sum(1 for r in results if r.is_match)
    by_method = {}
    by_confidence = {}
    by_match_type = {}

    for r in results:
        by_method[r.method] = by_method.get(r.method, 0) + 1
        by_confidence[r.confidence] = by_confidence.get(r.confidence, 0) + 1
        if r.is_match:
            by_match_type[r.match_type] = by_match_type.get(r.match_type, 0) + 1

    # Save detailed results
    results_data = [
        {
            'bph_id': r.bph_work.id,
            'bph_title': r.bph_work.title,
            'bph_author': r.bph_work.author,
            'bph_year': r.bph_work.year,
            'ia_identifier': r.ia_work.identifier if r.ia_work else None,
            'ia_title': r.ia_work.title if r.ia_work else None,
            'ia_creator': r.ia_work.creator if r.ia_work else None,
            'ia_year': r.ia_work.year if r.ia_work else None,
            'is_match': r.is_match,
            'confidence': r.confidence,
            'match_type': r.match_type,
            'reasoning': r.reasoning,
            'title_similarity': r.title_similarity,
            'author_match': r.author_match,
            'year_match': r.year_match,
            'method': r.method,
        }
        for r in results
    ]

    output = {
        'metadata': {
            'timestamp': timestamp,
            'total_works': total,
            'matched': matched,
            'match_rate': matched / total if total > 0 else 0
        },
        'summary': {
            'by_method': by_method,
            'by_confidence': by_confidence,
            'by_match_type': by_match_type
        },
        'results': results_data
    }

    json_path = output_dir / f"search_matches_{timestamp}.json"
    with open(json_path, 'w') as f:
        json.dump(output, f, indent=2)

    print(f"\nResults saved to: {json_path}")


def save_matches_to_supabase(results: List[MatchResult], min_confidence: str = 'high'):
    """Save matched results to Supabase bph_works table.

    Args:
        results: List of match results
        min_confidence: Minimum confidence to save ('high', 'medium', 'low')
    """
    client = get_supabase_client()

    confidence_levels = {'high': 3, 'medium': 2, 'low': 1}
    min_level = confidence_levels.get(min_confidence, 3)

    # Filter matches by confidence
    matches_to_save = [
        r for r in results
        if r.is_match and confidence_levels.get(r.confidence, 0) >= min_level
    ]

    print(f"\nSaving {len(matches_to_save)} matches to Supabase...")

    saved = 0
    errors = 0

    for result in matches_to_save:
        if not result.ia_work:
            continue

        update_data = {
            'ia_identifier': result.ia_work.identifier,
            'ia_url': f"https://archive.org/details/{result.ia_work.identifier}",
            'ia_match_confidence': result.confidence,
            'ia_match_method': result.method,
            'ia_title_similarity': result.title_similarity,
            'ia_author_match': result.author_match,
            'ia_year_match': result.year_match,
            'ia_matched_at': datetime.now().isoformat()
        }

        try:
            client.table('bph_works').update(update_data).eq('id', result.bph_work.id).execute()
            saved += 1
        except Exception as e:
            print(f"  Error saving {result.bph_work.id}: {e}")
            errors += 1

    print(f"  Saved: {saved}, Errors: {errors}")
    return saved, errors


def print_summary(results: List[MatchResult]):
    """Print matching summary."""
    total = len(results)
    matched = sum(1 for r in results if r.is_match)

    by_method = {}
    by_confidence = {}
    by_match_type = {}

    for r in results:
        by_method[r.method] = by_method.get(r.method, 0) + 1
        by_confidence[r.confidence] = by_confidence.get(r.confidence, 0) + 1
        if r.is_match:
            by_match_type[r.match_type] = by_match_type.get(r.match_type, 0) + 1

    print("\n" + "=" * 70)
    print("FINAL RESULTS")
    print("=" * 70)
    print(f"Total BPH works: {total}")
    print(f"Matched: {matched} ({100*matched/total:.1f}%)")
    print(f"\nBy method: {by_method}")
    print(f"By confidence: {by_confidence}")
    print(f"By match type: {by_match_type}")

    # Print sample matches
    print("\n" + "=" * 70)
    print("SAMPLE HIGH-CONFIDENCE MATCHES")
    print("=" * 70)

    high_conf = [r for r in results if r.is_match and r.confidence == 'high']
    for r in high_conf[:5]:
        print(f"\nBPH: {r.bph_work.title[:70]}")
        print(f"     Author: {r.bph_work.author}, Year: {r.bph_work.year}")
        print(f"IA:  {r.ia_work.title[:70]}")
        print(f"     Creator: {r.ia_work.creator}, Year: {r.ia_work.year}")
        print(f"     Similarity: {r.title_similarity}%, Author: {r.author_match}, Year: {r.year_match}")


def main():
    parser = argparse.ArgumentParser(description='BPH-IA Search-Based Matching')
    parser.add_argument('--mode', choices=['fast', 'hybrid', 'full'], default='fast',
                        help='Matching mode: fast (no LLM), hybrid (LLM for ambiguous), full (LLM for all)')
    parser.add_argument('--year-min', type=int, default=1400)
    parser.add_argument('--year-max', type=int, default=1700)
    parser.add_argument('--sample', type=int, default=None, help='Sample size for BPH works')
    parser.add_argument('--delay', type=float, default=0.5, help='Delay between IA searches (seconds)')
    parser.add_argument('--save-to-supabase', action='store_true',
                        help='Save matches to Supabase bph_works table')
    parser.add_argument('--min-confidence', choices=['high', 'medium', 'low'], default='high',
                        help='Minimum confidence level to save to Supabase')
    parser.add_argument('--save-interval', type=int, default=100,
                        help='Save to Supabase every N works (default: 100)')
    args = parser.parse_args()

    print("=" * 70)
    print("BPH-IA SEARCH-BASED MATCHING")
    print("=" * 70)
    print(f"Mode: {args.mode}")
    print(f"Year range: {args.year_min}-{args.year_max}")
    if args.sample:
        print(f"Sample size: {args.sample}")
    if args.save_to_supabase:
        print(f"Will save to Supabase (min confidence: {args.min_confidence}, every {args.save_interval} works)")

    use_llm = args.mode != 'fast'
    llm_mode = args.mode if args.mode != 'fast' else 'hybrid'

    matcher = SearchMatcher(use_llm=use_llm, llm_mode=llm_mode)
    matcher.load_bph_works(args.year_min, args.year_max, args.sample)

    # Create save callback if saving to Supabase
    save_callback = None
    if args.save_to_supabase:
        def save_callback(batch):
            save_matches_to_supabase(batch, args.min_confidence)

    results = matcher.run_matching(
        delay=args.delay,
        save_callback=save_callback,
        save_interval=args.save_interval
    )
    save_results(results, OUTPUT_DIR)
    print_summary(results)


if __name__ == "__main__":
    main()
