-- USTC (Universal Short Title Catalogue) Schema for Supabase
-- 1.6M+ editions from 1450-1700
-- Run this in the Supabase SQL Editor

-- Drop existing table if reloading
DROP TABLE IF EXISTS ustc_editions CASCADE;

-- Main editions table
CREATE TABLE ustc_editions (
    id INTEGER PRIMARY KEY,
    status TEXT,
    type TEXT,
    sn INTEGER,  -- Serial number

    -- Authors (up to 3 for simplified schema)
    author_1 TEXT,
    author_role_1 TEXT,
    author_2 TEXT,
    author_3 TEXT,

    -- Title and imprint
    title TEXT,
    imprint TEXT,
    colophon TEXT,

    -- Location
    country TEXT,
    region TEXT,
    place TEXT,

    -- Printers (up to 2)
    printer_1 TEXT,
    printer_2 TEXT,

    -- Date and format
    year INTEGER,
    format TEXT,
    pagination TEXT,
    signatures TEXT,

    -- Classification (up to 4)
    classification_1 TEXT,
    classification_2 TEXT,
    classification_3 TEXT,
    classification_4 TEXT,

    -- Languages (up to 4)
    language_1 TEXT,
    language_2 TEXT,
    language_3 TEXT,
    language_4 TEXT,

    -- Flags
    female_author BOOLEAN DEFAULT FALSE,
    female_printer BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ustc_year ON ustc_editions(year);
CREATE INDEX IF NOT EXISTS idx_ustc_language ON ustc_editions(language_1);
CREATE INDEX IF NOT EXISTS idx_ustc_country ON ustc_editions(country);
CREATE INDEX IF NOT EXISTS idx_ustc_place ON ustc_editions(place);
CREATE INDEX IF NOT EXISTS idx_ustc_classification ON ustc_editions(classification_1);
CREATE INDEX IF NOT EXISTS idx_ustc_author ON ustc_editions(author_1);

-- Full text search
CREATE INDEX IF NOT EXISTS idx_ustc_title_fts ON ustc_editions
    USING GIN (to_tsvector('simple', COALESCE(title, '')));

-- Composite index for Latin queries by year
CREATE INDEX IF NOT EXISTS idx_ustc_latin_year ON ustc_editions(year)
    WHERE language_1 = 'Latin';

-- Disable RLS for bulk loading (re-enable after)
ALTER TABLE ustc_editions DISABLE ROW LEVEL SECURITY;

-- View for Latin editions only
CREATE OR REPLACE VIEW latin_editions AS
SELECT * FROM ustc_editions
WHERE language_1 = 'Latin' OR language_2 = 'Latin';

-- View for decade counts
CREATE OR REPLACE VIEW ustc_by_decade AS
SELECT
    (year / 10) * 10 as decade,
    language_1 as language,
    COUNT(*) as editions
FROM ustc_editions
WHERE year IS NOT NULL AND year >= 1450 AND year <= 1700
GROUP BY decade, language_1
ORDER BY decade, editions DESC;

-- Stats view
CREATE OR REPLACE VIEW ustc_stats AS
SELECT
    COUNT(*) as total_editions,
    COUNT(*) FILTER (WHERE language_1 = 'Latin') as latin_editions,
    COUNT(DISTINCT author_1) FILTER (WHERE author_1 IS NOT NULL) as unique_authors,
    COUNT(DISTINCT place) FILTER (WHERE place IS NOT NULL) as unique_places,
    COUNT(DISTINCT printer_1) FILTER (WHERE printer_1 IS NOT NULL) as unique_printers,
    MIN(year) as earliest_year,
    MAX(year) as latest_year
FROM ustc_editions;

-- Classification summary
CREATE OR REPLACE VIEW ustc_by_classification AS
SELECT
    classification_1 as classification,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE language_1 = 'Latin') as latin_count
FROM ustc_editions
WHERE classification_1 IS NOT NULL
GROUP BY classification_1
ORDER BY total DESC;
