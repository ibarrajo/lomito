-- Migration: Inbound email logging table for government replies to escalated cases
-- Created: 2025-02-14

-- Create inbound_emails table to store government email replies
CREATE TABLE inbound_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  from_email TEXT NOT NULL,
  subject TEXT,
  body_text TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE inbound_emails ENABLE ROW LEVEL SECURITY;

-- Only admins can view inbound emails (contains PII)
CREATE POLICY admin_view_inbound_emails ON inbound_emails FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX idx_inbound_emails_case ON inbound_emails(case_id);
CREATE INDEX idx_inbound_emails_received ON inbound_emails(received_at DESC);
