import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Map,
  User,
  Shield,
  Settings,
  Building2,
  BarChart3,
} from 'lucide-react-native';
import { colors, iconSizes } from '@lomito/ui/src/theme/tokens';
import { useUserProfile } from '../../hooks/use-user-profile';
import { useBreakpoint } from '../../hooks/use-breakpoint';

export default function TabLayout() {
  const { t } = useTranslation();
  const { profile, loading } = useUserProfile();
  const { isDesktop, isTablet } = useBreakpoint();

  const isModerator =
    profile?.role === 'moderator' || profile?.role === 'admin';
  const isGovernment =
    profile?.role === 'government' || profile?.role === 'admin';

  const hideTabBar = Platform.OS === 'web' && isDesktop;
  const compactLabels = isTablet || (Platform.OS !== 'web' && !isDesktop);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.neutral500,
        tabBarStyle: hideTabBar ? { display: 'none' } : undefined,
      }}
    >
      {/* Hidden redirect — sends / to /dashboard */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: compactLabels ? t('nav.mapShort') : t('nav.map'),
          tabBarIcon: ({ color }) => (
            <Map size={iconSizes.default} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: compactLabels ? t('nav.dashboardShort') : t('nav.dashboard'),
          tabBarIcon: ({ color }) => (
            <BarChart3 size={iconSizes.default} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="moderation"
        options={{
          href: !loading && isModerator ? undefined : null,
          title: compactLabels ? t('nav.moderationShort') : t('nav.moderation'),
          tabBarIcon: ({ color }) => (
            <Shield size={iconSizes.default} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="government"
        options={{
          href: !loading && isGovernment ? undefined : null,
          title: compactLabels ? t('nav.governmentShort') : t('nav.government'),
          tabBarIcon: ({ color }) => (
            <Building2 size={iconSizes.default} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: compactLabels ? t('nav.profileShort') : t('nav.profile'),
          tabBarIcon: ({ color }) => (
            <User size={iconSizes.default} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: compactLabels ? t('nav.settingsShort') : t('nav.settings'),
          tabBarIcon: ({ color }) => (
            <Settings size={iconSizes.default} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
