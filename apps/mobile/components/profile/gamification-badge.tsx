/**
 * Gamification Badge
 * Shows "Civic Guardian Lvl X" based on user's case count
 */

import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Caption, BodySmall } from '@lomito/ui/components/typography';
import { colors, spacing, borderRadius } from '@lomito/ui/theme/tokens';

interface GamificationBadgeProps {
  totalCases: number;
}

function calculateLevel(caseCount: number): number {
  if (caseCount >= 11) return 4;
  if (caseCount >= 6) return 3;
  if (caseCount >= 3) return 2;
  if (caseCount >= 1) return 1;
  return 0;
}

function getNextLevelThreshold(level: number): number {
  if (level === 0) return 1;
  if (level === 1) return 3;
  if (level === 2) return 6;
  if (level === 3) return 11;
  return 20;
}

export const GamificationBadge = memo(function GamificationBadge({
  totalCases,
}: GamificationBadgeProps) {
  const { t } = useTranslation();
  const level = calculateLevel(totalCases);
  const nextThreshold = getNextLevelThreshold(level);

  if (level === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Caption style={styles.badgeText}>
          {t('profile.gamification.civicGuardian')}{' '}
          {t('profile.gamification.level', { level })}
        </Caption>
      </View>
      {level < 4 && (
        <BodySmall style={styles.nextLevelText}>
          {t('profile.gamification.nextLevel', { nextCount: nextThreshold })}
        </BodySmall>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    color: colors.secondary,
    fontWeight: '600',
  },
  container: {
    marginTop: spacing.xs,
  },
  nextLevelText: {
    color: colors.neutral500,
    marginTop: spacing.xs,
  },
});
