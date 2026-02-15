// Edge Function to check escalated cases and send reminders
// Deno Deploy runtime
// This function should be called via Supabase cron (pg_cron) or external scheduler daily

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_URL = 'https://api.resend.com/emails';

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
  escalated_at: string;
  escalation_reminder_count: number;
  escalation_email_id: string | null;
}

interface Jurisdiction {
  id: string;
  name: string;
  authority_name: string | null;
  authority_email: string | null;
}

interface CaseMedia {
  url: string;
  thumbnail_url: string | null;
}

function buildReminderEmailHtml(
  caseData: Case,
  jurisdiction: Jurisdiction,
  mediaUrls: CaseMedia[],
  daysSinceEscalation: number,
  reminderNumber: number,
): string {
  const [longitude, latitude] = caseData.location.coordinates;
  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  const folio = caseData.folio || 'Sin folio';
  const escalatedDate = new Date(caseData.escalated_at).toLocaleString(
    'es-MX',
    {
      dateStyle: 'long',
      timeStyle: 'short',
    },
  );

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

  const reminderBadgeColor = reminderNumber === 3 ? '#C53030' : '#DD6B20';

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
  <title>Recordatorio: Reporte ${folio}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F6F8F8;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
    <div style="background-color: #FFFFFF; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(30, 41, 59, 0.08);">
      <!-- Header -->
      <div style="border-bottom: 2px solid #13ECC8; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="color: #1E293B; margin: 0 0 8px 0; font-size: 24px;">Lomito</h1>
        <p style="color: #4A5568; margin: 0; font-size: 14px;">Recordatorio - Reporte de bienestar animal</p>
      </div>

      <!-- Reminder Badge -->
      <div style="background-color: ${reminderBadgeColor}15; border-left: 4px solid ${reminderBadgeColor}; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
        <p style="color: ${reminderBadgeColor}; margin: 0; font-weight: 600; font-size: 15px;">
          ⚠️ Recordatorio ${reminderNumber} - ${daysSinceEscalation} días sin respuesta
        </p>
        <p style="color: #4A5568; margin: 8px 0 0 0; font-size: 14px;">
          ${
            reminderNumber === 3
              ? 'Último recordatorio. Este caso será marcado como "sin respuesta" si no se recibe respuesta.'
              : 'Este reporte fue escalado y aún está pendiente de respuesta.'
          }
        </p>
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
            <td style="padding: 8px 0; color: #4A5568; font-weight: 600;">Fecha de escalación:</td>
            <td style="padding: 8px 0; color: #1F2328;">${escalatedDate}</td>
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
          style="display: inline-block; background-color: #1E293B; color: #FFFFFF; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 8px;"
        >
          Ver en Google Maps
        </a>
      </div>

      ${photosHtml}

      <!-- Footer -->
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #E2E8F0;">
        <p style="color: #718096; font-size: 13px; margin: 0 0 8px 0;">
          Este es un recordatorio automático del sistema Lomito.
        </p>
        <p style="color: #718096; font-size: 13px; margin: 0;">
          Para responder a este caso, por favor responda directamente a este correo.
        </p>
      </div>
    </div>

    <div style="text-align: center; margin-top: 16px;">
      <p style="color: #718096; font-size: 12px; margin: 0;">
        <a href="https://lomito.org" style="color: #13ECC8; text-decoration: none;">lomito.org</a>
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

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all escalated cases awaiting response
    const { data: cases, error: casesError } = await supabase
      .from('cases')
      .select(
        `
        *,
        jurisdiction:jurisdictions (
          id,
          name,
          authority_name,
          authority_email
        )
      `,
      )
      .not('escalated_at', 'is', null)
      .is('government_response_at', null)
      .eq('marked_unresponsive', false);

    if (casesError) {
      throw casesError;
    }

    if (!cases || cases.length === 0) {
      return new Response(
        JSON.stringify({
          checked: 0,
          reminders_sent: 0,
          marked_unresponsive: 0,
          message: 'No escalated cases pending response',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const now = new Date();
    let remindersSent = 0;
    let markedUnresponsive = 0;

    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? '';
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Resend API key not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    for (const caseItem of cases) {
      const escalatedAt = new Date(caseItem.escalated_at);
      const daysSinceEscalation = Math.floor(
        (now.getTime() - escalatedAt.getTime()) / (1000 * 60 * 60 * 24),
      );

      const reminderCount = caseItem.escalation_reminder_count;
      const jurisdiction = caseItem.jurisdiction as unknown as Jurisdiction;

      if (!jurisdiction || !jurisdiction.authority_email) {
        console.error(`Case ${caseItem.id}: No authority email configured`);
        continue;
      }

      let shouldSendReminder = false;
      let reminderNumber = 0;

      // Check if reminder should be sent based on days and reminder count
      if (daysSinceEscalation >= 30 && reminderCount < 3) {
        shouldSendReminder = true;
        reminderNumber = 3;
      } else if (daysSinceEscalation >= 15 && reminderCount < 2) {
        shouldSendReminder = true;
        reminderNumber = 2;
      } else if (daysSinceEscalation >= 5 && reminderCount < 1) {
        shouldSendReminder = true;
        reminderNumber = 1;
      }

      if (shouldSendReminder) {
        // Fetch case media
        const { data: mediaRecords } = await supabase
          .from('case_media')
          .select('url, thumbnail_url')
          .eq('case_id', caseItem.id)
          .order('sort_order', { ascending: true })
          .limit(5);

        const media = (mediaRecords || []) as CaseMedia[];

        // Build email content
        const htmlContent = buildReminderEmailHtml(
          caseItem as unknown as Case,
          jurisdiction,
          media,
          daysSinceEscalation,
          reminderNumber,
        );

        const categoryLabels: Record<string, string> = {
          abuse: 'Maltrato',
          stray: 'Animal callejero',
          missing: 'Mascota extraviada',
        };
        const category =
          categoryLabels[caseItem.category as string] || caseItem.category;
        const folio = caseItem.folio || 'Sin folio';

        // Send reminder email via Resend
        const emailResponse = await fetch(RESEND_API_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Lomito <reports@lomito.org>',
            to: jurisdiction.authority_email,
            reply_to: `case-${caseItem.id}@reply.lomito.org`,
            subject: `[Lomito] Recordatorio ${reminderNumber}: ${category} - ${jurisdiction.name} - Folio ${folio}`,
            html: htmlContent,
          }),
        });

        const emailResult = await emailResponse.json();

        if (!emailResponse.ok) {
          console.error(
            `Case ${caseItem.id}: Failed to send reminder email:`,
            emailResult,
          );
          continue;
        }

        // Update case reminder count
        const { error: updateError } = await supabase
          .from('cases')
          .update({
            escalation_reminder_count: reminderNumber,
          })
          .eq('id', caseItem.id);

        if (updateError) {
          console.error(
            `Case ${caseItem.id}: Failed to update reminder count:`,
            updateError,
          );
          continue;
        }

        // Insert timeline event
        const { error: timelineError } = await supabase
          .from('case_timeline')
          .insert({
            case_id: caseItem.id,
            actor_id: null,
            action: 'escalated',
            details: {
              type: 'reminder',
              day: reminderNumber === 1 ? 5 : reminderNumber === 2 ? 15 : 30,
              reminder_number: reminderNumber,
              email_id: emailResult.id,
            },
          });

        if (timelineError) {
          console.error(
            `Case ${caseItem.id}: Failed to insert timeline event:`,
            timelineError,
          );
        }

        remindersSent++;

        // Mark as unresponsive if this was the 3rd reminder (30 days)
        if (reminderNumber === 3) {
          const { error: markError } = await supabase
            .from('cases')
            .update({
              marked_unresponsive: true,
            })
            .eq('id', caseItem.id);

          if (markError) {
            console.error(
              `Case ${caseItem.id}: Failed to mark as unresponsive:`,
              markError,
            );
          } else {
            // Insert timeline event for marked unresponsive
            await supabase.from('case_timeline').insert({
              case_id: caseItem.id,
              actor_id: null,
              action: 'escalated',
              details: {
                type: 'marked_unresponsive',
                day: 30,
              },
            });

            markedUnresponsive++;
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        checked: cases.length,
        reminders_sent: remindersSent,
        marked_unresponsive: markedUnresponsive,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error in auto-escalation-check:', error);
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
