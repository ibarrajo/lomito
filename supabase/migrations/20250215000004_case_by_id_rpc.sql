-- Function to return a single case by ID with location as GeoJSON
-- This allows the Supabase client to fetch case data with properly formatted coordinates
-- instead of WKB hex strings that cause crashes when destructuring .coordinates
-- Rollback: DROP FUNCTION get_case_by_id(UUID);

CREATE OR REPLACE FUNCTION get_case_by_id(case_uuid UUID)
RETURNS TABLE (
  id UUID,
  reporter_id UUID,
  category TEXT,
  animal_type TEXT,
  description TEXT,
  location_geojson JSONB,
  jurisdiction_id UUID,
  urgency TEXT,
  status TEXT,
  flag_count INTEGER,
  folio TEXT,
  escalated_at TIMESTAMPTZ,
  escalation_email_id TEXT,
  escalation_reminder_count INTEGER,
  marked_unresponsive BOOLEAN,
  government_response_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.reporter_id,
    c.category::TEXT,
    c.animal_type::TEXT,
    c.description,
    ST_AsGeoJSON(c.location::geometry)::JSONB AS location_geojson,
    c.jurisdiction_id,
    c.urgency::TEXT,
    c.status::TEXT,
    c.flag_count,
    c.folio,
    c.escalated_at,
    c.escalation_email_id,
    c.escalation_reminder_count,
    c.marked_unresponsive,
    c.government_response_at,
    c.created_at,
    c.updated_at
  FROM cases c
  WHERE c.id = case_uuid;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant access to authenticated and anonymous users
-- RLS policies on cases table will still apply
GRANT EXECUTE ON FUNCTION get_case_by_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_case_by_id(UUID) TO anon;
