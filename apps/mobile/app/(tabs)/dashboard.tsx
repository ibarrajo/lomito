/**
 * Dashboard Tab Screen
 * Public impact dashboard with stats and charts.
 */

import { ScrollView, RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  CheckCircle2,
  Clock,
  TrendingUp,
  DollarSign,
  Calendar,
} from 'lucide-react-native';
import { H1, Body } from '@lomito/ui/src/components/typography';
import { Skeleton } from '@lomito/ui/src/components/skeleton';
import { colors, spacing } from '@lomito/ui/src/theme/tokens';
import { useDashboardStats } from '../../hooks/use-dashboard-stats';
import { StatCard } from '../../components/dashboard/stat-card';
import { CategoryChart } from '../../components/dashboard/category-chart';
import { ResolutionRate } from '../../components/dashboard/resolution-rate';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const { stats, loading, error, refetch } = useDashboardStats();

  const handleRefresh = async () => {
    await refetch();
  };

  if (loading && !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <H1 style={styles.header}>
            {t('dashboard.title')}
          </H1>
          <Skeleton width="100%" height={100} borderRadius={12} style={styles.skeleton} />
          <Skeleton width="100%" height={100} borderRadius={12} style={styles.skeleton} />
          <Skeleton width="100%" height={200} borderRadius={12} style={styles.skeleton} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <H1 style={styles.header}>
            {t('dashboard.title')}
          </H1>
          <View style={styles.errorContainer}>
            <Body color={colors.error}>
              {t('common.error')}: {error}
            </Body>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!stats) {
    return null;
  }

  const resolutionPercentage = stats.total_cases > 0
    ? Math.round((stats.resolved_cases / stats.total_cases) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <H1 style={styles.header}>
          {t('dashboard.title')}
        </H1>

        <StatCard
          icon={FileText}
          value={stats.total_cases}
          label={t('dashboard.totalCases')}
          color={colors.primary}
        />

        <View style={styles.row}>
          <View style={styles.halfCard}>
            <StatCard
              icon={Clock}
              value={stats.pending_cases}
              label={t('dashboard.pending')}
              color={colors.warning}
            />
          </View>
          <View style={styles.halfCard}>
            <StatCard
              icon={TrendingUp}
              value={stats.in_progress_cases}
              label={t('dashboard.inProgress')}
              color={colors.info}
            />
          </View>
        </View>

        <StatCard
          icon={CheckCircle2}
          value={`${stats.resolved_cases} (${resolutionPercentage}%)`}
          label={t('dashboard.resolved')}
          color={colors.success}
        />

        <StatCard
          icon={Calendar}
          value={`${stats.avg_resolution_days} ${t('dashboard.days')}`}
          label={t('dashboard.avgResolution')}
          color={colors.secondary}
        />

        <StatCard
          icon={DollarSign}
          value={`$${stats.total_donations.toLocaleString()}`}
          label={t('dashboard.totalDonations')}
          color={colors.accent}
        />

        <CategoryChart
          data={{
            abuse: stats.abuse_cases,
            stray: stats.stray_cases,
            missing: stats.missing_cases,
          }}
        />

        <ResolutionRate
          resolvedCount={stats.resolved_cases}
          totalCount={stats.total_cases}
        />

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral100,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
    color: colors.neutral900,
  },
  skeleton: {
    marginBottom: spacing.md,
  },
  errorContainer: {
    padding: spacing.lg,
    backgroundColor: colors.errorBackground,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  halfCard: {
    flex: 1,
  },
  bottomPadding: {
    height: spacing.xl,
  },
});
