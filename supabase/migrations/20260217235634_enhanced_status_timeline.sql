-- Enhanced status change trigger with action-specific values and rejection reason support
-- Replaces the basic notify_case_status_change() from migration 20250218000002
-- Rollback: Restore original notify_case_status_change() from 20250218000002

CREATE OR REPLACE FUNCTION notify_case_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_action TEXT;
  v_details JSONB;
  v_reason TEXT;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  -- Determine action based on transition
  IF NEW.status = 'verified' THEN
    v_action := 'verified';
  ELSIF NEW.status = 'rejected' THEN
    v_action := 'rejected';
    v_reason := current_setting('app.rejection_reason', true);
  ELSIF NEW.status = 'archived' THEN
    v_action := 'archived';
  ELSE
    v_action := 'status_changed';
  END IF;

  v_details := jsonb_build_object(
    'old_status', OLD.status::TEXT,
    'new_status', NEW.status::TEXT
  );

  IF v_reason IS NOT NULL AND v_reason != '' THEN
    v_details := v_details || jsonb_build_object('reason', v_reason);
  END IF;

  INSERT INTO case_timeline (case_id, actor_id, action, details)
  VALUES (NEW.id, auth.uid(), v_action, v_details);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC helper to set rejection reason as a session variable before updating case status
CREATE OR REPLACE FUNCTION set_rejection_reason(p_reason TEXT)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.rejection_reason', p_reason, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION set_rejection_reason(TEXT) TO authenticated;
