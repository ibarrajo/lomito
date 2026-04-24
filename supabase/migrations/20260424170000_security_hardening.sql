-- =============================================================================
-- Migration: 20260424170000_security_hardening.sql
-- Purpose  : Address multiple DB-layer security issues identified in the audit.
--
-- Sections:
--   1. Add SET search_path = '' to all SECURITY DEFINER functions that lack it,
--      and qualify all unqualified object references with their schema.
--   2. Add WITH CHECK clauses (clone of USING) to 8 UPDATE policies that were
--      missing them, preventing row-escape after update.
--   3. Harden case_timeline actor_id: replace case_timeline_insert_privileged
--      so WITH CHECK prevents actor_id spoofing. System/cron writes
--      (auth.uid() IS NULL) are allowed only when actor_id IS NULL.
--   4. Revoke EXECUTE on public.is_admin(uuid) from anon.
--   5. Add bounding-box and tolerance validation to both overloads of
--      get_jurisdictions_in_bounds (raises exception on oversized boxes or
--      too-small tolerance).
--   6. Redact reporter_id from get_case_by_id for unauthenticated callers
--      (returns NULL when auth.uid() IS NULL).
--
-- Rollback guidance:
--   1. Recreate each function without SET search_path and with unqualified
--      references (restore from prod-schema.sql snapshot or prior migration).
--   2. Drop each updated policy and recreate without the WITH CHECK clause.
--   3. Drop case_timeline_insert_privileged, recreate with the original body:
--      WITH CHECK ((auth.uid() = actor_id) AND (is_admin(auth.uid()) OR ...))
--   4. GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO anon;
--   5. Recreate both get_jurisdictions_in_bounds overloads without the
--      validation block at the top.
--   6. Recreate get_case_by_id returning reporter_id unconditionally.
-- =============================================================================


-- =============================================================================
-- SECTION 1: Add SET search_path = '' to SECURITY DEFINER functions
-- =============================================================================

-- ----------------------------------------------------------------------------
-- 1a. get_case_by_id
--     (reporter_id redaction added in section 6 — done here together)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_case_by_id(case_uuid uuid)
RETURNS TABLE(
    id uuid,
    reporter_id uuid,
    category text,
    animal_type text,
    description text,
    location_geojson jsonb,
    location_notes text,
    jurisdiction_id uuid,
    urgency text,
    status text,
    flag_count integer,
    folio text,
    escalated_at timestamp with time zone,
    escalation_email_id text,
    escalation_reminder_count integer,
    marked_unresponsive boolean,
    government_response_at timestamp with time zone,
    incident_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    -- Section 6: redact reporter_id for unauthenticated callers
    CASE WHEN auth.uid() IS NULL THEN NULL ELSE c.reporter_id END AS reporter_id,
    c.category::text,
    c.animal_type::text,
    c.description,
    public.ST_AsGeoJSON(c.location::public.geometry)::jsonb AS location_geojson,
    c.location_notes,
    c.jurisdiction_id,
    c.urgency::text,
    c.status::text,
    c.flag_count,
    c.folio,
    c.escalated_at,
    c.escalation_email_id,
    c.escalation_reminder_count,
    c.marked_unresponsive,
    c.government_response_at,
    c.incident_at,
    c.created_at,
    c.updated_at
  FROM public.cases c
  WHERE c.id = case_uuid;
END;
$$;

-- ----------------------------------------------------------------------------
-- 1b. get_cases_for_map
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_cases_for_map(
    limit_count integer DEFAULT 100,
    filter_categories text[] DEFAULT NULL::text[],
    filter_statuses text[] DEFAULT NULL::text[]
)
RETURNS TABLE(
    id uuid,
    category text,
    animal_type text,
    description text,
    status text,
    urgency text,
    location_geojson jsonb,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.category::text,
    c.animal_type::text,
    c.description,
    c.status::text,
    c.urgency::text,
    public.ST_AsGeoJSON(c.location::public.geometry)::jsonb AS location_geojson,
    c.created_at
  FROM public.cases c
  WHERE
    (filter_categories IS NULL OR c.category::text = ANY(filter_categories))
    AND (filter_statuses IS NULL OR c.status::text = ANY(filter_statuses))
  ORDER BY c.created_at DESC
  LIMIT limit_count;
END;
$$;

-- ----------------------------------------------------------------------------
-- 1c. get_dashboard_stats
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_cases',        (SELECT pg_catalog.count(*) FROM public.cases),
    'resolved_cases',     (SELECT pg_catalog.count(*) FROM public.cases WHERE status = 'resolved'),
    'pending_cases',      (SELECT pg_catalog.count(*) FROM public.cases WHERE status = 'pending'),
    'in_progress_cases',  (SELECT pg_catalog.count(*) FROM public.cases WHERE status = 'in_progress'),
    'abuse_cases',        (SELECT pg_catalog.count(*) FROM public.cases WHERE category = 'abuse'),
    'stray_cases',        (SELECT pg_catalog.count(*) FROM public.cases WHERE category = 'stray'),
    'missing_cases',      (SELECT pg_catalog.count(*) FROM public.cases WHERE category = 'missing'),
    'total_donations',    (SELECT COALESCE(SUM(amount), 0) FROM public.donations WHERE status = 'approved'),
    'avg_resolution_days', (
      SELECT COALESCE(
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400)::numeric(10,1),
        0
      )
      FROM public.cases
      WHERE status = 'resolved'
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- ----------------------------------------------------------------------------
-- 1d. get_jurisdictions_in_bounds — overload 1 (no p_levels param)
--     Bounding-box and tolerance validation added here (Section 5)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_jurisdictions_in_bounds(
    p_west double precision,
    p_south double precision,
    p_east double precision,
    p_north double precision,
    p_tolerance double precision DEFAULT 0.001
)
RETURNS TABLE(
    id uuid,
    name text,
    level public.jurisdiction_level,
    authority_name text,
    geojson text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Section 5: validate bounding box and tolerance
  IF (p_east - p_west) > 180 OR (p_north - p_south) > 180 THEN
    RAISE EXCEPTION 'Bounding box too large: longitude span % and latitude span % must each be <= 180 degrees',
      (p_east - p_west), (p_north - p_south);
  END IF;
  IF p_tolerance < 0.0001 THEN
    RAISE EXCEPTION 'p_tolerance % is below minimum allowed value of 0.0001', p_tolerance;
  END IF;

  RETURN QUERY
  SELECT
    j.id,
    j.name,
    j.level,
    j.authority_name,
    public.ST_AsGeoJSON(
      public.ST_Simplify(j.geometry, p_tolerance)
    )::text AS geojson
  FROM public.jurisdictions j
  WHERE j.geometry IS NOT NULL
    AND public.ST_Intersects(
      j.geometry,
      public.ST_MakeEnvelope(p_west, p_south, p_east, p_north, 4326)
    );
END;
$$;

COMMENT ON FUNCTION public.get_jurisdictions_in_bounds(double precision, double precision, double precision, double precision, double precision)
  IS 'Returns simplified jurisdiction boundaries within a bounding box for map display';

-- ----------------------------------------------------------------------------
-- 1e. get_jurisdictions_in_bounds — overload 2 (with p_levels param)
--     Bounding-box and tolerance validation added here (Section 5)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_jurisdictions_in_bounds(
    p_west double precision,
    p_south double precision,
    p_east double precision,
    p_north double precision,
    p_tolerance double precision DEFAULT 0.001,
    p_levels text[] DEFAULT ARRAY['delegacion'::text]
)
RETURNS TABLE(
    id uuid,
    name text,
    level public.jurisdiction_level,
    authority_name text,
    geojson text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Section 5: validate bounding box and tolerance
  IF (p_east - p_west) > 180 OR (p_north - p_south) > 180 THEN
    RAISE EXCEPTION 'Bounding box too large: longitude span % and latitude span % must each be <= 180 degrees',
      (p_east - p_west), (p_north - p_south);
  END IF;
  IF p_tolerance < 0.0001 THEN
    RAISE EXCEPTION 'p_tolerance % is below minimum allowed value of 0.0001', p_tolerance;
  END IF;

  RETURN QUERY
  SELECT
    j.id,
    j.name,
    j.level,
    j.authority_name,
    public.ST_AsGeoJSON(
      public.ST_Simplify(j.geometry, p_tolerance)
    )::text AS geojson
  FROM public.jurisdictions j
  WHERE j.geometry IS NOT NULL
    AND j.level::text = ANY(p_levels)
    AND public.ST_Intersects(
      j.geometry,
      public.ST_MakeEnvelope(p_west, p_south, p_east, p_north, 4326)
    );
END;
$$;

COMMENT ON FUNCTION public.get_jurisdictions_in_bounds(double precision, double precision, double precision, double precision, double precision, text[])
  IS 'Returns simplified jurisdiction boundaries within a bounding box for map display, filtered by level';

-- ----------------------------------------------------------------------------
-- 1f. get_pois_in_bounds  (LANGUAGE sql — SET search_path supported as attribute)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_pois_in_bounds(
    p_west double precision,
    p_south double precision,
    p_east double precision,
    p_north double precision,
    p_types text[] DEFAULT NULL::text[]
)
RETURNS TABLE(
    id uuid,
    poi_type text,
    vet_subtype text,
    name text,
    address text,
    phone text,
    email text,
    url text,
    hours text,
    capacity integer,
    lng double precision,
    lat double precision,
    jurisdiction_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  -- Government offices from jurisdiction_authorities
  SELECT
    ja.id,
    'government_office'::text AS poi_type,
    NULL::text AS vet_subtype,
    ja.dependency_name || COALESCE(' — ' || ja.department_name, '') AS name,
    ja.address,
    ja.phone,
    ja.email,
    ja.url,
    NULL::text AS hours,
    NULL::integer AS capacity,
    public.ST_X(ja.location::public.geometry) AS lng,
    public.ST_Y(ja.location::public.geometry) AS lat,
    ja.jurisdiction_id
  FROM public.jurisdiction_authorities ja
  WHERE ja.location IS NOT NULL
    AND public.ST_Intersects(
      ja.location,
      public.ST_MakeEnvelope(p_west, p_south, p_east, p_north, 4326)::public.geography
    )
    AND (p_types IS NULL OR 'government_office' = ANY(p_types))

  UNION ALL

  -- Points of interest
  SELECT
    poi.id,
    poi.poi_type::text,
    poi.vet_subtype::text,
    poi.name,
    poi.address,
    poi.phone,
    poi.email,
    poi.url,
    poi.hours,
    poi.capacity,
    public.ST_X(poi.location::public.geometry) AS lng,
    public.ST_Y(poi.location::public.geometry) AS lat,
    poi.jurisdiction_id
  FROM public.points_of_interest poi
  WHERE public.ST_Intersects(
      poi.location,
      public.ST_MakeEnvelope(p_west, p_south, p_east, p_north, 4326)::public.geography
    )
    AND (p_types IS NULL OR poi.poi_type::text = ANY(p_types));
$$;

-- ----------------------------------------------------------------------------
-- 1g. handle_case_flag
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_case_flag()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_flag_count integer;
BEGIN
  -- Increment flag_count on the case
  UPDATE public.cases SET flag_count = flag_count + 1
  WHERE id = NEW.case_id
  RETURNING flag_count INTO new_flag_count;

  -- Insert timeline event for the flag
  INSERT INTO public.case_timeline (case_id, actor_id, action, details)
  VALUES (NEW.case_id, NEW.reporter_id, 'flagged', jsonb_build_object('reason', NEW.reason));

  -- Auto-archive if 3+ flags
  IF new_flag_count >= 3 THEN
    -- Only archive if not already archived
    UPDATE public.cases
    SET status = 'archived'
    WHERE id = NEW.case_id
    AND status != 'archived';

    -- Insert timeline event for auto-archive
    INSERT INTO public.case_timeline (case_id, actor_id, action, details)
    VALUES (NEW.case_id, NEW.reporter_id, 'archived', '{"reason": "auto_archived_flags"}'::jsonb);
  END IF;

  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 1h. is_admin
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = p_user_id AND role = 'admin'
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 1i. notify_case_status_change
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_case_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_action text;
  v_details jsonb;
  v_reason text;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  -- Determine action based on transition
  IF NEW.status = 'verified' THEN
    v_action := 'verified';
  ELSIF NEW.status = 'rejected' THEN
    v_action := 'rejected';
    v_reason := pg_catalog.current_setting('app.rejection_reason', true);
  ELSIF NEW.status = 'archived' THEN
    v_action := 'archived';
  ELSE
    v_action := 'status_changed';
  END IF;

  v_details := jsonb_build_object(
    'old_status', OLD.status::text,
    'new_status', NEW.status::text
  );

  IF v_reason IS NOT NULL AND v_reason != '' THEN
    v_details := v_details || jsonb_build_object('reason', v_reason);
  END IF;

  INSERT INTO public.case_timeline (case_id, actor_id, action, details)
  VALUES (NEW.id, auth.uid(), v_action, v_details);

  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 1j. notify_case_subscribers
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.notify_case_subscribers()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Call the send-notification edge function via pg_net
  -- Only notify for specific actions that subscribers care about
  IF NEW.action IN ('verified', 'status_changed', 'comment', 'resolved', 'government_response', 'escalated') THEN
    PERFORM net.http_post(
      url := pg_catalog.current_setting('app.settings.supabase_url') || '/functions/v1/send-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || pg_catalog.current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'caseId', NEW.case_id::text,
        'action', NEW.action::text
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 1k. search_cases
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.search_cases(
    search_query text,
    result_limit integer DEFAULT 20,
    result_offset integer DEFAULT 0
)
RETURNS TABLE(
    id uuid,
    category text,
    animal_type text,
    description text,
    status text,
    urgency text,
    folio text,
    created_at timestamp with time zone,
    location_geojson jsonb,
    rank real
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.category::text,
    c.animal_type::text,
    c.description,
    c.status::text,
    c.urgency::text,
    c.folio,
    c.created_at,
    public.ST_AsGeoJSON(c.location::public.geometry)::jsonb AS location_geojson,
    ts_rank(
      to_tsvector('spanish', COALESCE(c.description, '') || ' ' || COALESCE(c.folio, '')),
      plainto_tsquery('spanish', search_query)
    ) AS rank
  FROM public.cases c
  WHERE
    to_tsvector('spanish', COALESCE(c.description, '') || ' ' || COALESCE(c.folio, ''))
    @@ plainto_tsquery('spanish', search_query)
    OR c.folio ILIKE '%' || search_query || '%'
  ORDER BY rank DESC, c.created_at DESC
  LIMIT result_limit
  OFFSET result_offset;
END;
$$;

-- ----------------------------------------------------------------------------
-- 1l. user_has_jurisdiction_role
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.user_has_jurisdiction_role(
    p_user_id uuid,
    p_jurisdiction_id uuid,
    p_roles public.user_role[]
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_jurisdictions uj ON uj.user_id = p.id
    WHERE p.id = p_user_id
    AND uj.jurisdiction_id = p_jurisdiction_id
    AND p.role = ANY(p_roles)
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 1m. validate_case_status_transition
--     Preserves the service-role bypass from 20260218100200_service_role_bypass_transition_guard.sql
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_case_status_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- No status change — allow
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  -- Service-role bypass: edge functions and cron jobs run with no auth
  -- context (auth.uid() IS NULL). Trust them to perform valid transitions.
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Admin bypass: admins can force any transition
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN NEW;
  END IF;

  -- Allowed transitions
  IF (OLD.status = 'pending'     AND NEW.status IN ('verified', 'rejected', 'archived')) OR
     (OLD.status = 'verified'    AND NEW.status IN ('in_progress', 'archived')) OR
     (OLD.status = 'in_progress' AND NEW.status IN ('resolved', 'archived')) OR
     (OLD.status = 'resolved'    AND NEW.status = 'archived')
  THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
END;
$$;


-- =============================================================================
-- SECTION 2: Add WITH CHECK to UPDATE policies missing it
-- =============================================================================

-- ----------------------------------------------------------------------------
-- cases_update_government_jurisdiction
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "cases_update_government_jurisdiction" ON public.cases;
CREATE POLICY "cases_update_government_jurisdiction" ON public.cases
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_jurisdictions uj ON uj.user_id = p.id
    WHERE p.id = auth.uid()
      AND p.role = ANY (ARRAY['government'::public.user_role, 'admin'::public.user_role])
      AND uj.jurisdiction_id = cases.jurisdiction_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_jurisdictions uj ON uj.user_id = p.id
    WHERE p.id = auth.uid()
      AND p.role = ANY (ARRAY['government'::public.user_role, 'admin'::public.user_role])
      AND uj.jurisdiction_id = cases.jurisdiction_id
  )
);

-- ----------------------------------------------------------------------------
-- cases_update_moderator_jurisdiction
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "cases_update_moderator_jurisdiction" ON public.cases;
CREATE POLICY "cases_update_moderator_jurisdiction" ON public.cases
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_jurisdictions uj ON uj.user_id = p.id
    WHERE p.id = auth.uid()
      AND p.role = ANY (ARRAY['moderator'::public.user_role, 'admin'::public.user_role])
      AND uj.jurisdiction_id = cases.jurisdiction_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.user_jurisdictions uj ON uj.user_id = p.id
    WHERE p.id = auth.uid()
      AND p.role = ANY (ARRAY['moderator'::public.user_role, 'admin'::public.user_role])
      AND uj.jurisdiction_id = cases.jurisdiction_id
  )
);

-- ----------------------------------------------------------------------------
-- cases_update_own_pending
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "cases_update_own_pending" ON public.cases;
CREATE POLICY "cases_update_own_pending" ON public.cases
FOR UPDATE
USING (
  auth.uid() = reporter_id
  AND status = 'pending'::public.case_status
)
WITH CHECK (
  auth.uid() = reporter_id
  AND status = 'pending'::public.case_status
);

-- ----------------------------------------------------------------------------
-- authority_submissions_admin_update
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "authority_submissions_admin_update" ON public.authority_submissions;
CREATE POLICY "authority_submissions_admin_update" ON public.authority_submissions
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::public.user_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::public.user_role
  )
);

-- ----------------------------------------------------------------------------
-- jurisdiction_authorities_admin_update
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "jurisdiction_authorities_admin_update" ON public.jurisdiction_authorities;
CREATE POLICY "jurisdiction_authorities_admin_update" ON public.jurisdiction_authorities
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = ANY (ARRAY['admin'::public.user_role, 'moderator'::public.user_role])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = ANY (ARRAY['admin'::public.user_role, 'moderator'::public.user_role])
  )
);

-- ----------------------------------------------------------------------------
-- jurisdictions_update_admin
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "jurisdictions_update_admin" ON public.jurisdictions;
CREATE POLICY "jurisdictions_update_admin" ON public.jurisdictions
FOR UPDATE
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ----------------------------------------------------------------------------
-- points_of_interest_admin_update
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "points_of_interest_admin_update" ON public.points_of_interest;
CREATE POLICY "points_of_interest_admin_update" ON public.points_of_interest
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = ANY (ARRAY['admin'::public.user_role, 'moderator'::public.user_role])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = ANY (ARRAY['admin'::public.user_role, 'moderator'::public.user_role])
  )
);

-- ----------------------------------------------------------------------------
-- profiles_update_admin
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin" ON public.profiles
FOR UPDATE
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));


-- =============================================================================
-- SECTION 3: Lock down case_timeline actor_id to prevent spoofing
-- =============================================================================
-- The new policy preserves the existing USING predicate (who may insert) and
-- replaces the WITH CHECK predicate so that:
--   - System/cron writes (auth.uid() IS NULL) are allowed only when actor_id IS NULL
--   - Authenticated writes must set actor_id = auth.uid()

DROP POLICY IF EXISTS "case_timeline_insert_privileged" ON public.case_timeline;
CREATE POLICY "case_timeline_insert_privileged" ON public.case_timeline
FOR INSERT
WITH CHECK (
  -- Identity check: system writes must use NULL actor_id; authenticated writes
  -- must match the calling user's uid
  (
    (auth.uid() IS NULL AND actor_id IS NULL)
    OR (auth.uid() IS NOT NULL AND actor_id = auth.uid())
  )
  -- Authorization check: caller must be admin, the case reporter, or a
  -- moderator/government user with jurisdiction access
  AND (
    auth.uid() IS NULL
    OR public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.cases c
      WHERE c.id = case_timeline.case_id
        AND (
          c.reporter_id = auth.uid()
          OR public.user_has_jurisdiction_role(
               auth.uid(),
               c.jurisdiction_id,
               ARRAY['moderator'::public.user_role, 'government'::public.user_role]
             )
        )
    )
  )
);


-- =============================================================================
-- SECTION 4: Revoke is_admin from anon
-- =============================================================================
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon;

-- Also revoke other admin/internal SECURITY DEFINER trigger functions from anon
-- (these are trigger functions — anon should never call them directly)
REVOKE EXECUTE ON FUNCTION public.handle_case_flag() FROM anon;
REVOKE EXECUTE ON FUNCTION public.notify_case_status_change() FROM anon;
REVOKE EXECUTE ON FUNCTION public.notify_case_subscribers() FROM anon;
REVOKE EXECUTE ON FUNCTION public.validate_case_status_transition() FROM anon;

-- NOTE: get_pois_in_bounds, get_jurisdictions_in_bounds, get_cases_for_map,
-- get_case_by_id, get_dashboard_stats, search_cases are intentionally kept
-- accessible to anon (public read-only data).
-- user_has_jurisdiction_role is kept for anon because it is called from
-- within other SECURITY DEFINER functions that anon may trigger indirectly.


-- =============================================================================
-- SECTION 5: Bounding-box validation for get_jurisdictions_in_bounds
-- (already incorporated into the CREATE OR REPLACE bodies in Section 1d/1e above)
-- =============================================================================


-- =============================================================================
-- SECTION 6: Redact reporter_id in get_case_by_id for unauthenticated callers
-- (already incorporated into the CREATE OR REPLACE body in Section 1a above)
-- =============================================================================
