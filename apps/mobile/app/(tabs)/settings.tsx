import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '@lomito/ui/src/theme/tokens';
import { useAuth } from '../../hooks/use-auth';
import { NotificationPrefs } from '../../components/settings/notification-prefs';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert(
      t('settings.signOut'),
      t('auth.logout'),
      [
        {
          style: 'cancel',
          text: t('common.cancel'),
        },
        {
          onPress: async () => {
            try {
              await signOut();
              router.replace('/auth/login');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert(t('common.error'), 'Failed to sign out');
            }
          },
          style: 'destructive',
          text: t('settings.signOut'),
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
      </View>

      <View style={styles.content}>
        <NotificationPrefs />

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          accessibilityLabel={t('settings.signOut')}
          accessibilityRole="button"
        >
          <Text style={styles.signOutButtonText}>{t('settings.signOut')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral100,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    backgroundColor: colors.white,
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.neutral900,
  },
  signOutButton: {
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: 8,
    justifyContent: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  signOutButtonText: {
    ...typography.button,
    color: colors.white,
  },
});
