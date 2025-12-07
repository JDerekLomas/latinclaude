-- Supabase Schema for ISTC (Incunabula Short Title Catalogue)
-- Database for 15th-century printed books

-- ============================================
-- CORE TABLES
-- ============================================

-- Main incunabula works table
CREATE TABLE istc_works (
    id TEXT PRIMARY KEY,  -- ISTC ID like 'ia00000100'
    author TEXT,
    title TEXT NOT NULL,

    -- Dating
    date_single INTEGER,  -- Single year if known
    date_from INTEGER,    -- Range start
    date_to INTEGER,      -- Range end
    date_display TEXT,    -- Original date string like "after 1486]"

    -- Physical description
    dimensions TEXT,      -- Format like 'f°', '4°', '8°'
    material_type TEXT,   -- 'monograph', etc.
    has_woodcuts BOOLEAN DEFAULT FALSE,

    -- Language
    language TEXT,        -- 'lat', 'eng', 'deu', etc.

    -- Imprint info
    printer TEXT,
    place TEXT,
    country_code TEXT,    -- ISO country code

    -- Location (for mapping)
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    geonames_id INTEGER,

    -- Metadata
    notes TEXT,
    uncontrolled_terms TEXT[],  -- Subject terms
    cataloguing_level TEXT,
    date_catalogued DATE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Holdings: which libraries have copies
CREATE TABLE istc_holdings (
    id SERIAL PRIMARY KEY,
    istc_id TEXT REFERENCES istc_works(id) ON DELETE CASCADE,

    institution_name TEXT,
    institution_id TEXT,   -- CERL institution ID
    country_code TEXT,

    copy_count INTEGER DEFAULT 1,
    copy_notes TEXT,
    shelfmark TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bibliography references
CREATE TABLE istc_references (
    id SERIAL PRIMARY KEY,
    istc_id TEXT REFERENCES istc_works(id) ON DELETE CASCADE,

    reference_name TEXT,      -- Like 'GW', 'H', 'BMC', etc.
    reference_location TEXT,  -- Page/entry number

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DIGITIZATION TRACKING
-- ============================================

-- Track digitization status across sources
CREATE TABLE digitization_status (
    id SERIAL PRIMARY KEY,
    istc_id TEXT REFERENCES istc_works(id) ON DELETE CASCADE,

    -- Internet Archive
    ia_found BOOLEAN DEFAULT FALSE,
    ia_identifier TEXT,
    ia_url TEXT,
    ia_checked_at TIMESTAMPTZ,

    -- HathiTrust
    ht_found BOOLEAN DEFAULT FALSE,
    ht_identifier TEXT,
    ht_url TEXT,
    ht_checked_at TIMESTAMPTZ,

    -- Google Books
    gb_found BOOLEAN DEFAULT FALSE,
    gb_identifier TEXT,
    gb_url TEXT,
    gb_checked_at TIMESTAMPTZ,

    -- Other sources
    other_sources JSONB,  -- Flexible field for additional sources

    -- Summary
    is_digitized BOOLEAN GENERATED ALWAYS AS (
        ia_found OR ht_found OR gb_found
    ) STORED,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(istc_id)
);

-- ============================================
-- TRANSLATION TRACKING (future use)
-- ============================================

CREATE TABLE translations (
    id SERIAL PRIMARY KEY,
    istc_id TEXT REFERENCES istc_works(id) ON DELETE SET NULL,

    -- Work identification (may not have ISTC match)
    author TEXT,
    original_title TEXT,

    -- Translation info
    target_language TEXT DEFAULT 'eng',
    translated_title TEXT,
    translator TEXT,
    publication_year INTEGER,
    publisher TEXT,

    -- Edition details
    edition_type TEXT,  -- 'bilingual', 'translation_only', 'abridged'
    is_complete BOOLEAN DEFAULT TRUE,

    -- Sources
    source_url TEXT,
    source_notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Core search indexes
CREATE INDEX idx_istc_works_author ON istc_works(author);
CREATE INDEX idx_istc_works_language ON istc_works(language);
CREATE INDEX idx_istc_works_date ON istc_works(date_single);
CREATE INDEX idx_istc_works_country ON istc_works(country_code);
CREATE INDEX idx_istc_works_place ON istc_works(place);

-- Full text search
CREATE INDEX idx_istc_works_title_fts ON istc_works
    USING GIN (to_tsvector('simple', title));
CREATE INDEX idx_istc_works_author_fts ON istc_works
    USING GIN (to_tsvector('simple', COALESCE(author, '')));

-- Holdings indexes
CREATE INDEX idx_holdings_istc ON istc_holdings(istc_id);
CREATE INDEX idx_holdings_institution ON istc_holdings(institution_name);
CREATE INDEX idx_holdings_country ON istc_holdings(country_code);

-- Digitization indexes
CREATE INDEX idx_digitization_istc ON digitization_status(istc_id);
CREATE INDEX idx_digitization_found ON digitization_status(is_digitized);

-- Geographic index for mapping
CREATE INDEX idx_istc_works_geo ON istc_works(latitude, longitude)
    WHERE latitude IS NOT NULL;

-- ============================================
-- VIEWS
-- ============================================

-- Latin works only (most common query)
CREATE VIEW latin_incunabula AS
SELECT * FROM istc_works WHERE language = 'lat';

-- Works with digitization status
CREATE VIEW works_with_digitization AS
SELECT
    w.*,
    d.ia_found,
    d.ht_found,
    d.gb_found,
    d.is_digitized
FROM istc_works w
LEFT JOIN digitization_status d ON w.id = d.istc_id;

-- Summary statistics
CREATE VIEW istc_stats AS
SELECT
    COUNT(*) as total_works,
    COUNT(*) FILTER (WHERE language = 'lat') as latin_works,
    COUNT(DISTINCT author) as unique_authors,
    COUNT(DISTINCT place) as unique_places,
    MIN(date_single) as earliest_year,
    MAX(date_single) as latest_year
FROM istc_works;

-- Digitization coverage summary
CREATE VIEW digitization_summary AS
SELECT
    language,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE d.is_digitized) as digitized,
    ROUND(100.0 * COUNT(*) FILTER (WHERE d.is_digitized) / COUNT(*), 1) as pct_digitized
FROM istc_works w
LEFT JOIN digitization_status d ON w.id = d.istc_id
GROUP BY language
ORDER BY total DESC;

-- ============================================
-- ROW LEVEL SECURITY (optional)
-- ============================================

-- Enable RLS
ALTER TABLE istc_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE istc_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE digitization_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access" ON istc_works FOR SELECT USING (true);
CREATE POLICY "Public read access" ON istc_holdings FOR SELECT USING (true);
CREATE POLICY "Public read access" ON digitization_status FOR SELECT USING (true);
CREATE POLICY "Public read access" ON translations FOR SELECT USING (true);

-- ============================================
-- SAMPLE QUERIES
-- ============================================

-- Find all Latin works from Venice
-- SELECT * FROM latin_incunabula WHERE place ILIKE '%Venice%' ORDER BY date_single;

-- Find digitized works
-- SELECT * FROM works_with_digitization WHERE is_digitized = true;

-- Count works by decade
-- SELECT (date_single / 10) * 10 as decade, COUNT(*)
-- FROM istc_works WHERE date_single IS NOT NULL
-- GROUP BY decade ORDER BY decade;

-- Geographic distribution
-- SELECT country_code, COUNT(*) FROM istc_works GROUP BY country_code ORDER BY count DESC;
