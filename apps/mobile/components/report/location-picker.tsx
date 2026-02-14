/**
 * Location Picker Component
 * Map with a centered pin that updates as the user pans.
 */

import { View, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MapboxGL, { TIJUANA_CENTER, DEFAULT_ZOOM } from '../../lib/mapbox';
import { Caption } from '@lomito/ui';
import { colors, spacing } from '@lomito/ui/src/theme/tokens';

interface LocationPickerProps {
  location: { latitude: number; longitude: number } | null;
  onLocationChange: (location: { latitude: number; longitude: number }) => void;
}

export function LocationPicker({ location, onLocationChange }: LocationPickerProps) {
  const { t } = useTranslation();
  const [currentLocation, setCurrentLocation] = useState(
    location || { latitude: TIJUANA_CENTER.latitude, longitude: TIJUANA_CENTER.longitude }
  );

  const handleRegionDidChange = async () => {
    // In the real implementation, we would extract the center coordinate from the region change event
    // For now, we update with the current location
    const newLocation = { ...currentLocation };
    setCurrentLocation(newLocation);
    onLocationChange(newLocation);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapboxGL.MapView
          style={styles.map}
          styleURL={MapboxGL.StyleURL.Street}
          onRegionDidChange={handleRegionDidChange}
        >
          <MapboxGL.Camera
            zoomLevel={DEFAULT_ZOOM}
            centerCoordinate={[currentLocation.longitude, currentLocation.latitude]}
          />
        </MapboxGL.MapView>

        {/* Center pin overlay */}
        <View style={styles.pinOverlay} pointerEvents="none">
          <View style={styles.pin}>
            <View style={styles.pinHead} />
            <View style={styles.pinTail} />
          </View>
        </View>
      </View>

      <View style={styles.coordinates}>
        <Caption color={colors.neutral500}>
          {t('report.coordinates')}: {currentLocation.latitude.toFixed(5)}, {currentLocation.longitude.toFixed(5)}
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
    shadowColor: colors.neutral900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: 30,
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
});
