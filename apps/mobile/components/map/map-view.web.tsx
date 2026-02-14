/**
 * MapView Component (Web)
 * Full-screen Mapbox GL JS map centered on Tijuana.
 */

import { useEffect, useRef } from 'react';
import { View } from 'react-native';
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

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

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
  }, [onMapReady, onRegionDidChange]);

  return (
    <View style={{ flex: 1 }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </View>
  );
}
