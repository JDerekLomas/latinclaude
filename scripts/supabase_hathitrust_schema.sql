-- HathiTrust Items Schema for Supabase
-- Stores metadata from the HathiFiles bulk export
-- ~18 million items in the full collection

-- Drop existing table if reloading
DROP TABLE IF EXISTS hathitrust_items CASCADE;

-- Main table
CREATE TABLE hathitrust_items (
    htid TEXT PRIMARY KEY,        -- HathiTrust ID (e.g., mdp.39015000000001)

    -- Access & Rights
    access TEXT,                  -- allow, deny
    rights TEXT,                  -- Rights code

    -- Identifiers
    ht_bib_key TEXT,              -- HathiTrust bib record key
    oclc_num TEXT,                -- OCLC number(s)
    isbn TEXT,                    -- ISBN(s)
    lccn TEXT,                    -- Library of Congress number

    -- Bibliographic data
    title TEXT,
    author TEXT,
    imprint TEXT,                 -- Publisher, date, place
    description TEXT,             -- Volume/issue description
    year INTEGER,                 -- Parsed publication year

    -- Classification
    lang TEXT,                    -- Language code (lat, eng, ger, etc.)
    pub_place TEXT,               -- Publication place code
    bib_fmt TEXT,                 -- Bibliographic format
    source TEXT,                  -- Digitization source (google, etc.)

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_ht_year ON hathitrust_items(year);
CREATE INDEX idx_ht_lang ON hathitrust_items(lang);
CREATE INDEX idx_ht_access ON hathitrust_items(access);
CREATE INDEX idx_ht_oclc ON hathitrust_items(oclc_num);
CREATE INDEX idx_ht_source ON hathitrust_items(source);

-- Full text search indexes
CREATE INDEX idx_ht_title_fts ON hathitrust_items
    USING GIN (to_tsvector('simple', COALESCE(title, '')));

CREATE INDEX idx_ht_author_fts ON hathitrust_items
    USING GIN (to_tsvector('simple', COALESCE(author, '')));

-- Disable RLS for bulk loading
ALTER TABLE hathitrust_items DISABLE ROW LEVEL SECURITY;

-- Useful views

-- Early modern items (1450-1700)
CREATE OR REPLACE VIEW ht_early_modern AS
SELECT * FROM hathitrust_items
WHERE year >= 1450 AND year <= 1700;

-- Incunabula (1450-1500)
CREATE OR REPLACE VIEW ht_incunabula AS
SELECT * FROM hathitrust_items
WHERE year >= 1450 AND year <= 1500;

-- Latin texts
CREATE OR REPLACE VIEW ht_latin AS
SELECT * FROM hathitrust_items
WHERE lang = 'lat';

-- Public domain (accessible)
CREATE OR REPLACE VIEW ht_public_domain AS
SELECT * FROM hathitrust_items
WHERE access = 'allow';

-- Statistics view
CREATE OR REPLACE VIEW ht_stats AS
SELECT
    COUNT(*) as total_items,
    COUNT(*) FILTER (WHERE access = 'allow') as public_domain,
    COUNT(*) FILTER (WHERE lang = 'lat') as latin,
    COUNT(*) FILTER (WHERE year >= 1450 AND year <= 1700) as early_modern,
    COUNT(*) FILTER (WHERE year >= 1450 AND year <= 1500) as incunabula,
    COUNT(*) FILTER (WHERE lang = 'lat' AND access = 'allow') as latin_public,
    COUNT(*) FILTER (WHERE lang = 'lat' AND year >= 1450 AND year <= 1700) as latin_early_modern,
    COUNT(DISTINCT oclc_num) FILTER (WHERE oclc_num IS NOT NULL) as unique_oclc,
    MIN(year) FILTER (WHERE year > 1000) as earliest_year,
    MAX(year) as latest_year
FROM hathitrust_items;

-- Language distribution
CREATE OR REPLACE VIEW ht_languages AS
SELECT
    lang,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE access = 'allow') as public_domain,
    COUNT(*) FILTER (WHERE year >= 1450 AND year <= 1700) as early_modern
FROM hathitrust_items
WHERE lang IS NOT NULL
GROUP BY lang
ORDER BY total DESC;

-- Digitization source distribution
CREATE OR REPLACE VIEW ht_sources AS
SELECT
    source,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE access = 'allow') as public_domain
FROM hathitrust_items
WHERE source IS NOT NULL
GROUP BY source
ORDER BY total DESC;
