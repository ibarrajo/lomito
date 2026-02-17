/**
 * useDeleteAccount Hook
 * Calls the delete-account Edge Function, then signs out and navigates home.
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

interface UseDeleteAccountResult {
  deleteAccount: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useDeleteAccount(): UseDeleteAccountResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const deleteAccount = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: functionError } = await supabase.functions.invoke(
        'delete-account',
        { body: {} },
      );

      if (functionError) {
        throw functionError;
      }

      if (data?.error) {
        throw new Error(data.error as string);
      }

      // Sign out the now-deleted session
      await supabase.auth.signOut();

      router.replace('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete account';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  return {
    deleteAccount,
    loading,
    error,
  };
}
