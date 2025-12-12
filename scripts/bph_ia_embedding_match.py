#!/usr/bin/env python3
"""
BPH-IA Semantic Matching with Sentence Embeddings

Uses sentence-transformers to create semantic embeddings of titles,
then finds matches based on cosine similarity. This approach works
even when titles are paraphrased or the BPH title is a substring
of an anthology title.

Key advantages over fuzzy matching:
- Captures semantic similarity, not just character overlap
- Handles synonyms and paraphrases
- Works well when titles are embedded in longer strings
"""

import os
import json
import numpy as np
from datetime import datetime
from pathlib import Path
from collections import defaultdict

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    import subprocess
    subprocess.run(["pip", "install", "sentence-transformers"], check=True)
    from sentence_transformers import SentenceTransformer

try:
    from supabase import create_client, Client
except ImportError:
    import subprocess
    subprocess.run(["pip", "install", "supabase"], check=True)
    from supabase import create_client, Client

try:
    import faiss
except ImportError:
    import subprocess
    subprocess.run(["pip", "install", "faiss-cpu"], check=True)
    import faiss

# Configuration
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "embedding_matching"
CACHE_DIR = Path(__file__).parent.parent / "data" / "embedding_cache"
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ykhxaecbbxaaqlujuzde.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlraHhhZWNiYnhhYXFsdWp1emRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjExMDEsImV4cCI6MjA4MDYzNzEwMX0.O2chfnHGQWLOaVSFQ-F6UJMlya9EzPbsUh848SEOPj4")

# Model - paraphrase-multilingual works well for Latin/mixed language titles
MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"

# Matching threshold (cosine similarity)
SIMILARITY_THRESHOLD = 0.75


def get_supabase_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def load_bph_latin_works(limit: int = None) -> list:
    """Load BPH Latin works from Supabase."""
    client = get_supabase_client()

    print("Loading BPH Latin works...")

    all_works = []
    offset = 0
    batch_size = 1000

    while True:
        result = client.table('bph_works').select(
            'id, title, author, year, ubn'
        ).eq('detected_language', 'Latin').range(offset, offset + batch_size - 1).execute()

        if not result.data:
            break

        all_works.extend(result.data)
        offset += batch_size

        if limit and len(all_works) >= limit:
            all_works = all_works[:limit]
            break

    print(f"  Loaded {len(all_works)} Latin works from BPH")
    return all_works


def load_ia_latin_works() -> list:
    """Load Internet Archive Latin works from Supabase."""
    client = get_supabase_client()

    print("Loading IA Latin works...")

    all_works = []
    offset = 0
    batch_size = 1000

    while True:
        result = client.table('ia_latin_texts').select(
            'identifier, title, creator, year'
        ).range(offset, offset + batch_size - 1).execute()

        if not result.data:
            break

        all_works.extend(result.data)
        offset += batch_size

        if offset % 10000 == 0:
            print(f"    {offset}...")

    print(f"  Loaded {len(all_works)} Latin works from IA")
    return all_works


def get_or_create_embeddings(works: list, model: SentenceTransformer, cache_name: str) -> np.ndarray:
    """Get embeddings from cache or create them."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_path = CACHE_DIR / f"{cache_name}_embeddings.npy"
    ids_path = CACHE_DIR / f"{cache_name}_ids.json"

    # Check if cache exists and is valid
    if cache_path.exists() and ids_path.exists():
        with open(ids_path) as f:
            cached_ids = json.load(f)

        # Get current IDs
        if cache_name == 'ia':
            current_ids = [w.get('identifier', '') for w in works]
        else:
            current_ids = [w.get('id', '') for w in works]

        if cached_ids == current_ids:
            print(f"  Loading {cache_name} embeddings from cache...")
            return np.load(cache_path)

    # Create embeddings
    print(f"  Creating {cache_name} embeddings ({len(works)} titles)...")
    titles = [w.get('title', '') or '' for w in works]

    # Encode in batches
    batch_size = 256
    all_embeddings = []

    for i in range(0, len(titles), batch_size):
        batch = titles[i:i+batch_size]
        embeddings = model.encode(batch, show_progress_bar=False, convert_to_numpy=True)
        all_embeddings.append(embeddings)

        if (i + batch_size) % 10000 == 0:
            print(f"    Encoded {min(i + batch_size, len(titles))}/{len(titles)}...")

    embeddings = np.vstack(all_embeddings).astype('float32')

    # Cache
    np.save(cache_path, embeddings)
    if cache_name == 'ia':
        ids = [w.get('identifier', '') for w in works]
    else:
        ids = [w.get('id', '') for w in works]
    with open(ids_path, 'w') as f:
        json.dump(ids, f)

    print(f"  Cached {cache_name} embeddings to {cache_path}")
    return embeddings


def build_faiss_index(embeddings: np.ndarray) -> faiss.IndexFlatIP:
    """Build a FAISS index for fast similarity search."""
    print("Building FAISS index...")

    # Normalize for cosine similarity
    faiss.normalize_L2(embeddings)

    # Create index
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)  # Inner product = cosine sim for normalized vectors
    index.add(embeddings)

    print(f"  Built index with {index.ntotal} vectors")
    return index


def find_matches(bph_works: list, ia_works: list, bph_embeddings: np.ndarray,
                 index: faiss.IndexFlatIP, k: int = 5) -> list:
    """Find top-k matches for each BPH work using semantic similarity."""
    print("\nFinding semantic matches...")

    # Normalize BPH embeddings for cosine similarity
    bph_normalized = bph_embeddings.copy()
    faiss.normalize_L2(bph_normalized)

    results = []
    matched = 0

    batch_size = 1000
    for i in range(0, len(bph_works), batch_size):
        batch_embeddings = bph_normalized[i:i+batch_size]

        # Search
        similarities, indices = index.search(batch_embeddings, k)

        for j, (sims, idxs) in enumerate(zip(similarities, indices)):
            bph_idx = i + j
            bph_work = bph_works[bph_idx]

            matches = []
            for sim, idx in zip(sims, idxs):
                if sim >= SIMILARITY_THRESHOLD:
                    matches.append({
                        'ia_work': ia_works[idx],
                        'score': float(sim),
                        'method': 'embedding'
                    })

            result = {
                'bph_work': bph_work,
                'matches': matches,
                'best_score': matches[0]['score'] if matches else 0,
                'found': len(matches) > 0
            }
            results.append(result)

            if result['found']:
                matched += 1

        if (i + batch_size) % 2000 == 0 or i + batch_size >= len(bph_works):
            print(f"  Processed {min(i + batch_size, len(bph_works))}/{len(bph_works)} - "
                  f"{matched} matched ({100*matched/min(i + batch_size, len(bph_works)):.1f}%)")

    return results


def main():
    print("=" * 70)
    print("BPH-IA SEMANTIC MATCHING WITH EMBEDDINGS")
    print("=" * 70)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Load model
    print(f"\nLoading model: {MODEL_NAME}")
    model = SentenceTransformer(MODEL_NAME)

    # Load data
    bph_works = load_bph_latin_works()
    ia_works = load_ia_latin_works()

    # Get or create embeddings
    print("\nPreparing embeddings...")
    bph_embeddings = get_or_create_embeddings(bph_works, model, 'bph')
    ia_embeddings = get_or_create_embeddings(ia_works, model, 'ia')

    # Build FAISS index
    index = build_faiss_index(ia_embeddings)

    # Find matches
    results = find_matches(bph_works, ia_works, bph_embeddings, index)

    # Calculate statistics
    total = len(results)
    matched = sum(1 for r in results if r['found'])

    print("\n" + "=" * 70)
    print("RESULTS")
    print("=" * 70)

    print(f"\nTotal BPH Latin works: {total}")
    print(f"Matched in IA:         {matched} ({100*matched/total:.1f}%)")
    print(f"Not found:             {total - matched} ({100*(total-matched)/total:.1f}%)")
    print(f"Similarity threshold:  {SIMILARITY_THRESHOLD}")

    # Score distribution
    print("\nScore distribution for matches:")
    score_ranges = [(0.9, 1.0), (0.85, 0.9), (0.8, 0.85), (0.75, 0.8)]
    for low, high in score_ranges:
        count = sum(1 for r in results if r['found'] and low <= r['best_score'] < high)
        print(f"  {low:.2f}-{high:.2f}: {count}")

    # Century breakdown
    print("\nBy century:")
    century_stats = defaultdict(lambda: {'total': 0, 'matched': 0})
    for r in results:
        year = r['bph_work'].get('year')
        if year:
            century = f"{(year // 100) + 1}th"
            century_stats[century]['total'] += 1
            if r['found']:
                century_stats[century]['matched'] += 1

    for century in sorted(century_stats.keys()):
        stats = century_stats[century]
        pct = 100 * stats['matched'] / stats['total'] if stats['total'] > 0 else 0
        print(f"  {century}: {stats['matched']}/{stats['total']} ({pct:.1f}%)")

    # Save results
    output = {
        'metadata': {
            'timestamp': timestamp,
            'model': MODEL_NAME,
            'similarity_threshold': SIMILARITY_THRESHOLD,
            'bph_latin_works': total,
            'ia_latin_works': len(ia_works),
        },
        'summary': {
            'matched': matched,
            'matched_pct': 100 * matched / total,
            'not_found': total - matched,
            'by_century': {k: dict(v) for k, v in century_stats.items()}
        },
        'sample_matches': [
            {
                'bph_title': r['bph_work'].get('title'),
                'bph_author': r['bph_work'].get('author'),
                'bph_year': r['bph_work'].get('year'),
                'ia_title': r['matches'][0]['ia_work'].get('title') if r['matches'] else None,
                'ia_identifier': r['matches'][0]['ia_work'].get('identifier') if r['matches'] else None,
                'score': r['best_score']
            }
            for r in results[:100] if r['found']
        ]
    }

    json_path = OUTPUT_DIR / f"embedding_match_results_{timestamp}.json"
    with open(json_path, 'w') as f:
        json.dump(output, f, indent=2)
    print(f"\nResults saved to: {json_path}")

    # Print sample matches
    print("\n" + "=" * 70)
    print("SAMPLE MATCHES")
    print("=" * 70)

    for r in results[:20]:
        if r['found']:
            bph = r['bph_work']
            match = r['matches'][0]
            print(f"\nBPH: {bph.get('title', '')[:60]}...")
            print(f"  IA: {match['ia_work'].get('title', '')[:60]}...")
            print(f"  Score: {match['score']:.3f}")


if __name__ == "__main__":
    main()
