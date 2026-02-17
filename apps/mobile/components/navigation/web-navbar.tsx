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

import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
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
  User,
  Settings,
  LogOut,
} from 'lucide-react-native';
import {
  colors,
  spacing,
  typography,
  layout,
  shadowStyles,
  iconSizes,
  borderRadius,
} from '@lomito/ui/src/theme/tokens';
import { useUserProfile } from '../../hooks/use-user-profile';
import { useAuth } from '../../hooks/use-auth';
import { isFeatureEnabled } from '@lomito/shared';

export function WebNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t, i18n } = useTranslation();
  const { profile, loading } = useUserProfile();
  const { signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isModerator =
    profile?.role === 'moderator' || profile?.role === 'admin';
  const isGovernment =
    profile?.role === 'government' || profile?.role === 'admin';

  // Close dropdown when navigating
  useEffect(() => {
    setShowUserMenu(false);
  }, [pathname]);

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
      // Strip /(tabs) prefix for comparison since Expo Router strips it from pathname
      const cleanPath = path.replace('/(tabs)', '');
      return pathname === cleanPath || pathname.startsWith(cleanPath + '/');
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
          <Text
            style={[styles.navLinkText, isActive && styles.navLinkTextActive]}
          >
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
          accessibilityLabel={t('nav.home')}
          accessibilityRole="link"
        >
          <Text style={styles.wordmark}>Lomito.org</Text>
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
              color={
                isActivePath('/about') ? colors.primary : colors.neutral700
              }
              strokeWidth={1.5}
            />,
          )}
          {isFeatureEnabled('donations') &&
            renderNavLink(
              t('donate.title'),
              '/donate',
              <Heart
                size={iconSizes.inline}
                color={
                  isActivePath('/donate') ? colors.primary : colors.neutral700
                }
                strokeWidth={1.5}
              />,
            )}
          {!loading &&
            isModerator &&
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
          {!loading &&
            isGovernment &&
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
            accessibilityLabel={t(
              i18n.language === 'en'
                ? 'nav.switchToSpanish'
                : 'nav.switchToEnglish',
            )}
            accessibilityRole="button"
          >
            <Text style={styles.languageText}>
              {i18n.language === 'en' ? 'ES' : 'EN'}
            </Text>
          </TouchableOpacity>

          <View style={styles.avatarContainer}>
            <TouchableOpacity
              style={styles.avatar}
              onPress={(e) => {
                e.stopPropagation?.();
                setShowUserMenu((prev) => !prev);
              }}
              accessibilityLabel={t('nav.profile')}
              accessibilityRole="button"
            >
              <Text style={styles.avatarText}>
                {getInitials(profile?.full_name)}
              </Text>
            </TouchableOpacity>
            {showUserMenu && (
              <>
                <Pressable
                  style={styles.userMenuBackdrop}
                  onPress={() => setShowUserMenu(false)}
                  accessibilityLabel={t('nav.closeMenu')}
                />
                <View style={styles.userMenu}>
                  {profile && (
                    <View style={styles.userMenuHeader}>
                      <Text
                        style={styles.userMenuName}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {profile.full_name || '?'}
                      </Text>
                    </View>
                  )}
                  <Pressable
                    style={({ pressed }) => [
                      styles.userMenuItem,
                      pressed && styles.userMenuItemPressed,
                    ]}
                    onPress={() => {
                      setShowUserMenu(false);
                      navigateTo('/(tabs)/profile');
                    }}
                    accessibilityLabel={t('nav.profile')}
                    accessibilityRole="link"
                  >
                    <User
                      size={16}
                      color={colors.neutral700}
                      strokeWidth={1.5}
                    />
                    <Text style={styles.userMenuItemText}>
                      {t('nav.profile')}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.userMenuItem,
                      pressed && styles.userMenuItemPressed,
                    ]}
                    onPress={() => {
                      setShowUserMenu(false);
                      navigateTo('/(tabs)/settings');
                    }}
                    accessibilityLabel={t('nav.settings')}
                    accessibilityRole="link"
                  >
                    <Settings
                      size={16}
                      color={colors.neutral700}
                      strokeWidth={1.5}
                    />
                    <Text style={styles.userMenuItemText}>
                      {t('nav.settings')}
                    </Text>
                  </Pressable>
                  <View style={styles.userMenuDivider} />
                  <Pressable
                    style={({ pressed }) => [
                      styles.userMenuItem,
                      pressed && styles.userMenuItemPressed,
                    ]}
                    onPress={() => {
                      setShowUserMenu(false);
                      signOut();
                    }}
                    accessibilityLabel={t('settings.signOut')}
                    accessibilityRole="button"
                  >
                    <LogOut size={16} color={colors.error} strokeWidth={1.5} />
                    <Text
                      style={[styles.userMenuItemText, { color: colors.error }]}
                    >
                      {t('settings.signOut')}
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigateTo('/report/new')}
            accessibilityLabel={t('report.newReport')}
            accessibilityRole="button"
          >
            <Plus
              size={iconSizes.inline}
              color={colors.secondary}
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
  activeIndicator: {
    backgroundColor: colors.primary,
    bottom: 0,
    height: 2,
    left: spacing.md,
    position: 'absolute',
    right: spacing.md,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 9999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarText: {
    ...typography.button,
    color: colors.secondary,
    fontSize: 15,
  },
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
    backgroundColor: colors.white,
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    height: layout.navbarHeight,
    ...shadowStyles.card,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    height: '100%',
    justifyContent: 'space-between',
    marginHorizontal: 'auto',
    maxWidth: layout.maxContentWidth,
    paddingHorizontal: spacing.lg,
    width: '100%',
  },
  ctaButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  ctaButtonText: {
    ...typography.button,
    color: colors.secondary,
  },
  languageText: {
    ...typography.button,
    color: colors.neutral700,
    fontSize: 15,
  },
  languageToggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  navLink: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    position: 'relative',
  },
  navLinkActive: {
    // Active state handled by activeIndicator
  },
  navLinkContent: {
    alignItems: 'center',
    flexDirection: 'row',
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
  navLinks: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    flexWrap: 'wrap',
    gap: spacing.xs,
    overflow: 'hidden',
  },
  rightSection: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    gap: spacing.sm,
  },
  userMenu: {
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    position: 'absolute',
    right: 0,
    top: 48,
    width: 220,
    ...shadowStyles.elevated,
    ...Platform.select({
      web: { zIndex: 1001 },
      default: {},
    }),
  },
  userMenuBackdrop: {
    ...Platform.select({
      web: {
        position: 'fixed' as never,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
      },
      default: {},
    }),
  },
  userMenuDivider: {
    backgroundColor: colors.neutral100,
    height: 1,
    marginVertical: 2,
  },
  userMenuHeader: {
    borderBottomColor: colors.neutral100,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  userMenuItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  userMenuItemPressed: {
    backgroundColor: colors.neutral100,
  },
  userMenuItemText: {
    ...typography.body,
    color: colors.neutral700,
    fontSize: 14,
  },
  userMenuName: {
    ...typography.button,
    color: colors.neutral900,
    fontSize: 14,
  },
  wordmark: {
    ...typography.h3,
    color: colors.primary,
    fontFamily: typography.fontFamily.display,
  },
});
