/**
 * CasePin Component
 * Color-coded marker for case locations on the map.
 */

import { View, StyleSheet } from 'react-native';
import MapboxGL from '../../lib/mapbox';
import { colors, borderRadius } from '@lomito/ui/src/theme/tokens';
import type { CaseCategory } from '@lomito/shared/types/database';

const PIN_BORDER_COLOR = 'rgba(255, 255, 255, 0.9)';
const PIN_SHADOW_COLOR = colors.neutral900;

interface CasePinProps {
  id: string;
  category: CaseCategory;
  longitude: number;
  latitude: number;
  onPress: () => void;
}

export function CasePin({
  id,
  category,
  longitude,
  latitude,
  onPress,
}: CasePinProps) {
  const pinColor = colors.category[category].pin;

  return (
    <MapboxGL.PointAnnotation
      id={id}
      coordinate={[longitude, latitude]}
      onSelected={onPress}
    >
      <View style={[styles.pin, { backgroundColor: pinColor }]} />
    </MapboxGL.PointAnnotation>
  );
}

const styles = StyleSheet.create({
  pin: {
    alignItems: 'center',
    borderColor: PIN_BORDER_COLOR,
    borderRadius: borderRadius.card,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    shadowColor: PIN_SHADOW_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: 24,
  },
});
