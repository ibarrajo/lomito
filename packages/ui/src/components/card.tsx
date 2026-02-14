/**
 * Card Component
 * Container with shadow and optional category border for map summaries.
 */

import { View, StyleSheet, type ViewStyle } from 'react-native';
import {
  colors,
  spacing,
  borderRadius,
  shadowStyles,
} from '../theme/tokens';

type CardVariant = 'default' | 'mapSummary';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  categoryColor?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function Card({
  children,
  variant = 'default',
  categoryColor,
  style,
  accessibilityLabel,
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        variant === 'mapSummary' && styles.mapSummary,
        variant === 'mapSummary' && categoryColor && { borderLeftColor: categoryColor },
        style,
      ]}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    ...shadowStyles.card,
  },
  mapSummary: {
    borderLeftWidth: 4,
  },
});
