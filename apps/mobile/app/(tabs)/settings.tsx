import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  TextInput as RNTextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadowStyles,
} from '@lomito/ui/src/theme/tokens';
import { H1, H2, H3, Body, Caption, AppModal } from '@lomito/ui';
import { useAuth } from '../../hooks/use-auth';
import { useUserProfile } from '../../hooks/use-user-profile';
import { useDeleteAccount } from '../../hooks/use-delete-account';
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

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const { deleteAccount, loading: deleteLoading } = useDeleteAccount();

  const confirmWord = t('settings.deleteAccountConfirmWord');
  const isDeleteConfirmed = deleteConfirmText === confirmWord;

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

  const handleDeleteAccount = () => {
    setDeleteConfirmText('');
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    if (!isDeleteConfirmed) return;
    try {
      await deleteAccount();
      // Navigation is handled inside the hook after successful deletion
    } catch {
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
      setErrorModal(t('settings.deleteAccountError'));
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
          <View style={styles.actionButtonContainer}>
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

          {/* Delete Account Button */}
          <View style={styles.actionButtonContainer}>
            <Pressable
              style={styles.deleteAccountButton}
              onPress={handleDeleteAccount}
              accessibilityLabel={t('settings.deleteAccount')}
              accessibilityRole="button"
            >
              <Text style={styles.deleteAccountButtonText}>
                {t('settings.deleteAccount')}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Sign out confirmation modal */}
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

      {/* Error modal */}
      <AppModal
        visible={!!errorModal}
        title={t('common.error')}
        message={errorModal ?? undefined}
        actions={[
          { label: t('common.ok'), onPress: () => setErrorModal(null) },
        ]}
        onClose={() => setErrorModal(null)}
      />

      {/* Delete account confirmation modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!deleteLoading) {
            setShowDeleteConfirm(false);
            setDeleteConfirmText('');
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <H3 style={styles.modalTitle}>
              {t('settings.deleteAccountTitle')}
            </H3>
            <Body style={styles.modalWarning}>
              {t('settings.deleteAccountWarning')}
            </Body>
            <Text style={styles.confirmLabel}>
              {t('settings.deleteAccountConfirm')}
            </Text>
            <RNTextInput
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              placeholder={confirmWord}
              placeholderTextColor={colors.neutral400}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!deleteLoading}
              accessibilityLabel={t('settings.deleteAccountConfirm')}
              style={[
                styles.confirmInput,
                isDeleteConfirmed && styles.confirmInputValid,
              ]}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                disabled={deleteLoading}
                accessibilityLabel={t('common.cancel')}
                accessibilityRole="button"
              >
                <Text style={styles.cancelButtonText}>
                  {t('common.cancel')}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.confirmDeleteButton,
                  (!isDeleteConfirmed || deleteLoading) &&
                    styles.confirmDeleteButtonDisabled,
                ]}
                onPress={confirmDeleteAccount}
                disabled={!isDeleteConfirmed || deleteLoading}
                accessibilityLabel={t('settings.deleteAccountButton')}
                accessibilityRole="button"
              >
                <Text style={styles.confirmDeleteButtonText}>
                  {deleteLoading
                    ? t('common.submitting')
                    : t('settings.deleteAccountButton')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  accountInfo: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  actionButtonContainer: {
    marginTop: spacing.md,
  },
  cancelButton: {
    alignItems: 'center',
    borderColor: colors.neutral200,
    borderRadius: borderRadius.button,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.neutral700,
  },
  confirmDeleteButton: {
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: borderRadius.button,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  confirmDeleteButtonDisabled: {
    backgroundColor: colors.neutral400,
  },
  confirmDeleteButtonText: {
    ...typography.button,
    color: colors.white,
  },
  confirmInput: {
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.input,
    borderWidth: 1,
    color: colors.neutral900,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    height: 48,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  confirmInputValid: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  confirmLabel: {
    ...typography.small,
    color: colors.neutral700,
    marginTop: spacing.md,
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
  deleteAccountButton: {
    alignItems: 'center',
    backgroundColor: colors.errorBackground,
    borderColor: colors.error,
    borderRadius: borderRadius.button,
    borderWidth: 1,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  deleteAccountButtonText: {
    ...typography.button,
    color: colors.error,
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
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    maxWidth: 400,
    padding: spacing.lg,
    width: '100%',
    ...shadowStyles.elevated,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(31, 35, 40, 0.5)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalTitle: {
    color: colors.neutral900,
    marginBottom: spacing.sm,
  },
  modalWarning: {
    color: colors.neutral700,
    marginBottom: spacing.sm,
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
});
