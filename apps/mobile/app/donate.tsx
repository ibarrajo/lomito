/**
 * Donate Screen
 * Donation flow with amount selection, payment method, and checkout.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as WebBrowser from 'expo-web-browser';
import { AmountPicker } from '../components/donate/amount-picker';
import { PaymentMethods } from '../components/donate/payment-methods';
import { useDonate } from '../hooks/use-donate';
import { colors, spacing, borderRadius, typography, shadowStyles } from '@lomito/ui/src/theme/tokens';
import { ArrowLeft } from 'lucide-react-native';

type PaymentMethod = 'mercado_pago' | 'oxxo' | 'spei';

export default function DonateScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { createDonation, loading, error } = useDonate();

  const [selectedAmount, setSelectedAmount] = useState(100);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('mercado_pago');

  async function handleSubmit() {
    // Validate amount
    if (selectedAmount < 10) {
      Alert.alert(t('donate.error'), t('donate.minAmount'));
      return;
    }

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
        Alert.alert(
          t('donate.processing'),
          t('donate.processingMessage'),
          [{ text: t('common.ok'), onPress: () => router.back() }]
        );
      }
    } else if (error) {
      Alert.alert(t('donate.error'), error);
    }
  }

  function handleBack() {
    router.back();
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
        <Text style={styles.headerTitle}>{t('donate.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Amount Picker */}
        <AmountPicker selectedAmount={selectedAmount} onAmountChange={setSelectedAmount} />

        {/* Payment Methods */}
        <PaymentMethods selectedMethod={selectedMethod} onMethodChange={setSelectedMethod} />

        {/* Info text based on payment method */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            {selectedMethod === 'oxxo' && t('donate.oxxoInfo')}
            {selectedMethod === 'spei' && t('donate.speiInfo')}
            {selectedMethod === 'mercado_pago' && t('donate.cardInfo')}
          </Text>
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
          <Text style={styles.submitButtonText}>
            {loading ? t('donate.processing') : `${t('common.submit')} $${selectedAmount} MXN`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
    ...shadowStyles.card,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h1,
    color: colors.neutral900,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  infoCard: {
    padding: spacing.md,
    backgroundColor: colors.infoBackground,
    borderRadius: borderRadius.card,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoText: {
    ...typography.small,
    color: colors.neutral700,
    lineHeight: 20,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
    ...shadowStyles.card,
  },
  submitButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.button,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowStyles.elevated,
  },
  submitButtonDisabled: {
    backgroundColor: colors.neutral400,
  },
  submitButtonText: {
    ...typography.button,
    color: colors.white,
  },
});
