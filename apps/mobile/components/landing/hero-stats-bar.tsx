import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { H2, BodySmall } from '@lomito/ui/src/components/typography';
import { Skeleton } from '@lomito/ui';
import { colors, spacing } from '@lomito/ui/src/theme/tokens';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { useDashboardStats } from '../../hooks/use-dashboard-stats';

export function HeroStatsBar() {
  const { t } = useTranslation();
  const { isMobile } = useBreakpoint();
  const { stats, loading } = useDashboardStats();

  const displayStats = stats
    ? {
        activeCases: stats.pending_cases + stats.in_progress_cases,
        resolvedCases: stats.resolved_cases,
        livesSaved: `${stats.resolved_cases}+`,
        avgResponse: stats.avg_resolution_days
          ? `${Math.round(stats.avg_resolution_days * 24)}h`
          : '--',
      }
    : null;

  const labels = [
    t('landing.statsActiveCasesLong'),
    t('landing.statsResolvedLong'),
    t('landing.statsLivesSavedLong'),
    t('landing.statsAvgResponseLong'),
  ];

  const values = displayStats
    ? [
        displayStats.activeCases,
        displayStats.resolvedCases,
        displayStats.livesSaved,
        displayStats.avgResponse,
      ]
    : [];

  return (
    <View style={styles.container}>
      <View style={[styles.grid, !isMobile && styles.gridTablet]}>
        {labels.map((label, i) => (
          <View key={label} style={styles.statItem}>
            {loading || !displayStats ? (
              <Skeleton
                width={64}
                height={32}
                borderRadius={spacing.xs}
                style={styles.skeletonNumber}
              />
            ) : (
              <H2 style={styles.statNumber}>{values[i]}</H2>
            )}
            <BodySmall style={styles.statLabel}>{label}</BodySmall>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.darkSurface,
    borderTopColor: colors.darkSurfaceLight,
    borderTopWidth: 1,
    paddingVertical: spacing.xl,
  },
  grid: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  gridTablet: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-around',
    paddingHorizontal: 0,
  },
  skeletonNumber: {
    marginBottom: spacing.xs,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: 140,
  },
  statLabel: {
    color: colors.neutral400,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  statNumber: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
});
