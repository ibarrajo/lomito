import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react-native';
import { Container } from '@lomito/ui/src/components/container';
import { H1, H2, Body, BodySmall } from '@lomito/ui/src/components/typography';
import {
  colors,
  spacing,
  borderRadius,
  shadowStyles,
} from '@lomito/ui/src/theme/tokens';
import { RecentReportsTicker } from '../../components/landing/recent-reports-ticker';
import { HeroStatsBar } from '../../components/landing/hero-stats-bar';
import { ProcessSteps } from '../../components/landing/process-steps';
import { AccountabilitySection } from '../../components/landing/accountability-section';
import { TransparencySection } from '../../components/landing/transparency-section';
import { CtaBanner } from '../../components/landing/cta-banner';
import { LandingFooter } from '../../components/landing/landing-footer';
import { useAnalytics } from '../../hooks/use-analytics';

export default function LandingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { trackEvent } = useAnalytics();

  if (Platform.OS !== 'web') {
    return <Redirect href="/auth/login" />;
  }

  return (
    <ScrollView style={styles.scrollView}>
      {/* Section 1: Hero (Dark) */}
      <View style={styles.hero}>
        <Container>
          <View style={styles.heroInner}>
            <View style={styles.heroText}>
              {/* Active Now Badge */}
              <View style={styles.activeBadge}>
                <View style={styles.activeDot} />
                <BodySmall style={styles.activeBadgeText}>
                  {t('landing.activeNow')}
                </BodySmall>
              </View>
              <H1 style={styles.heroTitle}>{t('landing.heroTitle')}</H1>
              <Body style={styles.heroSubtitle}>
                {t('landing.heroSubtitle')}
              </Body>
              <View style={styles.ctaRow}>
                <TouchableOpacity
                  style={styles.ctaPrimary}
                  onPress={() => {
                    trackEvent('cta_click', { label: 'report_now' });
                    router.push('/auth/register');
                  }}
                  accessibilityLabel={t('landing.ctaReport')}
                  accessibilityRole="button"
                >
                  <Text style={styles.ctaPrimaryText}>
                    {t('landing.ctaReport')}
                  </Text>
                  <ArrowRight
                    size={18}
                    color={colors.secondary}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.ctaSecondary}
                  onPress={() => {
                    trackEvent('cta_click', { label: 'view_map' });
                    router.push('/auth/login');
                  }}
                  accessibilityLabel={t('landing.ctaViewMap')}
                  accessibilityRole="button"
                >
                  <Text style={styles.ctaSecondaryText}>
                    {t('landing.ctaViewMap')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Container>
      </View>

      {/* Section 2: Hero Stats Bar */}
      <HeroStatsBar />

      {/* Section 3: Live Impact Map + Recent Activity */}
      <View style={styles.recentActivitySection}>
        <Container>
          <H2 style={styles.sectionTitle}>{t('landing.liveImpactMapTitle')}</H2>
          <BodySmall style={styles.sectionSubtitle}>
            {t('landing.liveImpactMapDescription')}
          </BodySmall>
          <View style={styles.activityGrid}>
            <View style={styles.mapCard}>
              <View style={styles.mapPlaceholder}>
                <Text style={styles.mapPlaceholderText}>Tijuana</Text>
              </View>
            </View>
            <View style={styles.tickerCard}>
              <RecentReportsTicker />
            </View>
          </View>
        </Container>
      </View>

      {/* Section 4: Process Steps */}
      <View style={styles.processSection}>
        <Container>
          <H2 style={styles.sectionTitle}>{t('landing.processTitle')}</H2>
          <View style={styles.processSpacer} />
          <ProcessSteps />
        </Container>
      </View>

      {/* Section 5: Transparency Section */}
      <View style={styles.transparencySection}>
        <Container>
          <TransparencySection />
        </Container>
      </View>

      {/* Section 6: Accountability Section */}
      <View style={styles.accountabilitySection}>
        <Container>
          <AccountabilitySection />
        </Container>
      </View>

      {/* Section 7: CTA Banner */}
      <CtaBanner />

      {/* Section 8: Footer */}
      <View style={styles.footerSection}>
        <Container>
          <LandingFooter />
        </Container>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  accountabilitySection: {
    backgroundColor: colors.neutral100,
    paddingVertical: spacing.xxl,
  },
  activeBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  activeBadgeText: {
    color: colors.primary,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  activeDot: {
    backgroundColor: colors.primary,
    borderRadius: 9999,
    height: 8,
    width: 8,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  ctaPrimary: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.button,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  ctaPrimaryText: {
    color: colors.secondary,
    fontSize: 15,
    fontWeight: '600',
  },
  ctaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  ctaSecondary: {
    borderColor: colors.primaryLight,
    borderRadius: borderRadius.button,
    borderWidth: 2,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  ctaSecondaryText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  footerSection: {
    backgroundColor: colors.white,
  },
  hero: {
    backgroundColor: colors.secondary,
    paddingBottom: spacing.xl,
    paddingTop: spacing.xl,
  },
  heroInner: {
    alignItems: 'center',
    flexDirection: 'column',
    gap: spacing.lg,
  },
  heroSubtitle: {
    color: colors.neutral400,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 680,
    textAlign: 'center',
  },
  heroText: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    width: '100%',
  },
  heroTitle: {
    color: colors.white,
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 48,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  mapCard: {
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    flex: 1,
    minWidth: 280,
    overflow: 'hidden',
    ...shadowStyles.card,
  },
  mapPlaceholder: {
    alignItems: 'center',
    backgroundColor: colors.neutral100,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.card,
    borderStyle: 'dashed',
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 280,
  },
  mapPlaceholderText: {
    color: colors.neutral400,
    fontSize: 18,
    fontWeight: '600',
  },
  processSection: {
    backgroundColor: colors.white,
    paddingVertical: spacing.xxl,
  },
  processSpacer: {
    height: spacing.lg,
  },
  recentActivitySection: {
    backgroundColor: colors.neutral100,
    paddingVertical: spacing.xxl,
  },
  scrollView: {
    backgroundColor: colors.neutral100,
    flex: 1,
  },
  sectionSubtitle: {
    color: colors.neutral500,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  tickerCard: {
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    flex: 1,
    minWidth: 320,
    overflow: 'hidden',
    ...shadowStyles.card,
  },
  transparencySection: {
    backgroundColor: colors.white,
    paddingVertical: spacing.xxl,
  },
});
