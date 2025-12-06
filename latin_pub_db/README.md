# Latin Publications Database (1450-1900)

A SQLite database of Latin-language publications harvested from Internet Archive, designed for analyzing publication trends over time.

## Overview

This tool harvests metadata from Internet Archive's Latin-language collections, stores it in SQLite for easy querying, deduplicates across overlapping collections, and enables analysis by decade, place, author, and subject.

## Requirements

```bash
pip install internetarchive rapidfuzz
```

- **internetarchive**: CLI tool for harvesting metadata (`ia` command)
- **rapidfuzz**: Fast fuzzy string matching for deduplication

## Quick Start

```bash
cd latin_pub_db

# 1. Harvest metadata from Internet Archive
./scripts/harvest.sh

# 2. Ingest JSON into SQLite
python scripts/ingest.py

# 3. Deduplicate records
python scripts/dedupe.py

# 4. Run analysis queries
sqlite3 db/latin_publications.db < scripts/analysis.sql
```

## Directory Structure

```
latin_pub_db/
├── scripts/
│   ├── harvest.sh      # Downloads metadata from IA
│   ├── ingest.py       # Loads JSON into SQLite
│   ├── dedupe.py       # Clusters duplicate records
│   └── analysis.sql    # Ready-to-run analysis queries
├── metadata/           # Raw JSON files from IA (generated)
├── item_lists/         # Item ID lists by century (generated)
├── db/
│   └── latin_publications.db  # SQLite database (generated)
└── README.md
```

## Database Schema

```sql
CREATE TABLE publications (
    id INTEGER PRIMARY KEY,
    ia_identifier TEXT UNIQUE,    -- Internet Archive identifier
    title TEXT,
    title_normalized TEXT,        -- Lowercase, no diacritics, no stopwords
    creator TEXT,
    creator_normalized TEXT,      -- Lowercase, "First Last" format
    date_string TEXT,             -- Original date field
    year INTEGER,                 -- Parsed 4-digit year
    publisher TEXT,
    language TEXT,
    collection TEXT,
    subject TEXT,
    source TEXT,
    mediatype TEXT,
    raw_metadata JSON,            -- Full original metadata
    canonical_id INTEGER,         -- Points to canonical record (dedup)
    created_at DATETIME
);
```

## Scripts

### harvest.sh

Downloads Latin-language item metadata from Internet Archive:
- Searches by century: 1450-1499, 1500-1599, 1600-1699, 1700-1799, 1800-1900
- Rate-limits requests (0.1s between calls)
- Supports resume (skips already-downloaded items)
- Stores JSON files in `metadata/`

### ingest.py

Loads JSON metadata into SQLite:
- Extracts key fields: title, creator, date, publisher, collection, subject
- **Title normalization**: Lowercase, removes diacritics, strips Latin stopwords (de, in, ad, et, cum, liber, opus, etc.)
- **Creator normalization**: Handles "Last, First" → "first last" format
- **Year parsing**: Extracts 4-digit years from various formats (ranges, "ca.", brackets, "15--")

### dedupe.py

Clusters duplicate records using fuzzy matching:
- **Blocking**: Groups by (5-year bucket, first 3 title words)
- **Similarity scoring**:
  - Title (60%): RapidFuzz token_set_ratio
  - Creator (30%): RapidFuzz token_set_ratio
  - Year proximity (10%): Within ±2 years
- **Threshold**: 85+ = same work
- **Canonical ID**: Lowest ID in cluster becomes canonical

### analysis.sql

Pre-built queries for common analyses:
- Publications per decade
- Publications by century
- Top 20 publishers/places
- Top 50 prolific authors
- Collection coverage
- Deduplication statistics
- Data quality report

## Example Queries

```sql
-- Publications per decade
SELECT (year/10)*10 as decade, COUNT(*) as n
FROM publications WHERE year IS NOT NULL
GROUP BY decade ORDER BY decade;

-- Top authors
SELECT creator, COUNT(*) as works
FROM publications WHERE creator IS NOT NULL
GROUP BY creator_normalized ORDER BY works DESC LIMIT 20;

-- Find works by specific author
SELECT title, year, publisher FROM publications
WHERE creator_normalized LIKE '%erasmus%' ORDER BY year;

-- Unique works after deduplication
SELECT * FROM publications
WHERE canonical_id IS NULL OR canonical_id = id;

-- Browse specific IA item
SELECT * FROM publications WHERE ia_identifier = 'some_identifier';
```

## Expected Data Volume

Based on Internet Archive's Latin collections:
- **50,000-200,000** items depending on collection coverage
- Major collections: `europeanlibraries`, `americana`, `biodiversity`, university libraries

## Data Quality Notes

- **Dates**: IA's `date` field is inconsistent. Parser handles:
  - Standard years: "1543"
  - Ranges: "1543-1545" (takes first)
  - Approximate: "ca. 1543", "[1543]", "1543?"
  - Century-only: "15--" → 1550 (mid-century)
- **Missing data**: Many records lack creator or precise dates
- **Duplicates**: Same work often appears in multiple IA collections

## Workflow

```
┌─────────────────┐
│ Internet Archive│
│   (ia search)   │
└────────┬────────┘
         │ item lists
         ▼
┌─────────────────┐
│   harvest.sh    │
│  (ia metadata)  │
└────────┬────────┘
         │ JSON files
         ▼
┌─────────────────┐
│   ingest.py     │
│  (normalize)    │
└────────┬────────┘
         │ SQLite
         ▼
┌─────────────────┐
│   dedupe.py     │
│  (cluster)      │
└────────┬────────┘
         │ canonical_id
         ▼
┌─────────────────┐
│  analysis.sql   │
│  (query)        │
└─────────────────┘
```

## Integration with LatinClaude

This database can feed into the larger LatinClaude research pipeline:
- Export unique works for Neo-Latin analysis
- Cross-reference with USTC, VD16/17/18 catalogues
- Check digitization status against multiple sources
- Prioritize untranslated works for research attention
