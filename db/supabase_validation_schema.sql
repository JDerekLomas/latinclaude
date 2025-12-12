-- Schema for validation columns in bph_works table
-- Run this in Supabase SQL editor: https://supabase.com/dashboard/project/ykhxaecbbxaaqlujuzde/sql

-- Add validation columns to bph_works table
ALTER TABLE bph_works
ADD COLUMN IF NOT EXISTS ia_match_validated BOOLEAN,
ADD COLUMN IF NOT EXISTS ia_match_is_same_work BOOLEAN,
ADD COLUMN IF NOT EXISTS ia_match_is_same_edition BOOLEAN,
ADD COLUMN IF NOT EXISTS ia_match_validated_by TEXT,
ADD COLUMN IF NOT EXISTS ia_match_validation_notes TEXT,
ADD COLUMN IF NOT EXISTS ia_match_validated_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_bph_works_ia_match_validated ON bph_works(ia_match_validated);
CREATE INDEX IF NOT EXISTS idx_bph_works_ia_match_is_same_work ON bph_works(ia_match_is_same_work);

-- View to easily see validation progress
CREATE OR REPLACE VIEW bph_validation_stats AS
SELECT
    COUNT(*) FILTER (WHERE ia_identifier IS NOT NULL) as total_matches,
    COUNT(*) FILTER (WHERE ia_match_validated = true) as validated_count,
    COUNT(*) FILTER (WHERE ia_match_validated = true AND ia_match_is_same_work = true) as confirmed_matches,
    COUNT(*) FILTER (WHERE ia_match_validated = true AND ia_match_is_same_work = false) as rejected_matches,
    COUNT(*) FILTER (WHERE ia_match_validated = true AND ia_match_is_same_work IS NULL) as uncertain_matches,
    COUNT(*) FILTER (WHERE ia_match_validated = true AND ia_match_is_same_edition = true) as same_edition_matches,
    COUNT(*) FILTER (WHERE ia_match_validated = true AND ia_match_is_same_work = true AND ia_match_is_same_edition = false) as different_edition_matches
FROM bph_works;
