/**
 * EmptyState Component
 * Centered icon + title + optional description + optional CTA button.
 */

import { View, StyleSheet, type ViewStyle } from 'react-native';
import { H3, Body } from './typography';
import { Button } from './button';
import { colors, spacing } from '../theme/tokens';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
  onCtaPress,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]} accessibilityLabel={title}>
      <View style={styles.iconContainer}>{icon}</View>
      <H3 style={styles.title} color={colors.neutral700}>
        {title}
      </H3>
      {description && (
        <Body style={styles.description} color={colors.neutral500}>
          {description}
        </Body>
      )}
      {ctaLabel && onCtaPress && (
        <Button
          variant="secondary"
          onPress={onCtaPress}
          accessibilityLabel={ctaLabel}
          style={styles.cta}
        >
          {ctaLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  cta: {
    marginTop: spacing.sm,
  },
  description: {
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});
