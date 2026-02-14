/**
 * CaseMap Component
 * Small non-interactive map showing the case location.
 */

import { View, StyleSheet } from 'react-native';
/* eslint-disable import/no-unresolved -- @rnmapbox/maps will be installed in a later task */
import MapboxGL from '@rnmapbox/maps';
/* eslint-enable import/no-unresolved */
import { colors, borderRadius, shadowStyles } from '@lomito/ui/theme/tokens';
import type { CaseCategory } from '@lomito/shared/types/database';

interface CaseMapProps {
  longitude: number;
  latitude: number;
  category: CaseCategory;
}

const CATEGORY_PIN_COLORS: Record<CaseCategory, string> = {
  abuse: colors.category.abuse.pin,
  stray: colors.category.stray.pin,
  missing: colors.category.missing.pin,
};

export function CaseMap({ longitude, latitude, category }: CaseMapProps) {
  const pinColor = CATEGORY_PIN_COLORS[category];

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={MapboxGL.StyleURL.Street}
        compassEnabled={false}
        scaleBarEnabled={false}
      >
        <MapboxGL.Camera
          centerCoordinate={[longitude, latitude]}
          zoomLevel={14}
        />
        <MapboxGL.PointAnnotation
          id="case-location"
          coordinate={[longitude, latitude]}
        >
          <View style={[styles.pin, { backgroundColor: pinColor }]} />
        </MapboxGL.PointAnnotation>
      </MapboxGL.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.card,
    height: 200,
    overflow: 'hidden',
    ...shadowStyles.card,
  },
  map: {
    flex: 1,
  },
  pin: {
    borderColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    width: 24,
  },
});
