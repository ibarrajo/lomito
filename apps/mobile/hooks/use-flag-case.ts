/**
 * useFlagCase Hook
 * Handles community flagging of cases with duplicate prevention.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './use-auth';

interface FlagCaseResult {
  flagCase: (caseId: string, reason: string) => Promise<void>;
  hasUserFlagged: boolean;
  loading: boolean;
  error: string | null;
  alreadyFlagged: boolean;
}

export function useFlagCase(caseId: string): FlagCaseResult {
  const { user } = useAuth();
  const [hasUserFlagged, setHasUserFlagged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alreadyFlagged, setAlreadyFlagged] = useState(false);

  // Check if the current user has already flagged this case
  const checkIfFlagged = useCallback(async () => {
    if (!user || !caseId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: checkError } = await supabase
        .from('case_flags')
        .select('id')
        .eq('case_id', caseId)
        .eq('reporter_id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      setHasUserFlagged(!!data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to check flag status';
      setError(errorMessage);
      console.error('Error checking flag status:', err);
    } finally {
      setLoading(false);
    }
  }, [user, caseId]);

  useEffect(() => {
    checkIfFlagged();
  }, [checkIfFlagged]);

  // Flag a case
  const flagCase = useCallback(
    async (caseIdToFlag: string, reason: string) => {
      if (!user) {
        setError('Must be logged in to flag cases');
        return;
      }

      setLoading(true);
      setError(null);
      setAlreadyFlagged(false);

      try {
        const { error: insertError } = await supabase
          .from('case_flags')
          .insert({
            case_id: caseIdToFlag,
            reporter_id: user.id,
            reason,
          } as never);

        if (insertError) {
          // Check if it's a unique constraint violation (user already flagged)
          if (insertError.code === '23505') {
            setAlreadyFlagged(true);
            setHasUserFlagged(true);
            setError('You have already flagged this case');
            return;
          }
          throw insertError;
        }

        setHasUserFlagged(true);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to flag case';
        setError(errorMessage);
        console.error('Error flagging case:', err);
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  return {
    flagCase,
    hasUserFlagged,
    loading,
    error,
    alreadyFlagged,
  };
}
