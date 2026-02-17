import { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, H1, Body, BodySmall } from '@lomito/ui';
import { colors, spacing } from '@lomito/ui/src/theme/tokens';
import { supabase } from '../../lib/supabase';

type CallbackStatus = 'verifying' | 'success' | 'error';

export default function AuthCallbackScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{
    token_hash?: string;
    type?: string;
    error_description?: string;
  }>();
  const [status, setStatus] = useState<CallbackStatus>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    async function verifyToken() {
      // Check for error in URL params (e.g. expired link)
      if (params.error_description) {
        setErrorMessage(params.error_description);
        setStatus('error');
        return;
      }

      // On web, Supabase JS can detect the hash fragment automatically
      // via onAuthStateChange. But if token_hash is passed as a query param,
      // we need to verify it explicitly.
      if (params.token_hash && params.type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: params.token_hash,
          type: params.type as 'email' | 'magiclink' | 'recovery' | 'invite',
        });

        if (error) {
          setErrorMessage(error.message);
          setStatus('error');
          return;
        }
      }

      // If we get here, either verifyOtp succeeded or onAuthStateChange
      // will handle the session from the URL hash. Either way, wait briefly
      // for the auth state to propagate, then redirect.
      setStatus('success');

      // Small delay to let onAuthStateChange fire in _layout.tsx
      setTimeout(() => {
        if (Platform.OS === 'web') {
          router.replace('/(tabs)/dashboard');
        }
      }, 500);
    }

    verifyToken();
  }, [params.token_hash, params.type, params.error_description, router]);

  return (
    <View style={styles.container}>
      {status === 'verifying' && (
        <>
          <H1 style={styles.heading}>{t('auth.callback.verifying')}</H1>
          <Body style={styles.body}>{t('auth.callback.pleaseWait')}</Body>
        </>
      )}

      {status === 'success' && (
        <>
          <H1 style={styles.heading}>{t('auth.callback.success')}</H1>
          <Body style={styles.body}>{t('auth.callback.redirecting')}</Body>
        </>
      )}

      {status === 'error' && (
        <>
          <H1 style={styles.heading}>{t('auth.callback.errorTitle')}</H1>
          <Body style={styles.body}>
            {errorMessage || t('auth.callback.errorGeneric')}
          </Body>
          <BodySmall style={styles.hint}>
            {t('auth.callback.linkExpiredHint')}
          </BodySmall>
          <Button
            onPress={() => router.replace('/auth/login')}
            accessibilityLabel={t('auth.callback.tryAgain')}
            style={styles.button}
          >
            {t('auth.callback.tryAgain')}
          </Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.neutral500,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  button: {
    minWidth: 200,
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.neutral100,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  heading: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  hint: {
    color: colors.neutral500,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
});
