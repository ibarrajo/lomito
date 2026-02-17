import { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Facebook, Instagram } from 'lucide-react-native';
import { H3, BodySmall } from '@lomito/ui/src/components/typography';
import {
  colors,
  spacing,
  iconSizes,
  borderRadius,
  typography,
} from '@lomito/ui/src/theme/tokens';
import { useBreakpoint } from '../../hooks/use-breakpoint';

export function LandingFooter() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { isMobile, isTablet } = useBreakpoint();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  const showTooltip = useCallback((key: string) => {
    setActiveTooltip(key);
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    tooltipTimerRef.current = setTimeout(() => setActiveTooltip(null), 2000);
  }, []);

  const platformLinks = [
    { label: t('nav.map'), route: '/auth/login' },
    { label: t('report.newReport'), route: '/auth/register' },
    { label: t('nav.dashboard'), route: '/auth/login' },
  ];

  const resourceLinks = [{ label: t('about.title'), route: '/about' }];

  const legalLinks = [
    { label: t('legal.privacy'), route: '/legal/privacy' },
    { label: t('legal.terms'), route: '/legal/terms' },
  ];

  const communityLinks: { label: string; route: string }[] = [];

  const getGridStyle = () => {
    if (isMobile) return styles.gridMobile;
    if (isTablet) return styles.gridTablet;
    return styles.gridDesktop;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.grid, getGridStyle()]}>
        {/* Column 1: Brand */}
        <View style={styles.column}>
          <Text style={styles.brand}>Lomito.org</Text>
          <BodySmall style={styles.tagline}>
            {t('landing.footerTagline')}
          </BodySmall>
        </View>

        {/* Column 2: Platform */}
        <View style={styles.column}>
          <H3 style={styles.columnTitle}>{t('landing.footerPlatform')}</H3>
          {platformLinks.map((link) => (
            <TouchableOpacity
              key={link.label}
              onPress={() => router.push(link.route as never)}
              accessibilityRole="link"
            >
              <Text style={styles.link}>{link.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Column 3: Resources */}
        <View style={styles.column}>
          <H3 style={styles.columnTitle}>{t('landing.footerResources')}</H3>
          {resourceLinks.map((link) => (
            <TouchableOpacity
              key={link.label}
              onPress={() => router.push(link.route as never)}
              accessibilityRole="link"
            >
              <Text style={styles.link}>{link.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Column 4: Community */}
        {communityLinks.length > 0 && (
          <View style={styles.column}>
            <H3 style={styles.columnTitle}>{t('landing.footerCommunity')}</H3>
            {communityLinks.map((link) => (
              <TouchableOpacity
                key={link.label}
                onPress={() => {
                  if (link.route !== '#') router.push(link.route as never);
                }}
                accessibilityRole="link"
              >
                <Text style={styles.link}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Column 5: Legal */}
        <View style={styles.column}>
          <H3 style={styles.columnTitle}>{t('landing.footerLegal')}</H3>
          {legalLinks.map((link) => (
            <TouchableOpacity
              key={link.label}
              onPress={() => router.push(link.route as never)}
              accessibilityRole="link"
            >
              <Text style={styles.link}>{link.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Social Icons Row */}
      <View style={styles.socialContainer}>
        <Text style={styles.socialTitle}>{t('landing.followUs')}</Text>
        <View style={styles.socialIcons}>
          {/* Facebook */}
          <View style={styles.socialIconWrapper}>
            {activeTooltip === 'facebook' && (
              <View style={styles.tooltip}>
                <Text style={styles.tooltipText}>
                  {t('landing.socialComingSoon')}
                </Text>
              </View>
            )}
            <TouchableOpacity
              accessibilityLabel="Facebook"
              accessibilityRole="button"
              onPress={() => showTooltip('facebook')}
            >
              <Facebook
                size={iconSizes.default}
                color={colors.neutral400}
                strokeWidth={1.5}
              />
            </TouchableOpacity>
          </View>

          {/* X (formerly Twitter) */}
          <View style={styles.socialIconWrapper}>
            {activeTooltip === 'x' && (
              <View style={styles.tooltip}>
                <Text style={styles.tooltipText}>
                  {t('landing.socialComingSoon')}
                </Text>
              </View>
            )}
            <TouchableOpacity
              accessibilityLabel="X"
              accessibilityRole="button"
              onPress={() => showTooltip('x')}
            >
              <Text
                style={{
                  fontSize: iconSizes.default,
                  fontWeight: '800',
                  color: colors.neutral400,
                }}
              >
                𝕏
              </Text>
            </TouchableOpacity>
          </View>

          {/* Instagram */}
          <View style={styles.socialIconWrapper}>
            {activeTooltip === 'instagram' && (
              <View style={styles.tooltip}>
                <Text style={styles.tooltipText}>
                  {t('landing.socialComingSoon')}
                </Text>
              </View>
            )}
            <TouchableOpacity
              accessibilityLabel="Instagram"
              accessibilityRole="button"
              onPress={() => showTooltip('instagram')}
            >
              <Instagram
                size={iconSizes.default}
                color={colors.neutral400}
                strokeWidth={1.5}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Language Toggle */}
      <View style={styles.languageToggleContainer}>
        <TouchableOpacity
          onPress={handleLanguageToggle}
          accessibilityLabel={t('settings.language')}
          accessibilityRole="button"
        >
          <Text style={styles.languageToggle}>
            {i18n.language === 'en' ? 'Español' : 'English'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimerContainer}>
        <BodySmall style={styles.disclaimerText}>
          {t('legal.disclaimerShort')}
        </BodySmall>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  column: {
    gap: spacing.sm,
    minWidth: 140,
  },
  columnTitle: {
    color: colors.neutral900,
    fontSize: 15,
    marginBottom: spacing.xs,
  },
  container: {
    borderTopColor: colors.neutral200,
    borderTopWidth: 1,
    paddingVertical: spacing.xl,
  },
  disclaimerContainer: {
    alignItems: 'center',
    borderTopColor: colors.neutral200,
    borderTopWidth: 1,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
  },
  disclaimerText: {
    color: colors.neutral400,
    textAlign: 'center',
  },
  grid: {
    gap: spacing.lg,
  },
  gridDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridMobile: {
    flexDirection: 'column',
  },
  gridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  languageToggle: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  languageToggleContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  link: {
    color: colors.neutral500,
    fontSize: 14,
  },
  socialContainer: {
    alignItems: 'center',
    borderTopColor: colors.neutral200,
    borderTopWidth: 1,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
  },
  socialIconWrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  socialIcons: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  socialTitle: {
    color: colors.neutral700,
    fontSize: 14,
    fontWeight: '600',
  },
  tagline: {
    color: colors.neutral500,
  },
  tooltip: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.tag,
    bottom: '100%',
    left: '50%',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    position: 'absolute',
    transform: [{ translateX: '-50%' }],
  },
  tooltipText: {
    color: colors.white,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
});
