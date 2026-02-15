-- Add donation status tracking columns
-- Rollback: ALTER TABLE donations DROP COLUMN IF EXISTS status, DROP COLUMN IF EXISTS payment_url;

ALTER TABLE donations
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS external_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_url TEXT;

CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_external_id ON donations(external_id);
