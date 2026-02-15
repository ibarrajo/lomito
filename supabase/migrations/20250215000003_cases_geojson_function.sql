-- Function to return cases with location as GeoJSON
-- This allows the Supabase client to fetch cases with properly formatted coordinates
-- Rollback: DROP FUNCTION get_cases_for_map(integer, text[], text[]);

CREATE OR REPLACE FUNCTION get_cases_for_map(
  limit_count INTEGER DEFAULT 100,
  filter_categories TEXT[] DEFAULT NULL,
  filter_statuses TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  category TEXT,
  animal_type TEXT,
  description TEXT,
  status TEXT,
  urgency TEXT,
  location_geojson JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.category::TEXT,
    c.animal_type::TEXT,
    c.description,
    c.status::TEXT,
    c.urgency::TEXT,
    ST_AsGeoJSON(c.location::geometry)::JSONB AS location_geojson,
    c.created_at
  FROM cases c
  WHERE
    (filter_categories IS NULL OR c.category::TEXT = ANY(filter_categories))
    AND (filter_statuses IS NULL OR c.status::TEXT = ANY(filter_statuses))
  ORDER BY c.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION get_cases_for_map(INTEGER, TEXT[], TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_cases_for_map(INTEGER, TEXT[], TEXT[]) TO anon;
