-- Create case_comments table for community discussion on cases
CREATE TABLE case_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_case_comments_case_id ON case_comments(case_id);
CREATE INDEX idx_case_comments_created_at ON case_comments(created_at);

-- RLS
ALTER TABLE case_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read comments on cases
CREATE POLICY "case_comments_select_all" ON case_comments
  FOR SELECT USING (true);

-- Authenticated users can insert their own comments
CREATE POLICY "case_comments_insert_own" ON case_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Authors can delete their own comments
CREATE POLICY "case_comments_delete_own" ON case_comments
  FOR DELETE USING (auth.uid() = author_id);
