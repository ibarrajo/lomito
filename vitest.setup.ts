// Set env vars before any test modules load
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Expo's __DEV__ global
(globalThis as Record<string, unknown>).__DEV__ = true;
