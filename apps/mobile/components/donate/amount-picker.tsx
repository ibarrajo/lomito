/**
 * Amount Picker Component
 * Preset donation amounts + custom amount input.
 */

import { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, typography, shadowStyles } from '@lomito/ui/src/theme/tokens';

interface AmountPickerProps {
  selectedAmount: number;
  onAmountChange: (amount: number) => void;
}

const PRESET_AMOUNTS = [50, 100, 200, 500];

export function AmountPicker({ selectedAmount, onAmountChange }: AmountPickerProps) {
  const { t } = useTranslation();
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  function handlePresetPress(amount: number) {
    setIsCustom(false);
    setCustomAmount('');
    onAmountChange(amount);
  }

  function handleCustomAmountChange(text: string) {
    const numericValue = text.replace(/[^0-9]/g, '');
    setCustomAmount(numericValue);
    if (numericValue) {
      const amount = parseInt(numericValue, 10);
      if (!isNaN(amount)) {
        setIsCustom(true);
        onAmountChange(amount);
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('donate.amount')}</Text>

      <View style={styles.presetGrid}>
        {PRESET_AMOUNTS.map((amount) => (
          <Pressable
            key={amount}
            style={[
              styles.presetButton,
              !isCustom && selectedAmount === amount && styles.presetButtonSelected,
            ]}
            onPress={() => handlePresetPress(amount)}
            accessibilityLabel={`${amount} MXN`}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.presetButtonText,
                !isCustom && selectedAmount === amount && styles.presetButtonTextSelected,
              ]}
            >
              ${amount}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.customContainer}>
        <Text style={styles.customLabel}>{t('donate.customAmount')}</Text>
        <View style={styles.customInputWrapper}>
          <Text style={styles.currencyPrefix}>$</Text>
          <TextInput
            style={styles.customInput}
            value={customAmount}
            onChangeText={handleCustomAmountChange}
            placeholder="0"
            keyboardType="number-pad"
            accessibilityLabel={t('donate.customAmount')}
          />
          <Text style={styles.currencySuffix}>MXN</Text>
        </View>
        <Text style={styles.minAmountHint}>{t('donate.minAmount')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  label: {
    ...typography.h3,
    color: colors.neutral900,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  presetButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.button,
    borderWidth: 2,
    borderColor: colors.neutral200,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  presetButtonText: {
    ...typography.h3,
    color: colors.neutral700,
  },
  presetButtonTextSelected: {
    color: colors.primary,
  },
  customContainer: {
    gap: spacing.sm,
  },
  customLabel: {
    ...typography.small,
    color: colors.neutral700,
    fontWeight: '600',
  },
  customInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.input,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    ...shadowStyles.card,
  },
  currencyPrefix: {
    ...typography.h2,
    color: colors.neutral700,
    marginRight: spacing.xs,
  },
  customInput: {
    flex: 1,
    ...typography.h2,
    color: colors.neutral900,
    paddingVertical: spacing.md,
  },
  currencySuffix: {
    ...typography.small,
    color: colors.neutral500,
    marginLeft: spacing.xs,
  },
  minAmountHint: {
    ...typography.caption,
    color: colors.neutral500,
  },
});
