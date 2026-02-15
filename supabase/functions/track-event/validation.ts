export const ALLOWED_ORIGINS = [
  'https://lomito.org',
  'https://www.lomito.org',
  'http://localhost:8081',
  'http://localhost:19006',
];

export const MAX_EVENTS_PER_REQUEST = 25;

export interface AnalyticsEvent {
  name: string;
  params?: Record<string, string>;
}

export interface AnalyticsPayload {
  client_id: string;
  events: AnalyticsEvent[];
}

export function corsHeaders(origin: string): Record<string, string> {
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return {};
  }
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
  };
}

export function isValidPayload(body: unknown): body is AnalyticsPayload {
  if (typeof body !== 'object' || body === null) return false;
  const payload = body as Record<string, unknown>;
  if (typeof payload.client_id !== 'string' || !payload.client_id) return false;
  if (!Array.isArray(payload.events) || payload.events.length === 0)
    return false;
  if (payload.events.length > MAX_EVENTS_PER_REQUEST) return false;
  return payload.events.every(
    (event: unknown) =>
      typeof event === 'object' &&
      event !== null &&
      typeof (event as Record<string, unknown>).name === 'string' &&
      (event as Record<string, unknown>).name !== '',
  );
}
