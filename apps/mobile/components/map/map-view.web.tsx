/**
 * MapView Component (Web)
 * Full-screen Mapbox GL JS map centered on Tijuana.
 */

/// <reference lib="dom" />

import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import mapboxgl from 'mapbox-gl';
import { TIJUANA_CENTER, DEFAULT_ZOOM } from '../../lib/mapbox.web';
import type { ReactNode } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Region {
  bounds: {
    ne: [number, number];
    sw: [number, number];
  };
  zoomLevel: number;
}

interface MapViewProps {
  children?: ReactNode;
  cases?: GeoJSON.FeatureCollection;
  onMapReady?: () => void;
  onRegionDidChange?: (region: Region) => void;
  onPinPress?: (caseId: string) => void;
}

export function MapView({
  onMapReady,
  onRegionDidChange,
  cases,
  onPinPress,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const onPinPressRef = useRef(onPinPress);
  const casesRef = useRef(cases);
  const hasToken = Boolean(mapboxgl.accessToken);

  // Keep refs up to date
  onPinPressRef.current = onPinPress;
  casesRef.current = cases;

  useEffect(() => {
    if (!hasToken || !mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [TIJUANA_CENTER.longitude, TIJUANA_CENTER.latitude],
      zoom: DEFAULT_ZOOM,
    });

    mapRef.current = map;

    map.on('load', () => {
      onMapReady?.();

      // Add GeoJSON source with clustering
      map.addSource('cases-source', {
        type: 'geojson',
        data: casesRef.current ?? { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterRadius: 50,
        clusterMaxZoom: 14,
      });

      // Cluster circles layer
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'cases-source',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#D4662B', // colors.primary
          'circle-radius': ['step', ['get', 'point_count'], 20, 10, 25, 30, 35],
          'circle-opacity': 0.9,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF',
        },
      });

      // Cluster count label layer
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'cases-source',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-size': 14,
          'text-font': ['DM Sans Bold', 'Arial Unicode MS Bold'],
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': '#FFFFFF',
        },
      });

      // Unclustered individual points
      map.addLayer({
        id: 'unclustered-points',
        type: 'circle',
        source: 'cases-source',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'category'],
            'abuse',
            '#C53030',
            'stray',
            '#DD6B20',
            'missing',
            '#2B6CB0',
            '#9CA3AF', // default (neutral500)
          ],
          'circle-radius': 12,
          'circle-stroke-width': [
            'case',
            ['==', ['get', 'status'], 'resolved'],
            3,
            ['==', ['get', 'status'], 'verified'],
            2,
            ['==', ['get', 'status'], 'in_progress'],
            2,
            2,
          ],
          'circle-stroke-color': [
            'case',
            ['==', ['get', 'status'], 'resolved'],
            '#276749',
            ['==', ['get', 'status'], 'verified'],
            '#276749',
            ['==', ['get', 'status'], 'in_progress'],
            '#2B6CB0',
            ['==', ['get', 'status'], 'rejected'],
            '#A0AEC0',
            ['==', ['get', 'status'], 'archived'],
            '#A0AEC0',
            'rgba(255, 255, 255, 0.9)',
          ],
          'circle-opacity': [
            'case',
            ['==', ['get', 'status'], 'rejected'],
            0.5,
            ['==', ['get', 'status'], 'archived'],
            0.5,
            1.0,
          ],
        },
      });

      // Click handler for unclustered points
      map.on('click', 'unclustered-points', (e) => {
        const feature = e.features?.[0];
        if (feature?.properties?.id) {
          onPinPressRef.current?.(feature.properties.id as string);
        }
      });

      // Change cursor on hover
      map.on('mouseenter', 'unclustered-points', () => {
        const canvas = map.getCanvas() as unknown as {
          style: { cursor: string };
        };
        canvas.style.cursor = 'pointer';
      });
      map.on('mouseleave', 'unclustered-points', () => {
        const canvas = map.getCanvas() as unknown as {
          style: { cursor: string };
        };
        canvas.style.cursor = '';
      });

      // Handle cluster clicks - zoom in
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        });
        const clusterId = features[0]?.properties?.cluster_id;
        const source = map.getSource('cases-source');
        if (
          source &&
          'getClusterExpansionZoom' in source &&
          clusterId != null
        ) {
          (source as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
              if (err || zoom == null) return;
              map.easeTo({
                center: (features[0].geometry as GeoJSON.Point).coordinates as [
                  number,
                  number,
                ],
                zoom,
              });
            },
          );
        }
      });
      map.on('mouseenter', 'clusters', () => {
        const canvas = map.getCanvas() as unknown as {
          style: { cursor: string };
        };
        canvas.style.cursor = 'pointer';
      });
      map.on('mouseleave', 'clusters', () => {
        const canvas = map.getCanvas() as unknown as {
          style: { cursor: string };
        };
        canvas.style.cursor = '';
      });
    });

    map.on('moveend', () => {
      if (!onRegionDidChange) return;
      const bounds = map.getBounds();
      if (!bounds) return;
      onRegionDidChange({
        bounds: {
          ne: [bounds.getNorthEast().lng, bounds.getNorthEast().lat],
          sw: [bounds.getSouthWest().lng, bounds.getSouthWest().lat],
        },
        zoomLevel: map.getZoom(),
      });
    });

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [hasToken, onMapReady, onRegionDidChange]);

  // Update GeoJSON data when cases prop changes
  useEffect(() => {
    if (!mapRef.current) return;
    const source = mapRef.current.getSource('cases-source') as
      | mapboxgl.GeoJSONSource
      | undefined;
    if (source) {
      source.setData(cases ?? { type: 'FeatureCollection', features: [] });
    }
  }, [cases]);

  if (!hasToken) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderTitle}>Map</Text>
        <Text style={styles.placeholderText}>
          Set EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN in .env to enable the map.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    backgroundColor: '#E8E0D8',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  placeholderText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
  placeholderTitle: {
    color: '#1F2328',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
});
