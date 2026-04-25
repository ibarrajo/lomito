import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { NotificationPreferences } from '@lomito/shared/types/database';
import { captureError } from '../lib/analytics';

interface UseNotificationPrefsResult {
  prefs: NotificationPreferences | null;
  updatePref: (key: keyof NotificationPreferences, value: boolean) => void;
  loading: boolean;
}

const DEFAULT_PREFS: NotificationPreferences = {
  push_enabled: true,
  email_enabled: true,
  own_case_updates: true,
  flagged_cases: false,
};

export function useNotificationPrefs(): UseNotificationPrefsResult {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchPrefs() {
      try {
        setLoading(true);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setPrefs(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('notification_preferences')
          .eq('id', user.id)
          .single();

        if (error) {
          captureError(error, 'fetching_notification_preferences_failed');
          setPrefs(DEFAULT_PREFS);
          return;
        }

        // If preferences don't exist, use defaults
        const profileData = data as {
          notification_preferences: NotificationPreferences | null;
        };
        if (!profileData?.notification_preferences) {
          setPrefs(DEFAULT_PREFS);
        } else {
          setPrefs(profileData.notification_preferences);
        }
      } catch (err) {
        captureError(err, 'unexpected_fetching_preferences');
        setPrefs(DEFAULT_PREFS);
      } finally {
        setLoading(false);
      }
    }

    fetchPrefs();
  }, []);

  const updatePref = useCallback(
    (key: keyof NotificationPreferences, value: boolean) => {
      // Optimistically update local state
      setPrefs((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          [key]: value,
        };
      });

      // Debounce database update
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) return;

          const { error } = await supabase
            .from('profiles')
            .update({
              notification_preferences: {
                ...prefs,
                [key]: value,
              },
            })
            .eq('id', user.id);

          if (error) {
            captureError(error, 'updating_notification_preferences_failed');
            // Revert optimistic update on error
            setPrefs((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                [key]: !value,
              };
            });
          }
        } catch (err) {
          captureError(err, 'unexpected_updating_preferences');
          // Revert optimistic update on error
          setPrefs((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              [key]: !value,
            };
          });
        }
      }, 500);
    },
    [prefs],
  );

  return {
    prefs,
    updatePref,
    loading,
  };
}
