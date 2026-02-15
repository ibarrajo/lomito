import { View, StyleSheet, ScrollView, Platform, TouchableOpacity, Text } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MapPin, ArrowRight, Search, Bell } from 'lucide-react-native';
import { Container } from '@lomito/ui/src/components/container';
import { H1, H2, H3, Body, BodySmall } from '@lomito/ui/src/components/typography';
import { colors, spacing, borderRadius, shadowStyles } from '@lomito/ui/src/theme/tokens';
import { isFeatureEnabled } from '@lomito/shared';
import { RecentReportsTicker } from '../../components/landing/recent-reports-ticker';
import { useAnalytics } from '../../hooks/use-analytics';

export default function LandingPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { trackEvent } = useAnalytics();

  if (Platform.OS !== 'web') {
    return <Redirect href="/auth/login" />;
  }

  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <ScrollView style={styles.scrollView}>
      {/* Hero — left-aligned, warm, with clear value prop */}
      <View style={styles.hero}>
        <Container>
          <View style={styles.heroInner}>
            <View style={styles.heroText}>
              <BodySmall style={styles.heroTag}>
                {i18n.language === 'es' ? 'Plataforma cívica para Tijuana' : 'Civic platform for Tijuana'}
              </BodySmall>
              <H1 style={styles.heroTitle}>{t('landing.heroTitle')}</H1>
              <Body style={styles.heroSubtitle}>{t('landing.heroSubtitle')}</Body>
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
                  <Text style={styles.ctaPrimaryText}>{t('landing.ctaReport')}</Text>
                  <ArrowRight size={18} color={colors.white} strokeWidth={2} />
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
                  <Text style={styles.ctaSecondaryText}>{t('landing.ctaViewMap')}</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Right side — step indicators as a visual instead of generic icons */}
            <View style={styles.heroVisual}>
              <View style={styles.stepCard}>
                <View style={[styles.stepDot, { backgroundColor: colors.primary }]} />
                <View style={styles.stepContent}>
                  <Text style={styles.stepLabel}>{t('landing.step1Title')}</Text>
                  <Text style={styles.stepDesc}>{t('landing.step1Description')}</Text>
                </View>
              </View>
              <View style={styles.stepConnector} />
              <View style={styles.stepCard}>
                <View style={[styles.stepDot, { backgroundColor: colors.accent }]} />
                <View style={styles.stepContent}>
                  <Text style={styles.stepLabel}>{t('landing.step2Title')}</Text>
                  <Text style={styles.stepDesc}>{t('landing.step2Description')}</Text>
                </View>
              </View>
              <View style={styles.stepConnector} />
              <View style={styles.stepCard}>
                <View style={[styles.stepDot, { backgroundColor: colors.secondary }]} />
                <View style={styles.stepContent}>
                  <Text style={styles.stepLabel}>{t('landing.step3Title')}</Text>
                  <Text style={styles.stepDesc}>{t('landing.step3Description')}</Text>
                </View>
              </View>
            </View>
          </View>
        </Container>
      </View>

      {/* Features — asymmetric bento layout, not 3 identical cards */}
      <View style={styles.featuresSection}>
        <Container>
          <H2 style={styles.featuresTitle}>{t('landing.howItWorksTitle')}</H2>
          <View style={styles.bentoGrid}>
            {/* Large card */}
            <View style={[styles.bentoCard, styles.bentoLarge]}>
              <View style={[styles.featureIcon, { backgroundColor: colors.primaryLight }]}>
                <MapPin size={24} color={colors.primary} strokeWidth={1.5} />
              </View>
              <H3 style={styles.featureTitle}>{t('landing.step1Title')}</H3>
              <Body style={styles.featureDesc}>{t('landing.step1Description')}</Body>
            </View>
            {/* Two smaller cards stacked */}
            <View style={styles.bentoStack}>
              <View style={[styles.bentoCard, styles.bentoSmall]}>
                <View style={[styles.featureIcon, { backgroundColor: colors.secondaryLight }]}>
                  <Search size={20} color={colors.secondary} strokeWidth={1.5} />
                </View>
                <H3 style={styles.featureTitle}>{t('landing.step2Title')}</H3>
                <Body style={styles.featureDesc}>{t('landing.step2Description')}</Body>
              </View>
              <View style={[styles.bentoCard, styles.bentoSmall]}>
                <View style={[styles.featureIcon, { backgroundColor: '#F0FFF4' }]}>
                  <Bell size={20} color={colors.success} strokeWidth={1.5} />
                </View>
                <H3 style={styles.featureTitle}>{t('landing.step3Title')}</H3>
                <Body style={styles.featureDesc}>{t('landing.step3Description')}</Body>
              </View>
            </View>
          </View>
        </Container>
      </View>

      {/* Recent Activity — map preview + recent reports */}
      <View style={styles.recentActivitySection}>
        <Container>
          <H2 style={styles.sectionTitle}>{t('landing.recentActivity')}</H2>
          <BodySmall style={styles.sectionSubtitle}>{t('landing.recentActivityDescription')}</BodySmall>
          <View style={styles.activityGrid}>
            {/* Left side: decorative map placeholder */}
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapPlaceholderText}>Tijuana</Text>
            </View>
            {/* Right side: recent reports ticker */}
            <View style={styles.tickerContainer}>
              <RecentReportsTicker />
            </View>
          </View>
        </Container>
      </View>

      {/* Community — compact, left-aligned */}
      <View style={styles.communitySection}>
        <Container>
          <View style={styles.communityInner}>
            <View style={styles.communityAccent} />
            <View style={styles.communityText}>
              <H2>{t('landing.communityTitle')}</H2>
              <Body style={styles.communityDesc}>{t('landing.communityDescription')}</Body>
            </View>
          </View>
        </Container>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Container>
          <View style={styles.footerInner}>
            <View style={styles.footerLeft}>
              <Text style={styles.footerBrand}>Lomito</Text>
              <BodySmall style={styles.footerTagline}>{t('landing.footerTagline')}</BodySmall>
            </View>
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => router.push('/about')} accessibilityRole="link">
                <Text style={styles.footerLink}>{t('about.title')}</Text>
              </TouchableOpacity>
              {isFeatureEnabled('donations') && (
              <TouchableOpacity onPress={() => router.push('/donate')} accessibilityRole="link">
                <Text style={styles.footerLink}>{t('donate.title')}</Text>
              </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => router.push('/legal/privacy')} accessibilityRole="link">
                <Text style={styles.footerLink}>{t('legal.privacy')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/legal/terms')} accessibilityRole="link">
                <Text style={styles.footerLink}>{t('legal.terms')}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={handleLanguageToggle}
              accessibilityLabel={t('settings.language')}
              accessibilityRole="button"
            >
              <Text style={styles.footerLangToggle}>
                {i18n.language === 'en' ? 'Español' : 'English'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footerDisclaimer}>
            <BodySmall style={styles.footerDisclaimerText}>{t('legal.disclaimerShort')}</BodySmall>
          </View>
        </Container>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  bentoCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    ...shadowStyles.card,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  bentoLarge: {
    flex: 1.2,
    minHeight: 180,
    minWidth: 300,
  },
  bentoSmall: {
    flex: 1,
  },
  bentoStack: {
    flex: 1,
    gap: spacing.md,
    minWidth: 280,
  },
  communityAccent: {
    backgroundColor: colors.primary,
    borderRadius: 2,
    width: 4,
  },
  communityDesc: {
    color: colors.neutral500,
    marginTop: spacing.sm,
  },
  communityInner: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  communitySection: {
    backgroundColor: colors.white,
    paddingVertical: spacing.xxl,
  },
  communityText: {
    flex: 1,
    maxWidth: 640,
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
    color: colors.white,
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
  featureDesc: {
    color: colors.neutral500,
  },
  featureIcon: {
    alignItems: 'center',
    borderRadius: borderRadius.button,
    height: 44,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 44,
  },
  featureTitle: {
    marginBottom: spacing.xs,
  },
  featuresSection: {
    paddingVertical: spacing.xxl,
  },
  featuresTitle: {
    marginBottom: spacing.lg,
  },
  footer: {
    borderTopColor: colors.neutral200,
    borderTopWidth: 1,
    paddingVertical: spacing.lg,
  },
  footerBrand: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '700',
  },
  footerDisclaimer: {
    borderTopColor: colors.neutral200,
    borderTopWidth: 1,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  footerDisclaimerText: {
    color: colors.neutral400,
    textAlign: 'center',
  },
  footerInner: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    justifyContent: 'space-between',
  },
  footerLangToggle: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  footerLeft: {
    gap: spacing.xs,
  },
  footerLink: {
    color: colors.neutral500,
    fontSize: 14,
  },
  footerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  footerTagline: {
    color: colors.neutral500,
  },
  hero: {
    backgroundColor: colors.white,
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    paddingBottom: spacing.xxl,
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
  heroTag: {
    color: colors.primary,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
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
  mapPlaceholder: {
    alignItems: 'center',
    backgroundColor: colors.neutral100,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.card,
    borderStyle: 'dashed',
    borderWidth: 2,
    flex: 1,
    justifyContent: 'center',
    minHeight: 280,
    minWidth: 280,
  },
  mapPlaceholderText: {
    color: colors.neutral400,
    fontSize: 18,
    fontWeight: '600',
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
  tickerContainer: {
    flex: 1,
    minWidth: 320,
  },
});
