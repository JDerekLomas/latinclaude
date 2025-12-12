-- BPH (Bibliotheca Philosophica Hermetica) Schema for Supabase
-- Embassy of the Free Mind's esoteric/hermetic collection
-- ~28,000 works spanning 1469-present

-- Drop existing table if reloading
DROP TABLE IF EXISTS bph_works CASCADE;

-- Main works table
CREATE TABLE bph_works (
    id TEXT PRIMARY KEY,  -- UUID from export
    ubn TEXT,             -- Unique bibliographic number

    -- Core bibliographic data
    title TEXT NOT NULL,
    parallel_title TEXT,
    uniform_title TEXT,
    author TEXT,
    variant_author TEXT,
    pseudonym TEXT,
    editor TEXT,

    -- Publication info
    place TEXT,
    printer TEXT,
    publisher TEXT,
    year_raw TEXT,        -- Original year string
    year INTEGER,         -- Parsed year

    -- Classification
    keywords TEXT,        -- Primary keyword (esotericism, hermetica, alchemy, etc.)
    language TEXT,
    shelf_mark TEXT,
    series_title TEXT,

    -- Physical/Collection
    location TEXT,
    object_size TEXT,
    binding TEXT,
    provenance TEXT,

    -- Notes
    remarks TEXT,
    bibliography TEXT,

    -- Status
    status TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bph_year ON bph_works(year);
CREATE INDEX IF NOT EXISTS idx_bph_keywords ON bph_works(keywords);
CREATE INDEX IF NOT EXISTS idx_bph_language ON bph_works(language);
CREATE INDEX IF NOT EXISTS idx_bph_author ON bph_works(author);

-- Full text search
CREATE INDEX IF NOT EXISTS idx_bph_title_fts ON bph_works
    USING GIN (to_tsvector('simple', COALESCE(title, '')));

-- Disable RLS for bulk loading
ALTER TABLE bph_works DISABLE ROW LEVEL SECURITY;

-- Views
CREATE OR REPLACE VIEW bph_early_modern AS
SELECT * FROM bph_works
WHERE year IS NOT NULL AND year >= 1450 AND year <= 1700;

CREATE OR REPLACE VIEW bph_by_keyword AS
SELECT
    keywords,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE year <= 1700) as pre_1700
FROM bph_works
WHERE keywords IS NOT NULL
GROUP BY keywords
ORDER BY total DESC;

CREATE OR REPLACE VIEW bph_stats AS
SELECT
    COUNT(*) as total_works,
    COUNT(*) FILTER (WHERE year <= 1700) as early_modern,
    COUNT(*) FILTER (WHERE keywords = 'hermetica') as hermetica,
    COUNT(*) FILTER (WHERE keywords = 'alchemy') as alchemy,
    COUNT(*) FILTER (WHERE keywords = 'mysticism') as mysticism,
    COUNT(DISTINCT author) FILTER (WHERE author IS NOT NULL) as unique_authors,
    MIN(year) as earliest_year,
    MAX(year) as latest_year
FROM bph_works;
