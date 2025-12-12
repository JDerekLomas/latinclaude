-- Schema for storing BPH-IA matches
-- Run this in Supabase SQL editor: https://supabase.com/dashboard/project/ykhxaecbbxaaqlujuzde/sql

-- ==============================================================
-- OPTION 1: Add columns to existing bph_works table (simpler)
-- ==============================================================

ALTER TABLE bph_works
ADD COLUMN IF NOT EXISTS ia_identifier TEXT,
ADD COLUMN IF NOT EXISTS ia_url TEXT,
ADD COLUMN IF NOT EXISTS ia_match_confidence TEXT,
ADD COLUMN IF NOT EXISTS ia_match_method TEXT,
ADD COLUMN IF NOT EXISTS ia_title_similarity NUMERIC,
ADD COLUMN IF NOT EXISTS ia_author_match BOOLEAN,
ADD COLUMN IF NOT EXISTS ia_year_match BOOLEAN,
ADD COLUMN IF NOT EXISTS ia_matched_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bph_works_ia_identifier ON bph_works(ia_identifier);
CREATE INDEX IF NOT EXISTS idx_bph_works_ia_match_confidence ON bph_works(ia_match_confidence);

-- ==============================================================
-- OPTION 2: Create separate matches table (more flexible)
-- Uncomment if you prefer a separate table
-- ==============================================================

-- CREATE TABLE IF NOT EXISTS bph_ia_matches (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     bph_work_id UUID NOT NULL REFERENCES bph_works(id),
--     ia_identifier TEXT NOT NULL,
--     ia_url TEXT,
--     ia_title TEXT,
--     ia_creator TEXT,
--     ia_year INTEGER,
--     match_confidence TEXT NOT NULL CHECK (match_confidence IN ('high', 'medium', 'low')),
--     match_method TEXT NOT NULL,
--     title_similarity NUMERIC,
--     author_match BOOLEAN,
--     year_match BOOLEAN,
--     match_type TEXT,
--     reasoning TEXT,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--     UNIQUE(bph_work_id, ia_identifier)
-- );
--
-- CREATE INDEX IF NOT EXISTS idx_bph_ia_matches_bph_work ON bph_ia_matches(bph_work_id);
-- CREATE INDEX IF NOT EXISTS idx_bph_ia_matches_ia_identifier ON bph_ia_matches(ia_identifier);
-- CREATE INDEX IF NOT EXISTS idx_bph_ia_matches_confidence ON bph_ia_matches(match_confidence);

-- ==============================================================
-- View to easily see matched works
-- ==============================================================

CREATE OR REPLACE VIEW bph_works_with_ia AS
SELECT
    bph.*,
    CASE WHEN bph.ia_identifier IS NOT NULL THEN true ELSE false END as has_ia_match
FROM bph_works bph;
