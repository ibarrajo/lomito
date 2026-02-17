/**
 * LandingMap (native fallback)
 * On native platforms the landing page redirects to auth/login,
 * so this component is a minimal placeholder that should never render.
 * It is provided only to satisfy Expo's platform-resolution requirement.
 */

import { View, StyleSheet } from 'react-native';
import { colors, borderRadius } from '@lomito/ui/src/theme/tokens';

interface LandingMapProps {
  height?: number;
}

export function LandingMap({ height = 400 }: LandingMapProps) {
  return (
    <View style={[styles.container, { height }]} accessibilityElementsHidden />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.card,
    width: '100%',
  },
});
