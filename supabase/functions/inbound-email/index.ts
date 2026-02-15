// Edge Function to parse inbound government email replies to escalated cases
// Deno Deploy runtime
// Webhook endpoint for Resend inbound email service

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface ResendWebhookPayload {
  type: string;
  created_at: string;
  data: {
    from: string;
    to: string[];
    subject: string;
    text: string;
    html: string;
  };
}

// Extract case ID from reply-to email format: case-{uuid}@reply.lomito.org
function extractCaseId(emailAddress: string): string | null {
  const match = emailAddress.match(/^case-([a-f0-9-]+)@reply\.lomito\.org$/i);
  return match ? match[1] : null;
}

/**
 * Validates webhook signature using HMAC-SHA256
 * Resend uses Svix webhooks which send svix-signature header
 * Format: "v1,signature1 v1,signature2 ..."
 */
async function validateWebhookSignature(
  rawBody: string,
  signature: string | null,
  timestamp: string | null,
  secret: string | null,
): Promise<boolean> {
  if (!secret) {
    console.warn(
      'INBOUND_EMAIL_WEBHOOK_SECRET not configured, skipping signature validation',
    );
    return true;
  }

  if (!signature || !timestamp) {
    return false;
  }

  // Parse signature header (Svix format: "v1,sig1 v1,sig2")
  const signatures = signature
    .split(' ')
    .map((s) => {
      const parts = s.split(',');
      return parts.length === 2 && parts[0] === 'v1' ? parts[1] : null;
    })
    .filter((s) => s !== null);

  if (signatures.length === 0) {
    return false;
  }

  // Build the message to sign: "{timestamp}.{body}"
  const message = `${timestamp}.${rawBody}`;

  // Compute HMAC-SHA256
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signatureBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message),
  );

  // Convert to base64
  const computedSignature = btoa(
    String.fromCharCode(...new Uint8Array(signatureBytes)),
  );

  // Check if computed signature matches any of the provided signatures
  return signatures.some((sig) => sig === computedSignature);
}

serve(async (req) => {
  try {
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

    // Get raw body for signature validation
    const rawBody = await req.text();

    // Validate webhook signature if secret is configured
    const webhookSecret = Deno.env.get('INBOUND_EMAIL_WEBHOOK_SECRET') ?? null;
    const signature = req.headers.get('svix-signature');
    const timestamp = req.headers.get('svix-timestamp');

    const isValidSignature = await validateWebhookSignature(
      rawBody,
      signature,
      timestamp,
      webhookSecret,
    );
    if (!isValidSignature) {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook signature' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Parse webhook payload
    const payload: ResendWebhookPayload = JSON.parse(rawBody);

    // We only care about email.received events
    if (payload.type !== 'email.received') {
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailData = payload.data;
    const { from, to, subject, text, html } = emailData;

    // Extract case ID from the 'to' address
    let caseId: string | null = null;
    for (const recipient of to) {
      caseId = extractCaseId(recipient);
      if (caseId) break;
    }

    if (!caseId) {
      return new Response(
        JSON.stringify({
          error: 'No valid case ID found in recipient address',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the case exists and was escalated
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id, escalated_at')
      .eq('id', caseId)
      .single();

    if (caseError || !caseData) {
      return new Response(JSON.stringify({ error: 'Case not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!caseData.escalated_at) {
      return new Response(JSON.stringify({ error: 'Case was not escalated' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insert record into inbound_emails table
    const { error: emailInsertError } = await supabase
      .from('inbound_emails')
      .insert({
        case_id: caseId,
        from_email: from,
        subject: subject || null,
        body_text: text,
        received_at: new Date().toISOString(),
      });

    if (emailInsertError) {
      console.error('Error inserting inbound email:', emailInsertError);
      return new Response(
        JSON.stringify({ error: 'Failed to log inbound email' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Truncate response text to 2000 chars for timeline
    const truncatedText =
      text.length > 2000 ? text.substring(0, 2000) + '...' : text;

    // Create case_timeline event with action='government_response'
    const { error: timelineError } = await supabase
      .from('case_timeline')
      .insert({
        case_id: caseId,
        actor_id: null, // No actor_id for external government response
        action: 'government_response',
        details: {
          from_email: from,
          subject: subject,
          response_text: truncatedText,
          received_at: new Date().toISOString(),
        },
      });

    if (timelineError) {
      console.error('Error creating timeline event:', timelineError);
    }

    // Update cases.government_response_at
    const { error: updateError } = await supabase
      .from('cases')
      .update({
        government_response_at: new Date().toISOString(),
      })
      .eq('id', caseId);

    if (updateError) {
      console.error('Error updating case:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        case_id: caseId,
        from: from,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error processing inbound email:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
