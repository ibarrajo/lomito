-- Migration: add UPDATE policy for case_subscriptions
-- Required for upsert (onConflict) to work when the DB trigger already
-- created the row. PostgREST needs UPDATE permission to perform the
-- conflict-resolution UPDATE branch of an upsert.

-- Rollback: DROP POLICY case_subscriptions_update_own ON public.case_subscriptions;

CREATE POLICY case_subscriptions_update_own ON public.case_subscriptions
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
