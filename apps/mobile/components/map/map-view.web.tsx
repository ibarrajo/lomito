/**
 * MapView Component (Web)
 * Full-screen Mapbox GL JS map centered on Tijuana.
 */

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
  onMapReady?: () => void;
  onRegionDidChange?: (region: Region) => void;
}

export function MapView({ onMapReady, onRegionDidChange }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const hasToken = Boolean(mapboxgl.accessToken);

  useEffect(() => {
    if (!hasToken || !mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [TIJUANA_CENTER.longitude, TIJUANA_CENTER.latitude],
      zoom: DEFAULT_ZOOM,
    });

    mapRef.current = map;

    map.on('load', () => {
      onMapReady?.();
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

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [hasToken, onMapReady, onRegionDidChange]);

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
    flex: 1,
    backgroundColor: '#E8E0D8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2328',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
