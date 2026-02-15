/**
 * ProgressBar Component
 * Simple colored progress bar with optional label.
 */

import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme/tokens';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  label?: string;
  showPercentage?: boolean;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  color = colors.primary,
  label,
  showPercentage = false,
  style,
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View
      style={[styles.container, style]}
      accessibilityLabel={label ?? `${clampedProgress}%`}
    >
      {(label || showPercentage) && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercentage && (
            <Text style={styles.percentage}>{clampedProgress}%</Text>
          )}
        </View>
      )}
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              width: `${clampedProgress}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  fill: {
    borderRadius: borderRadius.pill,
    height: '100%',
  },
  label: {
    color: colors.neutral700,
    flex: 1,
    fontFamily: typography.small.fontFamily,
    fontSize: typography.small.fontSize,
    fontWeight: typography.small.fontWeight,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  percentage: {
    color: colors.neutral500,
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  track: {
    backgroundColor: colors.neutral200,
    borderRadius: borderRadius.pill,
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
});
