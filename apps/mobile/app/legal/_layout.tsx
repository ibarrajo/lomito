import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function LegalLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: t('common.back'),
      }}
    >
      <Stack.Screen
        name="privacy"
        options={{
          title: t('legal.privacy'),
        }}
      />
      <Stack.Screen
        name="terms"
        options={{
          title: t('legal.terms'),
        }}
      />
    </Stack>
  );
}
