/**
 * PublicWebHeader Component
 * Lightweight header for standalone pages (about, donate, legal) when viewed
 * on web by unauthenticated users. Authenticated users get WebNavbar via AppShell,
 * so this only renders when there's no session.
 *
 * Shows: Lomito wordmark (links to landing) + Nav Links + Login button
 */

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
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
  const pathname = usePathname();
  const { t } = useTranslation();
  const { session } = useAuth();
  const { isMobile } = useBreakpoint();

  // Don't render on native or when authenticated (WebNavbar handles it)
  // Only render on tablet/desktop web for unauthenticated users
  if (Platform.OS !== 'web' || session) {
    return null;
  }

  // Don't render on mobile web (mobile tabs handle navigation)
  if (isMobile) {
    return null;
  }

  const isActivePath = (path: string) => {
    if (path === '/(public)') {
      return pathname === '/' || pathname === '/(public)';
    }
    return pathname === path || pathname.startsWith(path + '/');
  };

  const navLinks = [
    { label: t('landing.navHome'), path: '/(public)' },
    { label: t('landing.navImpact'), path: '/impact' },
    { label: t('landing.navHowItWorks'), path: '/about' },
    { label: t('landing.navTransparency'), path: '/impact' },
  ];

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => router.push('/(public)')}
        accessibilityLabel={t('nav.home')}
        accessibilityRole="link"
      >
        <Text style={styles.wordmark}>Lomito.org</Text>
      </TouchableOpacity>

      {/* Desktop Navigation Links */}
      <View style={styles.navLinks}>
        {navLinks.map((link) => {
          const isActive = isActivePath(link.path);
          return (
            <TouchableOpacity
              key={link.path}
              style={[styles.navLink, isActive && styles.navLinkActive]}
              onPress={() => router.push(link.path as never)}
              accessibilityLabel={link.label}
              accessibilityRole="link"
            >
              <Text
                style={[
                  styles.navLinkText,
                  isActive && styles.navLinkTextActive,
                ]}
              >
                {link.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

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
  activeIndicator: {
    backgroundColor: colors.primary,
    bottom: 0,
    height: 2,
    left: spacing.md,
    position: 'absolute',
    right: spacing.md,
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
  navLink: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    position: 'relative',
  },
  navLinkActive: {
    // Active state handled by activeIndicator
  },
  navLinkText: {
    color: colors.neutral700,
    fontFamily: typography.button.fontFamily,
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
  navLinkTextActive: {
    color: colors.primary,
  },
  navLinks: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  wordmark: {
    color: colors.primary,
    fontFamily: typography.h3.fontFamily,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
  },
});
