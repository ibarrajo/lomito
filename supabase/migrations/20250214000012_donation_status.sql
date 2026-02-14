-- Add donation status tracking columns
-- Rollback: ALTER TABLE donations DROP COLUMN IF EXISTS status, DROP COLUMN IF EXISTS external_id, DROP COLUMN IF EXISTS payment_url;

ALTER TABLE donations
  ADD COLUMN status TEXT DEFAULT 'pending',
  ADD COLUMN external_id TEXT,
  ADD COLUMN payment_url TEXT;

CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_external_id ON donations(external_id);
