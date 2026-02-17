import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { CaseStatus } from '@lomito/shared/types/database';

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
        .update({ status: newStatus } as never)
        .eq('id', caseId);

      if (updateError) {
        throw updateError;
      }
    } catch (err) {
      console.error('Error updating case status:', err);
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

      // Set rejection reason as session variable for the DB trigger.
      // Cast required: set_rejection_reason is pending in generated types until
      // migration 20260218100001 is applied and types are regenerated.
      await (
        supabase.rpc as unknown as (
          fn: string,
          args: Record<string, string>,
        ) => Promise<unknown>
      )('set_rejection_reason', { p_reason: reason });

      // Update case status — trigger writes timeline with reason
      const { error: updateError } = await supabase
        .from('cases')
        .update({ status: 'rejected' } as never)
        .eq('id', caseId);

      if (updateError) {
        throw updateError;
      }
    } catch (err) {
      console.error('Error rejecting case:', err);
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
        .update({ status: 'pending' } as never)
        .eq('id', caseId);

      if (updateError) {
        throw updateError;
      }
    } catch (err) {
      console.error('Error reopening case:', err);
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
