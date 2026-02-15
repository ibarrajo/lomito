import { Platform } from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const BATCH_INTERVAL_MS = 2000;
const MAX_BATCH_SIZE = 25;
const CLIENT_ID_KEY = 'lomito_analytics_client_id';

interface AnalyticsEvent {
  name: string;
  params?: Record<string, string>;
}

let clientId: string | null = null;
let eventQueue: AnalyticsEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getClientId(): string {
  if (clientId) return clientId;

  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(CLIENT_ID_KEY);
    if (stored) {
      clientId = stored;
      return clientId;
    }
    clientId = generateUUID();
    localStorage.setItem(CLIENT_ID_KEY, clientId);
    return clientId;
  }

  // Fallback for non-web (not used yet, but safe)
  clientId = generateUUID();
  return clientId;
}

function flush(): void {
  if (eventQueue.length === 0) return;

  const events = [...eventQueue];
  eventQueue = [];
  flushTimer = null;

  const url = `${SUPABASE_URL}/functions/v1/track-event`;

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: getClientId(),
      events,
    }),
  }).catch((err) => {
    console.warn('Analytics send failed:', err);
  });
}

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(flush, BATCH_INTERVAL_MS);
}

export function trackEvent(name: string, params?: Record<string, string>): void {
  if (Platform.OS !== 'web') return;
  if (!SUPABASE_URL) return;

  eventQueue.push({ name, params });

  // Flush immediately if batch is full
  if (eventQueue.length >= MAX_BATCH_SIZE) {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    flush();
  } else {
    scheduleFlush();
  }
}

export function trackPageView(path: string): void {
  trackEvent('page_view', { page_path: path });
}

/** @internal Exposed for testing only. */
export function _resetForTesting(): void {
  clientId = null;
  eventQueue = [];
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
}

/** @internal Exposed for testing only. */
export function _getEventQueue(): readonly AnalyticsEvent[] {
  return eventQueue;
}
