import { useState } from 'react';
import { View, StyleSheet, Alert, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, TextInput, H1, Body } from '@lomito/ui';
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

  const handleVerify = async () => {
    if (!phone) {
      Alert.alert(t('common.error'), 'Phone number is required');
      return;
    }

    if (!code.trim() || code.length !== 6) {
      Alert.alert(t('common.error'), 'Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(phone, code);
      // Auth state change listener will handle navigation
    } catch (error) {
      Alert.alert(t('common.error'), (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phone) {
      Alert.alert(t('common.error'), 'Phone number is required');
      return;
    }

    setResending(true);
    try {
      await signInWithOtp(phone);
      Alert.alert(t('common.done'), 'A new code has been sent to your phone');
    } catch (error) {
      Alert.alert(t('common.error'), (error as Error).message);
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
          label="Verification code"
          value={code}
          onChangeText={setCode}
          placeholder="000000"
          accessibilityLabel="Verification code"
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
        <Body accessibilityLabel="Didn't receive the code?">
          Didn&apos;t receive the code?{' '}
        </Body>
        <Pressable
          onPress={handleResend}
          disabled={resending}
          accessibilityLabel="Resend code"
          accessibilityRole="button"
        >
          <Body
            color={resending ? colors.neutral400 : colors.primary}
            accessibilityLabel="Resend code"
          >
            {resending ? 'Sending...' : 'Resend'}
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
