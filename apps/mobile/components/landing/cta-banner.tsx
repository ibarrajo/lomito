import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { H2, Body } from '@lomito/ui/src/components/typography';
import { colors, spacing, borderRadius } from '@lomito/ui/src/theme/tokens';
import { useAnalytics } from '../../hooks/use-analytics';

export function CtaBanner() {
  const { t } = useTranslation();
  const router = useRouter();
  const { trackEvent } = useAnalytics();

  const handleGetStarted = () => {
    trackEvent('cta_click', { label: 'get_started_banner' });
    router.push('/auth/register');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <H2 style={styles.title}>{t('landing.ctaTitle')}</H2>
        <Body style={styles.subtitle}>{t('landing.ctaSubtitle')}</Body>
        <TouchableOpacity
          style={styles.button}
          onPress={handleGetStarted}
          accessibilityLabel={t('landing.ctaButton')}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>{t('landing.ctaButton')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.button,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  container: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xxl,
  },
  content: {
    alignItems: 'center',
    alignSelf: 'center',
    maxWidth: 640,
    paddingHorizontal: spacing.lg,
    width: '100%',
  },
  subtitle: {
    color: colors.secondary,
    marginTop: spacing.sm,
    opacity: 0.8,
    textAlign: 'center',
  },
  title: {
    color: colors.secondary,
    textAlign: 'center',
  },
});
