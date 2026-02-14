-- Initial schema for Lomito
-- Rollback: DROP TABLE IF EXISTS donations, case_subscriptions, case_timeline, case_media, cases, user_jurisdictions, jurisdictions, profiles CASCADE;

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Custom types
CREATE TYPE user_role AS ENUM ('citizen', 'moderator', 'government', 'admin');
CREATE TYPE case_status AS ENUM ('pending', 'verified', 'in_progress', 'resolved', 'rejected', 'archived');
CREATE TYPE case_category AS ENUM ('abuse', 'stray', 'missing');
CREATE TYPE animal_type AS ENUM ('dog', 'cat', 'bird', 'other');
CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE media_type AS ENUM ('image', 'video');
CREATE TYPE jurisdiction_level AS ENUM ('state', 'municipality', 'locality');
CREATE TYPE donation_method AS ENUM ('mercado_pago', 'stripe', 'oxxo', 'spei');
CREATE TYPE timeline_action AS ENUM (
  'created', 'verified', 'rejected', 'status_changed', 'assigned',
  'escalated', 'government_response', 'comment', 'media_added',
  'flagged', 'resolved', 'archived'
);

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  municipality TEXT,
  role user_role NOT NULL DEFAULT 'citizen',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Jurisdictions (hierarchy with PostGIS boundaries)
CREATE TABLE jurisdictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES jurisdictions(id),
  level jurisdiction_level NOT NULL,
  geometry GEOMETRY(MultiPolygon, 4326),
  authority_name TEXT,
  authority_email TEXT,
  authority_phone TEXT,
  authority_url TEXT,
  escalation_enabled BOOLEAN NOT NULL DEFAULT false,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE jurisdictions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_jurisdictions_geometry ON jurisdictions USING GIST (geometry);
CREATE INDEX idx_jurisdictions_parent ON jurisdictions(parent_id);
CREATE INDEX idx_jurisdictions_level ON jurisdictions(level);

-- User-Jurisdiction junction (for role scoping)
CREATE TABLE user_jurisdictions (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  jurisdiction_id UUID NOT NULL REFERENCES jurisdictions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, jurisdiction_id)
);

ALTER TABLE user_jurisdictions ENABLE ROW LEVEL SECURITY;

-- Cases (core reports with PostGIS location)
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  category case_category NOT NULL,
  animal_type animal_type NOT NULL DEFAULT 'dog',
  description TEXT NOT NULL,
  location GEOGRAPHY(Point, 4326) NOT NULL,
  jurisdiction_id UUID REFERENCES jurisdictions(id),
  urgency urgency_level NOT NULL DEFAULT 'medium',
  status case_status NOT NULL DEFAULT 'pending',
  flag_count INTEGER NOT NULL DEFAULT 0,
  folio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_cases_location ON cases USING GIST (location);
CREATE INDEX idx_cases_jurisdiction ON cases(jurisdiction_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_category ON cases(category);
CREATE INDEX idx_cases_reporter ON cases(reporter_id);
CREATE INDEX idx_cases_created ON cases(created_at DESC);

-- Case Media
CREATE TABLE case_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type media_type NOT NULL DEFAULT 'image',
  thumbnail_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE case_media ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_case_media_case ON case_media(case_id);

-- Case Timeline (audit log)
CREATE TABLE case_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id),
  action timeline_action NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE case_timeline ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_case_timeline_case ON case_timeline(case_id);
CREATE INDEX idx_case_timeline_created ON case_timeline(created_at DESC);

-- Case Subscriptions (for notifications)
CREATE TABLE case_subscriptions (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, case_id)
);

ALTER TABLE case_subscriptions ENABLE ROW LEVEL SECURITY;

-- Donations
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'MXN',
  method donation_method NOT NULL,
  donor_id UUID REFERENCES profiles(id),
  recurring BOOLEAN NOT NULL DEFAULT false,
  external_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_donations_donor ON donations(donor_id);
CREATE INDEX idx_donations_created ON donations(created_at DESC);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER jurisdictions_updated_at BEFORE UPDATE ON jurisdictions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-assign jurisdiction on case insert
CREATE OR REPLACE FUNCTION auto_assign_jurisdiction()
RETURNS TRIGGER AS $$
BEGIN
  SELECT id INTO NEW.jurisdiction_id
  FROM jurisdictions
  WHERE ST_Contains(geometry, NEW.location::geometry)
  AND level = 'municipality'
  ORDER BY ST_Area(geometry) ASC
  LIMIT 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cases_auto_jurisdiction BEFORE INSERT ON cases FOR EACH ROW EXECUTE FUNCTION auto_assign_jurisdiction();

-- Auto-create timeline entry on case insert
CREATE OR REPLACE FUNCTION auto_create_timeline()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO case_timeline (case_id, actor_id, action, details)
  VALUES (NEW.id, NEW.reporter_id, 'created', jsonb_build_object('category', NEW.category, 'urgency', NEW.urgency));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cases_auto_timeline AFTER INSERT ON cases FOR EACH ROW EXECUTE FUNCTION auto_create_timeline();

-- Auto-subscribe reporter to their case
CREATE OR REPLACE FUNCTION auto_subscribe_reporter()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO case_subscriptions (user_id, case_id)
  VALUES (NEW.reporter_id, NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cases_auto_subscribe AFTER INSERT ON cases FOR EACH ROW EXECUTE FUNCTION auto_subscribe_reporter();
