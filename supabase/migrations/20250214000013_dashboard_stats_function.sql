-- Dashboard stats function for public impact metrics
-- Rollback: DROP FUNCTION IF EXISTS get_dashboard_stats();

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_cases', (SELECT COUNT(*) FROM cases),
    'resolved_cases', (SELECT COUNT(*) FROM cases WHERE status = 'resolved'),
    'pending_cases', (SELECT COUNT(*) FROM cases WHERE status = 'pending'),
    'in_progress_cases', (SELECT COUNT(*) FROM cases WHERE status = 'in_progress'),
    'abuse_cases', (SELECT COUNT(*) FROM cases WHERE category = 'abuse'),
    'stray_cases', (SELECT COUNT(*) FROM cases WHERE category = 'stray'),
    'missing_cases', (SELECT COUNT(*) FROM cases WHERE category = 'missing'),
    'total_donations', (SELECT COALESCE(SUM(amount), 0) FROM donations WHERE status = 'approved'),
    'avg_resolution_days', (
      SELECT COALESCE(
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400)::numeric(10,1),
        0
      )
      FROM cases
      WHERE status = 'resolved'
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Grant execute to all users (public dashboard)
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO anon, authenticated;
