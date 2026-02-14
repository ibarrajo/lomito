/**
 * WebNavbar Component
 * Top horizontal navigation bar for desktop web (64px height).
 *
 * Layout:
 * - Left: Lomito wordmark (links to home)
 * - Center: Navigation links (Map, Dashboard, About, Donate, role-based links)
 * - Right: Language toggle, user avatar, "New Report" CTA button
 *
 * Features:
 * - Active link detection via usePathname() with primary color underline
 * - Role-based navigation (Moderation for moderators/admin, Government for government/admin)
 * - Sticky positioning on web with card shadow
 * - Full accessibility labels
 * - Responsive max-width container (1280px)
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Map,
  BarChart3,
  Shield,
  Building2,
  Info,
  Heart,
  Plus,
} from 'lucide-react-native';
import {
  colors,
  spacing,
  typography,
  layout,
  shadowStyles,
  iconSizes,
} from '@lomito/ui/src/theme/tokens';
import { useUserProfile } from '../../hooks/use-user-profile';

export function WebNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t, i18n } = useTranslation();
  const { profile, loading } = useUserProfile();

  const isModerator = profile?.role === 'moderator' || profile?.role === 'admin';
  const isGovernment =
    profile?.role === 'government' || profile?.role === 'admin';

  const toggleLanguage = useCallback(() => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  }, [i18n]);

  const navigateTo = useCallback(
    (path: string) => {
      router.push(path as never);
    },
    [router],
  );

  const isActivePath = useCallback(
    (path: string) => {
      if (path === '/(tabs)') {
        return pathname === '/' || pathname === '/(tabs)';
      }
      return pathname.startsWith(path);
    },
    [pathname],
  );

  const renderNavLink = (
    label: string,
    path: string,
    icon: React.ReactNode,
  ) => {
    const isActive = isActivePath(path);
    return (
      <TouchableOpacity
        key={path}
        style={[styles.navLink, isActive && styles.navLinkActive]}
        onPress={() => navigateTo(path)}
        accessibilityLabel={label}
        accessibilityRole="link"
      >
        <View style={styles.navLinkContent}>
          {icon}
          <Text style={[styles.navLinkText, isActive && styles.navLinkTextActive]}>
            {label}
          </Text>
        </View>
        {isActive && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    );
  };

  const getInitials = (name: string | undefined): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Left: Wordmark */}
        <TouchableOpacity
          onPress={() => navigateTo('/(tabs)')}
          accessibilityLabel="Lomito home"
          accessibilityRole="link"
        >
          <Text style={styles.wordmark}>Lomito</Text>
        </TouchableOpacity>

        {/* Center: Nav Links */}
        <View style={styles.navLinks}>
          {renderNavLink(
            t('nav.map'),
            '/(tabs)',
            <Map
              size={iconSizes.inline}
              color={
                isActivePath('/(tabs)') ? colors.primary : colors.neutral700
              }
              strokeWidth={1.5}
            />,
          )}
          {renderNavLink(
            t('nav.dashboard'),
            '/(tabs)/dashboard',
            <BarChart3
              size={iconSizes.inline}
              color={
                isActivePath('/(tabs)/dashboard')
                  ? colors.primary
                  : colors.neutral700
              }
              strokeWidth={1.5}
            />,
          )}
          {renderNavLink(
            t('about.title'),
            '/about',
            <Info
              size={iconSizes.inline}
              color={isActivePath('/about') ? colors.primary : colors.neutral700}
              strokeWidth={1.5}
            />,
          )}
          {renderNavLink(
            t('donate.title'),
            '/donate',
            <Heart
              size={iconSizes.inline}
              color={isActivePath('/donate') ? colors.primary : colors.neutral700}
              strokeWidth={1.5}
            />,
          )}
          {!loading && isModerator &&
            renderNavLink(
              t('nav.moderation'),
              '/(tabs)/moderation',
              <Shield
                size={iconSizes.inline}
                color={
                  isActivePath('/(tabs)/moderation')
                    ? colors.primary
                    : colors.neutral700
                }
                strokeWidth={1.5}
              />,
            )}
          {!loading && isGovernment &&
            renderNavLink(
              t('nav.government'),
              '/(tabs)/government',
              <Building2
                size={iconSizes.inline}
                color={
                  isActivePath('/(tabs)/government')
                    ? colors.primary
                    : colors.neutral700
                }
                strokeWidth={1.5}
              />,
            )}
        </View>

        {/* Right: Language Toggle, Avatar, CTA */}
        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.languageToggle}
            onPress={toggleLanguage}
            accessibilityLabel={`Switch to ${i18n.language === 'en' ? 'Spanish' : 'English'}`}
            accessibilityRole="button"
          >
            <Text style={styles.languageText}>
              {i18n.language === 'en' ? 'ES' : 'EN'}
            </Text>
          </TouchableOpacity>

          {profile && (
            <TouchableOpacity
              style={styles.avatar}
              onPress={() => navigateTo('/(tabs)/profile')}
              accessibilityLabel={`Profile: ${profile.full_name}`}
              accessibilityRole="button"
            >
              <Text style={styles.avatarText}>
                {getInitials(profile.full_name)}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigateTo('/report/new')}
            accessibilityLabel={t('report.newReport')}
            accessibilityRole="button"
          >
            <Plus
              size={iconSizes.inline}
              color={colors.white}
              strokeWidth={2}
            />
            <Text style={styles.ctaButtonText}>{t('report.newReport')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      web: {
        position: 'fixed' as never,
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      },
      default: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
      },
    }),
    height: layout.navbarHeight,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
    ...shadowStyles.card,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    paddingHorizontal: spacing.lg,
    maxWidth: layout.maxContentWidth,
    marginHorizontal: 'auto',
    width: '100%',
  },
  wordmark: {
    ...typography.h3,
    color: colors.primary,
    fontFamily: typography.fontFamily.display,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  navLink: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    position: 'relative',
  },
  navLinkActive: {
    // Active state handled by activeIndicator
  },
  navLinkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  navLinkText: {
    ...typography.button,
    color: colors.neutral700,
    fontSize: 15,
  },
  navLinkTextActive: {
    color: colors.primary,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: spacing.md,
    right: spacing.md,
    height: 2,
    backgroundColor: colors.primary,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  languageToggle: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  languageText: {
    ...typography.button,
    color: colors.neutral700,
    fontSize: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.button,
    color: colors.white,
    fontSize: 15,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  ctaButtonText: {
    ...typography.button,
    color: colors.white,
  },
});
