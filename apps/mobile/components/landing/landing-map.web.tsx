/**
 * LandingMap (web)
 * Non-interactive Mapbox GL JS map centered on Tijuana showing case report markers.
 * Displayed on the public landing page.
 */

/// <reference lib="dom" />

import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Body } from '@lomito/ui/src/components/typography';
import { colors, borderRadius } from '@lomito/ui/src/theme/tokens';
import { supabase } from '../../lib/supabase';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const TIJUANA_CENTER: [number, number] = [-117.0382, 32.5149];
const TIJUANA_ZOOM = 11;
const LIGHT_STYLE = 'mapbox://styles/mapbox/light-v11';

// Category pin colors — matches tokens.ts category colors
const CATEGORY_COLORS: Record<string, string> = {
  abuse: '#C53030',
  injured: '#DC2626',
  missing: '#2B6CB0',
  stray: '#DD6B20',
  zoonotic: '#7C3AED',
  dead_animal: '#6B7280',
  dangerous_dog: '#DC2626',
  distress: '#F59E0B',
  illegal_sales: '#B91C1C',
  wildlife: '#059669',
  noise_nuisance: '#6366F1',
};

const DEFAULT_PIN_COLOR = '#718096';

interface CaseRow {
  id: string;
  category: string;
  status: string;
  location_geojson: { type: 'Point'; coordinates: [number, number] };
}

interface LandingMapProps {
  height?: number;
}

export function LandingMap({ height = 400 }: LandingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasToken = Boolean(mapboxgl.accessToken);

  useEffect(() => {
    if (!hasToken || !mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: LIGHT_STYLE,
      center: TIJUANA_CENTER,
      zoom: TIJUANA_ZOOM,
      // Non-interactive: disable all user interactions
      scrollZoom: false,
      boxZoom: false,
      dragRotate: false,
      dragPan: false,
      keyboard: false,
      doubleClickZoom: false,
      touchZoomRotate: false,
      interactive: false,
    });

    mapRef.current = map;

    map.on('load', async () => {
      try {
        // Fetch cases via the existing get_cases_for_map RPC
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error: rpcError } = (await (supabase as any).rpc(
          'get_cases_for_map',
          {
            limit_count: 200,
            filter_categories: null,
            filter_statuses: null,
          },
        )) as {
          data: CaseRow[] | null;
          error: { message: string } | null;
        };

        if (rpcError) {
          console.error('[LandingMap] RPC error:', rpcError.message);
          setError(rpcError.message);
          return;
        }

        const features: GeoJSON.Feature<GeoJSON.Point>[] = (data ?? [])
          .filter(
            (row) =>
              row.location_geojson?.type === 'Point' &&
              Array.isArray(row.location_geojson.coordinates),
          )
          .map((row) => ({
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: row.location_geojson.coordinates,
            },
            properties: {
              id: row.id,
              category: row.category,
              status: row.status,
              color: CATEGORY_COLORS[row.category] ?? DEFAULT_PIN_COLOR,
            },
          }));

        const geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
          type: 'FeatureCollection',
          features,
        };

        // GeoJSON source with clustering
        map.addSource('landing-cases', {
          type: 'geojson',
          data: geojson,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 40,
        });

        // Cluster circles
        map.addLayer({
          id: 'landing-clusters',
          type: 'circle',
          source: 'landing-cases',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': colors.primary,
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              14,
              10,
              18,
              50,
              22,
            ],
            'circle-opacity': 0.85,
          },
        });

        // Individual case circles
        map.addLayer({
          id: 'landing-unclustered',
          type: 'circle',
          source: 'landing-cases',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': ['get', 'color'],
            'circle-radius': 7,
            'circle-opacity': 0.9,
            'circle-stroke-color': colors.white,
            'circle-stroke-width': 1.5,
          },
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load cases';
        console.error('[LandingMap] Error loading cases:', message);
        setError(message);
      }
    });

    map.on('error', (e) => {
      console.error('[LandingMap] Map error:', e);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [hasToken]);

  if (!hasToken || error) {
    return (
      <View style={[styles.fallback, { height }]}>
        <View style={styles.fallbackInner}>
          <Body style={styles.fallbackText}>Tijuana</Body>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    width: '100%',
  },
  fallback: {
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    width: '100%',
  },
  fallbackInner: {
    alignItems: 'center',
    backgroundColor: colors.neutral100,
    flex: 1,
    justifyContent: 'center',
  },
  fallbackText: {
    color: colors.neutral400,
    fontWeight: '600',
  },
});
