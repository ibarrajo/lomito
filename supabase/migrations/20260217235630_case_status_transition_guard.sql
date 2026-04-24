-- BEFORE UPDATE trigger to validate case status transitions
-- Only allowed transitions are permitted. Admins can bypass.
-- Rollback: DROP TRIGGER IF EXISTS validate_status_transition ON cases;
--           DROP FUNCTION IF EXISTS validate_case_status_transition();

CREATE OR REPLACE FUNCTION validate_case_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- No status change — allow
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
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

CREATE TRIGGER validate_status_transition
  BEFORE UPDATE OF status ON cases
  FOR EACH ROW
  EXECUTE FUNCTION validate_case_status_transition();
