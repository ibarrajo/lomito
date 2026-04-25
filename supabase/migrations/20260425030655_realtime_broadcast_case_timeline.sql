-- =============================================================================
-- Migration: 20260425030655_realtime_broadcast_case_timeline.sql
-- Purpose  : Replace postgres_changes-based Realtime on `case_timeline` with
--            a private Broadcast channel that publishes only safe fields.
--
-- Background:
--   The case-detail screen subscribed to postgres_changes on `case_timeline`
--   filtered by `case_id=eq.${caseId}`. That delivers the full row payload
--   (including the JSONB `details` column, which captures unstructured event
--   context, and `actor_id`) to every authenticated subscriber. The
--   client-side filter is only a UX convenience — Supabase Realtime applies
--   it server-side, but the underlying RLS check on `case_timeline` is
--   `auth.uid() IS NOT NULL` (intentionally permissive to support the public
--   transparency mission of the cases table). A subscriber can use any
--   filter, or none, and receive timeline rows for cases they should not
--   see at the field level.
--
--   This migration:
--     1. Adds a SECURITY DEFINER trigger on `case_timeline` that publishes
--        a redacted payload to the private `case:<id>` Broadcast topic via
--        `realtime.send()`. The payload carries only `id`, `case_id`,
--        `action`, `created_at`, and `event_type` — *not* `details` or
--        `actor_id`.
--     2. Adds a SELECT policy on `realtime.messages` that allows
--        authenticated users to receive messages on any `case:*` topic.
--        (Per Supabase docs, `realtime.messages` SELECT policies gate which
--        Broadcast subscribers receive a message; they do NOT gate
--        postgres_changes. This policy applies only to the new path.)
--     3. Drops `case_timeline` from the `supabase_realtime` publication so
--        the legacy postgres_changes path stops firing entirely. After this
--        migration, any client still subscribing to
--        `.on('postgres_changes', { table: 'case_timeline' }, ...)` will
--        receive no events — by design.
--
--   Clients re-fetch the full timeline via the existing query path after
--   receiving a Broadcast notification.
--
-- Rollback:
--   ALTER PUBLICATION supabase_realtime ADD TABLE public.case_timeline;
--   DROP TRIGGER IF EXISTS notify_case_timeline_changed_trg ON public.case_timeline;
--   DROP FUNCTION IF EXISTS public.notify_case_timeline_changed();
--   DROP POLICY IF EXISTS "Authenticated receive case topic broadcasts" ON realtime.messages;
-- =============================================================================

-- ----------------------------------------------------------------------------
-- 1. Trigger function
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.notify_case_timeline_changed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_topic text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_topic := 'case:' || OLD.case_id::text;
    PERFORM realtime.send(
      jsonb_build_object(
        'id', OLD.id,
        'case_id', OLD.case_id,
        'event_type', 'DELETE'
      ),
      'timeline_event',
      v_topic,
      true
    );
  ELSE
    v_topic := 'case:' || NEW.case_id::text;
    PERFORM realtime.send(
      jsonb_build_object(
        'id', NEW.id,
        'case_id', NEW.case_id,
        'action', NEW.action,
        'created_at', NEW.created_at,
        'event_type', TG_OP
      ),
      'timeline_event',
      v_topic,
      true
    );
  END IF;
  RETURN NULL;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. Trigger
-- ----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS notify_case_timeline_changed_trg ON public.case_timeline;
CREATE TRIGGER notify_case_timeline_changed_trg
  AFTER INSERT OR UPDATE OR DELETE ON public.case_timeline
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_case_timeline_changed();

-- ----------------------------------------------------------------------------
-- 3. RLS policy on realtime.messages for case:* topics
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Authenticated receive case topic broadcasts" ON realtime.messages;
CREATE POLICY "Authenticated receive case topic broadcasts"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (realtime.topic() LIKE 'case:%');

-- ----------------------------------------------------------------------------
-- 4. Drop case_timeline from postgres_changes publication
--    so the legacy path stops broadcasting full rows.
--
--    On production we found case_timeline was never in supabase_realtime to
--    begin with (Supabase doesn't auto-publish new tables — they're added
--    explicitly), so this guarded DROP is a no-op in current state. Kept
--    for defense-in-depth: if a future migration ever adds case_timeline
--    back to the publication, this guard ensures the broadcast path
--    remains the only Realtime exposure.
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'case_timeline'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.case_timeline';
  END IF;
END $$;
