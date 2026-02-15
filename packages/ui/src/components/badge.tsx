/**
 * Badge Component
 * Colored pill for category labels.
 */

import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { typography, spacing, borderRadius } from '../theme/tokens';

interface BadgeProps {
  label: string;
  color: string;
  backgroundColor: string;
  accessibilityLabel: string;
  style?: ViewStyle;
}

export function Badge({
  label,
  color,
  backgroundColor,
  accessibilityLabel,
  style,
}: BadgeProps) {
  return (
    <View
      style={[styles.container, { backgroundColor }, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
    >
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.sm + spacing.xs, // 12px
    paddingVertical: spacing.xs,
  },
  text: {
    fontFamily: typography.small.fontFamily,
    fontSize: typography.small.fontSize,
    fontWeight: '600',
    lineHeight: typography.small.fontSize * typography.small.lineHeight,
  },
});
