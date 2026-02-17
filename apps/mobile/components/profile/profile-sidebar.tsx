/**
 * ProfileSidebar Component
 * Desktop sidebar with user info, nav links, and donate promo.
 */

import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Home, User, Settings } from 'lucide-react-native';
import {
  colors,
  spacing,
  borderRadius,
  shadowStyles,
  typography,
  iconSizes,
} from '@lomito/ui/src/theme/tokens';
import { H2, Body, Caption } from '@lomito/ui/src/components/typography';
import { Badge } from '@lomito/ui/src/components/badge';
import { useUserProfile } from '../../hooks/use-user-profile';

interface NavItem {
  key: string;
  icon: typeof Home;
  label: string;
  route: string;
}

export function ProfileSidebar() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useUserProfile();

  const navItems: NavItem[] = [
    {
      key: 'dashboard',
      icon: Home,
      label: t('profile.sidebar.dashboard'),
      route: '/(tabs)/stats',
    },
    {
      key: 'profile',
      icon: User,
      label: t('profile.sidebar.myProfile'),
      route: '/(tabs)/profile',
    },
    {
      key: 'settings',
      icon: Settings,
      label: t('profile.sidebar.settings'),
      route: '/(tabs)/settings',
    },
  ];

  const handleNavPress = (route: string) => {
    router.push(route);
  };

  const handleDonatePress = () => {
    router.push('/donate');
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const roleColors: Record<string, { color: string; backgroundColor: string }> =
    {
      citizen: { color: colors.neutral700, backgroundColor: colors.neutral100 },
      moderator: {
        color: colors.secondary,
        backgroundColor: colors.secondaryLight,
      },
      government: {
        color: colors.info,
        backgroundColor: colors.infoBackground,
      },
      admin: { color: colors.primary, backgroundColor: colors.primaryLight },
    };

  const roleStyle = profile?.role
    ? roleColors[profile.role] || roleColors.citizen
    : roleColors.citizen;

  return (
    <View style={styles.container}>
      <View style={styles.userSection}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Body style={styles.avatarText} color={colors.secondary}>
            {initials}
          </Body>
        </View>
        <H2 style={styles.userName}>
          {profile?.full_name || t('common.user')}
        </H2>
        {profile?.role && (
          <Badge
            label={t(`profile.${profile.role}`)}
            color={roleStyle.color}
            backgroundColor={roleStyle.backgroundColor}
            accessibilityLabel={t('profile.role')}
            style={styles.badge}
          />
        )}
      </View>

      <View style={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.route;
          return (
            <Pressable
              key={item.key}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => handleNavPress(item.route)}
              accessibilityLabel={item.label}
              accessibilityRole="button"
            >
              <Icon
                size={iconSizes.default}
                color={isActive ? colors.primary : colors.neutral500}
                strokeWidth={2}
              />
              <Body
                style={styles.navLabel}
                color={isActive ? colors.primary : colors.neutral700}
              >
                {item.label}
              </Body>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={styles.donatePromo}
        onPress={handleDonatePress}
        accessibilityLabel={t('profile.sidebar.donatePromo')}
        accessibilityRole="button"
      >
        <Body style={styles.donateTitle} color={colors.primary}>
          {t('profile.sidebar.donatePromo')}
        </Body>
        <Caption style={styles.donateDescription} color={colors.neutral500}>
          {t('profile.sidebar.donatePromoDescription')}
        </Caption>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    borderRadius: borderRadius.avatar,
    height: 80,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 80,
  },
  avatarText: {
    fontSize: typography.display.fontSize,
    fontWeight: typography.display.fontWeight,
  },
  badge: {
    marginTop: spacing.xs,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    ...shadowStyles.card,
  },
  donateDescription: {
    marginTop: spacing.xs,
  },
  donatePromo: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.button,
    marginTop: 'auto',
    padding: spacing.md,
  },
  donateTitle: {
    fontWeight: '600',
  },
  nav: {
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
  navItem: {
    alignItems: 'center',
    borderRadius: borderRadius.button,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  navItemActive: {
    backgroundColor: colors.primaryLight,
  },
  navLabel: {
    fontWeight: '500',
  },
  userName: {
    textAlign: 'center',
  },
  userSection: {
    alignItems: 'center',
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    paddingBottom: spacing.lg,
  },
});
