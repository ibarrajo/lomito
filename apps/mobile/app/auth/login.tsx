import { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  Linking,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, TextInput, H1, Body, BodySmall, AppModal } from '@lomito/ui';
import {
  colors,
  spacing,
  typography,
  borderRadius,
} from '@lomito/ui/src/theme/tokens';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../hooks/use-auth';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { useAnalytics } from '../../hooks/use-analytics';
import { isFeatureEnabled } from '@lomito/shared';

type AuthMethod = 'magicLink' | 'password' | 'phone';

/** Map email domains to provider info for "Open in ..." buttons */
const EMAIL_PROVIDERS: {
  domains: string[];
  name: string;
  url: string;
}[] = [
  {
    domains: ['gmail.com', 'googlemail.com', 'elninja.com', 'lomito.org'],
    name: 'Gmail',
    url: 'https://mail.google.com',
  },
  {
    domains: ['outlook.com', 'hotmail.com', 'live.com', 'msn.com'],
    name: 'Outlook',
    url: 'https://outlook.live.com',
  },
  {
    domains: ['yahoo.com', 'ymail.com'],
    name: 'Yahoo Mail',
    url: 'https://mail.yahoo.com',
  },
  {
    domains: ['icloud.com', 'me.com', 'mac.com'],
    name: 'iCloud Mail',
    url: 'https://www.icloud.com/mail',
  },
  {
    domains: ['protonmail.com', 'proton.me', 'pm.me'],
    name: 'Proton Mail',
    url: 'https://mail.proton.me',
  },
];

function getEmailProvider(email: string) {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return null;
  return EMAIL_PROVIDERS.find((p) => p.domains.includes(domain)) ?? null;
}

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signInWithMagicLink, signInWithPassword, signInWithOtp } = useAuth();

  const { isDesktop } = useBreakpoint();
  const { trackEvent } = useAnalytics();
  const [authMethod, setAuthMethod] = useState<AuthMethod>('magicLink');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSentTo, setMagicLinkSentTo] = useState<string | null>(null);
  const [modal, setModal] = useState<{
    title: string;
    message: string;
    onDismiss?: () => void;
  } | null>(null);

  const handleMagicLink = useCallback(async () => {
    if (!email.trim()) {
      setModal({ title: t('common.error'), message: t('auth.emailRequired') });
      return;
    }

    setLoading(true);
    trackEvent('auth_start', { method: 'email' });
    try {
      await signInWithMagicLink(email.trim());
      setMagicLinkSentTo(email.trim());
    } catch (error) {
      setModal({ title: t('common.error'), message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }, [email, signInWithMagicLink, t, trackEvent]);

  const handlePasswordLogin = useCallback(async () => {
    if (!email.trim()) {
      setModal({ title: t('common.error'), message: t('auth.emailRequired') });
      return;
    }
    if (!password || password.length < 6) {
      setModal({
        title: t('common.error'),
        message: t('auth.passwordMinLength'),
      });
      return;
    }

    setLoading(true);
    trackEvent('auth_start', { method: 'password' });
    try {
      await signInWithPassword(email.trim(), password);
      // Auth state listener handles navigation
    } catch (error) {
      setModal({ title: t('common.error'), message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }, [email, password, signInWithPassword, t, trackEvent]);

  const handleSmsOtp = useCallback(async () => {
    if (!phone.trim()) {
      setModal({ title: t('common.error'), message: t('auth.phoneRequired') });
      return;
    }

    setLoading(true);
    trackEvent('auth_start', { method: 'sms' });
    try {
      await signInWithOtp(phone);
      router.push({
        pathname: '/auth/verify',
        params: { phone },
      });
    } catch (error) {
      setModal({ title: t('common.error'), message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }, [phone, signInWithOtp, t, trackEvent, router]);

  // Magic link sent confirmation screen
  if (magicLinkSentTo) {
    const provider = getEmailProvider(magicLinkSentTo);
    return (
      <View style={[styles.container, isDesktop && styles.containerRow]}>
        {isDesktop && (
          <View style={styles.sidebar}>
            <View style={styles.sidebarContent}>
              <Text style={styles.sidebarEmoji}>📬</Text>
              <Text style={styles.sidebarHeading}>
                {t('auth.checkEmailHeading')}
              </Text>
              <Text style={styles.sidebarSubtext}>
                {t('auth.checkEmailSubtext')}
              </Text>
            </View>
          </View>
        )}
        <View style={styles.formSide}>
          <View style={styles.formWrapper}>
            <View style={styles.sentIconContainer}>
              <Mail size={48} color={colors.primary} strokeWidth={1.5} />
            </View>
            <H1
              accessibilityLabel={t('auth.checkYourEmail')}
              style={styles.sentTitle}
            >
              {t('auth.checkYourEmail')}
            </H1>
            <Body
              color={colors.neutral500}
              accessibilityLabel={t('auth.magicLinkSentTo', {
                email: magicLinkSentTo,
              })}
              style={styles.sentDescription}
            >
              {t('auth.magicLinkSentTo', { email: magicLinkSentTo })}
            </Body>

            {provider && (
              <Pressable
                style={({ pressed }) => [
                  styles.providerButton,
                  pressed && styles.providerButtonPressed,
                ]}
                onPress={() => Linking.openURL(provider.url)}
                accessibilityLabel={t('auth.openProvider', {
                  provider: provider.name,
                })}
                accessibilityRole="link"
              >
                <Mail size={20} color={colors.secondary} strokeWidth={1.5} />
                <Text style={styles.providerButtonText}>
                  {t('auth.openProvider', { provider: provider.name })}
                </Text>
              </Pressable>
            )}

            <View style={styles.sentActions}>
              <Pressable
                onPress={() => setMagicLinkSentTo(null)}
                accessibilityLabel={t('auth.tryDifferentEmail')}
                accessibilityRole="button"
                style={styles.backLink}
              >
                <ArrowLeft size={16} color={colors.primary} strokeWidth={1.5} />
                <Body
                  color={colors.primary}
                  accessibilityLabel={t('auth.tryDifferentEmail')}
                >
                  {t('auth.tryDifferentEmail')}
                </Body>
              </Pressable>

              <Pressable
                onPress={handleMagicLink}
                accessibilityLabel={t('auth.resendLink')}
                accessibilityRole="button"
                disabled={loading}
              >
                <Body
                  color={colors.neutral500}
                  accessibilityLabel={t('auth.resendLink')}
                >
                  {loading ? t('auth.sending') : t('auth.resendLink')}
                </Body>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDesktop && styles.containerRow]}>
      {isDesktop && (
        <View style={styles.sidebar}>
          <View style={styles.sidebarContent}>
            <Text style={styles.sidebarEmoji}>🐾</Text>
            <Text style={styles.sidebarHeading}>
              {t('auth.sidebarHeading')}
            </Text>
            <Text style={styles.sidebarSubtext}>
              {t('auth.sidebarSubtext')}
            </Text>
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
              <H1 accessibilityLabel={t('auth.welcomeBack')}>
                {t('auth.welcomeBack')}
              </H1>
            </View>

            {/* Method tabs — always show magic link vs password, optionally SMS */}
            <View style={styles.tabs}>
              <Pressable
                style={[
                  styles.tab,
                  authMethod === 'magicLink' && styles.tabActive,
                ]}
                onPress={() => setAuthMethod('magicLink')}
                accessibilityLabel={t('auth.magicLinkTab')}
                accessibilityRole="tab"
                accessibilityState={{ selected: authMethod === 'magicLink' }}
              >
                <Body
                  color={
                    authMethod === 'magicLink'
                      ? colors.primary
                      : colors.neutral500
                  }
                  accessibilityLabel={t('auth.magicLink')}
                >
                  {t('auth.magicLink')}
                </Body>
              </Pressable>

              <Pressable
                style={[
                  styles.tab,
                  authMethod === 'password' && styles.tabActive,
                ]}
                onPress={() => setAuthMethod('password')}
                accessibilityLabel={t('auth.passwordTab')}
                accessibilityRole="tab"
                accessibilityState={{ selected: authMethod === 'password' }}
              >
                <Body
                  color={
                    authMethod === 'password'
                      ? colors.primary
                      : colors.neutral500
                  }
                  accessibilityLabel={t('auth.passwordLogin')}
                >
                  {t('auth.passwordLogin')}
                </Body>
              </Pressable>

              {isFeatureEnabled('smsLogin') && (
                <Pressable
                  style={[
                    styles.tab,
                    authMethod === 'phone' && styles.tabActive,
                  ]}
                  onPress={() => setAuthMethod('phone')}
                  accessibilityLabel={t('auth.smsLoginTab')}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: authMethod === 'phone' }}
                >
                  <Body
                    color={
                      authMethod === 'phone'
                        ? colors.primary
                        : colors.neutral500
                    }
                    accessibilityLabel={t('auth.smsOtp')}
                  >
                    {t('auth.smsOtp')}
                  </Body>
                </Pressable>
              )}
            </View>

            {/* Magic link form */}
            {authMethod === 'magicLink' && (
              <View style={styles.form}>
                <TextInput
                  label={t('auth.email')}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('auth.emailPlaceholder')}
                  accessibilityLabel={t('auth.email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="send"
                  onSubmitEditing={handleMagicLink}
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

            {/* Password form */}
            {authMethod === 'password' && (
              <View style={styles.form}>
                <TextInput
                  label={t('auth.email')}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('auth.emailPlaceholder')}
                  accessibilityLabel={t('auth.email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />

                <TextInput
                  label={t('auth.password')}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t('auth.passwordPlaceholder')}
                  accessibilityLabel={t('auth.password')}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="go"
                  onSubmitEditing={handlePasswordLogin}
                />

                <Button
                  onPress={handlePasswordLogin}
                  loading={loading}
                  accessibilityLabel={t('auth.passwordLogin')}
                  style={styles.submitButton}
                >
                  {t('auth.passwordLogin')}
                </Button>
              </View>
            )}

            {/* Phone login */}
            {isFeatureEnabled('smsLogin') && authMethod === 'phone' && (
              <View style={styles.form}>
                <TextInput
                  label={t('auth.phone')}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={t('auth.phonePlaceholder')}
                  accessibilityLabel={t('auth.phone')}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  returnKeyType="send"
                  onSubmitEditing={handleSmsOtp}
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
              <Body accessibilityLabel={t('auth.noAccount')}>
                {t('auth.noAccount')}{' '}
              </Body>
              <Pressable
                onPress={() => router.push('/auth/register')}
                accessibilityLabel={t('auth.register')}
                accessibilityRole="link"
              >
                <Body
                  color={colors.primary}
                  accessibilityLabel={t('auth.register')}
                >
                  {t('auth.register')}
                </Body>
              </Pressable>
            </View>
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
            onPress: () => {
              const onDismiss = modal?.onDismiss;
              setModal(null);
              onDismiss?.();
            },
          },
        ]}
        onClose={() => {
          const onDismiss = modal?.onDismiss;
          setModal(null);
          onDismiss?.();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backLink: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
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
  providerButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.button,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  providerButtonPressed: {
    opacity: 0.85,
  },
  providerButtonText: {
    ...typography.button,
    color: colors.secondary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  sentActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.lg,
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  sentDescription: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  sentIconContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sentTitle: {
    textAlign: 'center',
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
  tab: {
    borderBottomColor: colors.white,
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
