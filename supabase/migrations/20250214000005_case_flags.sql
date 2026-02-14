-- Migration: Case Flags Table
-- Creates community flagging system with auto-hide at 3 flags

-- Create case_flags table
CREATE TABLE case_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(case_id, reporter_id)
);

-- Enable RLS
ALTER TABLE case_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can insert their own flags
CREATE POLICY insert_own_flags ON case_flags FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid());

-- Users can view their own flags (to check if already flagged)
CREATE POLICY view_own_flags ON case_flags FOR SELECT TO authenticated
  USING (reporter_id = auth.uid());

-- Moderators and admins can view all flags in their jurisdictions
CREATE POLICY view_jurisdiction_flags ON case_flags FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('moderator', 'admin', 'government')
    )
  );

-- Create indexes
CREATE INDEX idx_case_flags_case_id ON case_flags(case_id);
CREATE INDEX idx_case_flags_reporter_id ON case_flags(reporter_id);
CREATE INDEX idx_case_flags_created_at ON case_flags(created_at DESC);

-- Trigger: auto-increment flag_count and auto-archive at 3 flags
CREATE OR REPLACE FUNCTION handle_case_flag()
RETURNS TRIGGER AS $$
DECLARE
  new_flag_count INTEGER;
BEGIN
  -- Increment flag_count on the case
  UPDATE cases SET flag_count = flag_count + 1
  WHERE id = NEW.case_id
  RETURNING flag_count INTO new_flag_count;

  -- Insert timeline event for the flag
  INSERT INTO case_timeline (case_id, actor_id, action, details)
  VALUES (NEW.case_id, NEW.reporter_id, 'flagged', jsonb_build_object('reason', NEW.reason));

  -- Auto-archive if 3+ flags
  IF new_flag_count >= 3 THEN
    -- Only archive if not already archived
    UPDATE cases
    SET status = 'archived'
    WHERE id = NEW.case_id
    AND status != 'archived';

    -- Insert timeline event for auto-archive
    INSERT INTO case_timeline (case_id, actor_id, action, details)
    VALUES (NEW.case_id, NEW.reporter_id, 'archived', '{"reason": "auto_archived_flags"}'::jsonb);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_case_flag_insert
  AFTER INSERT ON case_flags
  FOR EACH ROW
  EXECUTE FUNCTION handle_case_flag();

-- Rollback instructions:
-- DROP TRIGGER IF EXISTS on_case_flag_insert ON case_flags;
-- DROP FUNCTION IF EXISTS handle_case_flag();
-- DROP TABLE IF EXISTS case_flags CASCADE;
