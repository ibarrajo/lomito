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

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.navLink}
            onPress={() => router.push('/about')}
            accessibilityLabel={t('about.title')}
            accessibilityRole="button"
          >
            <Text style={styles.navLinkText}>{t('about.title')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navLink}
            onPress={() => router.push('/donate')}
            accessibilityLabel={t('donate.title')}
            accessibilityRole="button"
          >
            <Text style={styles.navLinkText}>{t('donate.title')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.navLink}
            onPress={() => router.push('/legal/privacy')}
            accessibilityLabel={t('legal.privacy')}
            accessibilityRole="button"
          >
            <Text style={styles.navLinkText}>{t('legal.privacy')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navLink}
            onPress={() => router.push('/legal/terms')}
            accessibilityLabel={t('legal.terms')}
            accessibilityRole="button"
          >
            <Text style={styles.navLinkText}>{t('legal.terms')}</Text>
          </TouchableOpacity>
        </View>

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
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.neutral500,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    textTransform: 'uppercase',
  },
  navLink: {
    backgroundColor: colors.white,
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  navLinkText: {
    ...typography.body,
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
