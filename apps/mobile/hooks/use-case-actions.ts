import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { CaseStatus } from '@lomito/shared/types/database';
import { captureError } from '../lib/analytics';

interface UseCaseActionsResult {
  updateCaseStatus: (caseId: string, newStatus: CaseStatus) => Promise<void>;
  rejectCase: (caseId: string, reason: string) => Promise<void>;
  reopenCase: (caseId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useCaseActions(): UseCaseActionsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateCaseStatus(
    caseId: string,
    newStatus: CaseStatus,
  ): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('cases')
        .update({ status: newStatus })
        .eq('id', caseId);

      if (updateError) {
        throw updateError;
      }
    } catch (err) {
      captureError(err, 'updating_case_status_failed');
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function rejectCase(caseId: string, reason: string): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      // Single atomic RPC: sets app.rejection_reason session variable and updates
      // case status to 'rejected' in one transaction, so the status-change trigger
      // can read the reason and write it to case_timeline.
      // Cast required: reject_case is pending in generated types until
      // migration 20260217240000 is applied and types are regenerated.
      const { error: rpcError } = await (
        supabase.rpc as unknown as (
          fn: string,
          args: Record<string, string>,
        ) => Promise<{ error: { message: string } | null }>
      )('reject_case', { p_case_id: caseId, p_reason: reason });

      if (rpcError) {
        throw rpcError;
      }
    } catch (err) {
      captureError(err, 'rejecting_case_failed');
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function reopenCase(caseId: string): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('cases')
        .update({ status: 'pending' })
        .eq('id', caseId);

      if (updateError) {
        throw updateError;
      }
    } catch (err) {
      captureError(err, 'reopening_case_failed');
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    updateCaseStatus,
    rejectCase,
    reopenCase,
    loading,
    error,
  };
}
