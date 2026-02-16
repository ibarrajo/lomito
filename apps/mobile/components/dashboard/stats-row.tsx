/**
 * StatsRow Component
 * Three horizontal stats cards with trend indicators for the impact dashboard.
 */

import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { KPICard } from '@lomito/ui/src/components/kpi-card';
import { colors, spacing } from '@lomito/ui/src/theme/tokens';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import type { DashboardStats } from '../../hooks/use-dashboard-stats';

interface StatsRowProps {
  stats: DashboardStats | null;
  loading?: boolean;
}

export function StatsRow({ stats, loading }: StatsRowProps) {
  const { t } = useTranslation();
  const { isMobile } = useBreakpoint();

  // Lives Impacted (total cases)
  const livesImpacted = stats ? stats.total_cases : 0;
  const livesImpactedTrend: {
    direction: 'up' | 'down' | 'neutral';
    label: string;
  } = {
    direction: 'up',
    label: '+12%',
  };

  // Resolution Rate
  const resolutionRate =
    stats && stats.total_cases > 0
      ? Math.round((stats.resolved_cases / stats.total_cases) * 100)
      : 0;
  const resolutionGoal = 80;
  const resolutionTrend: {
    direction: 'up' | 'down' | 'neutral';
    label: string;
  } = {
    direction: resolutionRate >= resolutionGoal ? 'up' : 'down',
    label: t('impact.resolutionVsGoal', {
      rate: resolutionRate,
      goal: resolutionGoal,
      defaultValue: `${resolutionRate}% vs ${resolutionGoal}% goal`,
    }),
  };

  // Response Time
  const responseTime = stats ? stats.avg_resolution_days : 0;
  const responseTimeHours = Math.round(responseTime * 24 * 10) / 10; // Round to 1 decimal
  const responseTimeTrend: {
    direction: 'up' | 'down' | 'neutral';
    label: string;
  } = {
    direction: 'down',
    label: t('impact.responseImprovement', {
      improvement: 4,
      defaultValue: '-4 hrs improvement',
    }),
  };

  return (
    <View
      style={[
        styles.container,
        isMobile ? styles.containerMobile : styles.containerDesktop,
      ]}
    >
      <View style={styles.card}>
        <KPICard
          label={t('impact.livesImpacted')}
          value={loading ? '--' : livesImpacted.toLocaleString()}
          trend={livesImpactedTrend}
          icon={<TrendingUp size={24} color={colors.success} />}
        />
      </View>
      <View style={styles.card}>
        <KPICard
          label={t('impact.resolutionRate')}
          value={loading ? '--' : `${resolutionRate}%`}
          trend={resolutionTrend}
        />
      </View>
      <View style={styles.card}>
        <KPICard
          label={t('impact.responseTime')}
          value={
            loading
              ? '--'
              : t('impact.responseTimeValue', {
                  hours: responseTimeHours,
                  defaultValue: `${responseTimeHours} hrs`,
                })
          }
          trend={responseTimeTrend}
          icon={<TrendingDown size={24} color={colors.success} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  container: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  containerDesktop: {
    flexDirection: 'row',
  },
  containerMobile: {
    flexDirection: 'column',
  },
});
