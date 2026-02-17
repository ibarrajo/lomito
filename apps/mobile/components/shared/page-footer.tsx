import { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Facebook, Instagram } from 'lucide-react-native';
import {
  colors,
  spacing,
  iconSizes,
  borderRadius,
} from '@lomito/ui/src/theme/tokens';
import { BodySmall } from '@lomito/ui';

export function PageFooter() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = useCallback((key: string) => {
    setActiveTooltip(key);
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    tooltipTimerRef.current = setTimeout(() => setActiveTooltip(null), 2000);
  }, []);

  if (Platform.OS !== 'web') return null;

  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  const platformLinks = [
    { label: t('nav.map'), route: '/(tabs)/dashboard' },
    { label: t('report.newReport'), route: '/report/new' },
    { label: t('nav.dashboard'), route: '/(tabs)/stats' },
  ];

  const communityLinks = [
    { label: t('about.title'), route: '/about' },
    { label: t('impact.title'), route: '/impact' },
    { label: t('donate.title'), route: '/donate' },
  ];

  const legalLinks = [
    { label: t('legal.privacy'), route: '/legal/privacy' },
    { label: t('legal.terms'), route: '/legal/terms' },
  ];

  return (
    <View style={styles.footer}>
      <View style={styles.footerInner}>
        {/* Brand Section */}
        <View style={styles.section}>
          <Text style={styles.brand}>Lomito.org</Text>
          <BodySmall style={styles.tagline}>
            {t('landing.footerTagline')}
          </BodySmall>
        </View>

        {/* Platform Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('landing.footerPlatform')}</Text>
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

        {/* Community Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('landing.footerCommunity')}
          </Text>
          {communityLinks.map((link) => (
            <TouchableOpacity
              key={link.label}
              onPress={() => router.push(link.route as never)}
              accessibilityRole="link"
            >
              <Text style={styles.link}>{link.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Legal Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('landing.footerLegal')}</Text>
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

      {/* Social Media Icons */}
      <View style={styles.socialRow}>
        <View style={styles.socialIconWrapper}>
          {activeTooltip === 'facebook' && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>
                {t('landing.socialComingSoon')}
              </Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => showTooltip('facebook')}
            accessibilityLabel="Facebook"
            accessibilityRole="button"
          >
            <Facebook
              size={iconSizes.default}
              color={colors.neutral400}
              strokeWidth={1.5}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.socialIconWrapper}>
          {activeTooltip === 'x' && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>
                {t('landing.socialComingSoon')}
              </Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => showTooltip('x')}
            accessibilityLabel="X"
            accessibilityRole="button"
          >
            <Text
              style={{
                fontSize: iconSizes.default,
                fontWeight: '800',
                color: colors.neutral400,
              }}
            >
              {'𝕏'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.socialIconWrapper}>
          {activeTooltip === 'instagram' && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>
                {t('landing.socialComingSoon')}
              </Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => showTooltip('instagram')}
            accessibilityLabel="Instagram"
            accessibilityRole="button"
          >
            <Instagram
              size={iconSizes.default}
              color={colors.neutral400}
              strokeWidth={1.5}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Bar: Copyright + Language Toggle */}
      <View style={styles.bottomBar}>
        <BodySmall style={styles.copyright}>{t('footer.copyright')}</BodySmall>
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
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    alignItems: 'center',
    alignSelf: 'center',
    borderTopColor: colors.neutral200,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    maxWidth: 1280,
    paddingTop: spacing.lg,
    width: '100%',
  },
  brand: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  copyright: {
    color: colors.neutral400,
    fontSize: 14,
  },
  footer: {
    backgroundColor: colors.white,
    borderTopColor: colors.neutral200,
    borderTopWidth: 1,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  footerInner: {
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xl,
    justifyContent: 'space-between',
    maxWidth: 1280,
    width: '100%',
  },
  languageToggle: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  link: {
    color: colors.neutral500,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  section: {
    gap: spacing.sm,
    minWidth: 140,
  },
  sectionTitle: {
    color: colors.neutral900,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  socialIconWrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  socialRow: {
    alignItems: 'center',
    alignSelf: 'center',
    borderTopColor: colors.neutral200,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.lg,
    justifyContent: 'center',
    marginTop: spacing.lg,
    maxWidth: 1280,
    paddingTop: spacing.lg,
    width: '100%',
  },
  tagline: {
    color: colors.neutral500,
    fontSize: 14,
  },
  tooltip: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.tag,
    bottom: '100%' as unknown as number,
    left: '50%' as unknown as number,
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    transform: [{ translateX: '-50%' as unknown as number }],
  },
  tooltipText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
});
