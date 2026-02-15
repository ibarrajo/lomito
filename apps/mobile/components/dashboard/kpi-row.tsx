/**
 * KPIRow Component
 * Horizontal row of 3 KPI cards for dashboard stats.
 */

import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { KPICard } from '@lomito/ui/src/components/kpi-card';
import { spacing } from '@lomito/ui/src/theme/tokens';
import { useDashboardStats } from '../../hooks/use-dashboard-stats';

export function KpiRow() {
  const { t } = useTranslation();
  const { stats, loading } = useDashboardStats();

  const casesReported = stats ? String(stats.total_cases) : '--';
  const casesResolved = stats ? String(stats.resolved_cases) : '--';
  const responseRate =
    stats && stats.total_cases > 0
      ? `${Math.round((stats.resolved_cases / stats.total_cases) * 100)}%`
      : '--';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <KPICard
          label={t('dashboard.kpi.casesReported')}
          value={loading ? '--' : casesReported}
        />
      </View>
      <View style={styles.card}>
        <KPICard
          label={t('dashboard.kpi.casesResolved')}
          value={loading ? '--' : casesResolved}
        />
      </View>
      <View style={styles.card}>
        <KPICard
          label={t('dashboard.kpi.responseRate')}
          value={loading ? '--' : responseRate}
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
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
});
