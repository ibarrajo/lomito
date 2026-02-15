/**
 * Card Component
 * Container with shadow and optional category border for map summaries.
 */

import { useState } from 'react';
import { View, StyleSheet, Platform, type ViewStyle } from 'react-native';
import {
  colors,
  spacing,
  borderRadius,
  shadowStyles,
  shadows,
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
  const [isHovered, setIsHovered] = useState(false);

  const webHoverStyle =
    Platform.OS === 'web'
      ? ({
          transition: 'box-shadow 0.2s ease',
          boxShadow: isHovered ? shadows.elevated : shadows.card,
        } as ViewStyle)
      : {};

  return (
    <View
      style={[
        styles.base,
        variant === 'mapSummary' && styles.mapSummary,
        variant === 'mapSummary' &&
          categoryColor && { borderLeftColor: categoryColor },
        webHoverStyle,
        style,
      ]}
      {...(Platform.OS === 'web' && {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
      })}
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
