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
      {/* Section 1: Hero */}
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
            {/* Right side — step indicators */}
            <View style={styles.heroVisual}>
              <View style={styles.stepCard}>
                <View
                  style={[styles.stepDot, { backgroundColor: colors.primary }]}
                />
                <View style={styles.stepContent}>
                  <Text style={styles.stepLabel}>
                    {t('landing.step1Title')}
                  </Text>
                  <Text style={styles.stepDesc}>
                    {t('landing.step1Description')}
                  </Text>
                </View>
              </View>
              <View style={styles.stepConnector} />
              <View style={styles.stepCard}>
                <View
                  style={[styles.stepDot, { backgroundColor: colors.accent }]}
                />
                <View style={styles.stepContent}>
                  <Text style={styles.stepLabel}>
                    {t('landing.step2Title')}
                  </Text>
                  <Text style={styles.stepDesc}>
                    {t('landing.step2Description')}
                  </Text>
                </View>
              </View>
              <View style={styles.stepConnector} />
              <View style={styles.stepCard}>
                <View
                  style={[
                    styles.stepDot,
                    { backgroundColor: colors.secondary },
                  ]}
                />
                <View style={styles.stepContent}>
                  <Text style={styles.stepLabel}>
                    {t('landing.step3Title')}
                  </Text>
                  <Text style={styles.stepDesc}>
                    {t('landing.step3Description')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Container>
      </View>

      {/* Section 2: Hero Stats Bar */}
      <HeroStatsBar />

      {/* Section 3: Live Impact Map */}
      <View style={styles.recentActivitySection}>
        <Container>
          <H2 style={styles.sectionTitle}>{t('landing.recentActivity')}</H2>
          <BodySmall style={styles.sectionSubtitle}>
            {t('landing.recentActivityDescription')}
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

      {/* Section 5: Accountability Section */}
      <View style={styles.accountabilitySection}>
        <Container>
          <AccountabilitySection />
        </Container>
      </View>

      {/* Section 6: CTA Banner */}
      <CtaBanner />

      {/* Section 7: Footer */}
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
    backgroundColor: colors.white,
    paddingVertical: spacing.xxl,
  },
  activeBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  activeBadgeText: {
    color: colors.success,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  activeDot: {
    backgroundColor: colors.success,
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
    borderColor: colors.neutral200,
    borderRadius: borderRadius.button,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  ctaSecondaryText: {
    color: colors.neutral700,
    fontSize: 15,
    fontWeight: '500',
  },
  footerSection: {
    backgroundColor: colors.white,
  },
  hero: {
    backgroundColor: colors.white,
    paddingBottom: spacing.xl,
    paddingTop: spacing.xl,
  },
  heroInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxl,
  },
  heroSubtitle: {
    color: colors.neutral500,
    maxWidth: 480,
  },
  heroText: {
    flex: 1,
    minWidth: 320,
    paddingVertical: spacing.lg,
  },
  heroTitle: {
    marginBottom: spacing.md,
  },
  heroVisual: {
    flex: 1,
    maxWidth: 380,
    minWidth: 280,
    paddingVertical: spacing.md,
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
  stepCard: {
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.card,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  stepConnector: {
    backgroundColor: colors.neutral200,
    height: 20,
    marginLeft: 20,
    width: 1,
  },
  stepContent: {
    flex: 1,
  },
  stepDesc: {
    color: colors.neutral500,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  stepDot: {
    borderRadius: 9999,
    height: 10,
    marginTop: 5,
    width: 10,
  },
  stepLabel: {
    color: colors.neutral900,
    fontSize: 14,
    fontWeight: '600',
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
});
