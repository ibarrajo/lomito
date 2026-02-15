/**
 * Amount Picker Component
 * Preset donation amounts + custom amount input.
 */

import { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadowStyles,
} from '@lomito/ui/src/theme/tokens';

interface AmountPickerProps {
  selectedAmount: number;
  onAmountChange: (amount: number) => void;
}

const PRESET_AMOUNTS = [50, 100, 200, 500];

export function AmountPicker({
  selectedAmount,
  onAmountChange,
}: AmountPickerProps) {
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
              !isCustom &&
                selectedAmount === amount &&
                styles.presetButtonSelected,
            ]}
            onPress={() => handlePresetPress(amount)}
            accessibilityLabel={`${amount} MXN`}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.presetButtonText,
                !isCustom &&
                  selectedAmount === amount &&
                  styles.presetButtonTextSelected,
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
  currencyPrefix: {
    ...typography.h2,
    color: colors.neutral700,
    marginRight: spacing.xs,
  },
  currencySuffix: {
    ...typography.small,
    color: colors.neutral500,
    marginLeft: spacing.xs,
  },
  customContainer: {
    gap: spacing.sm,
  },
  customInput: {
    flex: 1,
    ...typography.h2,
    color: colors.neutral900,
    paddingVertical: spacing.md,
  },
  customInputWrapper: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.input,
    borderWidth: 2,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    ...shadowStyles.card,
  },
  customLabel: {
    ...typography.small,
    color: colors.neutral700,
    fontWeight: '600',
  },
  label: {
    ...typography.h3,
    color: colors.neutral900,
  },
  minAmountHint: {
    ...typography.caption,
    color: colors.neutral500,
  },
  presetButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.button,
    borderWidth: 2,
    flex: 1,
    justifyContent: 'center',
    minWidth: '45%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  presetButtonSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  presetButtonText: {
    ...typography.h3,
    color: colors.neutral700,
  },
  presetButtonTextSelected: {
    color: colors.primary,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
