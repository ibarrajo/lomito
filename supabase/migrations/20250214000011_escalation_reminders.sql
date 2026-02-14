-- Migration: Add escalation reminder tracking columns
-- Description: Add columns to track reminder count and unresponsive status for auto-escalation system

-- Add escalation reminder tracking columns
ALTER TABLE cases
  ADD COLUMN escalation_reminder_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE cases
  ADD COLUMN marked_unresponsive BOOLEAN NOT NULL DEFAULT false;

-- Add index for escalation queries (cases awaiting government response)
CREATE INDEX idx_cases_escalation_pending ON cases(escalated_at)
  WHERE escalated_at IS NOT NULL
    AND government_response_at IS NULL
    AND marked_unresponsive = false;

-- Comment for documentation
COMMENT ON COLUMN cases.escalation_reminder_count IS 'Number of reminder emails sent (0-3). Incremented at 5, 15, and 30 days after escalation';
COMMENT ON COLUMN cases.marked_unresponsive IS 'True if case has been marked as unresponsive after 30 days without government response';

-- Rollback instructions:
-- To rollback this migration:
-- DROP INDEX IF EXISTS idx_cases_escalation_pending;
-- ALTER TABLE cases DROP COLUMN IF EXISTS marked_unresponsive;
-- ALTER TABLE cases DROP COLUMN IF EXISTS escalation_reminder_count;
