export const ALLOWED_ORIGINS = [
  'https://lomito.org',
  'https://www.lomito.org',
  'http://localhost:8081',
  'http://localhost:19006',
];

export const MAX_EVENTS_PER_REQUEST = 25;

/** Maximum length (chars) for any event parameter string value. */
const MAX_PARAM_VALUE_LENGTH = 500;

/** Maximum allowed depth for user_properties nested objects. */
const MAX_USER_PROPERTIES_DEPTH = 2;

/** Valid key pattern for user_properties keys (matches GA4 conventions). */
const USER_PROPERTY_KEY_RE = /^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/;

/** Standard UUID v4 pattern. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface AnalyticsEvent {
  name: string;
  params?: Record<string, string>;
}

export interface AnalyticsPayload {
  client_id: string;
  user_id?: string;
  user_properties?: Record<string, { value: string }>;
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

/**
 * Returns the nesting depth of a plain object.
 * Primitive values have depth 0; { a: 1 } has depth 1; { a: { b: 1 } } has depth 2.
 */
function objectDepth(obj: unknown): number {
  if (typeof obj !== 'object' || obj === null) return 0;
  return (
    1 +
    Math.max(
      0,
      ...Object.values(obj as Record<string, unknown>).map(objectDepth),
    )
  );
}

/**
 * Validates user_properties:
 * - All keys must match USER_PROPERTY_KEY_RE
 * - Object depth must not exceed MAX_USER_PROPERTIES_DEPTH
 */
function isValidUserProperties(
  props: unknown,
): props is Record<string, { value: string }> {
  if (typeof props !== 'object' || props === null) return false;
  for (const [key, val] of Object.entries(props as Record<string, unknown>)) {
    if (!USER_PROPERTY_KEY_RE.test(key)) return false;
    if (
      typeof val !== 'object' ||
      val === null ||
      typeof (val as Record<string, unknown>).value !== 'string'
    ) {
      return false;
    }
    // Depth check: the property wrapper { value: string } counts as depth 1.
    // We allow nesting up to MAX_USER_PROPERTIES_DEPTH inside `value`.
    if (objectDepth(val) > MAX_USER_PROPERTIES_DEPTH) return false;
  }
  return true;
}

/**
 * Validates that all params values are strings within the length cap.
 */
function isValidEventParams(params: unknown): params is Record<string, string> {
  if (typeof params !== 'object' || params === null) return false;
  for (const val of Object.values(params as Record<string, unknown>)) {
    if (typeof val !== 'string') return false;
    if (val.length > MAX_PARAM_VALUE_LENGTH) return false;
  }
  return true;
}

export function isValidPayload(body: unknown): body is AnalyticsPayload {
  if (typeof body !== 'object' || body === null) return false;
  const payload = body as Record<string, unknown>;
  if (typeof payload.client_id !== 'string' || !payload.client_id) return false;
  if (!Array.isArray(payload.events) || payload.events.length === 0)
    return false;
  if (payload.events.length > MAX_EVENTS_PER_REQUEST) return false;

  // Validate user_id is a UUID when present
  if (payload.user_id !== undefined) {
    if (typeof payload.user_id !== 'string' || !UUID_RE.test(payload.user_id)) {
      return false;
    }
  }

  // Validate user_properties when present
  if (payload.user_properties !== undefined) {
    if (!isValidUserProperties(payload.user_properties)) return false;
  }

  return payload.events.every((event: unknown) => {
    if (
      typeof event !== 'object' ||
      event === null ||
      typeof (event as Record<string, unknown>).name !== 'string' ||
      (event as Record<string, unknown>).name === ''
    ) {
      return false;
    }
    const params = (event as Record<string, unknown>).params;
    if (params !== undefined && !isValidEventParams(params)) return false;
    return true;
  });
}
