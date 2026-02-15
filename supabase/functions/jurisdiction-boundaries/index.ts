/**
 * Jurisdiction Boundaries Edge Function
 * Returns simplified GeoJSON for jurisdictions within a bounding box.
 * Uses zoom-adaptive simplification via ST_Simplify.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const west = parseFloat(url.searchParams.get('west') || '0');
    const south = parseFloat(url.searchParams.get('south') || '0');
    const east = parseFloat(url.searchParams.get('east') || '0');
    const north = parseFloat(url.searchParams.get('north') || '0');
    const zoom = parseFloat(url.searchParams.get('zoom') || '10');

    // Validate bounds
    if (!west || !south || !east || !north) {
      return new Response(
        JSON.stringify({
          error: 'Missing required parameters: west, south, east, north',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Determine simplification tolerance based on zoom level
    let tolerance = 0.01;
    if (zoom >= 14) {
      tolerance = 0.0001; // high detail
    } else if (zoom >= 12) {
      tolerance = 0.001; // medium
    } else if (zoom >= 10) {
      tolerance = 0.005; // low
    }

    // Create Supabase client with service role for database access
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Query jurisdictions that intersect with the bounding box
    // Use ST_Simplify for zoom-adaptive simplification
    // Use ST_AsGeoJSON to convert geometry to GeoJSON
    const { data, error } = await supabase.rpc('get_jurisdictions_in_bounds', {
      p_west: west,
      p_south: south,
      p_east: east,
      p_north: north,
      p_tolerance: tolerance,
    });

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({
          error: 'Database query failed',
          details: error.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Transform results into GeoJSON FeatureCollection
    const features = (data || []).map(
      (row: {
        id: string;
        name: string;
        level: string;
        authority_name: string | null;
        geojson: string;
      }) => {
        const geometry = JSON.parse(row.geojson);
        return {
          type: 'Feature',
          geometry,
          properties: {
            id: row.id,
            name: row.name,
            level: row.level,
            authority_name: row.authority_name,
          },
        };
      },
    );

    const featureCollection = {
      type: 'FeatureCollection',
      features,
    };

    return new Response(JSON.stringify(featureCollection), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error in jurisdiction-boundaries function:', err);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: err instanceof Error ? err.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
