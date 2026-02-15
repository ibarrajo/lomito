import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '@lomito/ui/src/theme/tokens';
import { BodySmall } from '@lomito/ui';

export function PageFooter() {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  if (Platform.OS !== 'web') return null;

  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <View style={styles.footer}>
      <View style={styles.footerInner}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerBrand}>Lomito</Text>
          <BodySmall color={colors.neutral500}>
            {t('landing.footerTagline')}
          </BodySmall>
        </View>
        <View style={styles.footerLinks}>
          <TouchableOpacity
            onPress={() => router.push('/about')}
            accessibilityRole="link"
          >
            <Text style={styles.footerLink}>{t('about.title')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/donate')}
            accessibilityRole="link"
          >
            <Text style={styles.footerLink}>{t('donate.title')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/legal/privacy')}
            accessibilityRole="link"
          >
            <Text style={styles.footerLink}>{t('legal.privacy')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/legal/terms')}
            accessibilityRole="link"
          >
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
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    borderTopColor: colors.neutral200,
    borderTopWidth: 1,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  footerBrand: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '700',
  },
  footerInner: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    justifyContent: 'space-between',
    maxWidth: 1280,
    width: '100%',
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
});
