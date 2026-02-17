-- Add incident_at column to track when the incident occurred (separate from report creation)
-- Rollback: ALTER TABLE cases DROP COLUMN incident_at;

ALTER TABLE cases ADD COLUMN incident_at TIMESTAMPTZ;

COMMENT ON COLUMN cases.incident_at IS 'When the animal welfare incident occurred, as reported by the user. May differ from created_at.';
