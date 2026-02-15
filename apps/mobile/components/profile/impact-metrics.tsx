/**
 * Impact Metrics Cards
 * Shows Animals Assisted, Cases Resolved, Total Donations with milestone tracking
 */

import { memo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { H3, Caption } from '@lomito/ui/components/typography';
import { Card } from '@lomito/ui/components/card';
import { colors, spacing } from '@lomito/ui/theme/tokens';

interface ImpactMetricsProps {
  totalCases: number;
  resolvedCases: number;
  pendingCases: number;
  totalDonations: number;
}

export const ImpactMetrics = memo(function ImpactMetrics({
  totalCases,
  resolvedCases,
  pendingCases,
  totalDonations,
}: ImpactMetricsProps) {
  const { t } = useTranslation();

  const nextDonationMilestone =
    totalDonations < 500 ? { name: 'Gold Donor', amount: '$500' } : null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Animals Assisted */}
        <Card variant="default" style={styles.metricCard}>
          <Caption style={styles.metricLabel}>
            {t('profile.impact.animalsAssisted')}
          </Caption>
          <H3 style={styles.metricValue}>{totalCases}</H3>
        </Card>

        {/* Cases Resolved */}
        <Card variant="default" style={styles.metricCard}>
          <Caption style={styles.metricLabel}>
            {t('profile.impact.casesResolved')}
          </Caption>
          <H3 style={styles.metricValue}>{resolvedCases}</H3>
          {pendingCases > 0 && (
            <Caption style={styles.pendingText}>
              {t('profile.impact.pending', { count: pendingCases })}
            </Caption>
          )}
        </Card>

        {/* Total Donations */}
        <Card variant="default" style={styles.metricCard}>
          <Caption style={styles.metricLabel}>
            {t('profile.impact.totalDonations')}
          </Caption>
          <H3 style={styles.metricValue}>${totalDonations.toFixed(2)}</H3>
          {nextDonationMilestone && (
            <Caption style={styles.milestoneText}>
              {t('profile.impact.nextMilestone', {
                name: nextDonationMilestone.name,
                amount: nextDonationMilestone.amount,
              })}
            </Caption>
          )}
        </Card>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  metricCard: {
    marginRight: spacing.md,
    minWidth: 160,
    padding: spacing.md,
  },
  metricLabel: {
    color: colors.neutral500,
    marginBottom: spacing.xs,
  },
  metricValue: {
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  milestoneText: {
    color: colors.primary,
  },
  pendingText: {
    color: colors.warning,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },
});
