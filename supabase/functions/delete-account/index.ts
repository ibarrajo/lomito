// Edge Function: delete-account
// Permanently deletes the authenticated user's account and all associated data.
// Requires a valid JWT in the Authorization header.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeadersFor, isAllowedOrigin } from '../_shared/cors.ts';

serve(async (req: Request) => {
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
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

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
  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
  const { data: userData, error: userError } =
    await supabaseAnon.auth.getUser(token);

  if (userError || !userData.user) {
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const userId = userData.user.id;

  // User-scoped client: RLS is enforced on all data-deletion queries.
  const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });

  // Service-role client: used ONLY for auth.admin.deleteUser().
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  try {
    // 1. Delete case subscriptions (RLS allows user to delete their own rows)
    const { error: subscriptionsError } = await supabaseUser
      .from('case_subscriptions')
      .delete()
      .eq('user_id', userId);

    if (subscriptionsError) {
      console.error('Error deleting case_subscriptions:', subscriptionsError);
      throw new Error('Failed to delete case subscriptions');
    }

    // 2. Anonymize cases (set reporter_id to NULL; RLS limits to own cases)
    const { error: casesError } = await supabaseUser
      .from('cases')
      .update({ reporter_id: null })
      .eq('reporter_id', userId);

    if (casesError) {
      console.error('Error anonymizing cases:', casesError);
      throw new Error('Failed to anonymize cases');
    }

    // 3. Delete the profile (RLS allows user to delete their own profile)
    const { error: profileError } = await supabaseUser
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
      throw new Error('Failed to delete profile');
    }

    // 4. Delete the auth user — requires service role (must be last)
    const { error: deleteUserError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

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
