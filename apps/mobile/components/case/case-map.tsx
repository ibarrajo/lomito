/**
 * CaseMap Component
 * Small non-interactive map showing the case location.
 */

import { View, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { colors, borderRadius, shadowStyles } from '@lomito/ui/theme/tokens';
import type { CaseCategory } from '@lomito/shared/types/database';

interface CaseMapProps {
  longitude: number;
  latitude: number;
  category: CaseCategory;
}

const CATEGORY_PIN_COLORS: Record<CaseCategory, string> = {
  abuse: colors.category.abuse.pin,
  injured: colors.category.injured.pin,
  missing: colors.category.missing.pin,
  stray: colors.category.stray.pin,
  zoonotic: colors.category.zoonotic.pin,
  dead_animal: colors.category.dead_animal.pin,
  dangerous_dog: colors.category.dangerous_dog.pin,
  distress: colors.category.distress.pin,
  illegal_sales: colors.category.illegal_sales.pin,
  wildlife: colors.category.wildlife.pin,
  noise_nuisance: colors.category.noise_nuisance.pin,
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
    borderRadius: borderRadius.card,
    borderWidth: 2,
    height: 24,
    width: 24,
  },
});
