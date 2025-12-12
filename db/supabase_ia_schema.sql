-- Internet Archive Latin Texts Schema for Supabase
-- Stores scraped metadata from IA's Latin text collections

-- Drop existing table if reloading
DROP TABLE IF EXISTS ia_latin_texts CASCADE;

-- Main table
CREATE TABLE ia_latin_texts (
    identifier TEXT PRIMARY KEY,  -- IA unique identifier

    -- Core metadata
    title TEXT,
    creator TEXT,
    date_raw TEXT,               -- Original date string
    year INTEGER,                -- Parsed year

    -- Classification
    subject TEXT[],              -- Subject tags (array)
    language TEXT,
    mediatype TEXT,
    collection TEXT[],           -- IA collections (array)

    -- Description
    description TEXT,

    -- Stats
    downloads INTEGER,
    item_size BIGINT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ia_year ON ia_latin_texts(year);
CREATE INDEX IF NOT EXISTS idx_ia_language ON ia_latin_texts(language);
CREATE INDEX IF NOT EXISTS idx_ia_downloads ON ia_latin_texts(downloads);

-- GIN indexes for array fields
CREATE INDEX IF NOT EXISTS idx_ia_subject ON ia_latin_texts USING GIN(subject);
CREATE INDEX IF NOT EXISTS idx_ia_collection ON ia_latin_texts USING GIN(collection);

-- Full text search on title
CREATE INDEX IF NOT EXISTS idx_ia_title_fts ON ia_latin_texts
    USING GIN (to_tsvector('simple', COALESCE(title, '')));

-- Full text search on creator
CREATE INDEX IF NOT EXISTS idx_ia_creator_fts ON ia_latin_texts
    USING GIN (to_tsvector('simple', COALESCE(creator, '')));

-- Disable RLS for bulk loading
ALTER TABLE ia_latin_texts DISABLE ROW LEVEL SECURITY;

-- Useful views
CREATE OR REPLACE VIEW ia_early_modern AS
SELECT * FROM ia_latin_texts
WHERE year IS NOT NULL AND year >= 1450 AND year <= 1700;

CREATE OR REPLACE VIEW ia_incunabula AS
SELECT * FROM ia_latin_texts
WHERE year IS NOT NULL AND year >= 1450 AND year <= 1500;

CREATE OR REPLACE VIEW ia_stats AS
SELECT
    COUNT(*) as total_items,
    COUNT(*) FILTER (WHERE year >= 1450 AND year <= 1700) as early_modern,
    COUNT(*) FILTER (WHERE year >= 1450 AND year <= 1500) as incunabula,
    COUNT(*) FILTER (WHERE language = 'lat' OR language = 'Latin') as latin_language,
    SUM(downloads) as total_downloads,
    AVG(downloads)::INTEGER as avg_downloads,
    MIN(year) as earliest_year,
    MAX(year) as latest_year
FROM ia_latin_texts;

-- View for top downloaded items
CREATE OR REPLACE VIEW ia_top_downloads AS
SELECT identifier, title, creator, year, downloads
FROM ia_latin_texts
WHERE downloads IS NOT NULL
ORDER BY downloads DESC
LIMIT 100;
