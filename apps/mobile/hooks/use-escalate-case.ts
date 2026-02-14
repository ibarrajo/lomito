/**
 * useEscalateCase Hook
 * Escalates a case to jurisdiction authorities via email.
 */

import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface UseEscalateCaseResult {
  escalateCase: (caseId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useEscalateCase(): UseEscalateCaseResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function escalateCase(caseId: string): Promise<void> {
    try {
      setLoading(true);
      setError(null);

      const { data, error: functionError } = await supabase.functions.invoke(
        'escalate-case',
        {
          body: { caseId },
        },
      );

      if (functionError) {
        throw functionError;
      }

      if (data?.error) {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Error escalating case:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to escalate case';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    escalateCase,
    loading,
    error,
  };
}
