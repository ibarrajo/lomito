/**
 * Public Impact Dashboard
 * Stitch-aligned dashboard showing platform impact with rich data visualizations.
 */

import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import Head from 'expo-router/head';
import { useTranslation } from 'react-i18next';
import { Container } from '@lomito/ui/components/container';
import { H1, Body } from '@lomito/ui/components/typography';
import { colors, spacing } from '@lomito/ui/theme/tokens';
import { useDashboardStats } from '../../hooks/use-dashboard-stats';
import { StatsRow } from '../../components/dashboard/stats-row';
import { JurisdictionBarChart } from '../../components/dashboard/jurisdiction-bar-chart';
import { TrendLineChart } from '../../components/dashboard/trend-line-chart';
import { EfficiencyRankingTable } from '../../components/dashboard/efficiency-ranking-table';

export default function ImpactPage() {
  const { t } = useTranslation();
  const { stats, loading } = useDashboardStats();

  return (
    <ScrollView style={styles.scrollView}>
      {Platform.OS === 'web' && (
        <Head>
          <title>Lomito — {t('impact.title')}</title>
          <meta name="description" content={t('impact.subtitle')} />
          <meta property="og:title" content={`Lomito — ${t('impact.title')}`} />
          <meta property="og:description" content={t('impact.subtitle')} />
          <meta property="og:url" content="https://lomito.org/impact" />
        </Head>
      )}
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Container>
          <H1 style={styles.heroTitle}>{t('impact.title')}</H1>
          <Body style={styles.heroSubtitle}>{t('impact.subtitle')}</Body>
        </Container>
      </View>

      {/* Stats Cards Row */}
      <View style={styles.statsSection}>
        <Container>
          <StatsRow stats={stats} loading={loading} />
        </Container>
      </View>

      {/* Bar Chart - Cases by Jurisdiction */}
      <View style={styles.chartSection}>
        <Container>
          <JurisdictionBarChart />
        </Container>
      </View>

      {/* Line Chart - Six Month Trend */}
      <View style={styles.chartSection}>
        <Container>
          <TrendLineChart />
        </Container>
      </View>

      {/* Efficiency Ranking Table */}
      <View style={styles.tableSection}>
        <Container>
          <EfficiencyRankingTable />
        </Container>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bottomPadding: {
    height: spacing.xxl,
  },
  chartSection: {
    backgroundColor: colors.white,
    paddingVertical: spacing.xl,
  },
  heroSection: {
    backgroundColor: colors.white,
    paddingBottom: spacing.xl,
    paddingTop: spacing.xl,
  },
  heroSubtitle: {
    color: colors.neutral500,
    marginTop: spacing.sm,
  },
  heroTitle: {
    color: colors.secondary,
  },
  scrollView: {
    backgroundColor: colors.neutral100,
    flex: 1,
  },
  statsSection: {
    backgroundColor: colors.neutral100,
    paddingVertical: spacing.xl,
  },
  tableSection: {
    backgroundColor: colors.neutral100,
    paddingVertical: spacing.xl,
  },
});
