-- Audit fixes: donation constraints and NULL jurisdiction handling documentation
-- Rollback: ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_status_check; ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_external_id_unique;

-- ===================
-- DONATION CONSTRAINTS
-- ===================

-- 1. Add CHECK constraint on donation status to prevent invalid values
ALTER TABLE donations ADD CONSTRAINT donations_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'refunded', 'cancelled'));

-- 2. Add UNIQUE constraint on external_id to prevent duplicate webhook processing
-- This ensures Mercado Pago / Stripe webhooks are idempotent
ALTER TABLE donations ADD CONSTRAINT donations_external_id_unique
  UNIQUE NULLS NOT DISTINCT (external_id);

-- ===================
-- NULL JURISDICTION HANDLING
-- ===================

-- DESIGN NOTE: Cases with NULL jurisdiction_id (not auto-assigned due to location outside
-- known boundaries or PostGIS errors) are by design NOT updatable by moderators or government users.
-- Only admins can update these cases via the cases_all_admin policy (FOR ALL).
--
-- This is intentional: moderators and government users are scoped to specific jurisdictions.
-- Unassigned cases must be handled by admins who can either:
--   1. Manually assign a jurisdiction
--   2. Update the jurisdiction boundaries
--   3. Reject the case if location is invalid
--
-- The existing policies from migration 20250214000004_moderator_rls.sql correctly enforce this:
--   - cases_update_moderator_jurisdiction: requires uj.jurisdiction_id = cases.jurisdiction_id
--   - cases_update_government_jurisdiction: requires uj.jurisdiction_id = cases.jurisdiction_id
--   - cases_all_admin (from migration 002): allows admin to update ANY case (no jurisdiction filter)
--
-- No policy changes needed. This comment serves as documentation of expected behavior.

-- ===================
-- POSTGIS TYPE SAFETY
-- ===================

-- VERIFIED: The auto_assign_jurisdiction trigger function correctly casts geography to geometry
-- for ST_Contains. No changes needed. The function:
--   1. Accepts cases.location as GEOGRAPHY(Point, 4326)
--   2. Casts to geometry for ST_Contains: NEW.location::geometry
--   3. Compares with jurisdictions.geometry GEOMETRY(MultiPolygon, 4326)
-- This is the correct pattern per PostGIS best practices.
