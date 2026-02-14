-- Add email escalation tracking fields to cases table
-- Rollback: ALTER TABLE cases DROP COLUMN IF EXISTS escalated_at, DROP COLUMN IF EXISTS escalation_email_id, DROP COLUMN IF EXISTS government_response_at;

ALTER TABLE cases ADD COLUMN escalated_at TIMESTAMPTZ;
ALTER TABLE cases ADD COLUMN escalation_email_id TEXT;
ALTER TABLE cases ADD COLUMN government_response_at TIMESTAMPTZ;

-- Index for filtering escalated cases
CREATE INDEX idx_cases_escalated ON cases(escalated_at) WHERE escalated_at IS NOT NULL;
