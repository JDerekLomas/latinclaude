#!/usr/bin/env python3
"""
BPH-IA LLM Agent-Based Record Matching

A hybrid approach inspired by LEAD (arxiv.org/html/2511.07168):
1. Fast first pass: Embeddings + fuzzy matching identify candidates
2. LLM reasoning: Claude evaluates ambiguous cases with full context
3. Agent tools: Can search Internet Archive, examine metadata, verify editions

Key insight: Apply LLM only to hard cases, achieving both accuracy and efficiency.

Usage:
    python bph_ia_agent_match.py [--mode fast|hybrid|full] [--sample N]

Modes:
    fast   - Embeddings + fuzzy only (no LLM)
    hybrid - LLM for ambiguous cases only (recommended)
    full   - LLM evaluates all candidates (expensive but thorough)
"""

import os
import re
import json
import argparse
import asyncio
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any
from dataclasses import dataclass
import unicodedata

# Dependencies are assumed to be installed via requirements or venv

import numpy as np
import httpx
from anthropic import Anthropic
from supabase import create_client, Client
from rapidfuzz import fuzz
from sentence_transformers import SentenceTransformer
import faiss

# Configuration
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "agent_matching"
CACHE_DIR = Path(__file__).parent.parent / "data" / "embedding_cache"
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ykhxaecbbxaaqlujuzde.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlraHhhZWNiYnhhYXFsdWp1emRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjExMDEsImV4cCI6MjA4MDYzNzEwMX0.O2chfnHGQWLOaVSFQ-F6UJMlya9EzPbsUh848SEOPj4")

# Model settings
EMBEDDING_MODEL = "paraphrase-multilingual-MiniLM-L12-v2"
CLAUDE_MODEL = "claude-sonnet-4-20250514"  # Fast and capable

# Thresholds (aligned with docs/matching_methodology.md)
EMBEDDING_THRESHOLD_HIGH = 0.85  # Confident match with confirming signals
EMBEDDING_THRESHOLD_MEDIUM = 0.75  # Candidate match requiring additional signals
EMBEDDING_THRESHOLD_LOW = 0.60   # Low confidence, LLM evaluation recommended
FUZZY_THRESHOLD = 80             # Token set ratio threshold


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


@dataclass
class MatchCandidate:
    bph_work: BPHWork
    ia_work: IAWork
    embedding_score: float
    fuzzy_score: float
    author_match: bool
    year_match: bool
    confidence: str  # 'high', 'medium', 'low', 'needs_llm'


@dataclass
class MatchResult:
    bph_work: BPHWork
    ia_work: Optional[IAWork]
    is_match: bool
    confidence: str
    match_type: str  # 'same_edition', 'same_work_diff_edition', 'different_work'
    reasoning: str
    method: str  # 'embedding', 'fuzzy', 'llm', 'agent'


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


def extract_surname(name: str) -> str:
    """Extract surname from author name."""
    if not name:
        return ""
    name = re.sub(r'\([^)]*\d+[^)]*\)', '', name)
    if ',' in name:
        name = name.split(',')[0]
    words = name.split()
    for word in words:
        cleaned = re.sub(r'[^\w]', '', word)
        if len(cleaned) > 2:
            return cleaned.lower()
    return ""


class BibliographicMatcher:
    """Hybrid matcher combining embeddings, fuzzy matching, and LLM reasoning."""

    def __init__(self, use_llm: bool = True, llm_mode: str = 'hybrid'):
        self.supabase = get_supabase_client()
        self.use_llm = use_llm
        self.llm_mode = llm_mode  # 'hybrid' or 'full'

        # Load embedding model
        print(f"Loading embedding model: {EMBEDDING_MODEL}")
        self.embed_model = SentenceTransformer(EMBEDDING_MODEL)

        # Initialize Claude client if using LLM
        if use_llm:
            self.anthropic = Anthropic()
            print("Claude client initialized")

        # Data storage
        self.bph_works: List[BPHWork] = []
        self.ia_works: List[IAWork] = []
        self.ia_embeddings: Optional[np.ndarray] = None
        self.faiss_index: Optional[faiss.IndexFlatIP] = None

    def load_data(self, year_min: int = 1400, year_max: int = 1700,
                  bph_limit: Optional[int] = None, ia_limit: Optional[int] = None):
        """Load BPH and IA data from Supabase."""
        # Load BPH works
        print(f"Loading BPH Latin works ({year_min}-{year_max})...")
        all_bph = []
        offset = 0

        while True:
            result = self.supabase.table('bph_works').select(
                'id, title, author, year, publisher, place, ubn'
            ).eq('detected_language', 'Latin').gte('year', year_min).lte('year', year_max).range(
                offset, offset + 999
            ).execute()

            if not result.data:
                break
            all_bph.extend(result.data)
            offset += 1000
            if bph_limit and len(all_bph) >= bph_limit:
                break

        self.bph_works = [
            BPHWork(
                id=w['id'], title=w.get('title', ''), author=w.get('author'),
                year=w.get('year'), publisher=w.get('publisher'),
                place=w.get('place'), ubn=w.get('ubn')
            )
            for w in all_bph[:bph_limit] if w.get('title')
        ]
        print(f"  Loaded {len(self.bph_works)} BPH works")

        # Load IA works
        print("Loading IA Latin works...")
        all_ia = []
        offset = 0

        while True:
            result = self.supabase.table('ia_latin_texts').select(
                'identifier, title, creator, year, description'
            ).range(offset, offset + 999).execute()

            if not result.data:
                break
            all_ia.extend(result.data)
            offset += 1000
            if offset % 10000 == 0:
                print(f"    {offset}...")
            if ia_limit and len(all_ia) >= ia_limit:
                break

        self.ia_works = [
            IAWork(
                identifier=w['identifier'], title=w.get('title', ''),
                creator=w.get('creator'), year=w.get('year'),
                description=w.get('description')
            )
            for w in all_ia[:ia_limit] if w.get('title')
        ]
        print(f"  Loaded {len(self.ia_works)} IA works")

    def build_embeddings(self):
        """Build or load cached embeddings for IA works."""
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        cache_path = CACHE_DIR / "ia_embeddings.npy"
        ids_path = CACHE_DIR / "ia_ids.json"

        current_ids = [w.identifier for w in self.ia_works]

        # Check cache validity
        if cache_path.exists() and ids_path.exists():
            with open(ids_path) as f:
                cached_ids = json.load(f)
            if cached_ids == current_ids:
                print("Loading IA embeddings from cache...")
                self.ia_embeddings = np.load(cache_path)
            else:
                print("Cache invalid, regenerating embeddings...")

        if self.ia_embeddings is None:
            print(f"Creating embeddings for {len(self.ia_works)} IA works...")
            titles = [w.title for w in self.ia_works]

            # Batch encode
            embeddings = []
            batch_size = 256
            for i in range(0, len(titles), batch_size):
                batch = titles[i:i+batch_size]
                batch_emb = self.embed_model.encode(batch, show_progress_bar=False)
                embeddings.append(batch_emb)
                if (i + batch_size) % 10000 == 0:
                    print(f"    {min(i+batch_size, len(titles))}/{len(titles)}...")

            self.ia_embeddings = np.vstack(embeddings).astype('float32')

            # Cache
            np.save(cache_path, self.ia_embeddings)
            with open(ids_path, 'w') as f:
                json.dump(current_ids, f)
            print(f"  Cached embeddings to {cache_path}")

        # Build FAISS index
        print("Building FAISS index...")
        faiss.normalize_L2(self.ia_embeddings)
        self.faiss_index = faiss.IndexFlatIP(self.ia_embeddings.shape[1])
        self.faiss_index.add(self.ia_embeddings)
        print(f"  Index built with {self.faiss_index.ntotal} vectors")

    def find_candidates(self, bph_work: BPHWork, k: int = 10) -> List[MatchCandidate]:
        """Find candidate matches using embeddings and fuzzy matching."""
        candidates = []

        # Embedding search
        query_emb = self.embed_model.encode([bph_work.title], convert_to_numpy=True)
        faiss.normalize_L2(query_emb)
        scores, indices = self.faiss_index.search(query_emb.astype('float32'), k)

        bph_norm = normalize_text(bph_work.title)
        bph_surname = extract_surname(bph_work.author or '')

        for score, idx in zip(scores[0], indices[0]):
            if idx < 0:
                continue

            ia_work = self.ia_works[idx]
            ia_norm = normalize_text(ia_work.title)

            # Calculate fuzzy score
            fuzzy_score = fuzz.token_set_ratio(bph_norm, ia_norm)

            # Check author match
            ia_surname = extract_surname(ia_work.creator or '')
            author_match = (
                bph_surname and ia_surname and
                fuzz.ratio(bph_surname, ia_surname) >= 80
            )

            # Check year match (within 30 years)
            year_match = (
                bph_work.year and ia_work.year and
                abs(bph_work.year - ia_work.year) <= 30
            )

            # Determine confidence based on multiple signals
            # High: title + (author OR year) signal
            if score >= EMBEDDING_THRESHOLD_HIGH and (author_match or year_match):
                confidence = 'high'
            # Medium: title + author + year all match
            elif score >= EMBEDDING_THRESHOLD_MEDIUM and author_match and year_match:
                confidence = 'high'
            # Medium: title >= 0.85 alone
            elif score >= EMBEDDING_THRESHOLD_HIGH:
                confidence = 'medium'
            # Medium-low: title >= 0.75 with supporting signals
            elif score >= EMBEDDING_THRESHOLD_MEDIUM and (author_match or year_match):
                confidence = 'medium'
            # Low but potential: needs LLM evaluation
            elif score >= EMBEDDING_THRESHOLD_LOW:
                confidence = 'needs_llm' if self.use_llm else 'low'
            else:
                confidence = 'low'

            candidates.append(MatchCandidate(
                bph_work=bph_work,
                ia_work=ia_work,
                embedding_score=float(score),
                fuzzy_score=fuzzy_score,
                author_match=author_match,
                year_match=year_match,
                confidence=confidence,
            ))

        return sorted(candidates, key=lambda c: c.embedding_score, reverse=True)

    def llm_evaluate(self, candidate: MatchCandidate) -> MatchResult:
        """Use Claude to evaluate an ambiguous match candidate."""
        prompt = f"""You are an expert bibliographer evaluating whether two catalog records refer to the same book.

## BPH Catalog Record (Bibliotheca Philosophica Hermetica)
- Title: {candidate.bph_work.title}
- Author: {candidate.bph_work.author or 'Unknown'}
- Year: {candidate.bph_work.year or 'Unknown'}
- Publisher: {candidate.bph_work.publisher or 'Unknown'}
- Place: {candidate.bph_work.place or 'Unknown'}

## Internet Archive Record
- Title: {candidate.ia_work.title}
- Creator: {candidate.ia_work.creator or 'Unknown'}
- Year: {candidate.ia_work.year or 'Unknown'}
- Identifier: {candidate.ia_work.identifier}
- Description: {(candidate.ia_work.description or '')[:200]}

## Similarity Scores
- Semantic similarity: {candidate.embedding_score:.3f}
- Fuzzy title match: {candidate.fuzzy_score}%
- Author name match: {'Yes' if candidate.author_match else 'No'}
- Year match (±30 years): {'Yes' if candidate.year_match else 'No'}

## Your Task
Determine if these records refer to:
1. **SAME_EDITION** - The exact same printing/edition of the work
2. **SAME_WORK** - The same work but a different edition/printing
3. **DIFFERENT** - Different works entirely

Consider:
- Latin titles often have variations (abbreviated vs full)
- Author names vary (Latinized forms, initials, etc.)
- IA titles often include author name or "Opera omnia" compilations
- Year differences may indicate reprints

Respond in this exact JSON format:
{{
    "verdict": "SAME_EDITION" | "SAME_WORK" | "DIFFERENT",
    "confidence": "high" | "medium" | "low",
    "reasoning": "Brief explanation of your decision"
}}"""

        try:
            response = self.anthropic.messages.create(
                model=CLAUDE_MODEL,
                max_tokens=500,
                messages=[{"role": "user", "content": prompt}]
            )

            # Parse response
            text = response.content[0].text
            # Extract JSON from response
            json_match = re.search(r'\{[^}]+\}', text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                result = {"verdict": "DIFFERENT", "confidence": "low", "reasoning": "Could not parse response"}

            is_match = result['verdict'] in ['SAME_EDITION', 'SAME_WORK']
            match_type = result['verdict'].lower().replace('_', '_')

            return MatchResult(
                bph_work=candidate.bph_work,
                ia_work=candidate.ia_work if is_match else None,
                is_match=is_match,
                confidence=result['confidence'],
                match_type=match_type,
                reasoning=result['reasoning'],
                method='llm'
            )

        except Exception as e:
            print(f"  LLM evaluation failed: {e}")
            return MatchResult(
                bph_work=candidate.bph_work,
                ia_work=None,
                is_match=False,
                confidence='low',
                match_type='error',
                reasoning=f"LLM error: {str(e)}",
                method='llm_error'
            )

    def match_work(self, bph_work: BPHWork) -> MatchResult:
        """Match a single BPH work using the hybrid approach."""
        candidates = self.find_candidates(bph_work)

        if not candidates:
            return MatchResult(
                bph_work=bph_work, ia_work=None, is_match=False,
                confidence='high', match_type='no_candidates',
                reasoning='No candidates found above threshold', method='embedding'
            )

        best = candidates[0]

        # High confidence - accept without LLM
        if best.confidence == 'high':
            match_type = 'same_edition' if best.author_match and best.year_match else 'same_work'
            return MatchResult(
                bph_work=bph_work, ia_work=best.ia_work, is_match=True,
                confidence='high', match_type=match_type,
                reasoning=f"High embedding score ({best.embedding_score:.3f}) with metadata confirmation",
                method='embedding'
            )

        # Medium confidence - accept with lower confidence
        if best.confidence == 'medium' and self.llm_mode != 'full':
            return MatchResult(
                bph_work=bph_work, ia_work=best.ia_work, is_match=True,
                confidence='medium', match_type='same_work',
                reasoning=f"Good embedding score ({best.embedding_score:.3f}) without full metadata match",
                method='embedding'
            )

        # Needs LLM evaluation
        if best.confidence == 'needs_llm' or self.llm_mode == 'full':
            return self.llm_evaluate(best)

        # Low confidence - no match
        return MatchResult(
            bph_work=bph_work, ia_work=None, is_match=False,
            confidence='high', match_type='no_match',
            reasoning=f"Best candidate score ({best.embedding_score:.3f}) below threshold",
            method='embedding'
        )

    def run_matching(self) -> List[MatchResult]:
        """Run matching on all BPH works."""
        print("\n" + "=" * 70)
        print("RUNNING HYBRID MATCHING")
        print(f"Mode: {self.llm_mode}, LLM enabled: {self.use_llm}")
        print("=" * 70)

        results = []
        llm_calls = 0

        for i, bph_work in enumerate(self.bph_works):
            result = self.match_work(bph_work)
            results.append(result)

            if result.method == 'llm':
                llm_calls += 1

            # Progress
            if (i + 1) % 100 == 0:
                matched = sum(1 for r in results if r.is_match)
                print(f"  {i+1}/{len(self.bph_works)} - Matched: {matched} ({100*matched/(i+1):.1f}%), LLM calls: {llm_calls}")

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
            'method': r.method,
        }
        for r in results
    ]

    json_path = output_dir / f"agent_matches_{timestamp}.json"
    with open(json_path, 'w') as f:
        json.dump({
            'metadata': {
                'timestamp': timestamp,
                'total_works': total,
                'matched': matched,
                'match_rate': matched / total if total > 0 else 0,
            },
            'summary': {
                'by_method': by_method,
                'by_confidence': by_confidence,
                'by_match_type': by_match_type,
            },
            'results': results_data,
        }, f, indent=2)

    print(f"\nResults saved to: {json_path}")

    # Print summary
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
    print("SAMPLE MATCHES")
    print("=" * 70)

    for r in results[:10]:
        if r.is_match:
            print(f"\nBPH: {r.bph_work.title[:60]}...")
            print(f"  IA: {r.ia_work.title[:60]}...")
            print(f"  Type: {r.match_type}, Confidence: {r.confidence}, Method: {r.method}")
            print(f"  Reasoning: {r.reasoning[:80]}...")


def main():
    parser = argparse.ArgumentParser(description='BPH-IA LLM Agent Matching')
    parser.add_argument('--mode', choices=['fast', 'hybrid', 'full'], default='hybrid',
                        help='Matching mode: fast (no LLM), hybrid (LLM for ambiguous), full (LLM for all)')
    parser.add_argument('--year-min', type=int, default=1400)
    parser.add_argument('--year-max', type=int, default=1700)
    parser.add_argument('--sample', type=int, default=None, help='Sample size for BPH works')
    parser.add_argument('--ia-sample', type=int, default=None, help='Limit IA corpus size for faster testing')
    args = parser.parse_args()

    print("=" * 70)
    print("BPH-IA LLM AGENT-BASED MATCHING")
    print("=" * 70)
    print(f"Mode: {args.mode}")
    print(f"Year range: {args.year_min}-{args.year_max}")
    if args.ia_sample:
        print(f"IA corpus limited to: {args.ia_sample} (for testing)")

    use_llm = args.mode != 'fast'
    llm_mode = args.mode if args.mode != 'fast' else 'hybrid'

    matcher = BibliographicMatcher(use_llm=use_llm, llm_mode=llm_mode)
    matcher.load_data(args.year_min, args.year_max, bph_limit=args.sample, ia_limit=args.ia_sample)
    matcher.build_embeddings()

    results = matcher.run_matching()
    save_results(results, OUTPUT_DIR)


if __name__ == "__main__":
    main()
