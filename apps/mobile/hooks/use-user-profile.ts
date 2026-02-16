import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { UserRole } from '@lomito/shared/types/database';

interface UserProfile {
  id: string;
  full_name: string;
  phone: string | null;
  municipality: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface UseUserProfileResult {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export function useUserProfile(): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      try {
        if (!mounted) return;
        setLoading(true);
        setError(null);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (!user) {
          setProfile(null);
          setLoading(false);
          return;
        }

        const { data, error: queryError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!mounted) return;

        if (queryError) {
          console.error('Error fetching user profile:', queryError);
          setError(queryError.message);
          return;
        }

        if (data) {
          setProfile(data as UserProfile);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Unexpected error fetching profile:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    // Subscribe to auth state changes to refetch profile
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    profile,
    loading,
    error,
  };
}
