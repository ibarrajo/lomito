-- Trigger to send push notifications when case timeline is updated
-- Rollback: DROP TRIGGER on_timeline_insert_notify ON case_timeline; DROP FUNCTION notify_case_subscribers();

-- Note: This requires pg_net extension to be enabled in Supabase dashboard
-- Also requires app.settings.supabase_url and app.settings.service_role_key to be configured

-- Function to call the send-notification edge function
CREATE OR REPLACE FUNCTION notify_case_subscribers()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the send-notification edge function via pg_net
  -- Only notify for specific actions that subscribers care about
  IF NEW.action IN ('verified', 'status_changed', 'comment', 'resolved', 'government_response', 'escalated') THEN
    PERFORM net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/send-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'caseId', NEW.case_id::text,
        'action', NEW.action::text
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on timeline insert
CREATE TRIGGER on_timeline_insert_notify
  AFTER INSERT ON case_timeline
  FOR EACH ROW
  EXECUTE FUNCTION notify_case_subscribers();

-- Configuration notes:
-- 1. Enable pg_net extension: Enable in Supabase Dashboard > Database > Extensions
-- 2. Set config variables:
--    ALTER DATABASE postgres SET app.settings.supabase_url = 'https://your-project.supabase.co';
--    ALTER DATABASE postgres SET app.settings.service_role_key = 'your-service-role-key';
