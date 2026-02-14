import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Map, User } from 'lucide-react-native';
import { colors, iconSizes } from '@lomito/ui/src/theme/tokens';

export default function TabLayout() {
  const { t } = useTranslation();

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
      <Tabs.Screen
        name="profile"
        options={{
          title: t('nav.profile'),
          tabBarIcon: ({ color }) => (
            <User size={iconSizes.default} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
