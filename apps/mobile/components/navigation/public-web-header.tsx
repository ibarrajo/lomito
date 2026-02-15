/**
 * PublicWebHeader Component
 * Lightweight header for standalone pages (about, donate, legal) when viewed
 * on web by unauthenticated users. Authenticated users get WebNavbar via AppShell,
 * so this only renders when there's no session.
 *
 * Shows: Lomito wordmark (links to landing) + Login button
 */

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/use-auth';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import {
  colors,
  spacing,
  typography,
  borderRadius,
} from '@lomito/ui/src/theme/tokens';

export function PublicWebHeader() {
  const router = useRouter();
  const { t } = useTranslation();
  const { session } = useAuth();
  const { isMobile } = useBreakpoint();

  // Don't render on native, mobile web, or when authenticated (WebNavbar handles it)
  if (Platform.OS !== 'web' || isMobile || session) {
    return null;
  }

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => router.push('/(public)')}
        accessibilityLabel="Lomito home"
        accessibilityRole="link"
      >
        <Text style={styles.wordmark}>Lomito</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => router.push('/auth/login')}
        accessibilityLabel={t('auth.login')}
        accessibilityRole="button"
      >
        <Text style={styles.loginButtonText}>{t('auth.login')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: colors.white,
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
