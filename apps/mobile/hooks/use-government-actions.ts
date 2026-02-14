import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { CaseStatus } from '@lomito/shared/types/database';

interface UseGovernmentActionsResult {
  assignFolio: (caseId: string, folio: string) => Promise<void>;
  postResponse: (caseId: string, responseText: string) => Promise<void>;
  updateStatus: (caseId: string, newStatus: CaseStatus) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useGovernmentActions(): UseGovernmentActionsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function assignFolio(caseId: string, folio: string): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      // Update case folio
      const { error: updateError } = await supabase
        .from('cases')
        .update({ folio } as never)
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
      const { error: timelineError } = await supabase.from('case_timeline').insert({
        case_id: caseId,
        actor_id: user.id,
        action: 'assigned',
        details: { folio },
      } as never);

      if (timelineError) {
        throw timelineError;
      }
    } catch (err) {
      console.error('Error assigning folio:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function postResponse(caseId: string, responseText: string): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update government_response_at timestamp
      const { error: updateError } = await supabase
        .from('cases')
        .update({ government_response_at: new Date().toISOString() } as never)
        .eq('id', caseId);

      if (updateError) {
        throw updateError;
      }

      // Insert timeline event with response
      const { error: timelineError } = await supabase.from('case_timeline').insert({
        case_id: caseId,
        actor_id: user.id,
        action: 'government_response',
        details: { response: responseText },
      } as never);

      if (timelineError) {
        throw timelineError;
      }
    } catch (err) {
      console.error('Error posting government response:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(caseId: string, newStatus: CaseStatus): Promise<void> {
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
      const { error: timelineError } = await supabase.from('case_timeline').insert({
        case_id: caseId,
        actor_id: user.id,
        action: 'status_changed',
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

  return {
    assignFolio,
    postResponse,
    updateStatus,
    loading,
    error,
  };
}
