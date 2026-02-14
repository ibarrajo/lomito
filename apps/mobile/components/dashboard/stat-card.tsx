/**
 * StatCard Component
 * Dashboard metric card with icon, value, and label.
 */

import { View, StyleSheet } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Card } from '@lomito/ui/src/components/card';
import { H1, BodySmall } from '@lomito/ui/src/components/typography';
import { colors, spacing } from '@lomito/ui/src/theme/tokens';

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  color?: string;
  accessibilityLabel?: string;
}

export function StatCard({
  icon: Icon,
  value,
  label,
  color = colors.primary,
  accessibilityLabel,
}: StatCardProps) {
  return (
    <Card
      style={styles.card}
      accessibilityLabel={accessibilityLabel ?? `${label}: ${value}`}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <Icon size={24} color={color} strokeWidth={1.5} />
        </View>
        <View style={styles.textContainer}>
          <H1 style={styles.value}>
            {value}
          </H1>
          <BodySmall color={colors.neutral700}>
            {label}
          </BodySmall>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  value: {
    marginBottom: spacing.xs,
  },
});
