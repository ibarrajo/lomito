import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '@lomito/ui/src/theme/tokens';
import { H1, Body, Caption, AppModal } from '@lomito/ui';
import { useAuth } from '../../hooks/use-auth';
import { useUserProfile } from '../../hooks/use-user-profile';
import { NotificationPrefs } from '../../components/settings/notification-prefs';
import { LanguagePicker } from '../../components/settings/language-picker';
import { isFeatureEnabled } from '@lomito/shared';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { session, signOut } = useAuth();
  const { profile } = useUserProfile();
  const router = useRouter();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const handleSignOut = () => {
    setShowSignOutConfirm(true);
  };

  const confirmSignOut = async () => {
    setShowSignOutConfirm(false);
    try {
      await signOut();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
      setErrorModal(t('settings.signOutError'));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <H1>{t('settings.title')}</H1>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Caption style={styles.sectionLabel}>{t('settings.account')}</Caption>
          <View style={styles.accountInfo}>
            <Body style={{ color: colors.neutral900 }}>{profile?.full_name || ''}</Body>
            <Caption style={{ color: colors.neutral500 }}>{session?.user?.email || ''}</Caption>
          </View>
        </View>

        <View style={styles.spacer} />

        <NotificationPrefs />

        <View style={styles.spacer} />

        <LanguagePicker />

        <View style={styles.section}>
          <Pressable
            style={styles.navLink}
            onPress={() => router.push('/about')}
            accessibilityLabel={t('about.title')}
            accessibilityRole="button"
          >
            <Text style={styles.navLinkText}>{t('about.title')}</Text>
          </Pressable>
          {isFeatureEnabled('donations') && (
          <Pressable
            style={styles.navLink}
            onPress={() => router.push('/donate')}
            accessibilityLabel={t('donate.title')}
            accessibilityRole="button"
          >
            <Text style={styles.navLinkText}>{t('donate.title')}</Text>
          </Pressable>
          )}
        </View>

        <View style={styles.section}>
          <Pressable
            style={styles.navLink}
            onPress={() => router.push('/legal/privacy')}
            accessibilityLabel={t('legal.privacy')}
            accessibilityRole="button"
          >
            <Text style={styles.navLinkText}>{t('legal.privacy')}</Text>
          </Pressable>
          <Pressable
            style={styles.navLink}
            onPress={() => router.push('/legal/terms')}
            accessibilityLabel={t('legal.terms')}
            accessibilityRole="button"
          >
            <Text style={styles.navLinkText}>{t('legal.terms')}</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.signOutButton}
          onPress={handleSignOut}
          accessibilityLabel={t('settings.signOut')}
          accessibilityRole="button"
        >
          <Text style={styles.signOutButtonText}>{t('settings.signOut')}</Text>
        </Pressable>
      </View>

      <AppModal
        visible={showSignOutConfirm}
        title={t('settings.signOut')}
        message={t('auth.logout')}
        actions={[
          { label: t('common.cancel'), onPress: () => setShowSignOutConfirm(false) },
          { label: t('settings.signOut'), onPress: confirmSignOut },
        ]}
        onClose={() => setShowSignOutConfirm(false)}
      />

      <AppModal
        visible={!!errorModal}
        title={t('common.error')}
        message={errorModal ?? undefined}
        actions={[{ label: t('common.ok'), onPress: () => setErrorModal(null) }]}
        onClose={() => setErrorModal(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  accountInfo: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
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
  section: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  sectionLabel: {
    color: colors.neutral500,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    textTransform: 'uppercase',
  },
  signOutButton: {
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: borderRadius.button,
    justifyContent: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  signOutButtonText: {
    ...typography.button,
    color: colors.white,
  },
  spacer: {
    height: spacing.md,
  },
});
