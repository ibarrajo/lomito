/**
 * Donate Screen
 * Donation flow with amount selection, payment method, and checkout.
 */

import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as WebBrowser from 'expo-web-browser';
import { AmountPicker } from '../components/donate/amount-picker';
import { PaymentMethods } from '../components/donate/payment-methods';
import { useDonate } from '../hooks/use-donate';
import { colors, spacing, borderRadius, shadowStyles } from '@lomito/ui/src/theme/tokens';
import { H1, H2, Body, BodySmall, ButtonText, AppModal } from '@lomito/ui';
import { ArrowLeft } from 'lucide-react-native';
import { isFeatureEnabled } from '@lomito/shared';
import { useAnalytics } from '../hooks/use-analytics';

type PaymentMethod = 'mercado_pago' | 'oxxo' | 'spei';

export default function DonateScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { createDonation, loading, error } = useDonate();
  const { trackEvent } = useAnalytics();

  const [selectedAmount, setSelectedAmount] = useState(100);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('mercado_pago');
  const [modal, setModal] = useState<{ title: string; message: string; onDismiss?: () => void } | null>(null);

  async function handleSubmit() {
    // Validate amount
    if (selectedAmount < 10) {
      setModal({ title: t('donate.error'), message: t('donate.minAmount') });
      return;
    }

    trackEvent('donate_start', { amount: String(selectedAmount), method: selectedMethod });

    // Create donation and get checkout URL
    const result = await createDonation({
      amount: selectedAmount,
      paymentMethod: selectedMethod,
    });

    if (result && result.checkoutUrl) {
      // Open Mercado Pago checkout in browser
      const browserResult = await WebBrowser.openBrowserAsync(result.checkoutUrl);

      // Handle result after user returns from browser
      if (browserResult.type === 'cancel' || browserResult.type === 'dismiss') {
        // User closed the browser, show processing message
        setModal({
          title: t('donate.processing'),
          message: t('donate.processingMessage'),
          onDismiss: () => router.back(),
        });
      }
    } else if (error) {
      setModal({ title: t('donate.error'), message: error });
    }
  }

  function handleBack() {
    router.back();
  }

  if (!isFeatureEnabled('donations')) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={handleBack}
            style={styles.backButton}
            accessibilityLabel={t('common.back')}
            accessibilityRole="button"
          >
            <ArrowLeft size={24} color={colors.neutral900} />
          </Pressable>
          <H1>{t('donate.title')}</H1>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.comingSoonWrapper}>
          <H2 style={styles.comingSoonTitle}>{t('donate.comingSoon')}</H2>
          <Body color={colors.neutral500}>{t('donate.comingSoonDescription')}</Body>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={styles.backButton}
          accessibilityLabel={t('common.back')}
          accessibilityRole="button"
        >
          <ArrowLeft size={24} color={colors.neutral900} />
        </Pressable>
        <H1>{t('donate.title')}</H1>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.formWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Trust Building Callout */}
          <View style={styles.trustCard}>
            <H2 style={styles.trustTitle}>{t('donate.whyDonate')}</H2>
            <Body color={colors.neutral700} style={styles.trustBody}>
              {t('donate.whyDonateDescription')}
            </Body>
          </View>

          {/* Amount Picker */}
          <AmountPicker selectedAmount={selectedAmount} onAmountChange={setSelectedAmount} />

          {/* Payment Methods */}
          <PaymentMethods selectedMethod={selectedMethod} onMethodChange={setSelectedMethod} />

          {/* Info text based on payment method */}
          <View style={styles.infoCard}>
            <BodySmall>
              {selectedMethod === 'oxxo' && t('donate.oxxoInfo')}
              {selectedMethod === 'spei' && t('donate.speiInfo')}
              {selectedMethod === 'mercado_pago' && t('donate.cardInfo')}
            </BodySmall>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <Pressable
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            accessibilityLabel={t('common.submit')}
            accessibilityRole="button"
          >
            <ButtonText style={styles.submitButtonText}>
              {loading ? t('donate.processing') : `${t('common.submit')} $${selectedAmount} MXN`}
            </ButtonText>
          </Pressable>
        </View>
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
  backButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  comingSoonTitle: {
    marginBottom: spacing.md,
  },
  comingSoonWrapper: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  container: {
    backgroundColor: colors.neutral100,
    flex: 1,
  },
  footer: {
    backgroundColor: colors.white,
    borderTopColor: colors.neutral200,
    borderTopWidth: 1,
    padding: spacing.md,
    ...shadowStyles.card,
  },
  formWrapper: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 560 : undefined,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxl,
    ...shadowStyles.card,
  },
  headerSpacer: {
    width: 44,
  },
  infoCard: {
    backgroundColor: colors.infoBackground,
    borderLeftColor: colors.info,
    borderLeftWidth: 4,
    borderRadius: borderRadius.card,
    padding: spacing.md,
  },
  scrollContent: {
    gap: spacing.lg,
    padding: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.button,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadowStyles.elevated,
  },
  submitButtonDisabled: {
    backgroundColor: colors.neutral400,
  },
  submitButtonText: {
    color: colors.white,
  },
  trustBody: {
    lineHeight: 22,
  },
  trustCard: {
    backgroundColor: colors.secondaryLight,
    borderLeftColor: colors.secondary,
    borderLeftWidth: 4,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
  },
  trustTitle: {
    marginBottom: spacing.sm,
  },
});
