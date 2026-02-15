import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { H2, BodySmall } from '@lomito/ui/src/components/typography';
import { colors, spacing } from '@lomito/ui/src/theme/tokens';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { useDashboardStats } from '../../hooks/use-dashboard-stats';

const FALLBACK_STATS = {
  activeCases: 0,
  resolvedCases: 0,
  livesSaved: '0',
  avgResponse: '--',
};

export function HeroStatsBar() {
  const { t } = useTranslation();
  const { isMobile } = useBreakpoint();
  const { stats } = useDashboardStats();

  const displayStats = stats
    ? {
        activeCases: stats.pending_cases + stats.in_progress_cases,
        resolvedCases: stats.resolved_cases,
        livesSaved: `${stats.resolved_cases}+`,
        avgResponse: stats.avg_resolution_days
          ? `${Math.round(stats.avg_resolution_days * 24)}h`
          : '--',
      }
    : FALLBACK_STATS;

  return (
    <View style={styles.container}>
      <View style={[styles.grid, isMobile && styles.gridMobile]}>
        <View style={styles.statItem}>
          <H2 style={styles.statNumber}>{displayStats.activeCases}</H2>
          <BodySmall style={styles.statLabel}>
            {t('landing.statsActiveCases')}
          </BodySmall>
        </View>
        <View style={styles.statItem}>
          <H2 style={styles.statNumber}>{displayStats.resolvedCases}</H2>
          <BodySmall style={styles.statLabel}>
            {t('landing.statsResolved')}
          </BodySmall>
        </View>
        <View style={styles.statItem}>
          <H2 style={styles.statNumber}>{displayStats.livesSaved}</H2>
          <BodySmall style={styles.statLabel}>
            {t('landing.statsLivesSaved')}
          </BodySmall>
        </View>
        <View style={styles.statItem}>
          <H2 style={styles.statNumber}>{displayStats.avgResponse}</H2>
          <BodySmall style={styles.statLabel}>
            {t('landing.statsAvgResponse')}
          </BodySmall>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral100,
    borderTopColor: colors.neutral200,
    borderTopWidth: 1,
    paddingVertical: spacing.lg,
  },
  grid: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  gridMobile: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: 120,
  },
  statLabel: {
    color: colors.neutral500,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  statNumber: {
    color: colors.primary,
    marginBottom: spacing.xs,
  },
});
