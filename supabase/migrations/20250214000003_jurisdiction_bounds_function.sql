-- Migration: Add SQL function for fetching jurisdictions within bounds
-- Description: Creates a function to retrieve simplified jurisdiction boundaries for map display

-- Create function to get jurisdictions within a bounding box
CREATE OR REPLACE FUNCTION get_jurisdictions_in_bounds(
  p_west FLOAT,
  p_south FLOAT,
  p_east FLOAT,
  p_north FLOAT,
  p_tolerance FLOAT DEFAULT 0.001
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  level jurisdiction_level,
  authority_name TEXT,
  geojson TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    j.id,
    j.name,
    j.level,
    j.authority_name,
    ST_AsGeoJSON(
      ST_Simplify(j.geometry, p_tolerance)
    )::TEXT as geojson
  FROM jurisdictions j
  WHERE j.geometry IS NOT NULL
    AND ST_Intersects(
      j.geometry,
      ST_MakeEnvelope(p_west, p_south, p_east, p_north, 4326)
    );
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION get_jurisdictions_in_bounds(FLOAT, FLOAT, FLOAT, FLOAT, FLOAT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_jurisdictions_in_bounds(FLOAT, FLOAT, FLOAT, FLOAT, FLOAT) TO anon;

-- Add comment
COMMENT ON FUNCTION get_jurisdictions_in_bounds IS 'Returns simplified jurisdiction boundaries within a bounding box for map display';
