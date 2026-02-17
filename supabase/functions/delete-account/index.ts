// Edge Function: delete-account
// Permanently deletes the authenticated user's account and all associated data.
// Requires a valid JWT in the Authorization header.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Verify the caller is authenticated
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Missing authorization header' }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  const token = authHeader.replace('Bearer ', '');

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  // Use anon client just to verify the JWT and get the user
  const supabaseAnon = createClient(
    supabaseUrl,
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );
  const { data: userData, error: userError } =
    await supabaseAnon.auth.getUser(token);

  if (userError || !userData.user) {
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const userId = userData.user.id;

  // Use service role client for all privileged operations
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Delete case subscriptions
    const { error: subscriptionsError } = await supabase
      .from('case_subscriptions')
      .delete()
      .eq('user_id', userId);

    if (subscriptionsError) {
      console.error('Error deleting case_subscriptions:', subscriptionsError);
      throw new Error('Failed to delete case subscriptions');
    }

    // 2. Anonymize cases (set reporter_id to NULL, do not delete the cases)
    const { error: casesError } = await supabase
      .from('cases')
      .update({ reporter_id: null })
      .eq('reporter_id', userId);

    if (casesError) {
      console.error('Error anonymizing cases:', casesError);
      throw new Error('Failed to anonymize cases');
    }

    // 3. Delete the profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
      throw new Error('Failed to delete profile');
    }

    // 4. Delete the auth user (must be last)
    const { error: deleteUserError } =
      await supabase.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError);
      throw new Error('Failed to delete auth user');
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('delete-account error:', err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
