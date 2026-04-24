-- Allow service-role operations (edge functions, cron jobs) to bypass the
-- case status transition guard. Service-role calls execute with no auth
-- context, so auth.uid() returns NULL. Without this bypass, any service-role
-- UPDATE to cases.status is blocked even when the transition is otherwise valid.
--
-- Rollback: re-apply the original function body from
--           20260218100000_case_status_transition_guard.sql
--           (remove the service-role bypass block below)

CREATE OR REPLACE FUNCTION validate_case_status_transition()
RETURNS TRIGGER AS $$
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
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
