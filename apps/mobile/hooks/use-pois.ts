/**
 * usePois Hook
 * Fetches points of interest (government offices, shelters, vet clinics)
 * within the current map viewport. Debounced and cached.
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { PoiType, PointOfInterest } from '@lomito/shared/types/database';

interface Bounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

interface UsePoisParams {
  bounds: Bounds | null;
  enabledTypes: PoiType[];
}

type PoiFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Point,
  PointOfInterest
>;

interface UsePoisResult {
  data: PoiFeatureCollection | null;
  loading: boolean;
  error: string | null;
}

const DEBOUNCE_DELAY = 300;

export function usePois({
  bounds,
  enabledTypes,
}: UsePoisParams): UsePoisResult {
  const [data, setData] = useState<PoiFeatureCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cacheRef = useRef<Map<string, PoiFeatureCollection>>(new Map());

  const fetchPois = useCallback(
    async (fetchBounds: Bounds, types: PoiType[]) => {
      const sortedTypes = [...types].sort();
      const cacheKey = `${fetchBounds.west},${fetchBounds.south},${fetchBounds.east},${fetchBounds.north},${sortedTypes.join(',')}`;

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
        const { data: rows, error: rpcError } = await supabase.rpc(
          'get_pois_in_bounds',
          {
            p_west: fetchBounds.west,
            p_south: fetchBounds.south,
            p_east: fetchBounds.east,
            p_north: fetchBounds.north,
            p_types: sortedTypes,
          },
        );

        if (rpcError) {
          throw new Error(rpcError.message);
        }

        const features: GeoJSON.Feature<GeoJSON.Point, PointOfInterest>[] = (
          rows ?? []
        ).map((row) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [row.lng, row.lat],
          },
          properties: row,
        }));

        const collection: PoiFeatureCollection = {
          type: 'FeatureCollection',
          features,
        };

        // Cache the result
        cacheRef.current.set(cacheKey, collection);

        // Limit cache size to prevent memory issues (keep last 10 entries)
        if (cacheRef.current.size > 10) {
          const firstKey = cacheRef.current.keys().next().value;
          if (firstKey !== undefined) {
            cacheRef.current.delete(firstKey);
          }
        }

        setData(collection);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch POIs';
        setError(errorMessage);
        console.error('Error fetching POIs:', err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!bounds || enabledTypes.length === 0) {
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
      fetchPois(bounds, enabledTypes);
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [bounds, enabledTypes, fetchPois]);

  return { data, loading, error };
}
