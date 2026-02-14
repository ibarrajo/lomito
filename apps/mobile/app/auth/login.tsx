import { useState } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, TextInput, H1, Body } from '@lomito/ui';
import { colors, spacing } from '@lomito/ui/src/theme/tokens';
import { useAuth } from '../../hooks/use-auth';

type AuthMethod = 'email' | 'phone';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signInWithMagicLink, signInWithOtp } = useAuth();

  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMagicLink = async () => {
    if (!email.trim()) {
      Alert.alert(t('common.error'), 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await signInWithMagicLink(email);
      Alert.alert(
        t('common.done'),
        'Check your email for the magic link to log in',
      );
    } catch (error) {
      Alert.alert(t('common.error'), (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSmsOtp = async () => {
    if (!phone.trim()) {
      Alert.alert(t('common.error'), 'Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      await signInWithOtp(phone);
      router.push({
        pathname: '/auth/verify',
        params: { phone },
      });
    } catch (error) {
      Alert.alert(t('common.error'), (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <H1 accessibilityLabel={t('auth.welcomeBack')}>
          {t('auth.welcomeBack')}
        </H1>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, authMethod === 'email' && styles.tabActive]}
          onPress={() => setAuthMethod('email')}
          accessibilityLabel="Email login tab"
          accessibilityRole="tab"
          accessibilityState={{ selected: authMethod === 'email' }}
        >
          <Body
            color={authMethod === 'email' ? colors.primary : colors.neutral500}
            accessibilityLabel={t('auth.magicLink')}
          >
            {t('auth.magicLink')}
          </Body>
        </Pressable>

        <Pressable
          style={[styles.tab, authMethod === 'phone' && styles.tabActive]}
          onPress={() => setAuthMethod('phone')}
          accessibilityLabel="SMS login tab"
          accessibilityRole="tab"
          accessibilityState={{ selected: authMethod === 'phone' }}
        >
          <Body
            color={authMethod === 'phone' ? colors.primary : colors.neutral500}
            accessibilityLabel={t('auth.smsOtp')}
          >
            {t('auth.smsOtp')}
          </Body>
        </Pressable>
      </View>

      {/* Email login */}
      {authMethod === 'email' && (
        <View style={styles.form}>
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

          <Button
            onPress={handleMagicLink}
            loading={loading}
            accessibilityLabel={t('auth.magicLink')}
            style={styles.submitButton}
          >
            {t('auth.magicLink')}
          </Button>
        </View>
      )}

      {/* Phone login */}
      {authMethod === 'phone' && (
        <View style={styles.form}>
          <TextInput
            label={t('auth.phone')}
            value={phone}
            onChangeText={setPhone}
            placeholder="+52 664 123 4567"
            accessibilityLabel={t('auth.phone')}
            keyboardType="phone-pad"
            autoCapitalize="none"
          />

          <Button
            onPress={handleSmsOtp}
            loading={loading}
            accessibilityLabel={t('auth.smsOtp')}
            style={styles.submitButton}
          >
            {t('auth.smsOtp')}
          </Button>
        </View>
      )}

      {/* Register link */}
      <View style={styles.footer}>
        <Body accessibilityLabel="Don't have an account?">
          Don&apos;t have an account?{' '}
        </Body>
        <Pressable
          onPress={() => router.push('/auth/register')}
          accessibilityLabel={t('auth.register')}
          accessibilityRole="link"
        >
          <Body color={colors.primary} accessibilityLabel={t('auth.register')}>
            {t('auth.register')}
          </Body>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  submitButton: {
    marginTop: spacing.md,
  },
  tab: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 2,
    flex: 1,
    paddingBottom: spacing.sm,
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabs: {
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
  },
});
