/**
 * Donation Webhook Edge Function
 * Receives Mercado Pago IPN notifications and updates donation status.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const MERCADO_PAGO_ACCESS_TOKEN =
  Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN') ?? '';
const MERCADO_PAGO_WEBHOOK_SECRET =
  Deno.env.get('MERCADO_PAGO_WEBHOOK_SECRET') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface MercadoPagoPayment {
  id: number;
  status: string;
  status_detail: string;
  external_reference: string;
  transaction_amount: number;
  payment_method_id: string;
}

/**
 * Validates Mercado Pago webhook signature using HMAC-SHA256
 * Signature format: "ts=...,v1=..."
 */
async function validateMercadoPagoSignature(
  req: Request,
  dataId: string,
): Promise<boolean> {
  if (!MERCADO_PAGO_WEBHOOK_SECRET) {
    console.warn(
      'MERCADO_PAGO_WEBHOOK_SECRET not configured, skipping signature validation',
    );
    return true;
  }

  const signature = req.headers.get('x-signature');
  const requestId = req.headers.get('x-request-id');

  if (!signature || !requestId) {
    return false;
  }

  // Parse signature header: "ts=1234567890,v1=abc123..."
  const parts = signature.split(',').reduce(
    (acc, part) => {
      const [key, value] = part.split('=');
      if (key && value) {
        acc[key.trim()] = value.trim();
      }
      return acc;
    },
    {} as Record<string, string>,
  );

  const timestamp = parts.ts;
  const hash = parts.v1;

  if (!timestamp || !hash) {
    return false;
  }

  // Build the message to sign: "id:{data.id};request-id:{requestId};ts:{ts};"
  const message = `id:${dataId};request-id:${requestId};ts:${timestamp};`;

  // Compute HMAC-SHA256
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(MERCADO_PAGO_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signatureBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message),
  );

  // Convert to hex string
  const computedHash = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return computedHash === hash;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();

    // Mercado Pago sends topic and id in the notification
    const { topic, id } = body;

    if (!topic || !id) {
      console.error('Missing topic or id in webhook payload');
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate webhook signature
    const isValidSignature = await validateMercadoPagoSignature(req, id);
    if (!isValidSignature) {
      console.error('Invalid webhook signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Only process payment notifications
    if (topic !== 'payment') {
      return new Response(
        JSON.stringify({ message: 'Ignored non-payment notification' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Fetch payment details from Mercado Pago API
    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${id}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!mpResponse.ok) {
      console.error(
        'Failed to fetch payment from Mercado Pago:',
        await mpResponse.text(),
      );
      return new Response(
        JSON.stringify({ error: 'Failed to fetch payment details' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const payment: MercadoPagoPayment = await mpResponse.json();

    // Map Mercado Pago status to our internal status
    let donationStatus = 'pending';
    if (payment.status === 'approved') {
      donationStatus = 'approved';
    } else if (
      payment.status === 'rejected' ||
      payment.status === 'cancelled'
    ) {
      donationStatus = 'rejected';
    } else if (
      payment.status === 'in_process' ||
      payment.status === 'pending'
    ) {
      donationStatus = 'pending';
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Update donation record by external_reference (our donation ID)
    const { error: updateError } = await supabase
      .from('donations')
      .update({
        status: donationStatus,
      })
      .eq('id', payment.external_reference);

    if (updateError) {
      console.error('Error updating donation status:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update donation' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    console.log(
      `Donation ${payment.external_reference} updated to status: ${donationStatus}`,
    );

    return new Response(
      JSON.stringify({
        message: 'Donation updated successfully',
        donationId: payment.external_reference,
        status: donationStatus,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Unexpected error in webhook:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
