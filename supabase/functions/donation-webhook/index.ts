/**
 * Donation Webhook Edge Function
 * Receives Mercado Pago IPN notifications and updates donation status.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

interface MercadoPagoPayment {
  id: number;
  status: string;
  status_detail: string;
  external_reference: string;
  transaction_amount: number;
  payment_method_id: string;
}

serve(async (req) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Only process payment notifications
    if (topic !== 'payment') {
      return new Response(JSON.stringify({ message: 'Ignored non-payment notification' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch payment details from Mercado Pago API
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!mpResponse.ok) {
      console.error('Failed to fetch payment from Mercado Pago:', await mpResponse.text());
      return new Response(JSON.stringify({ error: 'Failed to fetch payment details' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payment: MercadoPagoPayment = await mpResponse.json();

    // Map Mercado Pago status to our internal status
    let donationStatus = 'pending';
    if (payment.status === 'approved') {
      donationStatus = 'approved';
    } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
      donationStatus = 'rejected';
    } else if (payment.status === 'in_process' || payment.status === 'pending') {
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
      return new Response(JSON.stringify({ error: 'Failed to update donation' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log(`Donation ${payment.external_reference} updated to status: ${donationStatus}`);

    return new Response(
      JSON.stringify({
        message: 'Donation updated successfully',
        donationId: payment.external_reference,
        status: donationStatus,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unexpected error in webhook:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
