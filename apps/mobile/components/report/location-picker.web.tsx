/**
 * Location Picker Component (Web)
 * Map with a centered pin that updates as the user pans.
 */

/// <reference lib="dom" />

import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import mapboxgl from 'mapbox-gl';
import {
  TIJUANA_CENTER,
  DEFAULT_ZOOM,
  STREET_STYLE_URL,
} from '../../lib/mapbox.web';
import { Caption } from '@lomito/ui';
import { colors, spacing } from '@lomito/ui/src/theme/tokens';
import 'mapbox-gl/dist/mapbox-gl.css';

interface LocationPickerProps {
  location: { latitude: number; longitude: number } | null;
  onLocationChange: (location: { latitude: number; longitude: number }) => void;
}

export function LocationPicker({
  location,
  onLocationChange,
}: LocationPickerProps) {
  const { t } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const onLocationChangeRef = useRef(onLocationChange);
  const hasToken = Boolean(mapboxgl.accessToken);

  const initialLocation = location || {
    latitude: TIJUANA_CENTER.latitude,
    longitude: TIJUANA_CENTER.longitude,
  };

  const [currentLocation, setCurrentLocation] = useState(initialLocation);

  // Keep ref up to date
  onLocationChangeRef.current = onLocationChange;

  useEffect(() => {
    if (!hasToken || !mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: STREET_STYLE_URL,
      center: [initialLocation.longitude, initialLocation.latitude],
      zoom: DEFAULT_ZOOM,
    });

    mapRef.current = map;

    map.on('moveend', () => {
      const center = map.getCenter();
      const newLocation = {
        latitude: center.lat,
        longitude: center.lng,
      };
      setCurrentLocation(newLocation);
      onLocationChangeRef.current(newLocation);
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [hasToken, initialLocation.latitude, initialLocation.longitude]);

  // Update map center when location prop changes externally
  useEffect(() => {
    if (!mapRef.current || !location) return;
    const map = mapRef.current;
    const currentCenter = map.getCenter();

    // Only update if the location changed significantly (avoid infinite loops)
    const latDiff = Math.abs(currentCenter.lat - location.latitude);
    const lngDiff = Math.abs(currentCenter.lng - location.longitude);

    if (latDiff > 0.0001 || lngDiff > 0.0001) {
      map.setCenter([location.longitude, location.latitude]);
    }
  }, [location]);

  if (!hasToken) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Caption color={colors.neutral500}>
            {t('map.placeholderText')}
          </Caption>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* Center pin overlay */}
        <div style={pinOverlayStyle}>
          <div style={pinStyle}>
            <div style={pinHeadStyle} />
            <div style={pinTailStyle} />
          </div>
        </div>
      </View>

      <View style={styles.coordinates}>
        <Caption color={colors.neutral500}>
          {t('report.coordinates')}: {currentLocation.latitude.toFixed(5)},{' '}
          {currentLocation.longitude.toFixed(5)}
        </Caption>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  coordinates: {
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  placeholder: {
    alignItems: 'center',
    backgroundColor: colors.neutral100,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
});

// CSS-in-JS for the pin (DOM-only styles)
const pinOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
};

const pinStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '30px',
  height: '40px',
};

const pinHeadStyle: React.CSSProperties = {
  width: '30px',
  height: '30px',
  backgroundColor: colors.primary,
  border: `3px solid ${colors.white}`,
  borderRadius: '15px',
  boxShadow: '0 2px 4px rgba(30, 41, 59, 0.3)',
};

const pinTailStyle: React.CSSProperties = {
  width: '10px',
  height: '10px',
  backgroundColor: colors.primary,
  transform: 'rotate(45deg)',
  marginTop: '-5px',
};
