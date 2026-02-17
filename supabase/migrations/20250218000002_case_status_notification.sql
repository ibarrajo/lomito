-- Trigger to insert a case_timeline event when a case's status changes
-- The existing on_timeline_insert_notify trigger (migration 20250214000007) already
-- handles 'status_changed' actions, so inserting here automatically fires notifications
-- to all case subscribers via the send-notification Edge Function.
-- Rollback: DROP TRIGGER IF EXISTS on_case_status_change ON cases;
--           DROP FUNCTION IF EXISTS notify_case_status_change();

CREATE OR REPLACE FUNCTION notify_case_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only act when the status column actually changes value
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO case_timeline (case_id, actor_id, action, details)
    VALUES (
      NEW.id,
      -- auth.uid() is NULL when called from a cron job or service-role context;
      -- store NULL to represent a system-initiated status change.
      auth.uid(),
      'status_changed',
      jsonb_build_object(
        'old_status', OLD.status::TEXT,
        'new_status', NEW.status::TEXT
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger fires after each row UPDATE that touches the status column
CREATE TRIGGER on_case_status_change
  AFTER UPDATE OF status ON cases
  FOR EACH ROW
  EXECUTE FUNCTION notify_case_status_change();
