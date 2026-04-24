/**
 * Create Donation Edge Function
 * Creates a Mercado Pago checkout preference and inserts pending donation record.
 */

// TODO(security): add Turnstile verification before processing donation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeadersFor, isAllowedOrigin } from '../_shared/cors.ts';

const MERCADO_PAGO_ACCESS_TOKEN =
  Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

/** Maximum individual donation in MXN (100,000 MXN). */
const MAX_DONATION_AMOUNT_MXN = 100_000;

/** Maximum donation attempts per IP per hour (in-memory, resets on cold start). */
const MAX_DONATIONS_PER_HOUR = 5;

/** In-memory rate limit store: ip -> list of timestamps. */
const rateLimitStore = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - 3_600_000; // 1 hour
  const hits = (rateLimitStore.get(ip) ?? []).filter((t) => t > windowStart);
  if (hits.length >= MAX_DONATIONS_PER_HOUR) return true;
  hits.push(now);
  rateLimitStore.set(ip, hits);
  return false;
}

interface CreateDonationRequest {
  amount: number;
  paymentMethod: 'mercado_pago' | 'oxxo' | 'spei';
  donorId?: string;
  recurring?: boolean;
}

interface MercadoPagoPreference {
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
  }>;
  payment_methods?: {
    excluded_payment_types?: Array<{ id: string }>;
    installments?: number;
  };
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return?: string;
  external_reference?: string;
  notification_url?: string;
}

serve(async (req) => {
  const origin = req.headers.get('Origin');
  const corsHeaders = corsHeadersFor(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    if (!isAllowedOrigin(origin)) {
      return new Response(null, { status: 403 });
    }
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Reject requests from non-allowlisted origins
  if (origin && !isAllowedOrigin(origin)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Rate limiting: keyed by caller IP
  const callerIp =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (callerIp !== 'unknown' && isRateLimited(callerIp)) {
    return new Response(
      JSON.stringify({ error: 'Too many donation requests. Try again later.' }),
      {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  try {
    const {
      amount,
      paymentMethod,
      donorId,
      recurring = false,
    }: CreateDonationRequest = await req.json();

    // Validate minimum amount
    if (!amount || amount < 10) {
      return new Response(
        JSON.stringify({ error: 'Minimum donation amount is $10 MXN' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Validate maximum amount ceiling
    if (amount > MAX_DONATION_AMOUNT_MXN) {
      return new Response(
        JSON.stringify({
          error: `Maximum donation amount is $${MAX_DONATION_AMOUNT_MXN.toLocaleString()} MXN`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Payment provider not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Validate donorId against the JWT when provided
    const authHeader = req.headers.get('authorization');
    const jwt = authHeader?.replace('Bearer ', '') ?? null;

    if (donorId) {
      if (!jwt) {
        return new Response(
          JSON.stringify({
            error: 'Authorization header required when donorId is provided',
          }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }

      // Verify JWT and confirm the user owns this donorId
      const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
      });
      const { data: userData, error: userError } =
        await supabaseAnon.auth.getUser(jwt);

      if (userError || !userData.user) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired token' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }

      if (userData.user.id !== donorId) {
        return new Response(
          JSON.stringify({
            error: 'donorId does not match authenticated user',
          }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }
    }

    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Create pending donation record
    const { data: donation, error: insertError } = await supabase
      .from('donations')
      .insert({
        amount,
        currency: 'MXN',
        method: paymentMethod,
        donor_id: donorId || null,
        recurring,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError || !donation) {
      console.error('Error inserting donation:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create donation record' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Build Mercado Pago preference based on payment method
    const preference: MercadoPagoPreference = {
      items: [
        {
          title: 'Donación a Lomito',
          quantity: 1,
          unit_price: amount,
          currency_id: 'MXN',
        },
      ],
      external_reference: donation.id,
      notification_url: `${SUPABASE_URL}/functions/v1/donation-webhook`,
      back_urls: {
        success: `lomito://donate/success?donation_id=${donation.id}`,
        failure: `lomito://donate/failure?donation_id=${donation.id}`,
        pending: `lomito://donate/pending?donation_id=${donation.id}`,
      },
      auto_return: 'approved',
    };

    // Configure payment method constraints
    if (paymentMethod === 'oxxo') {
      preference.payment_methods = {
        excluded_payment_types: [
          { id: 'credit_card' },
          { id: 'debit_card' },
          { id: 'bank_transfer' },
        ],
      };
    } else if (paymentMethod === 'spei') {
      preference.payment_methods = {
        excluded_payment_types: [
          { id: 'credit_card' },
          { id: 'debit_card' },
          { id: 'ticket' },
        ],
      };
    } else {
      // mercado_pago (card payments)
      preference.payment_methods = {
        installments: 1,
      };
    }

    // Create Mercado Pago checkout preference
    const mpResponse = await fetch(
      'https://api.mercadopago.com/checkout/preferences',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preference),
      },
    );

    if (!mpResponse.ok) {
      const errorData = await mpResponse.text();
      console.error('Mercado Pago API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to create payment checkout' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const mpData = await mpResponse.json();

    // Update donation with external_id and payment_url
    const { error: updateError } = await supabase
      .from('donations')
      .update({
        external_id: mpData.id,
        payment_url: mpData.init_point,
      })
      .eq('id', donation.id);

    if (updateError) {
      console.error('Error updating donation with payment URL:', updateError);
    }

    return new Response(
      JSON.stringify({
        donationId: donation.id,
        checkoutUrl: mpData.init_point,
        externalId: mpData.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
