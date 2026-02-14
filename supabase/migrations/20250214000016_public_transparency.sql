-- Public Transparency Migration
-- Makes cases, timeline, and media publicly readable for transparency
-- Rollback: DROP POLICY cases_select_public; DROP POLICY case_timeline_select_public; DROP POLICY case_media_select_public;
-- Then recreate policies from migration 20250214000004

-- Replace authenticated-only SELECT with public SELECT on cases
DROP POLICY IF EXISTS cases_select_all ON cases;

CREATE POLICY cases_select_public ON cases
  FOR SELECT USING (true);

-- Make case_timeline publicly readable
DROP POLICY IF EXISTS case_timeline_select_authenticated ON case_timeline;

CREATE POLICY case_timeline_select_public ON case_timeline
  FOR SELECT USING (true);

-- Make case_media publicly readable
DROP POLICY IF EXISTS case_media_select_authenticated ON case_media;

CREATE POLICY case_media_select_public ON case_media
  FOR SELECT USING (true);

-- Note: profiles, donations, case_subscriptions remain auth-protected (contain PII)
