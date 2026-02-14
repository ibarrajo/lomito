import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Map, User, Shield, Settings } from 'lucide-react-native';
import { colors, iconSizes } from '@lomito/ui/src/theme/tokens';
import { useUserProfile } from '../../hooks/use-user-profile';

export default function TabLayout() {
  const { t } = useTranslation();
  const { profile, loading } = useUserProfile();

  const isModerator = profile?.role === 'moderator' || profile?.role === 'admin';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.neutral500,
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
