import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { NotificationPreferences } from '@lomito/shared/types/database';

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
          console.error('Error fetching notification preferences:', error);
          setPrefs(DEFAULT_PREFS);
          return;
        }

        // If preferences don't exist, use defaults
        const profileData = data as { notification_preferences: NotificationPreferences | null };
        if (!profileData?.notification_preferences) {
          setPrefs(DEFAULT_PREFS);
        } else {
          setPrefs(profileData.notification_preferences);
        }
      } catch (err) {
        console.error('Unexpected error fetching preferences:', err);
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
            } as never)
            .eq('id', user.id);

          if (error) {
            console.error('Error updating notification preferences:', error);
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
          console.error('Unexpected error updating preferences:', err);
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
