// Edge Function to escalate cases to jurisdiction authorities via Resend API
// Deno Deploy runtime

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_URL = 'https://api.resend.com/emails';

interface EscalatePayload {
  caseId: string;
}

interface Case {
  id: string;
  category: string;
  animal_type: string;
  description: string;
  location: { type: string; coordinates: [number, number] };
  urgency: string;
  jurisdiction_id: string;
  folio: string | null;
  created_at: string;
  escalated_at: string | null;
}

interface Jurisdiction {
  id: string;
  name: string;
  authority_name: string | null;
  authority_email: string | null;
  escalation_enabled: boolean;
}

interface CaseMedia {
  url: string;
  thumbnail_url: string | null;
}

function buildEmailHtml(
  caseData: Case,
  jurisdiction: Jurisdiction,
  mediaUrls: CaseMedia[],
): string {
  const [longitude, latitude] = caseData.location.coordinates;
  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  const folio = caseData.folio || 'Sin folio';
  const createdDate = new Date(caseData.created_at).toLocaleString('es-MX', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const categoryLabels: Record<string, string> = {
    abuse: 'Maltrato',
    stray: 'Animal callejero',
    missing: 'Mascota extraviada',
  };

  const animalTypeLabels: Record<string, string> = {
    dog: 'Perro',
    cat: 'Gato',
    bird: 'Ave',
    other: 'Otro',
  };

  const urgencyLabels: Record<string, string> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    critical: 'Crítica',
  };

  const urgencyColors: Record<string, string> = {
    low: '#718096',
    medium: '#DD6B20',
    high: '#C53030',
    critical: '#9B2C2C',
  };

  const category = categoryLabels[caseData.category] || caseData.category;
  const animalType =
    animalTypeLabels[caseData.animal_type] || caseData.animal_type;
  const urgency = urgencyLabels[caseData.urgency] || caseData.urgency;
  const urgencyColor = urgencyColors[caseData.urgency] || '#718096';

  let photosHtml = '';
  if (mediaUrls.length > 0) {
    photosHtml = `
      <h3 style="color: #1F2328; margin-top: 24px; margin-bottom: 12px;">Fotos adjuntas</h3>
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        ${mediaUrls
          .map(
            (media) => `
          <a href="${media.url}" target="_blank">
            <img
              src="${media.thumbnail_url || media.url}"
              alt="Foto del reporte"
              style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px; border: 1px solid #E2E8F0;"
            />
          </a>
        `,
          )
          .join('')}
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte de bienestar animal - ${folio}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F7F8FA;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
    <div style="background-color: #FFFFFF; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(164, 77, 30, 0.08);">
      <!-- Header -->
      <div style="border-bottom: 2px solid #D4662B; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="color: #D4662B; margin: 0 0 8px 0; font-size: 24px;">Lomito</h1>
        <p style="color: #4A5568; margin: 0; font-size: 14px;">Reporte de bienestar animal</p>
      </div>

      <!-- Case Info -->
      <div style="margin-bottom: 24px;">
        <h2 style="color: #1F2328; margin: 0 0 16px 0; font-size: 20px;">Detalles del reporte</h2>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #4A5568; font-weight: 600;">Folio:</td>
            <td style="padding: 8px 0; color: #1F2328;">${folio}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4A5568; font-weight: 600;">Categoría:</td>
            <td style="padding: 8px 0; color: #1F2328;">${category}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4A5568; font-weight: 600;">Tipo de animal:</td>
            <td style="padding: 8px 0; color: #1F2328;">${animalType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4A5568; font-weight: 600;">Urgencia:</td>
            <td style="padding: 8px 0;">
              <span style="background-color: ${urgencyColor}; color: #FFFFFF; padding: 4px 12px; border-radius: 4px; font-size: 13px; font-weight: 600;">
                ${urgency}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4A5568; font-weight: 600;">Fecha:</td>
            <td style="padding: 8px 0; color: #1F2328;">${createdDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4A5568; font-weight: 600;">Jurisdicción:</td>
            <td style="padding: 8px 0; color: #1F2328;">${jurisdiction.name}</td>
          </tr>
        </table>
      </div>

      <!-- Description -->
      <div style="margin-bottom: 24px;">
        <h3 style="color: #1F2328; margin: 0 0 12px 0;">Descripción</h3>
        <p style="color: #4A5568; margin: 0; line-height: 1.6;">${caseData.description}</p>
      </div>

      <!-- Location -->
      <div style="margin-bottom: 24px;">
        <h3 style="color: #1F2328; margin: 0 0 12px 0;">Ubicación</h3>
        <p style="color: #4A5568; margin: 0 0 8px 0;">
          Coordenadas: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
        </p>
        <a
          href="${googleMapsUrl}"
          target="_blank"
          style="display: inline-block; background-color: #1A6B54; color: #FFFFFF; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 8px;"
        >
          Ver en Google Maps
        </a>
      </div>

      ${photosHtml}

      <!-- Footer -->
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #E2E8F0;">
        <p style="color: #718096; font-size: 13px; margin: 0 0 8px 0;">
          Este reporte fue escalado automáticamente desde la plataforma Lomito.
        </p>
        <p style="color: #718096; font-size: 13px; margin: 0;">
          Para responder a este caso, por favor responda directamente a este correo.
        </p>
      </div>
    </div>

    <div style="text-align: center; margin-top: 16px;">
      <p style="color: #718096; font-size: 12px; margin: 0;">
        <a href="https://lomito.org" style="color: #D4662B; text-decoration: none;">lomito.org</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

serve(async (req) => {
  try {
    // CORS headers
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, content-type',
        },
      });
    }

    // Parse request body
    const payload: EscalatePayload = await req.json();
    const { caseId } = payload;

    if (!caseId) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: caseId' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch case with jurisdiction data
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select(
        `
        *,
        jurisdiction:jurisdictions (
          id,
          name,
          authority_name,
          authority_email,
          escalation_enabled
        )
      `,
      )
      .eq('id', caseId)
      .single();

    if (caseError || !caseData) {
      return new Response(
        JSON.stringify({ error: 'Case not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Check if already escalated
    if (caseData.escalated_at) {
      return new Response(
        JSON.stringify({ error: 'Case already escalated' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const jurisdiction = caseData.jurisdiction as unknown as Jurisdiction;

    // Validate jurisdiction has escalation enabled
    if (!jurisdiction || !jurisdiction.escalation_enabled) {
      return new Response(
        JSON.stringify({
          error: 'Escalation not enabled for this jurisdiction',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Validate jurisdiction has authority email
    if (!jurisdiction.authority_email) {
      return new Response(
        JSON.stringify({
          error: 'No authority email configured for this jurisdiction',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Fetch case media
    const { data: mediaRecords, error: mediaError } = await supabase
      .from('case_media')
      .select('url, thumbnail_url')
      .eq('case_id', caseId)
      .order('sort_order', { ascending: true })
      .limit(5);

    if (mediaError) {
      console.error('Error fetching media:', mediaError);
    }

    const media = (mediaRecords || []) as CaseMedia[];

    // Build email content
    const htmlContent = buildEmailHtml(
      caseData as unknown as Case,
      jurisdiction,
      media,
    );

    const categoryLabels: Record<string, string> = {
      abuse: 'Maltrato',
      stray: 'Animal callejero',
      missing: 'Mascota extraviada',
    };
    const category =
      categoryLabels[caseData.category as string] ||
      (caseData.category as string);
    const folio = caseData.folio || 'Sin folio';

    // Send email via Resend API
    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? '';
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Resend API key not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const emailResponse = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Lomito <reports@lomito.org>',
        to: jurisdiction.authority_email,
        reply_to: `case-${caseId}@reply.lomito.org`,
        subject: `[Lomito] Reporte de ${category} - ${jurisdiction.name} - Folio ${folio}`,
        html: htmlContent,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error('Resend API error:', emailResult);
      return new Response(
        JSON.stringify({
          error: 'Failed to send email',
          details: emailResult,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Update case with escalation data
    const { error: updateError } = await supabase
      .from('cases')
      .update({
        escalated_at: new Date().toISOString(),
        escalation_email_id: emailResult.id,
      })
      .eq('id', caseId);

    if (updateError) {
      console.error('Error updating case:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update case' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Get current user from request authorization header
    const authHeader = req.headers.get('authorization');
    let actorId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: userData } = await supabase.auth.getUser(token);
      actorId = userData?.user?.id || null;
    }

    // Insert timeline event
    const { error: timelineError } = await supabase
      .from('case_timeline')
      .insert({
        case_id: caseId,
        actor_id: actorId,
        action: 'escalated',
        details: {
          jurisdiction_id: jurisdiction.id,
          authority_email: jurisdiction.authority_email,
          email_id: emailResult.id,
        },
      });

    if (timelineError) {
      console.error('Error inserting timeline event:', timelineError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        email_id: emailResult.id,
        escalated_to: jurisdiction.authority_email,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error escalating case:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
});
