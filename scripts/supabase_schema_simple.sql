-- ISTC Schema for Supabase - Simplified Version
-- Run this in the Supabase SQL Editor

-- Main incunabula works table
CREATE TABLE IF NOT EXISTS istc_works (
    id TEXT PRIMARY KEY,
    author TEXT,
    title TEXT NOT NULL,
    date_single INTEGER,
    date_display TEXT,
    dimensions TEXT,
    material_type TEXT,
    has_woodcuts BOOLEAN DEFAULT FALSE,
    language TEXT,
    printer TEXT,
    place TEXT,
    country_code TEXT,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    geonames_id INTEGER,
    notes TEXT,
    cataloguing_level TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Digitization tracking
CREATE TABLE IF NOT EXISTS digitization_status (
    id SERIAL PRIMARY KEY,
    istc_id TEXT REFERENCES istc_works(id) ON DELETE CASCADE UNIQUE,
    ia_found BOOLEAN DEFAULT FALSE,
    ia_identifier TEXT,
    ht_found BOOLEAN DEFAULT FALSE,
    ht_identifier TEXT,
    gb_found BOOLEAN DEFAULT FALSE,
    gb_identifier TEXT,
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_istc_language ON istc_works(language);
CREATE INDEX IF NOT EXISTS idx_istc_date ON istc_works(date_single);
CREATE INDEX IF NOT EXISTS idx_istc_place ON istc_works(place);
CREATE INDEX IF NOT EXISTS idx_istc_author ON istc_works(author);

-- Full text search on title
CREATE INDEX IF NOT EXISTS idx_istc_title_fts ON istc_works
    USING GIN (to_tsvector('simple', title));

-- Enable Row Level Security with public read
ALTER TABLE istc_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE digitization_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON istc_works FOR SELECT USING (true);
CREATE POLICY "Public read" ON digitization_status FOR SELECT USING (true);

-- View for Latin works
CREATE OR REPLACE VIEW latin_incunabula AS
SELECT * FROM istc_works WHERE language = 'lat';

-- Stats view
CREATE OR REPLACE VIEW istc_stats AS
SELECT
    COUNT(*) as total_works,
    COUNT(*) FILTER (WHERE language = 'lat') as latin_works,
    COUNT(DISTINCT author) FILTER (WHERE author IS NOT NULL) as unique_authors,
    COUNT(DISTINCT place) FILTER (WHERE place IS NOT NULL) as unique_places,
    MIN(date_single) as earliest_year,
    MAX(date_single) as latest_year
FROM istc_works;
