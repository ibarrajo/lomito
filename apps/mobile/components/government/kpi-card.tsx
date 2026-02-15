/**
 * KPI Card Component
 * Displays key performance indicator with icon, value, and label
 */

import { View, Text, StyleSheet } from 'react-native';
import {
  colors,
  spacing,
  typography,
  borderRadius,
} from '@lomito/ui/theme/tokens';

interface KpiCardProps {
  icon: string;
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  accessibilityLabel: string;
}

export function KpiCard({
  icon,
  value,
  label,
  trend,
  trendValue,
  accessibilityLabel,
}: KpiCardProps) {
  const trendColor =
    trend === 'up'
      ? colors.success
      : trend === 'down'
        ? colors.error
        : colors.neutral500;

  return (
    <View style={styles.container} accessibilityLabel={accessibilityLabel}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {trend && trendValue && (
        <Text style={[styles.trend, { color: trendColor }]}>{trendValue}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    flex: 1,
    minWidth: 150,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  icon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.neutral700,
    fontFamily: typography.small.fontFamily,
    fontSize: typography.small.fontSize,
    fontWeight: '500',
    lineHeight: typography.small.fontSize * typography.small.lineHeight,
    textAlign: 'center',
  },
  trend: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    marginTop: spacing.xs,
  },
  value: {
    color: colors.secondary,
    fontFamily: typography.h1.fontFamily,
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    lineHeight: typography.h1.fontSize * typography.h1.lineHeight,
    marginBottom: spacing.xs,
  },
});
