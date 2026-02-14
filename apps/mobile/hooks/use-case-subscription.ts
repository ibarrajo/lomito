/**
 * useCaseSubscription Hook
 * Manages case subscription (follow) functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface UseCaseSubscriptionResult {
  isSubscribed: boolean;
  loading: boolean;
  error: string | null;
  toggle: () => Promise<void>;
}

export function useCaseSubscription(caseId: string): UseCaseSubscriptionResult {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSubscription();
  }, [caseId]);

  const checkSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsSubscribed(false);
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from('case_subscriptions')
        .select('user_id')
        .eq('case_id', caseId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (queryError) {
        console.error('Error checking subscription:', queryError);
        setError(queryError.message);
        setIsSubscribed(false);
      } else {
        setIsSubscribed(!!data);
      }
    } catch (err) {
      console.error('Unexpected error checking subscription:', err);
      setError('Unexpected error');
      setIsSubscribed(false);
    } finally {
      setLoading(false);
    }
  };

  const toggle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Must be logged in');
        setLoading(false);
        return;
      }

      if (isSubscribed) {
        // Unsubscribe
        const { error: deleteError } = await supabase
          .from('case_subscriptions')
          .delete()
          .eq('case_id', caseId)
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('Error unsubscribing:', deleteError);
          setError(deleteError.message);
        } else {
          setIsSubscribed(false);
        }
      } else {
        // Subscribe
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase
          .from('case_subscriptions')
          .insert as any)({
            case_id: caseId,
            user_id: user.id,
          });

        if (insertError) {
          console.error('Error subscribing:', insertError);
          setError(insertError.message);
        } else {
          setIsSubscribed(true);
        }
      }
    } catch (err) {
      console.error('Unexpected error toggling subscription:', err);
      setError('Unexpected error');
    } finally {
      setLoading(false);
    }
  }, [caseId, isSubscribed]);

  return {
    isSubscribed,
    loading,
    error,
    toggle,
  };
}
