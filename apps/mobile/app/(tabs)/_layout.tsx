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
  const { isDesktop } = useBreakpoint();

  const isModerator =
    profile?.role === 'moderator' || profile?.role === 'admin';
  const isGovernment =
    profile?.role === 'government' || profile?.role === 'admin';

  const hideTabBar = Platform.OS === 'web' && isDesktop;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.neutral500,
        tabBarStyle: hideTabBar ? { display: 'none' } : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.map'),
          tabBarIcon: ({ color }) => (
            <Map size={iconSizes.default} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t('nav.dashboard'),
          tabBarIcon: ({ color }) => (
            <BarChart3 size={iconSizes.default} color={color} />
          ),
        }}
      />
      {!loading && isModerator && (
        <Tabs.Screen
          name="moderation"
          options={{
            title: t('nav.moderation'),
            tabBarIcon: ({ color }) => (
              <Shield size={iconSizes.default} color={color} />
            ),
          }}
        />
      )}
      {!loading && isGovernment && (
        <Tabs.Screen
          name="government"
          options={{
            title: t('nav.government'),
            tabBarIcon: ({ color }) => (
              <Building2 size={iconSizes.default} color={color} />
            ),
          }}
        />
      )}
      <Tabs.Screen
        name="profile"
        options={{
          title: t('nav.profile'),
          tabBarIcon: ({ color }) => (
            <User size={iconSizes.default} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('nav.settings'),
          tabBarIcon: ({ color }) => (
            <Settings size={iconSizes.default} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
