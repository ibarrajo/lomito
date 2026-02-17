-- Schedule daily auto-escalation check via pg_cron + pg_net
-- Runs at 06:00 UTC every day, calling the auto-escalation-check Edge Function
-- Rollback: SELECT cron.unschedule('daily-auto-escalation'); DROP EXTENSION IF EXISTS pg_cron;

-- pg_net is already required by migration 20250214000007 (notification trigger).
-- Enable pg_cron for scheduled job support.
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove any existing schedule with the same name before creating a new one
-- (safe to run on repeated migrations or re-deployments)
SELECT cron.unschedule('daily-auto-escalation')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'daily-auto-escalation'
);

-- Schedule the daily auto-escalation job.
-- Uses the same app.settings pattern as notify_case_subscribers() so that:
--   1. Local dev silently skips (settings not configured).
--   2. Production uses the service_role_key already set on the database.
-- Note: nested dollar-quoting uses $cron_body$ to avoid conflicts with the outer $$
SELECT cron.schedule(
  'daily-auto-escalation',
  '0 6 * * *',
  $cron_body$
  DO $inner$
  DECLARE
    v_supabase_url TEXT;
    v_service_role_key TEXT;
  BEGIN
    BEGIN
      v_supabase_url := current_setting('app.settings.supabase_url');
      v_service_role_key := current_setting('app.settings.service_role_key');
    EXCEPTION
      WHEN undefined_object THEN
        -- Settings not configured (local dev), skip HTTP call
        RETURN;
    END;

    IF v_supabase_url IS NOT NULL AND v_service_role_key IS NOT NULL THEN
      PERFORM net.http_post(
        url := v_supabase_url || '/functions/v1/auto-escalation-check',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_service_role_key
        ),
        body := '{}'::jsonb
      );
    END IF;
  END;
  $inner$ LANGUAGE plpgsql;
  $cron_body$
);

-- Configuration notes:
-- 1. Enable pg_cron extension: Dashboard > Database > Extensions > pg_cron
-- 2. Enable pg_net extension: Dashboard > Database > Extensions > pg_net
-- 3. Ensure app settings are set (only needs to be done once per project):
--    ALTER DATABASE postgres SET app.settings.supabase_url = 'https://jmhsuttikjjyfwbvojiu.supabase.co';
--    ALTER DATABASE postgres SET app.settings.service_role_key = '<your-service-role-key>';
-- 4. Verify the scheduled job: SELECT * FROM cron.job WHERE jobname = 'daily-auto-escalation';
