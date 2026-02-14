-- Moderator RLS Policies
-- This migration updates RLS policies to ensure moderators can properly view and update cases in their jurisdictions
-- Rollback: DROP POLICY IF EXISTS cases_select_all; DROP POLICY IF EXISTS cases_update_moderator_jurisdiction; DROP POLICY IF EXISTS cases_update_government_jurisdiction;

-- Drop the existing broad SELECT policy and replace with more specific one
DROP POLICY IF EXISTS cases_select_authenticated ON cases;

-- Allow users to view cases based on their role:
-- - Own cases (reporter)
-- - Non-hidden public cases (pending, verified, in_progress, resolved)
-- - Cases in assigned jurisdictions (moderator, government, admin)
CREATE POLICY cases_select_all ON cases
  FOR SELECT USING (
    -- Own cases
    reporter_id = auth.uid()
    OR
    -- Public cases (not rejected or archived)
    status NOT IN ('rejected', 'archived')
    OR
    -- Cases in moderator/government/admin's assigned jurisdictions
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_jurisdictions uj ON uj.user_id = p.id
      WHERE p.id = auth.uid()
      AND p.role IN ('moderator', 'government', 'admin')
      AND uj.jurisdiction_id = cases.jurisdiction_id
    )
    OR
    -- Admins can see all
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Drop existing moderator update policy and replace with clearer version
DROP POLICY IF EXISTS cases_update_moderator ON cases;

-- Moderators can update cases in their assigned jurisdictions
CREATE POLICY cases_update_moderator_jurisdiction ON cases
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_jurisdictions uj ON uj.user_id = p.id
      WHERE p.id = auth.uid()
      AND p.role IN ('moderator', 'admin')
      AND uj.jurisdiction_id = cases.jurisdiction_id
    )
  );

-- Drop existing government update policy and replace with clearer version
DROP POLICY IF EXISTS cases_update_government ON cases;

-- Government users can update cases in their assigned jurisdictions
CREATE POLICY cases_update_government_jurisdiction ON cases
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_jurisdictions uj ON uj.user_id = p.id
      WHERE p.id = auth.uid()
      AND p.role IN ('government', 'admin')
      AND uj.jurisdiction_id = cases.jurisdiction_id
    )
  );
