-- =============================================================================
-- Migration: 20260425005402_realtime_broadcast_cases_changed.sql
-- Purpose  : Replace postgres_changes-based Realtime on `cases` with a
--            Broadcast channel that carries no row data.
--
-- Background:
--   The web dashboard previously used
--     .on('postgres_changes', { table: 'cases', event: '*' }, ...)
--   to refresh when cases changed. That subscription delivers full row
--   payloads — including reporter_id, exact PostGIS location, and the
--   free-text description — to every authenticated subscriber, because the
--   cases SELECT RLS policy is intentionally permissive (`auth.uid() IS NOT
--   NULL`) to support the public reports ticker on the landing page and the
--   transparency mission of the product.
--
--   The dashboard's callback discards the payload and re-fetches via an RPC
--   that already enforces RLS and field redaction. So no client UX depends
--   on the row data — only on the "something changed" signal.
--
--   This migration adds a SECURITY DEFINER statement-level trigger that
--   publishes a small notification on the `cases:public` Broadcast topic
--   whenever a row is inserted, updated, or deleted in `cases`. The
--   notification carries only a timestamp; clients re-fetch via the
--   existing RLS-aware RPC.
--
-- Rollback:
--   DROP TRIGGER IF EXISTS notify_cases_changed_trg ON public.cases;
--   DROP FUNCTION IF EXISTS public.notify_cases_changed();
-- =============================================================================

CREATE OR REPLACE FUNCTION public.notify_cases_changed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM realtime.send(
    jsonb_build_object('updated_at', extract(epoch from clock_timestamp())),
    'cases_changed',
    'cases:public',
    false
  );
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS notify_cases_changed_trg ON public.cases;
CREATE TRIGGER notify_cases_changed_trg
  AFTER INSERT OR UPDATE OR DELETE ON public.cases
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.notify_cases_changed();
