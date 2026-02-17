-- Full-text search on cases by description and folio
-- Rollback: DROP FUNCTION search_cases(TEXT, INTEGER, INTEGER);
--           DROP INDEX IF EXISTS idx_cases_description_fts;

CREATE OR REPLACE FUNCTION search_cases(
  search_query TEXT,
  result_limit INTEGER DEFAULT 20,
  result_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  category TEXT,
  animal_type TEXT,
  description TEXT,
  status TEXT,
  urgency TEXT,
  folio TEXT,
  created_at TIMESTAMPTZ,
  location_geojson JSONB,
  rank REAL
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
    c.folio,
    c.created_at,
    ST_AsGeoJSON(c.location::geometry)::JSONB AS location_geojson,
    ts_rank(
      to_tsvector('spanish', COALESCE(c.description, '') || ' ' || COALESCE(c.folio, '')),
      plainto_tsquery('spanish', search_query)
    ) AS rank
  FROM cases c
  WHERE
    to_tsvector('spanish', COALESCE(c.description, '') || ' ' || COALESCE(c.folio, ''))
    @@ plainto_tsquery('spanish', search_query)
    OR c.folio ILIKE '%' || search_query || '%'
  ORDER BY rank DESC, c.created_at DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION search_cases(TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION search_cases(TEXT, INTEGER, INTEGER) TO anon;

-- Add GIN index for full-text search performance
CREATE INDEX IF NOT EXISTS idx_cases_description_fts
ON cases USING GIN (to_tsvector('spanish', COALESCE(description, '') || ' ' || COALESCE(folio, '')));
