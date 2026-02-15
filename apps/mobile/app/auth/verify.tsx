import { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, TextInput, H1, Body, AppModal } from '@lomito/ui';
import { colors, spacing } from '@lomito/ui/src/theme/tokens';
import { useAuth } from '../../hooks/use-auth';

export default function VerifyScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { verifyOtp, signInWithOtp } = useAuth();

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
    <View style={styles.container}>
      <View style={styles.header}>
        <H1 accessibilityLabel={t('auth.verifyCode')}>
          {t('auth.verifyCode')}
        </H1>
        <Body style={styles.subtitle} accessibilityLabel={t('auth.enterCode')}>
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
        <Body accessibilityLabel={t('auth.noCode')}>{t('auth.noCode')} </Body>
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
        <Body color={colors.neutral500} accessibilityLabel={t('common.back')}>
          {t('common.back')}
        </Body>
      </Pressable>

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
  container: {
    backgroundColor: colors.white,
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
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
  header: {
    marginBottom: spacing.xl,
  },
  phoneNumber: {
    marginTop: spacing.xs,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  subtitle: {
    marginTop: spacing.sm,
  },
});
