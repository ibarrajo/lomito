import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { CaseStatus } from '@lomito/shared/types/database';

interface UseCaseActionsResult {
  updateCaseStatus: (caseId: string, newStatus: CaseStatus) => Promise<void>;
  rejectCase: (caseId: string, reason: string) => Promise<void>;
  flagCase: (caseId: string) => Promise<void>;
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

      // Update case status
      const { error: updateError } = await supabase
        .from('cases')
        .update({ status: newStatus } as never)
        .eq('id', caseId);

      if (updateError) {
        throw updateError;
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Insert timeline event
      const { error: timelineError } = await supabase
        .from('case_timeline')
        .insert({
          case_id: caseId,
          actor_id: user.id,
          action: newStatus === 'verified' ? 'verified' : 'status_changed',
          details: { status: newStatus },
        } as never);

      if (timelineError) {
        throw timelineError;
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

      // Update case status to rejected
      const { error: updateError } = await supabase
        .from('cases')
        .update({ status: 'rejected' } as never)
        .eq('id', caseId);

      if (updateError) {
        throw updateError;
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Insert timeline event with reason
      const { error: timelineError } = await supabase
        .from('case_timeline')
        .insert({
          case_id: caseId,
          actor_id: user.id,
          action: 'rejected',
          details: { reason },
        } as never);

      if (timelineError) {
        throw timelineError;
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

  async function flagCase(caseId: string): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      // Get current flag count
      const { data: caseData, error: fetchError } = await supabase
        .from('cases')
        .select('flag_count')
        .eq('id', caseId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Increment flag count
      const newFlagCount =
        ((caseData as { flag_count: number })?.flag_count ?? 0) + 1;
      const { error: updateError } = await supabase
        .from('cases')
        .update({ flag_count: newFlagCount } as never)
        .eq('id', caseId);

      if (updateError) {
        throw updateError;
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Insert timeline event
      const { error: timelineError } = await supabase
        .from('case_timeline')
        .insert({
          case_id: caseId,
          actor_id: user.id,
          action: 'flagged',
          details: { flag_count: newFlagCount },
        } as never);

      if (timelineError) {
        throw timelineError;
      }
    } catch (err) {
      console.error('Error flagging case:', err);
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
    flagCase,
    loading,
    error,
  };
}
