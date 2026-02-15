import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Container } from '@lomito/ui/components/container';
import { H1, H2, Body, BodySmall } from '@lomito/ui/components/typography';
import { Card } from '@lomito/ui/components/card';
import { Button } from '@lomito/ui/components/button';
import { colors, spacing, typography } from '@lomito/ui/theme/tokens';
import { useDashboardStats } from '../../hooks/use-dashboard-stats';
import { useBreakpoint } from '../../hooks/use-breakpoint';

interface StatCardProps {
  value: number | string;
  label: string;
  accentColor?: string;
}

function StatCard({ value, label, accentColor }: StatCardProps) {
  return (
    <Card style={styles.statCard}>
      <Text style={[styles.statValue, accentColor && { color: accentColor }]}>
        {value}
      </Text>
      <BodySmall style={styles.statLabel}>{label}</BodySmall>
    </Card>
  );
}

export default function ImpactPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { stats, loading } = useDashboardStats();
  const { isMobile } = useBreakpoint();

  const displayValue = (value: number | undefined): string => {
    if (loading || value === undefined) return '—';
    return value.toLocaleString();
  };

  const formatDonations = (amount: number | undefined): string => {
    if (loading || amount === undefined) return '—';
    return `$${amount.toLocaleString()} MXN`;
  };

  return (
    <ScrollView style={styles.scrollView}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Container>
          <H1 style={styles.heroTitle}>{t('impact.title')}</H1>
          <Body style={styles.heroSubtitle}>{t('impact.subtitle')}</Body>
        </Container>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsSection}>
        <Container>
          <View
            style={[
              styles.statsGrid,
              isMobile ? styles.statsGridMobile : styles.statsGridDesktop,
            ]}
          >
            <StatCard
              value={displayValue(stats?.total_cases)}
              label={t('impact.totalCases')}
              accentColor={colors.secondary}
            />
            <StatCard
              value={displayValue(stats?.resolved_cases)}
              label={t('impact.resolvedCases')}
              accentColor={colors.success}
            />
            <StatCard
              value={displayValue(stats?.pending_cases)}
              label={t('impact.pendingCases')}
              accentColor={colors.warning}
            />
            <StatCard
              value={displayValue(stats?.in_progress_cases)}
              label={t('impact.inProgressCases')}
              accentColor={colors.info}
            />
          </View>
        </Container>
      </View>

      {/* Category Breakdown */}
      <View style={styles.categorySection}>
        <Container>
          <H2 style={styles.sectionTitle}>{t('impact.categoryBreakdown')}</H2>
          <View
            style={[
              styles.categoryGrid,
              isMobile ? styles.categoryGridMobile : styles.categoryGridDesktop,
            ]}
          >
            <StatCard
              value={displayValue(stats?.abuse_cases)}
              label={t('impact.abuseCases')}
              accentColor={colors.error}
            />
            <StatCard
              value={displayValue(stats?.stray_cases)}
              label={t('impact.strayCases')}
              accentColor={colors.accent}
            />
            <StatCard
              value={displayValue(stats?.missing_cases)}
              label={t('impact.missingCases')}
              accentColor={colors.info}
            />
          </View>
        </Container>
      </View>

      {/* Transparency Section */}
      <View style={styles.transparencySection}>
        <Container>
          <H2 style={styles.sectionTitle}>{t('impact.transparency')}</H2>
          <Body style={styles.transparencyDescription}>
            {t('impact.transparencyDescription')}
          </Body>
          <View
            style={[
              styles.transparencyGrid,
              isMobile
                ? styles.transparencyGridMobile
                : styles.transparencyGridDesktop,
            ]}
          >
            <Card style={styles.transparencyCard}>
              <Text style={styles.transparencyValue}>
                {t('impact.avgResolutionDays', {
                  days: displayValue(stats?.avg_resolution_days),
                })}
              </Text>
              <BodySmall style={styles.transparencyLabel}>
                {t('impact.avgResolution')}
              </BodySmall>
            </Card>
            <Card style={styles.transparencyCard}>
              <Text style={styles.transparencyValue}>
                {formatDonations(stats?.total_donations)}
              </Text>
              <BodySmall style={styles.transparencyLabel}>
                {t('impact.totalDonations')}
              </BodySmall>
            </Card>
          </View>
        </Container>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Container>
          <Card style={styles.ctaCard}>
            <H2 style={styles.ctaTitle}>{t('impact.joinCta')}</H2>
            <Body style={styles.ctaDescription}>
              {t('impact.joinDescription')}
            </Body>
            <Button
              variant="primary"
              onPress={() => router.push('/auth/register')}
              accessibilityLabel={t('impact.joinCta')}
              style={styles.ctaButton}
            >
              {t('impact.joinCta')}
            </Button>
          </Card>
        </Container>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  categoryGrid: {
    gap: spacing.md,
  },
  categoryGridDesktop: {
    flexDirection: 'row',
  },
  categoryGridMobile: {
    flexDirection: 'column',
  },
  categorySection: {
    backgroundColor: colors.white,
    paddingVertical: spacing.xxl,
  },
  ctaButton: {
    alignSelf: 'flex-start',
  },
  ctaCard: {
    alignItems: 'flex-start',
    padding: spacing.xl,
  },
  ctaDescription: {
    color: colors.neutral500,
    marginBottom: spacing.lg,
  },
  ctaSection: {
    backgroundColor: colors.white,
    paddingVertical: spacing.xxl,
  },
  ctaTitle: {
    marginBottom: spacing.sm,
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
  sectionTitle: {
    marginBottom: spacing.lg,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    minWidth: 140,
    padding: spacing.lg,
  },
  statLabel: {
    color: colors.neutral500,
    textAlign: 'center',
  },
  statValue: {
    color: colors.secondary,
    fontFamily: typography.fontFamily.display,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statsGrid: {
    gap: spacing.md,
  },
  statsGridDesktop: {
    flexDirection: 'row',
  },
  statsGridMobile: {
    flexDirection: 'column',
  },
  statsSection: {
    backgroundColor: colors.neutral100,
    paddingVertical: spacing.xxl,
  },
  transparencyCard: {
    alignItems: 'center',
    flex: 1,
    minWidth: 200,
    padding: spacing.lg,
  },
  transparencyDescription: {
    color: colors.neutral500,
    marginBottom: spacing.lg,
  },
  transparencyGrid: {
    gap: spacing.md,
  },
  transparencyGridDesktop: {
    flexDirection: 'row',
  },
  transparencyGridMobile: {
    flexDirection: 'column',
  },
  transparencyLabel: {
    color: colors.neutral500,
    textAlign: 'center',
  },
  transparencySection: {
    backgroundColor: colors.neutral100,
    paddingVertical: spacing.xxl,
  },
  transparencyValue: {
    color: colors.primary,
    fontFamily: typography.fontFamily.display,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
});
