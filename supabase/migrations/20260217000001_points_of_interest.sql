-- Points of Interest: POI table, location for jurisdiction_authorities, viewport RPC
-- Rollback: DROP FUNCTION IF EXISTS get_pois_in_bounds; DROP TABLE IF EXISTS points_of_interest CASCADE; DROP TYPE IF EXISTS poi_type, vet_subtype CASCADE; ALTER TABLE jurisdiction_authorities DROP COLUMN IF EXISTS location;

-- =============================================================================
-- 1. Add location column to jurisdiction_authorities
-- =============================================================================

ALTER TABLE jurisdiction_authorities
  ADD COLUMN IF NOT EXISTS location GEOGRAPHY(Point, 4326);

CREATE INDEX IF NOT EXISTS idx_jurisdiction_authorities_location
  ON jurisdiction_authorities USING GIST (location);

-- =============================================================================
-- 2. New Enums
-- =============================================================================

CREATE TYPE poi_type AS ENUM ('government_office', 'animal_shelter', 'vet_clinic');
CREATE TYPE vet_subtype AS ENUM ('standard', 'emergency', 'hours_24');

-- =============================================================================
-- 3. New table: points_of_interest
-- =============================================================================

CREATE TABLE points_of_interest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poi_type poi_type NOT NULL,
  vet_subtype vet_subtype,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  url TEXT,
  hours TEXT,
  capacity INTEGER,
  location GEOGRAPHY(Point, 4326) NOT NULL,
  jurisdiction_id UUID REFERENCES jurisdictions(id) ON DELETE SET NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE points_of_interest ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_points_of_interest_location
  ON points_of_interest USING GIST (location);

CREATE INDEX idx_points_of_interest_poi_type
  ON points_of_interest (poi_type);

CREATE INDEX idx_points_of_interest_jurisdiction
  ON points_of_interest (jurisdiction_id);

-- Updated_at trigger
CREATE TRIGGER points_of_interest_updated_at
  BEFORE UPDATE ON points_of_interest
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- 4. RLS Policies
-- =============================================================================

-- points_of_interest: public read, admin/moderator write, admin-only delete
CREATE POLICY "points_of_interest_read"
  ON points_of_interest FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "points_of_interest_admin_insert"
  ON points_of_interest FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "points_of_interest_admin_update"
  ON points_of_interest FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "points_of_interest_admin_delete"
  ON points_of_interest FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =============================================================================
-- 5. RPC: get_pois_in_bounds
-- =============================================================================

CREATE OR REPLACE FUNCTION get_pois_in_bounds(
  p_west FLOAT,
  p_south FLOAT,
  p_east FLOAT,
  p_north FLOAT,
  p_types TEXT[] DEFAULT NULL
) RETURNS TABLE (
  id UUID,
  poi_type TEXT,
  vet_subtype TEXT,
  name TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  url TEXT,
  hours TEXT,
  capacity INTEGER,
  lng FLOAT,
  lat FLOAT,
  jurisdiction_id UUID
) LANGUAGE sql STABLE SECURITY DEFINER AS $$
  -- Government offices from jurisdiction_authorities
  SELECT
    ja.id,
    'government_office'::TEXT AS poi_type,
    NULL::TEXT AS vet_subtype,
    ja.dependency_name || COALESCE(' — ' || ja.department_name, '') AS name,
    ja.address,
    ja.phone,
    ja.email,
    ja.url,
    NULL::TEXT AS hours,
    NULL::INTEGER AS capacity,
    ST_X(ja.location::geometry) AS lng,
    ST_Y(ja.location::geometry) AS lat,
    ja.jurisdiction_id
  FROM jurisdiction_authorities ja
  WHERE ja.location IS NOT NULL
    AND ST_Intersects(
      ja.location,
      ST_MakeEnvelope(p_west, p_south, p_east, p_north, 4326)::geography
    )
    AND (p_types IS NULL OR 'government_office' = ANY(p_types))

  UNION ALL

  -- Points of interest
  SELECT
    poi.id,
    poi.poi_type::TEXT,
    poi.vet_subtype::TEXT,
    poi.name,
    poi.address,
    poi.phone,
    poi.email,
    poi.url,
    poi.hours,
    poi.capacity,
    ST_X(poi.location::geometry) AS lng,
    ST_Y(poi.location::geometry) AS lat,
    poi.jurisdiction_id
  FROM points_of_interest poi
  WHERE ST_Intersects(
      poi.location,
      ST_MakeEnvelope(p_west, p_south, p_east, p_north, 4326)::geography
    )
    AND (p_types IS NULL OR poi.poi_type::TEXT = ANY(p_types));
$$;

GRANT EXECUTE ON FUNCTION get_pois_in_bounds(FLOAT, FLOAT, FLOAT, FLOAT, TEXT[]) TO anon, authenticated;
