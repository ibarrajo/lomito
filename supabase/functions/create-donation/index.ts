/**
 * Create Donation Edge Function
 * Creates a Mercado Pago checkout preference and inserts pending donation record.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

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
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { amount, paymentMethod, donorId, recurring = false }: CreateDonationRequest = await req.json();

    // Validate input
    if (!amount || amount < 10) {
      return new Response(JSON.stringify({ error: 'Minimum donation amount is $10 MXN' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN not configured');
      return new Response(JSON.stringify({ error: 'Payment provider not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
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
      return new Response(JSON.stringify({ error: 'Failed to create donation record' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
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
        excluded_payment_types: [{ id: 'credit_card' }, { id: 'debit_card' }, { id: 'bank_transfer' }],
      };
    } else if (paymentMethod === 'spei') {
      preference.payment_methods = {
        excluded_payment_types: [{ id: 'credit_card' }, { id: 'debit_card' }, { id: 'ticket' }],
      };
    } else {
      // mercado_pago (card payments)
      preference.payment_methods = {
        installments: 1,
      };
    }

    // Create Mercado Pago checkout preference
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    if (!mpResponse.ok) {
      const errorData = await mpResponse.text();
      console.error('Mercado Pago API error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to create payment checkout' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
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
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
