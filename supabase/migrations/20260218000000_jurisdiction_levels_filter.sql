-- Migration: Add level filtering to jurisdiction bounds function
-- Up: Add p_levels parameter to filter by jurisdiction level
-- Down: Remove p_levels parameter (revert to original function)

CREATE OR REPLACE FUNCTION get_jurisdictions_in_bounds(
  p_west FLOAT,
  p_south FLOAT,
  p_east FLOAT,
  p_north FLOAT,
  p_tolerance FLOAT DEFAULT 0.001,
  p_levels TEXT[] DEFAULT ARRAY['delegacion']
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
    AND j.level::TEXT = ANY(p_levels)
    AND ST_Intersects(
      j.geometry,
      ST_MakeEnvelope(p_west, p_south, p_east, p_north, 4326)
    );
END;
$$;

-- Grant execute permission (must include new signature)
GRANT EXECUTE ON FUNCTION get_jurisdictions_in_bounds(FLOAT, FLOAT, FLOAT, FLOAT, FLOAT, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_jurisdictions_in_bounds(FLOAT, FLOAT, FLOAT, FLOAT, FLOAT, TEXT[]) TO anon;

COMMENT ON FUNCTION get_jurisdictions_in_bounds(FLOAT, FLOAT, FLOAT, FLOAT, FLOAT, TEXT[]) IS 'Returns simplified jurisdiction boundaries within a bounding box for map display, filtered by level';
