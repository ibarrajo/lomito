import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

interface SignUpMetadata {
  full_name: string;
  phone: string;
  municipality: string;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        session,
        user: session?.user ?? null,
        loading: false,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        session,
        user: session?.user ?? null,
        loading: false,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithOtp = useCallback(async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw error;
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    const siteUrl =
      process.env.EXPO_PUBLIC_SITE_URL ||
      (Platform.OS === 'web' ? window.location.origin : undefined);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        ...(siteUrl ? { emailRedirectTo: siteUrl } : {}),
      },
    });
    if (error) throw error;
  }, []);

  const verifyOtp = useCallback(async (phone: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    if (error) throw error;
  }, []);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    },
    [],
  );

  const signUp = useCallback(
    async (email: string, password: string, metadata: SignUpMetadata) => {
      // Clear any stale session before creating a new account
      await supabase.auth.signOut();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      if (error) throw error;

      // Explicitly create profile as fallback if DB trigger doesn't fire
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert(
          {
            id: data.user.id,
            full_name: metadata.full_name,
            phone: metadata.phone,
            municipality: metadata.municipality,
            role: 'citizen',
            avatar_url: null,
            push_token: null,
          } as never,
          { onConflict: 'id' },
        );
        if (profileError) {
          console.error('Profile creation fallback failed:', profileError);
        }
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  return {
    session: state.session,
    user: state.user,
    loading: state.loading,
    signInWithOtp,
    signInWithMagicLink,
    signInWithPassword,
    verifyOtp,
    signUp,
    signOut,
  };
}
