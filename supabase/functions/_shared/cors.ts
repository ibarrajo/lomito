/**
 * Shared CORS helpers for Lomito edge functions.
 *
 * Only browser-facing functions should call these helpers.
 * Server-to-server functions (donation-webhook, auto-escalation-check,
 * inbound-email) skip origin checks because they receive requests from
 * third-party services that do not send an Origin header.
 */

const ALLOWED_ORIGINS = ['https://lomito.org', 'https://www.lomito.org'];

/**
 * Returns CORS response headers scoped to the requesting origin.
 * Returns an empty object when the origin is not in the allowlist —
 * the caller should then respond with 403.
 */
export function corsHeadersFor(origin: string | null): Record<string, string> {
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

/**
 * Returns true when origin is present and in the allowlist.
 */
export function isAllowedOrigin(origin: string | null): boolean {
  return !!origin && ALLOWED_ORIGINS.includes(origin);
}
