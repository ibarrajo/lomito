-- Atomic reject_case RPC that sets the session variable and updates case status
-- in a single transaction, replacing the broken two-call pattern (set_rejection_reason + update).
-- Rollback: DROP FUNCTION IF EXISTS reject_case(UUID, TEXT);
--           Restore set_rejection_reason grant if needed.

-- Create the atomic reject_case function
CREATE OR REPLACE FUNCTION reject_case(p_case_id UUID, p_reason TEXT)
RETURNS void AS $$
BEGIN
  -- Set the rejection reason session variable so the status change trigger can read it.
  -- Using true (transaction-local) so it is scoped to this transaction only.
  PERFORM set_config('app.rejection_reason', p_reason, true);

  -- Update case status to rejected in the same transaction.
  -- The AFTER UPDATE trigger notify_case_status_change() will read the session
  -- variable and write the rejection reason into the case_timeline details.
  UPDATE cases
  SET status = 'rejected'
  WHERE id = p_case_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Case % not found', p_case_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

GRANT EXECUTE ON FUNCTION reject_case(UUID, TEXT) TO authenticated;

-- Drop the old standalone set_rejection_reason function — it cannot work across
-- separate PostgREST transactions and is replaced by reject_case above.
DROP FUNCTION IF EXISTS set_rejection_reason(TEXT);
