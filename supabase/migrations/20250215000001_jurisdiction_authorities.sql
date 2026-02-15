-- Jurisdiction Authorities: Split authority data from jurisdictions into dedicated table
-- Rollback: DROP TABLE IF EXISTS authority_submissions, jurisdiction_authorities CASCADE;
--           DROP TYPE IF EXISTS authority_type, dependency_category, verification_status, submission_status CASCADE;
--           ALTER TABLE jurisdictions DROP COLUMN IF EXISTS name_en, country_code, inegi_clave, fips_code, population, timezone;

-- =============================================================================
-- 1. New Enums
-- =============================================================================

CREATE TYPE authority_type AS ENUM ('primary', 'escalation', 'enforcement', 'specialized');
CREATE TYPE dependency_category AS ENUM (
  'control_animal', 'ecologia', 'salud', 'seguridad_publica',
  'fiscalia', 'dif', 'semarnat', 'smads', 'unknown'
);
CREATE TYPE verification_status AS ENUM ('unverified', 'verified', 'contact_confirmed', 'unresponsive');
CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'rejected');

-- =============================================================================
-- 2. Extend jurisdiction_level enum
-- =============================================================================

ALTER TYPE jurisdiction_level ADD VALUE IF NOT EXISTS 'country';
ALTER TYPE jurisdiction_level ADD VALUE IF NOT EXISTS 'delegacion';

-- =============================================================================
-- 3. Add columns to jurisdictions
-- =============================================================================

ALTER TABLE jurisdictions ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE jurisdictions ADD COLUMN IF NOT EXISTS country_code CHAR(2) NOT NULL DEFAULT 'MX';
ALTER TABLE jurisdictions ADD COLUMN IF NOT EXISTS inegi_clave TEXT;
ALTER TABLE jurisdictions ADD COLUMN IF NOT EXISTS fips_code TEXT;
ALTER TABLE jurisdictions ADD COLUMN IF NOT EXISTS population INTEGER;
ALTER TABLE jurisdictions ADD COLUMN IF NOT EXISTS timezone TEXT;

-- Add index on inegi_clave for lookups
CREATE INDEX IF NOT EXISTS idx_jurisdictions_inegi_clave ON jurisdictions(inegi_clave);

-- =============================================================================
-- 4. New table: jurisdiction_authorities
-- =============================================================================

CREATE TABLE jurisdiction_authorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id UUID NOT NULL REFERENCES jurisdictions(id) ON DELETE CASCADE,
  authority_type authority_type NOT NULL DEFAULT 'primary',
  dependency_category dependency_category NOT NULL DEFAULT 'unknown',
  dependency_name TEXT NOT NULL,
  department_name TEXT,
  contact_name TEXT,
  contact_title TEXT,
  email TEXT,
  phone TEXT,
  url TEXT,
  address TEXT,
  handles_report_types TEXT[] NOT NULL DEFAULT '{}',
  verification verification_status NOT NULL DEFAULT 'unverified',
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE jurisdiction_authorities ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_jurisdiction_authorities_jurisdiction ON jurisdiction_authorities(jurisdiction_id);
CREATE INDEX idx_jurisdiction_authorities_category ON jurisdiction_authorities(dependency_category);
CREATE INDEX idx_jurisdiction_authorities_report_types ON jurisdiction_authorities USING GIN (handles_report_types);

-- Updated_at trigger
CREATE TRIGGER jurisdiction_authorities_updated_at
  BEFORE UPDATE ON jurisdiction_authorities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 5. New table: authority_submissions (community contributions)
-- =============================================================================

CREATE TABLE authority_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id UUID NOT NULL REFERENCES jurisdictions(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES profiles(id),
  status submission_status NOT NULL DEFAULT 'pending',
  dependency_name TEXT NOT NULL,
  department_name TEXT,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  url TEXT,
  handles_report_types TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE authority_submissions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_authority_submissions_jurisdiction ON authority_submissions(jurisdiction_id);
CREATE INDEX idx_authority_submissions_status ON authority_submissions(status);

-- =============================================================================
-- 6. RLS Policies
-- =============================================================================

-- jurisdiction_authorities: public read, admin/moderator write
CREATE POLICY "jurisdiction_authorities_read"
  ON jurisdiction_authorities FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "jurisdiction_authorities_admin_insert"
  ON jurisdiction_authorities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "jurisdiction_authorities_admin_update"
  ON jurisdiction_authorities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "jurisdiction_authorities_admin_delete"
  ON jurisdiction_authorities FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- authority_submissions: authenticated insert, admin/moderator read, admin update
CREATE POLICY "authority_submissions_insert"
  ON authority_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "authority_submissions_read"
  ON authority_submissions FOR SELECT
  TO authenticated
  USING (
    submitted_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "authority_submissions_admin_update"
  ON authority_submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =============================================================================
-- 7. Migrate existing authority data from jurisdictions → jurisdiction_authorities
-- =============================================================================

INSERT INTO jurisdiction_authorities (
  jurisdiction_id, authority_type, dependency_category,
  dependency_name, email, phone, url,
  handles_report_types, verification
)
SELECT
  id, 'primary', 'control_animal',
  authority_name, authority_email, authority_phone, authority_url,
  ARRAY['abuse', 'stray', 'missing', 'injured'],
  CASE WHEN verified THEN 'verified'::verification_status ELSE 'unverified'::verification_status END
FROM jurisdictions
WHERE authority_name IS NOT NULL;

-- Note: existing authority_* columns on jurisdictions are kept for backward compatibility
-- They will be removed in a future migration after all consumers are updated
