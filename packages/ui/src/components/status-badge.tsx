/**
 * StatusBadge Component
 * Colored pill for case statuses, priorities, and categories.
 */

import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../theme/tokens';

type BadgeVariant =
  | 'high'
  | 'medium'
  | 'low'
  | 'pending'
  | 'active'
  | 'resolved'
  | 'new'
  | 'escalated';

const VARIANT_COLORS: Record<
  BadgeVariant,
  { bg: string; text: string; border: string }
> = {
  high: {
    bg: colors.errorBackground,
    text: colors.error,
    border: colors.error,
  },
  medium: {
    bg: colors.warningBackground,
    text: '#92400E',
    border: colors.warning,
  },
  low: {
    bg: colors.infoBackground,
    text: colors.info,
    border: colors.info,
  },
  pending: {
    bg: colors.warningBackground,
    text: '#92400E',
    border: colors.warning,
  },
  active: {
    bg: colors.infoBackground,
    text: colors.info,
    border: colors.info,
  },
  resolved: {
    bg: colors.successBackground,
    text: colors.success,
    border: colors.success,
  },
  new: {
    bg: colors.primaryLight,
    text: colors.primaryDark,
    border: colors.primary,
  },
  escalated: {
    bg: colors.errorBackground,
    text: colors.error,
    border: colors.error,
  },
};

interface StatusBadgeProps {
  variant: BadgeVariant;
  label: string;
  style?: ViewStyle;
}

export function StatusBadge({ variant, label, style }: StatusBadgeProps) {
  const variantColors = VARIANT_COLORS[variant];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantColors.bg,
          borderColor: variantColors.border,
        },
        style,
      ]}
      accessibilityLabel={label}
      accessibilityRole="text"
    >
      <Text style={[styles.text, { color: variantColors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.tag,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  text: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    lineHeight: typography.caption.fontSize * typography.caption.lineHeight,
    textTransform: 'uppercase',
  },
});
