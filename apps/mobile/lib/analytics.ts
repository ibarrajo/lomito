/**
 * Unified Analytics Module
 * Sends events to both PostHog (mobile + web) and GA4 via Supabase Edge Function (web only).
 *
 * Usage:
 *   import { initAnalytics, trackEvent, identifyUser, resetAnalytics } from './analytics';
 *
 *   // Call once at app startup
 *   await initAnalytics();
 *
 *   // Track events anywhere
 *   trackEvent('report_submitted', { category: 'abuse', urgency: 'high' });
 *
 *   // After login
 *   identifyUser(userId);
 *
 *   // After logout
 *   resetAnalytics();
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PostHog from 'posthog-react-native';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const POSTHOG_API_KEY =
  process.env.EXPO_PUBLIC_POSTHOG_API_KEY ??
  'phc_bKpGWgNax2tJ9WoGH9M67WoeQlG6yGc4mjiKveL3QV5';
const POSTHOG_HOST = 'https://us.i.posthog.com';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const GA4_BATCH_INTERVAL_MS = 2000;
const GA4_MAX_BATCH_SIZE = 25;
const CLIENT_ID_STORAGE_KEY = 'lomito_analytics_client_id';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Ga4Event {
  name: string;
  params?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// PostHog instance (module-level singleton, lazily initialized)
// ---------------------------------------------------------------------------

let posthog: PostHog | null = null;

// ---------------------------------------------------------------------------
// GA4 batch queue (web-only)
// ---------------------------------------------------------------------------

let ga4ClientId: string | null = null;
let ga4Queue: Ga4Event[] = [];
let ga4FlushTimer: ReturnType<typeof setTimeout> | null = null;

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

/**
 * Initializes PostHog with the configured API key.
 * Must be called once at app startup (e.g. in _layout.tsx useEffect).
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export async function initAnalytics(): Promise<void> {
  if (posthog) return;

  posthog = new PostHog(POSTHOG_API_KEY, {
    host: POSTHOG_HOST,
    // Capture lifecycle events (app open, install, etc.) automatically
    captureAppLifecycleEvents: true,
  });

  // Wait for PostHog to be ready before proceeding
  await posthog.ready();

  // Seed GA4 client ID on web from localStorage
  if (Platform.OS === 'web') {
    ga4ClientId = getOrCreateWebClientId();
  }

  if (__DEV__) {
    console.log('[Analytics] Initialized (PostHog + GA4)');
  }
}

// ---------------------------------------------------------------------------
// User identification
// ---------------------------------------------------------------------------

/**
 * Associates the current session with a known user ID.
 * Call this after a successful login.
 */
export function identifyUser(userId: string): void {
  if (!posthog) return;
  posthog.identify(userId);
}

/**
 * Resets the analytics session (call on logout).
 * PostHog generates a new anonymous ID; GA4 client ID is preserved.
 */
export function resetAnalytics(): void {
  if (!posthog) return;
  posthog.reset();
}

// ---------------------------------------------------------------------------
// Event tracking
// ---------------------------------------------------------------------------

/**
 * Tracks an event in both PostHog and GA4 (GA4 on web only).
 *
 * @param name   - Lowercase snake_case event name (e.g. 'report_submitted')
 * @param params - Optional flat key/value properties (values must be strings)
 */
export function trackEvent(
  name: string,
  params?: Record<string, string>,
): void {
  // --- PostHog (works on both native and web) ---
  if (posthog) {
    posthog.capture(name, params);
  }

  // --- GA4 via Supabase Edge Function (web only) ---
  if (Platform.OS === 'web' && SUPABASE_URL) {
    ga4Queue.push({ name, params });

    if (ga4Queue.length >= GA4_MAX_BATCH_SIZE) {
      cancelGa4Timer();
      flushGa4();
    } else {
      scheduleGa4Flush();
    }
  }
}

/**
 * Convenience helper for page-view events (web only).
 * Called automatically by _layout.tsx on every route change.
 */
export function trackPageView(path: string): void {
  trackEvent('page_view', { page_path: path });
}

// ---------------------------------------------------------------------------
// GA4 batching helpers
// ---------------------------------------------------------------------------

function getOrCreateWebClientId(): string {
  if (typeof localStorage === 'undefined') return generateUUID();

  const stored = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
  if (stored) return stored;

  const id = generateUUID();
  localStorage.setItem(CLIENT_ID_STORAGE_KEY, id);
  return id;
}

/**
 * Ensures a persistent anonymous client ID exists on native platforms.
 * Reads from AsyncStorage; creates and saves a new UUID if absent.
 */
export async function ensureNativeClientId(): Promise<string> {
  if (ga4ClientId) return ga4ClientId;

  const stored = await AsyncStorage.getItem(CLIENT_ID_STORAGE_KEY);
  if (stored) {
    ga4ClientId = stored;
    return ga4ClientId;
  }

  ga4ClientId = generateUUID();
  await AsyncStorage.setItem(CLIENT_ID_STORAGE_KEY, ga4ClientId);
  return ga4ClientId;
}

function scheduleGa4Flush(): void {
  if (ga4FlushTimer) return;
  ga4FlushTimer = setTimeout(flushGa4, GA4_BATCH_INTERVAL_MS);
}

function cancelGa4Timer(): void {
  if (ga4FlushTimer) {
    clearTimeout(ga4FlushTimer);
    ga4FlushTimer = null;
  }
}

function flushGa4(): void {
  if (ga4Queue.length === 0) return;

  const events = [...ga4Queue];
  ga4Queue = [];
  ga4FlushTimer = null;

  const clientId = ga4ClientId ?? generateUUID();
  const url = `${SUPABASE_URL}/functions/v1/track-event`;

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ client_id: clientId, events }),
  }).catch((err: unknown) => {
    if (__DEV__) {
      console.warn('[Analytics] GA4 send failed:', err);
    }
  });
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ---------------------------------------------------------------------------
// Test helpers (exported for unit tests only)
// ---------------------------------------------------------------------------

/** @internal Exposed for testing only. */
export function _resetForTesting(): void {
  posthog = null;
  ga4ClientId = null;
  ga4Queue = [];
  cancelGa4Timer();
}

/** @internal Exposed for testing only. */
export function _getGa4EventQueue(): readonly Ga4Event[] {
  return ga4Queue;
}
