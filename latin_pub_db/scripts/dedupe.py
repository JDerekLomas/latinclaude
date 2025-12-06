#!/usr/bin/env python3
"""
dedupe.py - Deduplicate Latin publications by clustering similar records

Uses blocking (by year range + title prefix) and fuzzy matching (RapidFuzz)
to identify duplicate records and assign canonical_id to clusters.
"""

import sqlite3
from collections import defaultdict
from pathlib import Path
from typing import List, Tuple, Dict, Set

try:
    from rapidfuzz import fuzz
    RAPIDFUZZ_AVAILABLE = True
except ImportError:
    RAPIDFUZZ_AVAILABLE = False
    print("Warning: rapidfuzz not installed. Install with: pip install rapidfuzz")
    print("Falling back to basic string matching.")

# Paths
SCRIPT_DIR = Path(__file__).parent
BASE_DIR = SCRIPT_DIR.parent
DB_PATH = BASE_DIR / "db" / "latin_publications.db"

# Deduplication settings
YEAR_TOLERANCE = 2  # Years +/- to consider as potential match
TITLE_PREFIX_LENGTH = 3  # Number of words for blocking
SIMILARITY_THRESHOLD = 85  # Minimum score to consider as duplicate


def get_title_prefix(title_normalized: str) -> str:
    """Get first N words of normalized title for blocking."""
    if not title_normalized:
        return ""
    words = title_normalized.split()[:TITLE_PREFIX_LENGTH]
    return " ".join(words)


def similarity_score(record1: dict, record2: dict) -> float:
    """
    Calculate similarity score between two records.
    Returns score 0-100.
    """
    score = 0.0
    weights_total = 0.0

    # Title similarity (weight: 60%)
    if record1.get('title_normalized') and record2.get('title_normalized'):
        if RAPIDFUZZ_AVAILABLE:
            title_sim = fuzz.token_set_ratio(
                record1['title_normalized'],
                record2['title_normalized']
            )
        else:
            # Basic fallback
            t1 = set(record1['title_normalized'].split())
            t2 = set(record2['title_normalized'].split())
            if t1 and t2:
                title_sim = len(t1 & t2) / len(t1 | t2) * 100
            else:
                title_sim = 0
        score += title_sim * 0.6
        weights_total += 0.6

    # Creator similarity (weight: 30%)
    if record1.get('creator_normalized') and record2.get('creator_normalized'):
        if RAPIDFUZZ_AVAILABLE:
            creator_sim = fuzz.token_set_ratio(
                record1['creator_normalized'],
                record2['creator_normalized']
            )
        else:
            c1 = set(record1['creator_normalized'].split())
            c2 = set(record2['creator_normalized'].split())
            if c1 and c2:
                creator_sim = len(c1 & c2) / len(c1 | c2) * 100
            else:
                creator_sim = 0
        score += creator_sim * 0.3
        weights_total += 0.3

    # Year proximity (weight: 10%)
    if record1.get('year') and record2.get('year'):
        year_diff = abs(record1['year'] - record2['year'])
        if year_diff <= YEAR_TOLERANCE:
            year_sim = 100 - (year_diff * 20)  # 0 diff = 100, 2 diff = 60
        else:
            year_sim = 0
        score += year_sim * 0.1
        weights_total += 0.1

    # Normalize by actual weights used
    if weights_total > 0:
        return score / weights_total * 100
    return 0.0


def find_clusters(records: List[dict]) -> List[Set[int]]:
    """
    Find clusters of duplicate records using Union-Find.
    Returns list of sets, each containing record IDs in a cluster.
    """
    n = len(records)
    if n == 0:
        return []

    # Union-Find data structure
    parent = list(range(n))

    def find(x: int) -> int:
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]

    def union(x: int, y: int):
        px, py = find(x), find(y)
        if px != py:
            parent[px] = py

    # Compare all pairs within block
    for i in range(n):
        for j in range(i + 1, n):
            score = similarity_score(records[i], records[j])
            if score >= SIMILARITY_THRESHOLD:
                union(i, j)

    # Build clusters
    clusters_map: Dict[int, Set[int]] = defaultdict(set)
    for i in range(n):
        root = find(i)
        clusters_map[root].add(records[i]['id'])

    return list(clusters_map.values())


def deduplicate():
    """Main deduplication process."""
    print("=== Latin Publications Deduplicator ===")
    print(f"Database: {DB_PATH}")
    print(f"Year tolerance: ±{YEAR_TOLERANCE}")
    print(f"Similarity threshold: {SIMILARITY_THRESHOLD}%")
    print()

    if not DB_PATH.exists():
        print(f"Error: Database not found: {DB_PATH}")
        print("Run ingest.py first.")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Reset canonical_id
    cursor.execute("UPDATE publications SET canonical_id = NULL")
    conn.commit()

    # Get all records with year and title
    cursor.execute("""
        SELECT id, title_normalized, creator_normalized, year
        FROM publications
        WHERE title_normalized IS NOT NULL AND year IS NOT NULL
        ORDER BY year, title_normalized
    """)

    records = [dict(row) for row in cursor.fetchall()]
    total = len(records)

    print(f"Processing {total} records with year and title...")
    print()

    # Build blocks: (year_bucket, title_prefix) -> [records]
    blocks: Dict[Tuple[int, str], List[dict]] = defaultdict(list)

    for record in records:
        year_bucket = record['year'] // 5 * 5  # 5-year buckets
        title_prefix = get_title_prefix(record['title_normalized'])

        if title_prefix:
            # Add to primary bucket
            blocks[(year_bucket, title_prefix)].append(record)
            # Also add to adjacent year buckets for edge cases
            blocks[(year_bucket - 5, title_prefix)].append(record)
            blocks[(year_bucket + 5, title_prefix)].append(record)

    print(f"Created {len(blocks)} blocking groups")

    # Process blocks and find duplicates
    all_clusters: List[Set[int]] = []
    processed_ids: Set[int] = set()

    block_count = 0
    for block_key, block_records in blocks.items():
        if len(block_records) < 2:
            continue

        # Deduplicate records in this block
        unique_records = []
        seen_ids = set()
        for r in block_records:
            if r['id'] not in seen_ids:
                unique_records.append(r)
                seen_ids.add(r['id'])

        if len(unique_records) < 2:
            continue

        block_count += 1
        if block_count % 1000 == 0:
            print(f"  Processed {block_count} blocks...")

        clusters = find_clusters(unique_records)

        for cluster in clusters:
            if len(cluster) > 1:
                # Only add if not already part of another cluster
                if not cluster & processed_ids:
                    all_clusters.append(cluster)
                    processed_ids.update(cluster)

    print()
    print(f"Found {len(all_clusters)} duplicate clusters")

    # Assign canonical IDs
    duplicates_marked = 0
    for cluster in all_clusters:
        canonical_id = min(cluster)  # Use lowest ID as canonical

        for record_id in cluster:
            cursor.execute(
                "UPDATE publications SET canonical_id = ? WHERE id = ?",
                (canonical_id, record_id)
            )
            duplicates_marked += 1

    conn.commit()

    # Stats
    cursor.execute("""
        SELECT COUNT(DISTINCT canonical_id) as clusters,
               COUNT(*) as total_dupes
        FROM publications
        WHERE canonical_id IS NOT NULL
    """)
    stats = cursor.fetchone()

    cursor.execute("SELECT COUNT(*) FROM publications")
    total_records = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*) FROM publications
        WHERE canonical_id IS NULL OR canonical_id = id
    """)
    unique_works = cursor.fetchone()[0]

    conn.close()

    print()
    print("=== Deduplication Complete ===")
    print(f"Total records: {total_records}")
    print(f"Duplicate clusters found: {stats['clusters']}")
    print(f"Records marked as duplicates: {duplicates_marked}")
    print(f"Estimated unique works: {unique_works}")


if __name__ == "__main__":
    deduplicate()
