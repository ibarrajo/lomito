-- RLS Policies for Lomito
-- Rollback: DROP POLICY IF EXISTS ... (each policy name)

-- Helper function: check if user has a role in a jurisdiction
CREATE OR REPLACE FUNCTION user_has_jurisdiction_role(p_user_id UUID, p_jurisdiction_id UUID, p_roles user_role[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles p
    JOIN user_jurisdictions uj ON uj.user_id = p.id
    WHERE p.id = p_user_id
    AND uj.jurisdiction_id = p_jurisdiction_id
    AND p.role = ANY(p_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: check if user is admin
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================
-- PROFILES
-- ===================

-- Anyone can read basic profile info (public fields)
CREATE POLICY profiles_select_public ON profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (on registration)
CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY profiles_update_admin ON profiles
  FOR UPDATE USING (is_admin(auth.uid()));

-- ===================
-- JURISDICTIONS
-- ===================

-- Everyone can read jurisdictions (public data)
CREATE POLICY jurisdictions_select_all ON jurisdictions
  FOR SELECT USING (true);

-- Only admins can modify jurisdictions
CREATE POLICY jurisdictions_insert_admin ON jurisdictions
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY jurisdictions_update_admin ON jurisdictions
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY jurisdictions_delete_admin ON jurisdictions
  FOR DELETE USING (is_admin(auth.uid()));

-- ===================
-- USER_JURISDICTIONS
-- ===================

-- Users can see their own jurisdiction assignments
CREATE POLICY user_jurisdictions_select_own ON user_jurisdictions
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can see and manage all assignments
CREATE POLICY user_jurisdictions_select_admin ON user_jurisdictions
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY user_jurisdictions_insert_admin ON user_jurisdictions
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY user_jurisdictions_delete_admin ON user_jurisdictions
  FOR DELETE USING (is_admin(auth.uid()));

-- ===================
-- CASES
-- ===================

-- Anyone authenticated can read cases (public case data, no PII)
CREATE POLICY cases_select_authenticated ON cases
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Authenticated users can create cases
CREATE POLICY cases_insert_authenticated ON cases
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Reporters can update their own pending cases
CREATE POLICY cases_update_own_pending ON cases
  FOR UPDATE USING (
    auth.uid() = reporter_id AND status = 'pending'
  );

-- Moderators can update cases in their jurisdictions
CREATE POLICY cases_update_moderator ON cases
  FOR UPDATE USING (
    user_has_jurisdiction_role(auth.uid(), jurisdiction_id, ARRAY['moderator']::user_role[])
  );

-- Government can update case status in their jurisdictions
CREATE POLICY cases_update_government ON cases
  FOR UPDATE USING (
    user_has_jurisdiction_role(auth.uid(), jurisdiction_id, ARRAY['government']::user_role[])
  );

-- Admins can do anything with cases
CREATE POLICY cases_all_admin ON cases
  FOR ALL USING (is_admin(auth.uid()));

-- ===================
-- CASE_MEDIA
-- ===================

-- Anyone authenticated can view case media
CREATE POLICY case_media_select_authenticated ON case_media
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Case reporters can add media to their own cases
CREATE POLICY case_media_insert_reporter ON case_media
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM cases WHERE cases.id = case_id AND cases.reporter_id = auth.uid())
  );

-- Admins can manage all media
CREATE POLICY case_media_all_admin ON case_media
  FOR ALL USING (is_admin(auth.uid()));

-- ===================
-- CASE_TIMELINE
-- ===================

-- Anyone authenticated can read timeline
CREATE POLICY case_timeline_select_authenticated ON case_timeline
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- System and privileged roles insert timeline entries (via triggers or edge functions)
-- Direct inserts by moderators/government in their jurisdictions
CREATE POLICY case_timeline_insert_privileged ON case_timeline
  FOR INSERT WITH CHECK (
    auth.uid() = actor_id AND (
      is_admin(auth.uid()) OR
      EXISTS (
        SELECT 1 FROM cases c
        WHERE c.id = case_id AND (
          c.reporter_id = auth.uid() OR
          user_has_jurisdiction_role(auth.uid(), c.jurisdiction_id, ARRAY['moderator', 'government']::user_role[])
        )
      )
    )
  );

-- ===================
-- CASE_SUBSCRIPTIONS
-- ===================

-- Users can see their own subscriptions
CREATE POLICY case_subscriptions_select_own ON case_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can subscribe/unsubscribe themselves
CREATE POLICY case_subscriptions_insert_own ON case_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY case_subscriptions_delete_own ON case_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- ===================
-- DONATIONS
-- ===================

-- Users can see their own donations
CREATE POLICY donations_select_own ON donations
  FOR SELECT USING (auth.uid() = donor_id);

-- Admins can see all donations
CREATE POLICY donations_select_admin ON donations
  FOR SELECT USING (is_admin(auth.uid()));

-- Authenticated users can create donations
CREATE POLICY donations_insert_authenticated ON donations
  FOR INSERT WITH CHECK (auth.uid() = donor_id);
