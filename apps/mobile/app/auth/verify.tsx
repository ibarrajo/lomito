import { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, TextInput, H1, Body, BodySmall, AppModal } from '@lomito/ui';
import { colors, spacing, typography } from '@lomito/ui/src/theme/tokens';
import { useAuth } from '../../hooks/use-auth';
import { useBreakpoint } from '../../hooks/use-breakpoint';

export default function VerifyScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { verifyOtp, signInWithOtp } = useAuth();
  const { isDesktop } = useBreakpoint();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [modal, setModal] = useState<{ title: string; message: string } | null>(
    null,
  );

  const handleVerify = async () => {
    if (!phone) {
      setModal({ title: t('common.error'), message: t('auth.phoneRequired') });
      return;
    }

    if (!code.trim() || code.length !== 6) {
      setModal({ title: t('common.error'), message: t('auth.codeInvalid') });
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(phone, code);
      // Auth state change listener will handle navigation
    } catch (error) {
      setModal({ title: t('common.error'), message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phone) {
      setModal({ title: t('common.error'), message: t('auth.phoneRequired') });
      return;
    }

    setResending(true);
    try {
      await signInWithOtp(phone);
      setModal({ title: t('common.done'), message: t('auth.codeSent') });
    } catch (error) {
      setModal({ title: t('common.error'), message: (error as Error).message });
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={[styles.container, isDesktop && styles.containerRow]}>
      {isDesktop && (
        <View style={styles.sidebar}>
          <View style={styles.sidebarContent}>
            <Text style={styles.sidebarEmoji}>🔐</Text>
            <Text style={styles.sidebarHeading}>
              {t('auth.checkEmailHeading')}
            </Text>
            <Text style={styles.sidebarSubtext}>{t('auth.enterCode')}</Text>
          </View>
        </View>
      )}
      <View style={styles.formSide}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formWrapper}>
            {!isDesktop && <View style={styles.mobileAccent} />}
            <View style={styles.branding}>
              <Text style={styles.brandWordmark}>Lomito.org</Text>
              <BodySmall color={colors.neutral500}>
                {t('landing.footerTagline')}
              </BodySmall>
            </View>

            <View style={styles.header}>
              <H1 accessibilityLabel={t('auth.verifyCode')}>
                {t('auth.verifyCode')}
              </H1>
              <Body
                style={styles.subtitle}
                accessibilityLabel={t('auth.enterCode')}
              >
                {t('auth.enterCode')}
              </Body>
              {phone && (
                <Body
                  color={colors.neutral500}
                  style={styles.phoneNumber}
                  accessibilityLabel={phone}
                >
                  {phone}
                </Body>
              )}
            </View>

            <View style={styles.form}>
              <TextInput
                label={t('auth.verificationCode')}
                value={code}
                onChangeText={setCode}
                placeholder={t('auth.codePlaceholder')}
                accessibilityLabel={t('auth.verificationCode')}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />

              <Button
                onPress={handleVerify}
                loading={loading}
                accessibilityLabel={t('auth.verifyCode')}
                style={styles.submitButton}
              >
                {t('auth.verifyCode')}
              </Button>
            </View>

            {/* Resend code link */}
            <View style={styles.footer}>
              <Body accessibilityLabel={t('auth.noCode')}>
                {t('auth.noCode')}{' '}
              </Body>
              <Pressable
                onPress={handleResend}
                disabled={resending}
                accessibilityLabel={t('auth.resend')}
                accessibilityRole="button"
              >
                <Body
                  color={resending ? colors.neutral400 : colors.primary}
                  accessibilityLabel={t('auth.resend')}
                >
                  {resending ? t('auth.sending') : t('auth.resend')}
                </Body>
              </Pressable>
            </View>

            {/* Back to login */}
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
              accessibilityLabel={t('common.back')}
              accessibilityRole="button"
            >
              <Body
                color={colors.neutral500}
                accessibilityLabel={t('common.back')}
              >
                {t('common.back')}
              </Body>
            </Pressable>
          </View>
        </ScrollView>
      </View>

      <AppModal
        visible={!!modal}
        title={modal?.title ?? ''}
        message={modal?.message}
        actions={[
          {
            label: t('common.ok'),
            onPress: () => setModal(null),
          },
        ]}
        onClose={() => setModal(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
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
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  containerRow: {
    flexDirection: 'row',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  form: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  formSide: {
    flex: 1,
    justifyContent: 'center',
  },
  formWrapper: {
    alignSelf: 'center',
    maxWidth: 440,
    width: '100%',
  },
  header: {
    marginBottom: spacing.xl,
  },
  mobileAccent: {
    alignSelf: 'center',
    backgroundColor: colors.primary,
    borderRadius: 2,
    height: 4,
    marginBottom: spacing.lg,
    width: 40,
  },
  phoneNumber: {
    marginTop: spacing.xs,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
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
  subtitle: {
    marginTop: spacing.sm,
  },
});
