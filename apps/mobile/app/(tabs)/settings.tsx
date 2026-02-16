import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import {
  colors,
  spacing,
  typography,
  borderRadius,
} from '@lomito/ui/src/theme/tokens';
import { H1, H2, Body, Caption, AppModal } from '@lomito/ui';
import { useAuth } from '../../hooks/use-auth';
import { useUserProfile } from '../../hooks/use-user-profile';
import { NotificationPrefs } from '../../components/settings/notification-prefs';
import { LanguagePicker } from '../../components/settings/language-picker';
import { isFeatureEnabled } from '@lomito/shared';
import { useBreakpoint } from '../../hooks/use-breakpoint';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { session, signOut } = useAuth();
  const { profile } = useUserProfile();
  const router = useRouter();
  const { isDesktop } = useBreakpoint();
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
      {!isDesktop && (
        <View style={styles.header}>
          <H1>{t('settings.title')}</H1>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          isDesktop && styles.contentDesktop,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[styles.innerContent, isDesktop && styles.innerContentDesktop]}
        >
          {isDesktop && (
            <View style={styles.desktopHeader}>
              <H1>{t('settings.title')}</H1>
            </View>
          )}

          {/* Account Section */}
          <View style={styles.sectionGroup}>
            <H2 style={styles.sectionTitle}>{t('settings.account')}</H2>
            <View style={styles.section}>
              <View style={styles.accountInfo}>
                <Body style={{ color: colors.neutral900 }}>
                  {profile?.full_name || ''}
                </Body>
                <Caption style={{ color: colors.neutral500 }}>
                  {session?.user?.email || ''}
                </Caption>
              </View>
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.sectionGroup}>
            <H2 style={styles.sectionTitle}>
              {t('settings.sectionPreferences')}
            </H2>
            <NotificationPrefs />
            <View style={styles.sectionSpacer} />
            <LanguagePicker />
          </View>

          {/* About Section */}
          <View style={styles.sectionGroup}>
            <H2 style={styles.sectionTitle}>{t('settings.sectionAbout')}</H2>
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
              <Pressable
                style={styles.navLink}
                onPress={() => router.push('/authority/submit')}
                accessibilityLabel={t('authoritySubmission.title')}
                accessibilityRole="button"
              >
                <Text style={styles.navLinkText}>
                  {t('authoritySubmission.title')}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Legal Section */}
          <View style={styles.sectionGroup}>
            <H2 style={styles.sectionTitle}>{t('settings.sectionLegal')}</H2>
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
          </View>

          {/* Sign Out Button */}
          <View style={styles.signOutContainer}>
            <Pressable
              style={styles.signOutButton}
              onPress={handleSignOut}
              accessibilityLabel={t('settings.signOut')}
              accessibilityRole="button"
            >
              <Text style={styles.signOutButtonText}>
                {t('settings.signOut')}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <AppModal
        visible={showSignOutConfirm}
        title={t('settings.signOut')}
        message={t('auth.logout')}
        actions={[
          {
            label: t('common.cancel'),
            onPress: () => setShowSignOutConfirm(false),
          },
          { label: t('settings.signOut'), onPress: confirmSignOut },
        ]}
        onClose={() => setShowSignOutConfirm(false)}
      />

      <AppModal
        visible={!!errorModal}
        title={t('common.error')}
        message={errorModal ?? undefined}
        actions={[
          { label: t('common.ok'), onPress: () => setErrorModal(null) },
        ]}
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
    flexGrow: 1,
    padding: spacing.md,
  },
  contentDesktop: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  desktopHeader: {
    marginBottom: spacing.xl,
  },
  header: {
    backgroundColor: colors.white,
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },
  innerContent: {
    width: '100%',
  },
  innerContentDesktop: {
    maxWidth: 720,
    width: '100%',
  },
  navLink: {
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  navLinkText: {
    ...typography.body,
    color: colors.neutral900,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    overflow: 'hidden',
  },
  sectionGroup: {
    marginBottom: spacing.xl,
  },
  sectionSpacer: {
    height: spacing.md,
  },
  sectionTitle: {
    color: colors.neutral900,
    marginBottom: spacing.md,
  },
  signOutButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.error,
    borderRadius: borderRadius.button,
    borderWidth: 1,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  signOutButtonText: {
    ...typography.button,
    color: colors.error,
  },
  signOutContainer: {
    marginTop: spacing.lg,
  },
});
