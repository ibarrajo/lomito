import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { H2, BodySmall } from '@lomito/ui/src/components/typography';
import { colors, spacing } from '@lomito/ui/src/theme/tokens';
import { useBreakpoint } from '../../hooks/use-breakpoint';

// TODO: Connect to useDashboardStats
const HARDCODED_STATS = {
  activeCases: 47,
  resolvedCases: 312,
  livesSaved: '280+',
  avgResponse: '48h',
};

export function HeroStatsBar() {
  const { t } = useTranslation();
  const { isMobile } = useBreakpoint();

  return (
    <View style={styles.container}>
      <View style={[styles.grid, isMobile && styles.gridMobile]}>
        <View style={styles.statItem}>
          <H2 style={styles.statNumber}>{HARDCODED_STATS.activeCases}</H2>
          <BodySmall style={styles.statLabel}>
            {t('landing.statsActiveCases')}
          </BodySmall>
        </View>
        <View style={styles.statItem}>
          <H2 style={styles.statNumber}>{HARDCODED_STATS.resolvedCases}</H2>
          <BodySmall style={styles.statLabel}>
            {t('landing.statsResolved')}
          </BodySmall>
        </View>
        <View style={styles.statItem}>
          <H2 style={styles.statNumber}>{HARDCODED_STATS.livesSaved}</H2>
          <BodySmall style={styles.statLabel}>
            {t('landing.statsLivesSaved')}
          </BodySmall>
        </View>
        <View style={styles.statItem}>
          <H2 style={styles.statNumber}>{HARDCODED_STATS.avgResponse}</H2>
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
