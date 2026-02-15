/**
 * KPICard Component
 * Displays a key metric with label, value, and optional trend indicator.
 */

import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadowStyles,
} from '../theme/tokens';

interface KPICardProps {
  label: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    label: string;
  };
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function KPICard({ label, value, trend, icon, style }: KPICardProps) {
  const trendColor =
    trend?.direction === 'up'
      ? colors.success
      : trend?.direction === 'down'
        ? colors.error
        : colors.neutral500;

  return (
    <View
      style={[styles.card, style]}
      accessibilityLabel={`${label}: ${value}`}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {trend && (
        <Text style={[styles.trend, { color: trendColor }]}>
          {trend.direction === 'up'
            ? '\u2191'
            : trend.direction === 'down'
              ? '\u2193'
              : '\u2192'}{' '}
          {trend.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadowStyles.card,
  },
  iconContainer: {
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.neutral500,
    fontFamily: typography.small.fontFamily,
    fontSize: typography.small.fontSize,
    fontWeight: typography.small.fontWeight,
    lineHeight: typography.small.fontSize * typography.small.lineHeight,
    marginTop: spacing.xs,
  },
  trend: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    lineHeight: typography.caption.fontSize * typography.caption.lineHeight,
    marginTop: spacing.sm,
  },
  value: {
    color: colors.neutral900,
    fontFamily: typography.display.fontFamily,
    fontSize: typography.h1.fontSize,
    fontWeight: '700',
    lineHeight: typography.h1.fontSize * typography.h1.lineHeight,
  },
});
