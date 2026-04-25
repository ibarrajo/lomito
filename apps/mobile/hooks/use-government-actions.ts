import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { CaseStatus } from '@lomito/shared/types/database';
import { captureError } from '../lib/analytics';

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
        .update({ folio })
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
          action: 'assigned',
          details: { folio },
        });

      if (timelineError) {
        throw timelineError;
      }
    } catch (err) {
      captureError(err, 'assigning_folio_failed');
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function postResponse(
    caseId: string,
    responseText: string,
  ): Promise<void> {
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
        .update({ government_response_at: new Date().toISOString() })
        .eq('id', caseId);

      if (updateError) {
        throw updateError;
      }

      // Insert timeline event with response
      const { error: timelineError } = await supabase
        .from('case_timeline')
        .insert({
          case_id: caseId,
          actor_id: user.id,
          action: 'government_response',
          details: { response: responseText },
        });

      if (timelineError) {
        throw timelineError;
      }
    } catch (err) {
      captureError(err, 'posting_government_response_failed');
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(
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

  return {
    assignFolio,
    postResponse,
    updateStatus,
    loading,
    error,
  };
}
