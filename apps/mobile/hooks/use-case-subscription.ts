/**
 * useCaseSubscription Hook
 * Manages case subscription (follow) functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { captureError } from '../lib/analytics';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const checkSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

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
        captureError(queryError, 'checking_subscription_failed');
        setError(queryError.message);
        setIsSubscribed(false);
      } else {
        setIsSubscribed(!!data);
      }
    } catch (err) {
      captureError(err, 'unexpected_checking_subscription');
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

      const {
        data: { user },
      } = await supabase.auth.getUser();

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
          captureError(deleteError, 'unsubscribing_failed');
          setError(deleteError.message);
        } else {
          setIsSubscribed(false);
        }
      } else {
        // Subscribe
        const { error: insertError } = await (
          supabase.from('case_subscriptions').insert as unknown as (data: {
            case_id: string;
            user_id: string;
          }) => Promise<{ error: { message: string } | null }>
        )({
          case_id: caseId,
          user_id: user.id,
        });

        if (insertError) {
          captureError(insertError, 'subscribing_failed');
          setError(insertError.message);
        } else {
          setIsSubscribed(true);
        }
      }
    } catch (err) {
      captureError(err, 'unexpected_toggling_subscription');
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
