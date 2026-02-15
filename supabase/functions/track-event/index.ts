import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders, isValidPayload } from './validation.ts';

serve(async (req: Request) => {
  const origin = req.headers.get('Origin') ?? '';
  const headers = corsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  const measurementId = Deno.env.get('GA4_MEASUREMENT_ID');
  const apiSecret = Deno.env.get('GA4_API_SECRET');

  if (!measurementId || !apiSecret) {
    return new Response(JSON.stringify({ error: 'Analytics not configured' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  if (!isValidPayload(body)) {
    return new Response(
      JSON.stringify({
        error:
          'Invalid payload. Expected { client_id: string, events: Array<{ name: string, params?: Record<string, string> }> } (max 25 events)',
      }),
      {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      },
    );
  }

  const ga4Url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;

  try {
    const ga4Response = await fetch(ga4Url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: body.client_id,
        events: body.events,
      }),
    });

    if (!ga4Response.ok) {
      console.error('GA4 error:', ga4Response.status, await ga4Response.text());
    }
  } catch (err) {
    console.error('Failed to forward to GA4:', err);
  }

  return new Response(null, { status: 204, headers });
});
