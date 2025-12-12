-- ==============================================
-- TRANSLATION WEBAPP SCHEMA
-- New tables only - does not modify existing tables
-- ==============================================

-- Translation jobs table
CREATE TABLE IF NOT EXISTS translation_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Source: IA identifier, uploaded PDF, or ZIP of images
    ia_identifier TEXT,                    -- If from IA catalog
    pdf_path TEXT,                         -- If uploaded PDF
    images_dir TEXT,                       -- If uploaded ZIP of images
    original_filename TEXT,

    -- Metadata (from IA or extracted from PDF)
    title TEXT,
    creator TEXT,
    year INTEGER,

    -- Job state
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',            -- Just created, waiting for worker
        'rendering',          -- Converting PDF to images (PDF upload only)
        'processing_preview', -- Processing first N pages
        'awaiting_review',    -- Preview done, waiting for user to review/continue
        'processing_full',    -- Processing remaining pages after review
        'completed',          -- All done
        'failed',             -- Error occurred
        'cancelled'           -- User cancelled
    )),

    -- Config
    provider TEXT DEFAULT 'openai' CHECK (provider IN ('openai', 'gemini', 'claude')),
    prompts JSONB NOT NULL DEFAULT '{}',

    -- Progress
    total_pages INTEGER,
    preview_pages INTEGER DEFAULT 30,
    max_pages INTEGER,                     -- Optional limit on total pages to process
    pages_processed INTEGER DEFAULT 0,
    current_page INTEGER,

    -- Error tracking
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    preview_completed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual page results
CREATE TABLE IF NOT EXISTS job_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES translation_jobs(id) ON DELETE CASCADE,
    page_number INTEGER NOT NULL,

    -- Image location
    image_url TEXT,              -- IA URL or local path to processed image

    -- Results
    ocr_text TEXT,
    translation_text TEXT,
    summary_text TEXT,

    -- Processing metadata
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    processing_time_ms INTEGER,
    error_message TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,

    UNIQUE(job_id, page_number)
);

-- Saved prompts (for experts to reuse across jobs)
CREATE TABLE IF NOT EXISTS saved_prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    stage TEXT NOT NULL CHECK (stage IN ('ocr', 'translation', 'summary')),
    content TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- INDEXES
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_translation_jobs_user ON translation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_translation_jobs_status ON translation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_translation_jobs_created ON translation_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_translation_jobs_ia ON translation_jobs(ia_identifier);

CREATE INDEX IF NOT EXISTS idx_job_pages_job ON job_pages(job_id);
CREATE INDEX IF NOT EXISTS idx_job_pages_status ON job_pages(job_id, status);

CREATE INDEX IF NOT EXISTS idx_saved_prompts_user ON saved_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_prompts_stage ON saved_prompts(stage);

-- ==============================================
-- ROW LEVEL SECURITY
-- ==============================================

ALTER TABLE translation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_prompts ENABLE ROW LEVEL SECURITY;

-- Translation jobs: users can only see and manage their own jobs
CREATE POLICY "Users can view own jobs" ON translation_jobs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create jobs" ON translation_jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs" ON translation_jobs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs" ON translation_jobs
    FOR DELETE USING (auth.uid() = user_id);

-- Job pages: users can see pages for their own jobs
CREATE POLICY "Users can view own job pages" ON job_pages
    FOR SELECT USING (
        job_id IN (SELECT id FROM translation_jobs WHERE user_id = auth.uid())
    );

-- Saved prompts: users can manage their own prompts, see defaults
CREATE POLICY "Users can view own and default prompts" ON saved_prompts
    FOR SELECT USING (user_id = auth.uid() OR is_default = true);

CREATE POLICY "Users can create prompts" ON saved_prompts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompts" ON saved_prompts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompts" ON saved_prompts
    FOR DELETE USING (auth.uid() = user_id);

-- ==============================================
-- SERVICE ROLE POLICIES (for worker)
-- The worker uses service role key which bypasses RLS
-- ==============================================

-- ==============================================
-- HELPER FUNCTIONS
-- ==============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_translation_job_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating timestamp
DROP TRIGGER IF EXISTS translation_jobs_updated_at ON translation_jobs;
CREATE TRIGGER translation_jobs_updated_at
    BEFORE UPDATE ON translation_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_translation_job_timestamp();

-- ==============================================
-- VIEWS
-- ==============================================

-- Job progress view for dashboard
CREATE OR REPLACE VIEW translation_job_progress AS
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

-- ==============================================
-- DEFAULT PROMPTS
-- ==============================================

-- Insert default prompts (run once, will skip if already exist)
INSERT INTO saved_prompts (id, user_id, name, stage, content, is_default)
VALUES
    (
        'a0000000-0000-0000-0000-000000000001',
        NULL,
        'Renaissance Latin OCR (Default)',
        'ocr',
        E'You are transcribing a Renaissance Latin facsimile page image.\n\nInstructions:\n- Transcribe all Latin text faithfully, including abbreviations\n- Preserve paragraph breaks\n- Expand common abbreviations in [brackets] where clear (e.g., [que] for ꝗ)\n- Note any unclear sections with [?]\n- Include page numbers if visible\n- Skip decorative elements, focus on the text\n- For Greek text, transcribe using Greek letters\n\nOutput only the transcription, no commentary.',
        true
    ),
    (
        'a0000000-0000-0000-0000-000000000002',
        NULL,
        'Renaissance Latin Translation (Default)',
        'translation',
        E'Translate the following Latin text to English.\n\nInstructions:\n- Provide an accurate, readable English translation\n- Preserve paragraph structure\n- For technical/philosophical terms, provide the Latin in parentheses on first use\n- Maintain the scholarly tone of the original\n- If there are unclear passages marked with [?], translate as best you can and note uncertainty\n\nProvide only the English translation, no commentary.',
        true
    ),
    (
        'a0000000-0000-0000-0000-000000000003',
        NULL,
        'Page Summary (Default)',
        'summary',
        E'Summarize the contents of this page for a general, non-specialist reader.\n\nInstructions:\n- Write 3-5 sentences\n- Mention key people, ideas, and why the content matters\n- Use accessible language, explain any jargon\n- Optionally use bullet points if helpful\n\nProvide only the summary.',
        true
    )
ON CONFLICT (id) DO NOTHING;
