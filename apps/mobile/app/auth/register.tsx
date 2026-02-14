import { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, TextInput, H1, Body, BodySmall, AppModal } from '@lomito/ui';
import { colors, spacing, borderRadius, typography } from '@lomito/ui/src/theme/tokens';
import { useAuth } from '../../hooks/use-auth';
import { useBreakpoint } from '../../hooks/use-breakpoint';

const MUNICIPALITIES = [
  'Tijuana',
  'Tecate',
  'Ensenada',
  'Playas de Rosarito',
  'Mexicali',
];

const MODAL_OVERLAY_COLOR = 'rgba(0, 0, 0, 0.5)';

export default function RegisterScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { signUp } = useAuth();
  const { isDesktop } = useBreakpoint();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [password, setPassword] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMunicipalityPicker, setShowMunicipalityPicker] = useState(false);
  const [modal, setModal] = useState<{ title: string; message: string; onDismiss?: () => void } | null>(null);

  const handleRegister = async () => {
    // Validation
    if (!fullName.trim()) {
      setModal({ title: t('common.error'), message: t('auth.nameRequired') });
      return;
    }
    if (!email.trim()) {
      setModal({ title: t('common.error'), message: t('auth.emailRequired') });
      return;
    }
    if (!phone.trim()) {
      setModal({ title: t('common.error'), message: t('auth.phoneRequired') });
      return;
    }
    if (!municipality) {
      setModal({ title: t('common.error'), message: t('auth.municipalityRequired') });
      return;
    }
    if (!password.trim() || password.length < 6) {
      setModal({ title: t('common.error'), message: t('auth.passwordMinLength') });
      return;
    }
    if (!privacyAccepted || !termsAccepted) {
      setModal({ title: t('common.error'), message: t('auth.acceptTerms') });
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, {
        full_name: fullName,
        phone,
        municipality,
      });
      setModal({
        title: t('common.done'),
        message: t('auth.accountCreated'),
        onDismiss: () => router.replace('/auth/login'),
      });
    } catch (error) {
      setModal({ title: t('common.error'), message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.outerContainer, isDesktop && styles.outerContainerRow]}>
      {isDesktop && (
        <View style={styles.sidebar}>
          <View style={styles.sidebarContent}>
            <Text style={styles.sidebarEmoji}>🐾</Text>
            <Text style={styles.sidebarHeading}>
              {i18n.language === 'es' ? 'Únete a nuestra comunidad' : 'Join our community'}
            </Text>
            <Text style={styles.sidebarSubtext}>
              {i18n.language === 'es' ? 'Juntos podemos proteger a los animales de Tijuana' : 'Together we can protect Tijuana\'s animals'}
            </Text>
          </View>
        </View>
      )}
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.formWrapper}>
          {!isDesktop && <View style={styles.mobileAccent} />}
          <View style={styles.branding}>
            <Text style={styles.brandWordmark}>Lomito</Text>
            <BodySmall color={colors.neutral500}>{t('landing.footerTagline')}</BodySmall>
          </View>

          <View style={styles.header}>
            <H1 accessibilityLabel={t('auth.createAccount')}>
              {t('auth.createAccount')}
            </H1>
          </View>

      <View style={styles.form}>
        <TextInput
          label={t('auth.name')}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Juan Pérez"
          accessibilityLabel={t('auth.name')}
          autoCapitalize="words"
        />

        <TextInput
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          accessibilityLabel={t('auth.email')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          label={t('auth.phone')}
          value={phone}
          onChangeText={setPhone}
          placeholder="+52 664 123 4567"
          accessibilityLabel={t('auth.phone')}
          keyboardType="phone-pad"
        />

        {/* Municipality picker */}
        <View>
          <BodySmall
            color={colors.neutral700}
            style={styles.label}
            accessibilityLabel={t('auth.municipality')}
          >
            {t('auth.municipality')}
          </BodySmall>
          <Pressable
            onPress={() => setShowMunicipalityPicker(true)}
            style={styles.picker}
            accessibilityLabel={t('auth.municipality')}
            accessibilityRole="button"
          >
            <Body
              color={municipality ? colors.neutral900 : colors.neutral400}
              accessibilityLabel={municipality || t('auth.selectMunicipality')}
            >
              {municipality || t('auth.selectMunicipality')}
            </Body>
          </Pressable>
        </View>

        <TextInput
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          placeholder={t('auth.passwordPlaceholder')}
          accessibilityLabel={t('auth.password')}
          secureTextEntry
          autoCapitalize="none"
        />

        {/* Privacy and terms checkboxes */}
        <Pressable
          onPress={() => setPrivacyAccepted(!privacyAccepted)}
          style={styles.checkbox}
          accessibilityLabel={t('auth.privacyAccept')}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: privacyAccepted }}
        >
          <View style={styles.checkboxBox}>
            {privacyAccepted && <View style={styles.checkboxChecked} />}
          </View>
          <BodySmall
            color={colors.neutral700}
            style={styles.checkboxLabel}
            accessibilityLabel={t('auth.privacyAccept')}
          >
            {t('auth.privacyAccept')}
          </BodySmall>
        </Pressable>

        <Pressable
          onPress={() => setTermsAccepted(!termsAccepted)}
          style={styles.checkbox}
          accessibilityLabel={t('auth.termsAccept')}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: termsAccepted }}
        >
          <View style={styles.checkboxBox}>
            {termsAccepted && <View style={styles.checkboxChecked} />}
          </View>
          <BodySmall
            color={colors.neutral700}
            style={styles.checkboxLabel}
            accessibilityLabel={t('auth.termsAccept')}
          >
            {t('auth.termsAccept')}
          </BodySmall>
        </Pressable>

        <Button
          onPress={handleRegister}
          loading={loading}
          accessibilityLabel={t('auth.createAccount')}
          style={styles.submitButton}
        >
          {t('auth.createAccount')}
        </Button>
      </View>

      {/* Login link */}
      <View style={styles.footer}>
        <Body accessibilityLabel={t('auth.alreadyHaveAccount')}>
          {t('auth.alreadyHaveAccount')}{' '}
        </Body>
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel={t('auth.login')}
          accessibilityRole="link"
        >
          <Body color={colors.primary} accessibilityLabel={t('auth.login')}>
            {t('auth.login')}
          </Body>
        </Pressable>
      </View>
        </View>

        {/* Municipality picker modal */}
        <Modal
        visible={showMunicipalityPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMunicipalityPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowMunicipalityPicker(false)}
          accessibilityLabel={t('common.close')}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <H1 accessibilityLabel={t('auth.municipality')}>
                {t('auth.municipality')}
              </H1>
            </View>
            {MUNICIPALITIES.map((mun) => (
              <Pressable
                key={mun}
                onPress={() => {
                  setMunicipality(mun);
                  setShowMunicipalityPicker(false);
                }}
                style={styles.modalItem}
                accessibilityLabel={mun}
                accessibilityRole="button"
              >
                <Body
                  color={
                    municipality === mun ? colors.primary : colors.neutral900
                  }
                  accessibilityLabel={mun}
                >
                  {mun}
                </Body>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <AppModal
        visible={!!modal}
        title={modal?.title ?? ''}
        message={modal?.message}
        actions={[{
          label: t('common.ok'),
          onPress: () => {
            const onDismiss = modal?.onDismiss;
            setModal(null);
            onDismiss?.();
          },
        }]}
        onClose={() => {
          const onDismiss = modal?.onDismiss;
          setModal(null);
          onDismiss?.();
        }}
      />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  brandWordmark: {
    color: colors.primary,
    fontFamily: typography.h1.fontFamily,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  branding: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  checkbox: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  checkboxBox: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: 4,
    borderWidth: 1,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderRadius: 2,
    height: 12,
    width: 12,
  },
  checkboxLabel: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    marginTop: spacing.xl,
  },
  form: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  formWrapper: {
    alignSelf: 'center',
    maxWidth: 480,
    width: '100%',
  },
  header: {
    marginBottom: spacing.xl,
  },
  label: {
    marginBottom: spacing.xs,
  },
  mobileAccent: {
    alignSelf: 'center',
    backgroundColor: colors.primary,
    borderRadius: 2,
    height: 4,
    marginBottom: spacing.lg,
    width: 40,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.card,
    borderTopRightRadius: borderRadius.card,
    maxHeight: '50%',
    padding: spacing.lg,
  },
  modalHeader: {
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
  },
  modalItem: {
    paddingVertical: spacing.md,
  },
  modalOverlay: {
    backgroundColor: MODAL_OVERLAY_COLOR,
    flex: 1,
    justifyContent: 'flex-end',
  },
  outerContainer: {
    backgroundColor: colors.white,
    flex: 1,
  },
  outerContainerRow: {
    flexDirection: 'row',
  },
  picker: {
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.input,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  sidebar: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRightColor: colors.neutral200,
    borderRightWidth: 1,
    flex: 1,
    justifyContent: 'center',
    maxWidth: 480,
    padding: spacing.xxl,
  },
  sidebarContent: {
    maxWidth: 320,
  },
  sidebarEmoji: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  sidebarHeading: {
    color: colors.primaryDark,
    fontFamily: typography.h1.fontFamily,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    marginBottom: spacing.md,
  },
  sidebarSubtext: {
    color: colors.neutral500,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
  },
  submitButton: {
    marginTop: spacing.md,
  },
});
