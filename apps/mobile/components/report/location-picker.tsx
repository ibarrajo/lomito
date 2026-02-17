/**
 * Location Picker Component
 * Map with a centered pin that updates as the user pans.
 *
 * Note: `onMapIdle` and Camera `ref` are v10-only APIs not included in the
 * shared TypeScript types (which also cover the web stub). We widen the
 * component prop types via `as unknown as` assertions so the runtime
 * behaviour is preserved without @ts-ignore comments.
 */

import { View, StyleSheet, Platform, Pressable, Text } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MapboxGL, {
  TIJUANA_CENTER,
  DEFAULT_ZOOM,
  STREET_STYLE_URL,
} from '../../lib/mapbox';
import { Caption } from '@lomito/ui';
import {
  colors,
  spacing,
  borderRadius,
  shadowStyles,
} from '@lomito/ui/src/theme/tokens';

/** GeoJSON Position — [longitude, latitude] */
type Position = [number, number];

/** Subset of the MapboxGL v10 MapState used by onMapIdle */
interface MapIdleState {
  properties: {
    center: Position;
    zoom: number;
  };
}

/** Camera imperative handle (v10 native API) */
interface CameraHandle {
  setCamera: (config: {
    zoomLevel?: number;
    animationDuration?: number;
  }) => void;
}

/**
 * MapView widened to include the v10-only onMapIdle prop.
 * The underlying native component supports this at runtime.
 */
const NativeMapView = MapboxGL.MapView as unknown as React.ComponentType<
  React.ComponentProps<typeof MapboxGL.MapView> & {
    onMapIdle?: (state: MapIdleState) => void;
  }
>;

/**
 * Camera widened to accept a ref typed as CameraHandle.
 * The underlying native Camera exposes setCamera imperatively.
 */
const NativeCamera =
  MapboxGL.Camera as unknown as React.ForwardRefExoticComponent<
    React.ComponentProps<typeof MapboxGL.Camera> &
      React.RefAttributes<CameraHandle>
  >;

interface LocationPickerProps {
  location: { latitude: number; longitude: number } | null;
  onLocationChange: (location: { latitude: number; longitude: number }) => void;
}

export function LocationPicker({
  location,
  onLocationChange,
}: LocationPickerProps) {
  const { t } = useTranslation();
  const initialLocation = location || {
    latitude: TIJUANA_CENTER.latitude,
    longitude: TIJUANA_CENTER.longitude,
  };

  const onLocationChangeRef = useRef(onLocationChange);
  onLocationChangeRef.current = onLocationChange;

  const cameraRef = useRef<CameraHandle>(null);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);

  // Set initial location on mount so Next button is enabled immediately
  useEffect(() => {
    onLocationChangeRef.current(initialLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMapIdle = (state: MapIdleState) => {
    const [lng, lat] = state.properties.center;
    setZoomLevel(state.properties.zoom);
    onLocationChangeRef.current({ latitude: lat, longitude: lng });
  };

  const handleZoomIn = () => {
    cameraRef.current?.setCamera({
      zoomLevel: Math.min(zoomLevel + 1, 20),
      animationDuration: 300,
    });
  };

  const handleZoomOut = () => {
    cameraRef.current?.setCamera({
      zoomLevel: Math.max(zoomLevel - 1, 1),
      animationDuration: 300,
    });
  };

  const displayLocation = location || initialLocation;

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <NativeMapView
          style={styles.map}
          styleURL={STREET_STYLE_URL}
          onMapIdle={handleMapIdle}
        >
          <NativeCamera
            ref={cameraRef}
            zoomLevel={DEFAULT_ZOOM}
            centerCoordinate={[
              initialLocation.longitude,
              initialLocation.latitude,
            ]}
          />
        </NativeMapView>

        {/* Center pin overlay */}
        <View style={styles.pinOverlay} pointerEvents="none">
          <View style={styles.pin}>
            <View style={styles.pinHead} />
            <View style={styles.pinTail} />
          </View>
        </View>

        {/* Zoom controls */}
        <View style={styles.zoomControls} pointerEvents="box-none">
          <Pressable
            style={styles.zoomButton}
            onPress={handleZoomIn}
            accessibilityLabel={t('report.zoomIn')}
            accessibilityRole="button"
          >
            <Text style={styles.zoomButtonText}>+</Text>
          </Pressable>
          <Pressable
            style={styles.zoomButton}
            onPress={handleZoomOut}
            accessibilityLabel={t('report.zoomOut')}
            accessibilityRole="button"
          >
            <Text style={styles.zoomButtonText}>-</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.coordinates}>
        <Caption color={colors.neutral500}>
          {t('report.coordinates')}: {displayLocation.latitude.toFixed(5)},{' '}
          {displayLocation.longitude.toFixed(5)}
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
  map: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  pin: {
    alignItems: 'center',
    height: 40,
    width: 30,
  },
  pinHead: {
    backgroundColor: colors.primary,
    borderColor: colors.white,
    borderRadius: 15,
    borderWidth: 3,
    height: 30,
    width: 30,
    ...(Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(30, 41, 59, 0.3)',
      },
      default: {
        shadowColor: colors.neutral900,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
      },
    }) as object),
  },
  pinOverlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  pinTail: {
    backgroundColor: colors.primary,
    height: 10,
    transform: [{ rotate: '45deg' }],
    width: 10,
  },
  zoomButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.button,
    height: 44,
    justifyContent: 'center',
    width: 44,
    ...(shadowStyles.card as object),
  },
  zoomButtonText: {
    color: colors.secondary,
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  zoomControls: {
    bottom: spacing.lg,
    gap: spacing.sm,
    position: 'absolute',
    right: spacing.md,
  },
});
