/**
 * useJurisdictions Hook
 * Fetches jurisdiction boundary polygons from Supabase Edge Function.
 * Debounces requests and caches results to avoid redundant fetches.
 */

import { useEffect, useState, useRef, useCallback } from 'react';

interface Bounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

interface JurisdictionFeature {
  type: 'Feature';
  geometry: {
    type: 'MultiPolygon';
    coordinates: number[][][][];
  };
  properties: {
    id: string;
    name: string;
    level: string;
    authority_name: string | null;
  };
}

interface JurisdictionGeoJSON {
  type: 'FeatureCollection';
  features: JurisdictionFeature[];
}

interface UseJurisdictionsParams {
  bounds: Bounds | null;
  zoom: number;
}

interface UseJurisdictionsResult {
  data: JurisdictionGeoJSON | null;
  loading: boolean;
  error: string | null;
}

const DEBOUNCE_DELAY = 300;

export function useJurisdictions({ bounds, zoom }: UseJurisdictionsParams): UseJurisdictionsResult {
  const [data, setData] = useState<JurisdictionGeoJSON | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cacheRef = useRef<Map<string, JurisdictionGeoJSON>>(new Map());

  const fetchJurisdictions = useCallback(async (fetchBounds: Bounds, fetchZoom: number) => {
    const cacheKey = `${fetchBounds.west},${fetchBounds.south},${fetchBounds.east},${fetchBounds.north},${Math.floor(fetchZoom)}`;

    // Check cache first
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration missing');
      }

      const url = new URL(`${supabaseUrl}/functions/v1/jurisdiction-boundaries`);
      url.searchParams.append('west', fetchBounds.west.toString());
      url.searchParams.append('south', fetchBounds.south.toString());
      url.searchParams.append('east', fetchBounds.east.toString());
      url.searchParams.append('north', fetchBounds.north.toString());
      url.searchParams.append('zoom', fetchZoom.toString());

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch jurisdictions: ${response.statusText}`);
      }

      const result = await response.json() as JurisdictionGeoJSON;

      // Cache the result
      cacheRef.current.set(cacheKey, result);

      // Limit cache size to prevent memory issues (keep last 10 entries)
      if (cacheRef.current.size > 10) {
        const firstKey = cacheRef.current.keys().next().value;
        if (firstKey) {
          cacheRef.current.delete(firstKey);
        }
      }

      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch jurisdictions';
      setError(errorMessage);
      console.error('Error fetching jurisdictions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!bounds) {
      setData(null);
      setLoading(false);
      return;
    }

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce the fetch
    debounceTimerRef.current = setTimeout(() => {
      fetchJurisdictions(bounds, zoom);
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [bounds, zoom, fetchJurisdictions]);

  return {
    data,
    loading,
    error,
  };
}
