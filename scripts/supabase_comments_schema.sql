-- Blog Comments Schema for Supabase
-- Simple commenting system for research blog

CREATE TABLE IF NOT EXISTS blog_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_slug TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_email TEXT,
    content TEXT NOT NULL,
    approved BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comments_post ON blog_comments(post_slug);
CREATE INDEX IF NOT EXISTS idx_comments_created ON blog_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON blog_comments(approved);

-- Enable RLS
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved comments
CREATE POLICY "Public can read approved comments"
ON blog_comments FOR SELECT
USING (approved = true);

-- Anyone can insert comments (will be approved by default)
CREATE POLICY "Public can insert comments"
ON blog_comments FOR INSERT
WITH CHECK (true);
