-- ==============================================
-- MIGRATION: Add images_dir and max_pages columns
-- Run this if you've already created the translation_jobs table
-- ==============================================

-- Add images_dir column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'translation_jobs' AND column_name = 'images_dir'
    ) THEN
        ALTER TABLE translation_jobs ADD COLUMN images_dir TEXT;
        COMMENT ON COLUMN translation_jobs.images_dir IS 'Directory containing extracted images from ZIP upload';
    END IF;
END $$;

-- Add max_pages column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'translation_jobs' AND column_name = 'max_pages'
    ) THEN
        ALTER TABLE translation_jobs ADD COLUMN max_pages INTEGER;
        COMMENT ON COLUMN translation_jobs.max_pages IS 'Optional limit on total pages to process';
    END IF;
END $$;

-- Drop and recreate the view to include new fields
DROP VIEW IF EXISTS translation_job_progress;

CREATE VIEW translation_job_progress AS
SELECT
    j.id,
    j.user_id,
    j.ia_identifier,
    j.images_dir,
    j.original_filename,
    j.title,
    j.creator,
    j.year,
    j.status,
    j.provider,
    j.total_pages,
    j.preview_pages,
    j.max_pages,
    j.pages_processed,
    CASE
        WHEN COALESCE(j.max_pages, j.total_pages) > 0
        THEN ROUND(100.0 * j.pages_processed / COALESCE(j.max_pages, j.total_pages), 1)
        ELSE 0
    END as progress_percent,
    j.created_at,
    j.preview_completed_at,
    j.completed_at,
    j.error_message
FROM translation_jobs j;
