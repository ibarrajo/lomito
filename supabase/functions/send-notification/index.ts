// Edge Function to send push notifications to case subscribers
// Deno Deploy runtime

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface NotificationPayload {
  caseId: string;
  action: string;
  actorName?: string;
}

interface ExpoPushMessage {
  to: string;
  sound: 'default';
  title: string;
  body: string;
  data: {
    caseId: string;
  };
}

// Map timeline actions to notification messages
function getNotificationContent(
  action: string,
  actorName?: string,
): { title: string; body: string } {
  switch (action) {
    case 'verified':
      return {
        title: 'Case verified',
        body: 'Your report has been verified',
      };
    case 'status_changed':
      return {
        title: 'Case updated',
        body: 'Case status has been updated',
      };
    case 'comment':
      return {
        title: 'New comment',
        body: actorName
          ? `${actorName} commented on your case`
          : 'New comment on case',
      };
    case 'resolved':
      return {
        title: 'Case resolved',
        body: 'Case has been resolved',
      };
    case 'government_response':
      return {
        title: 'Government response',
        body: 'An authority has responded to your case',
      };
    case 'escalated':
      return {
        title: 'Case escalated',
        body: 'Your case has been escalated to authorities',
      };
    default:
      return {
        title: 'Case updated',
        body: 'There is a new update on your case',
      };
  }
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
    const payload: NotificationPayload = await req.json();
    const { caseId, action, actorName } = payload;

    if (!caseId || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: caseId, action' }),
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

    // Get timeline entry to find the actor ID
    const { data: timelineEntry } = await supabase
      .from('case_timeline')
      .select('actor_id')
      .eq('case_id', caseId)
      .eq('action', action)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const actorId = timelineEntry?.actor_id;

    // Get all subscribers for this case
    const { data: subscriptions, error: subsError } = await supabase
      .from('case_subscriptions')
      .select('user_id')
      .eq('case_id', caseId);

    if (subsError) {
      throw subsError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No subscribers' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Get push tokens for subscribers, filtering out the actor
    const subscriberIds = subscriptions
      .map((s) => s.user_id)
      .filter((id) => id !== actorId); // Don't notify the actor

    if (subscriberIds.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          sent: 0,
          message: 'No subscribers to notify',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('push_token, notification_preferences')
      .in('id', subscriberIds)
      .not('push_token', 'is', null);

    if (profilesError) {
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          sent: 0,
          message: 'No valid push tokens',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Get case data to check if subscriber is reporter
    const { data: caseData } = await supabase
      .from('cases')
      .select('reporter_id')
      .eq('id', caseId)
      .single();

    // Filter profiles based on notification preferences
    const eligibleProfiles = profiles.filter((p) => {
      if (!p.push_token) return false;

      const prefs = p.notification_preferences as {
        push_enabled?: boolean;
        own_case_updates?: boolean;
        flagged_cases?: boolean;
      } | null;

      // If no preferences set, use defaults (all enabled)
      if (!prefs) return true;

      // Check if push notifications are enabled
      if (prefs.push_enabled === false) return false;

      // Check if this is an update on their own case
      if (caseData && subscriberIds.includes(caseData.reporter_id)) {
        if (prefs.own_case_updates === false) return false;
      }

      // For flagged case notifications (moderators only)
      if (action === 'flagged') {
        if (prefs.flagged_cases === false) return false;
      }

      return true;
    });

    if (eligibleProfiles.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          sent: 0,
          message: 'No eligible subscribers after preference filtering',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Build notification messages
    const { title, body } = getNotificationContent(action, actorName);
    const messages: ExpoPushMessage[] = eligibleProfiles.map((p) => ({
      to: p.push_token!,
      sound: 'default',
      title,
      body,
      data: { caseId },
    }));

    // Send to Expo Push API
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        sent: messages.length,
        result,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error sending notifications:', error);
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
