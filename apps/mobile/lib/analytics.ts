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
const SESSION_ID_STORAGE_KEY = 'lomito_ga4_session_id';
const SESSION_LAST_ACTIVE_KEY = 'lomito_ga4_session_last_active';
/** GA4 sessions expire after 30 min of inactivity. */
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Ga4Event {
  name: string;
  params?: Record<string, string>;
}

interface Ga4UserProperties {
  [key: string]: { value: string };
}

// ---------------------------------------------------------------------------
// PostHog instance (module-level singleton, lazily initialized)
// ---------------------------------------------------------------------------

let posthog: PostHog | null = null;

// ---------------------------------------------------------------------------
// GA4 batch queue (web-only)
// ---------------------------------------------------------------------------

let ga4ClientId: string | null = null;
let ga4UserId: string | null = null;
let ga4UserProperties: Ga4UserProperties | null = null;
let ga4Queue: Ga4Event[] = [];
let ga4FlushTimer: ReturnType<typeof setTimeout> | null = null;
let ga4SessionId: string | null = null;
/** Timestamp (epoch ms) of last event — used for engagement_time_msec. */
let ga4SessionLastActive: number = 0;
/** Whether the current session has already emitted a session_start event. */
let ga4SessionStartSent = false;

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
  ga4UserId = userId;
  if (!posthog) return;
  posthog.identify(userId);
}

/**
 * Sets user properties that are attached to subsequent GA4/PostHog events.
 * Call after login when profile data is available.
 *
 * @param properties - Flat key/value pairs (e.g. { role: 'citizen', municipality: 'Tijuana' })
 */
export function setUserProperties(properties: Record<string, string>): void {
  // PostHog: set person properties
  if (posthog) {
    posthog.identify(ga4UserId ?? undefined, properties);
  }

  // GA4: convert to { key: { value: "..." } } format
  ga4UserProperties = {};
  for (const [key, value] of Object.entries(properties)) {
    ga4UserProperties[key] = { value };
  }
}

/**
 * Resets the analytics session (call on logout).
 * PostHog generates a new anonymous ID; GA4 client ID is preserved.
 */
export function resetAnalytics(): void {
  ga4UserId = null;
  ga4UserProperties = null;
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
    ensureGa4Session();

    // Attach session_id and engagement_time_msec — required by GA4 MP
    const now = Date.now();
    const engagementMs = ga4SessionLastActive
      ? Math.max(now - ga4SessionLastActive, 1)
      : 1;
    ga4SessionLastActive = now;
    persistSessionLastActive(now);

    const enrichedParams: Record<string, string> = {
      ...params,
      session_id: ga4SessionId!,
      engagement_time_msec: String(engagementMs),
    };

    ga4Queue.push({ name, params: enrichedParams });

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
 * Includes page_location, page_title, and page_referrer for GA4.
 */
export function trackPageView(path: string): void {
  const extraParams: Record<string, string> = { page_path: path };

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    extraParams.page_location = window.location.href;
    extraParams.page_title = document.title || '';
    if (document.referrer) {
      extraParams.page_referrer = document.referrer;
    }
  }

  trackEvent('page_view', extraParams);
}

// ---------------------------------------------------------------------------
// GA4 session management
// ---------------------------------------------------------------------------

/**
 * Ensures a valid GA4 session exists. Creates a new session (with a
 * session_start event) if none exists or the previous one timed out.
 *
 * GA4 sessions are identified by a numeric session_id (epoch seconds).
 * A session expires after 30 minutes of inactivity.
 */
function ensureGa4Session(): void {
  if (typeof localStorage === 'undefined') {
    if (!ga4SessionId) startNewSession();
    return;
  }

  const now = Date.now();

  // Try to restore an existing session from localStorage
  if (!ga4SessionId) {
    const storedId = localStorage.getItem(SESSION_ID_STORAGE_KEY);
    const storedLastActive = localStorage.getItem(SESSION_LAST_ACTIVE_KEY);
    if (storedId && storedLastActive) {
      const lastActive = parseInt(storedLastActive, 10);
      if (now - lastActive < SESSION_TIMEOUT_MS) {
        ga4SessionId = storedId;
        ga4SessionLastActive = lastActive;
        ga4SessionStartSent = true; // session_start was sent in a previous page load
        return;
      }
    }
  }

  // Check if current session has timed out
  if (
    ga4SessionId &&
    ga4SessionLastActive &&
    now - ga4SessionLastActive >= SESSION_TIMEOUT_MS
  ) {
    startNewSession();
    return;
  }

  // No session yet — start one
  if (!ga4SessionId) {
    startNewSession();
  }
}

function startNewSession(): void {
  // GA4 expects session_id as epoch seconds (numeric string)
  ga4SessionId = String(Math.floor(Date.now() / 1000));
  ga4SessionLastActive = Date.now();
  ga4SessionStartSent = false;

  persistSession();

  // Emit session_start event (GA4 requires this to count sessions)
  if (!ga4SessionStartSent) {
    ga4SessionStartSent = true;
    ga4Queue.push({
      name: 'session_start',
      params: {
        session_id: ga4SessionId,
        engagement_time_msec: '0',
      },
    });
  }
}

function persistSession(): void {
  if (typeof localStorage === 'undefined') return;
  if (ga4SessionId) {
    localStorage.setItem(SESSION_ID_STORAGE_KEY, ga4SessionId);
  }
  localStorage.setItem(SESSION_LAST_ACTIVE_KEY, String(ga4SessionLastActive));
}

function persistSessionLastActive(now: number): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(SESSION_LAST_ACTIVE_KEY, String(now));
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

  // Lazily ensure we have a persistent client ID even if initAnalytics() hasn't run yet
  if (!ga4ClientId) {
    ga4ClientId = getOrCreateWebClientId();
  }
  const clientId = ga4ClientId;
  const url = `${SUPABASE_URL}/functions/v1/track-event`;

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      client_id: clientId,
      ...(ga4UserId ? { user_id: ga4UserId } : {}),
      ...(ga4UserProperties ? { user_properties: ga4UserProperties } : {}),
      events,
    }),
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
  ga4UserId = null;
  ga4UserProperties = null;
  ga4Queue = [];
  ga4SessionId = null;
  ga4SessionLastActive = 0;
  ga4SessionStartSent = false;
  cancelGa4Timer();
}

/** @internal Exposed for testing only. */
export function _getEventQueue(): readonly Ga4Event[] {
  return ga4Queue;
}
