#!/usr/bin/env python3
"""
ingest.py - Load Internet Archive JSON metadata into SQLite database

Reads JSON files from metadata/ directory, extracts and normalizes fields,
and inserts into latin_publications.db.
"""

import json
import os
import re
import sqlite3
import unicodedata
from pathlib import Path
from typing import Optional, Any

# Directories
SCRIPT_DIR = Path(__file__).parent
BASE_DIR = SCRIPT_DIR.parent
METADATA_DIR = BASE_DIR / "metadata"
DB_PATH = BASE_DIR / "db" / "latin_publications.db"

# Latin stopwords to remove during title normalization
LATIN_STOPWORDS = {
    "de", "in", "ad", "et", "cum", "liber", "opus", "pro", "per", "ex",
    "quae", "qui", "quod", "vel", "sive", "seu", "atque", "ac", "aut",
    "item", "idem", "hic", "haec", "hoc", "ab", "a", "e", "ut", "ne",
    "nec", "non", "si", "qua", "quo", "quam", "dum", "tum", "iam",
    "super", "sub", "ante", "post", "inter", "contra", "circa", "ergo"
}


def create_database():
    """Create SQLite database with schema."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS publications (
            id INTEGER PRIMARY KEY,
            ia_identifier TEXT UNIQUE,
            title TEXT,
            title_normalized TEXT,
            creator TEXT,
            creator_normalized TEXT,
            date_string TEXT,
            year INTEGER,
            publisher TEXT,
            language TEXT,
            collection TEXT,
            subject TEXT,
            source TEXT,
            mediatype TEXT,
            raw_metadata JSON,
            canonical_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_year ON publications(year);
        CREATE INDEX IF NOT EXISTS idx_creator ON publications(creator_normalized);
        CREATE INDEX IF NOT EXISTS idx_canonical ON publications(canonical_id);
        CREATE INDEX IF NOT EXISTS idx_ia_identifier ON publications(ia_identifier);
        CREATE INDEX IF NOT EXISTS idx_title_normalized ON publications(title_normalized);
    """)

    conn.commit()
    return conn


def remove_diacritics(text: str) -> str:
    """Remove diacritics from text (ä -> a, é -> e, etc.)."""
    normalized = unicodedata.normalize('NFD', text)
    return ''.join(c for c in normalized if unicodedata.category(c) != 'Mn')


def normalize_title(title: Optional[str]) -> Optional[str]:
    """Normalize title for deduplication matching."""
    if not title:
        return None

    # Lowercase and remove diacritics
    text = remove_diacritics(title.lower())

    # Remove punctuation
    text = re.sub(r'[^\w\s]', ' ', text)

    # Remove stopwords
    words = [w for w in text.split() if w not in LATIN_STOPWORDS and len(w) > 1]

    # Return first 10 significant words
    return ' '.join(words[:10]) if words else None


def normalize_creator(creator: Optional[str]) -> Optional[str]:
    """Normalize creator/author name."""
    if not creator:
        return None

    # Handle "Last, First" format -> "first last"
    if ',' in creator:
        parts = creator.split(',', 1)
        creator = f"{parts[1].strip()} {parts[0].strip()}"

    # Lowercase and remove diacritics
    text = remove_diacritics(creator.lower())

    # Remove punctuation and extra whitespace
    text = re.sub(r'[^\w\s]', ' ', text)
    text = ' '.join(text.split())

    return text if text else None


def extract_year(date_string: Optional[str]) -> Optional[int]:
    """Extract 4-digit year from date string, handling various formats."""
    if not date_string:
        return None

    # Handle various date formats:
    # "1543", "1543-1545", "[1543]", "ca. 1543", "1543?", "15--", "c1543"

    # Try to find a 4-digit year
    match = re.search(r'\b(1[4-9]\d{2})\b', str(date_string))
    if match:
        year = int(match.group(1))
        if 1450 <= year <= 1900:
            return year

    # Handle century-only dates like "15--" or "16th century"
    match = re.search(r'\b(1[4-9])[-_x]{2}\b', str(date_string))
    if match:
        return int(match.group(1)) * 100 + 50  # Approximate to mid-century

    return None


def get_field(metadata: dict, field: str) -> Optional[str]:
    """Extract field from metadata, handling lists and nested structures."""
    value = metadata.get(field)

    if value is None:
        return None

    if isinstance(value, list):
        # Join list items or take first
        return '; '.join(str(v) for v in value if v)

    return str(value) if value else None


def process_metadata_file(filepath: Path) -> Optional[dict]:
    """Process a single JSON metadata file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except (json.JSONDecodeError, UnicodeDecodeError) as e:
        print(f"  Error reading {filepath.name}: {e}")
        return None

    # Handle nested metadata structure
    if 'metadata' in data:
        metadata = data['metadata']
    else:
        metadata = data

    identifier = metadata.get('identifier') or filepath.stem
    title = get_field(metadata, 'title')
    creator = get_field(metadata, 'creator')
    date_string = get_field(metadata, 'date')
    publisher = get_field(metadata, 'publisher')
    language = get_field(metadata, 'language')
    collection = get_field(metadata, 'collection')
    subject = get_field(metadata, 'subject')
    source = get_field(metadata, 'source')
    mediatype = get_field(metadata, 'mediatype')

    return {
        'ia_identifier': identifier,
        'title': title,
        'title_normalized': normalize_title(title),
        'creator': creator,
        'creator_normalized': normalize_creator(creator),
        'date_string': date_string,
        'year': extract_year(date_string),
        'publisher': publisher,
        'language': language,
        'collection': collection,
        'subject': subject,
        'source': source,
        'mediatype': mediatype,
        'raw_metadata': json.dumps(metadata, ensure_ascii=False)
    }


def ingest_all():
    """Ingest all metadata files into database."""
    print("=== Latin Publications Ingester ===")
    print(f"Metadata directory: {METADATA_DIR}")
    print(f"Database: {DB_PATH}")
    print()

    if not METADATA_DIR.exists():
        print(f"Error: Metadata directory not found: {METADATA_DIR}")
        print("Run harvest.sh first to download metadata.")
        return

    conn = create_database()
    cursor = conn.cursor()

    # Get list of JSON files
    json_files = list(METADATA_DIR.glob("*.json"))
    total = len(json_files)

    if total == 0:
        print("No JSON files found in metadata directory.")
        print("Run harvest.sh first to download metadata.")
        return

    print(f"Found {total} metadata files")
    print()

    inserted = 0
    skipped = 0
    errors = 0

    for i, filepath in enumerate(json_files, 1):
        # Progress every 1000 items
        if i % 1000 == 0:
            print(f"  Processed: {i}/{total} | Inserted: {inserted} | Skipped: {skipped}")

        record = process_metadata_file(filepath)

        if record is None:
            errors += 1
            continue

        try:
            cursor.execute("""
                INSERT INTO publications (
                    ia_identifier, title, title_normalized, creator, creator_normalized,
                    date_string, year, publisher, language, collection, subject,
                    source, mediatype, raw_metadata
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                record['ia_identifier'],
                record['title'],
                record['title_normalized'],
                record['creator'],
                record['creator_normalized'],
                record['date_string'],
                record['year'],
                record['publisher'],
                record['language'],
                record['collection'],
                record['subject'],
                record['source'],
                record['mediatype'],
                record['raw_metadata']
            ))
            inserted += 1
        except sqlite3.IntegrityError:
            # Duplicate ia_identifier
            skipped += 1

    conn.commit()

    # Get final stats
    cursor.execute("SELECT COUNT(*) FROM publications")
    total_rows = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM publications WHERE year IS NOT NULL")
    with_year = cursor.fetchone()[0]

    cursor.execute("SELECT MIN(year), MAX(year) FROM publications WHERE year IS NOT NULL")
    year_range = cursor.fetchone()

    conn.close()

    print()
    print("=== Ingest Complete ===")
    print(f"Inserted: {inserted}")
    print(f"Skipped (duplicates): {skipped}")
    print(f"Errors: {errors}")
    print(f"Total rows in database: {total_rows}")
    print(f"Records with parsed year: {with_year}")
    if year_range[0]:
        print(f"Year range: {year_range[0]} - {year_range[1]}")


if __name__ == "__main__":
    ingest_all()
