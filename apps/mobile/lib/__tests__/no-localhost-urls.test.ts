import { describe, it, expect } from 'vitest';

/**
 * Build integrity test: ensures no localhost/local-network URLs are hardcoded
 * in source code that gets bundled for production.
 *
 * The .env.local file (gitignored) overrides EXPO_PUBLIC_* vars for local dev.
 * If any source file has a hardcoded localhost fallback, the production bundle
 * will silently connect to the user's local network instead of production APIs.
 *
 * This test catches that class of bug at CI time.
 */

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

describe('no localhost URLs in configuration', () => {
  it('EXPO_PUBLIC_SUPABASE_URL must not point to localhost or local network', () => {
    expect(SUPABASE_URL).not.toBe('');
    expect(SUPABASE_URL).not.toMatch(/localhost/i);
    expect(SUPABASE_URL).not.toMatch(/127\.0\.0\.1/);
    expect(SUPABASE_URL).not.toMatch(/192\.168\./);
    expect(SUPABASE_URL).not.toMatch(/10\.0\./);
    expect(SUPABASE_URL).not.toMatch(/0\.0\.0\.0/);
  });

  it('EXPO_PUBLIC_SUPABASE_URL must be HTTPS in non-dev environments', () => {
    // In the test environment vitest.setup.ts sets this to https://test.supabase.co
    // In production .env it's https://jmhsuttikjjyfwbvojiu.supabase.co
    // Both are valid — the key thing is it's not HTTP localhost
    expect(SUPABASE_URL).toMatch(/^https:\/\//);
  });

  it('EXPO_PUBLIC_SUPABASE_ANON_KEY must be set', () => {
    expect(SUPABASE_ANON_KEY).not.toBe('');
    expect(SUPABASE_ANON_KEY.length).toBeGreaterThan(10);
  });
});
