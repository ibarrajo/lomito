import { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, TextInput, H1, Body, BodySmall, AppModal } from '@lomito/ui';
import { colors, spacing, typography } from '@lomito/ui/src/theme/tokens';
import { useAuth } from '../../hooks/use-auth';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { isFeatureEnabled } from '@lomito/shared';

type AuthMethod = 'email' | 'phone';

export default function LoginScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { signInWithMagicLink, signInWithOtp } = useAuth();

  const { isDesktop } = useBreakpoint();
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ title: string; message: string; onDismiss?: () => void } | null>(null);

  const handleMagicLink = async () => {
    if (!email.trim()) {
      setModal({ title: t('common.error'), message: t('auth.emailRequired') });
      return;
    }

    setLoading(true);
    try {
      await signInWithMagicLink(email);
      setModal({ title: t('common.done'), message: t('auth.magicLinkSent') });
    } catch (error) {
      setModal({ title: t('common.error'), message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleSmsOtp = async () => {
    if (!phone.trim()) {
      setModal({ title: t('common.error'), message: t('auth.phoneRequired') });
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
      setModal({ title: t('common.error'), message: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, isDesktop && styles.containerRow]}>
      {isDesktop && (
        <View style={styles.sidebar}>
          <View style={styles.sidebarContent}>
            <Text style={styles.sidebarEmoji}>🐾</Text>
            <Text style={styles.sidebarHeading}>
              {i18n.language === 'es' ? 'Protegiendo a los animales de nuestra comunidad' : 'Protecting our community\'s animals'}
            </Text>
            <Text style={styles.sidebarSubtext}>
              {i18n.language === 'es' ? 'Plataforma cívica para Tijuana' : 'Civic platform for Tijuana'}
            </Text>
          </View>
        </View>
      )}
      <View style={styles.formSide}>
        <View style={styles.formWrapper}>
          {!isDesktop && <View style={styles.mobileAccent} />}
          <View style={styles.branding}>
            <Text style={styles.brandWordmark}>Lomito</Text>
            <BodySmall color={colors.neutral500}>{t('landing.footerTagline')}</BodySmall>
          </View>

          <View style={styles.header}>
            <H1 accessibilityLabel={t('auth.welcomeBack')}>
              {t('auth.welcomeBack')}
            </H1>
          </View>

      {/* Tab switcher — only show if SMS login is enabled */}
      {isFeatureEnabled('smsLogin') && (
      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, authMethod === 'email' && styles.tabActive]}
          onPress={() => setAuthMethod('email')}
          accessibilityLabel={t('auth.emailLoginTab')}
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
          accessibilityLabel={t('auth.smsLoginTab')}
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
      )}

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
      {isFeatureEnabled('smsLogin') && authMethod === 'phone' && (
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
        <Body accessibilityLabel={t('auth.noAccount')}>
          {t('auth.noAccount')}{' '}
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
      </View>

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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
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
