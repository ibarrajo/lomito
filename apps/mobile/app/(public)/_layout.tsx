import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import {
  colors,
  spacing,
  typography,
  borderRadius,
} from '@lomito/ui/src/theme/tokens';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/use-auth';

export default function PublicLayout() {
  const router = useRouter();
  const { t } = useTranslation();
  const { session } = useAuth();

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' && (
        <Head>
          <title>Lomito — Plataforma cívica para bienestar animal</title>
          <meta
            name="description"
            content="Reporta y da seguimiento a problemas de bienestar animal en tu comunidad. Plataforma cívica para Tijuana."
          />
          <meta name="theme-color" content="#13ECC8" />
          {/* OpenGraph */}
          <meta property="og:site_name" content="Lomito" />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://lomito.org" />
          <meta
            property="og:title"
            content="Lomito — Plataforma cívica para bienestar animal"
          />
          <meta
            property="og:description"
            content="Reporta y da seguimiento a problemas de bienestar animal en tu comunidad"
          />
          <meta property="og:image" content="https://lomito.org/og-image.png" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:locale" content="es_MX" />
          <meta property="og:locale:alternate" content="en_US" />
          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content="Lomito — Plataforma cívica para bienestar animal"
          />
          <meta
            name="twitter:description"
            content="Reporta y da seguimiento a problemas de bienestar animal en tu comunidad"
          />
          <meta
            name="twitter:image"
            content="https://lomito.org/og-image.png"
          />
        </Head>
      )}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push('/(public)')}
          accessibilityLabel={t('nav.home')}
          accessibilityRole="link"
        >
          <Text style={styles.wordmark}>Lomito.org</Text>
        </TouchableOpacity>
        {session ? (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/(tabs)/dashboard')}
            accessibilityLabel={t('landing.ctaGoToDashboard')}
            accessibilityRole="button"
          >
            <Text style={styles.loginButtonText}>
              {t('landing.ctaGoToDashboard')}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/auth/login')}
            accessibilityLabel={t('auth.login')}
            accessibilityRole="button"
          >
            <Text style={styles.loginButtonText}>{t('auth.login')}</Text>
          </TouchableOpacity>
        )}
      </View>
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  loginButtonText: {
    color: colors.secondary,
    fontFamily: typography.button.fontFamily,
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
  wordmark: {
    color: colors.primary,
    fontFamily: typography.h3.fontFamily,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
  },
});
