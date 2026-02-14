/**
 * Payment Methods Component
 * Card selection for different payment methods: Card, OXXO, SPEI.
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CreditCard, Store, Building } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography, shadowStyles, iconSizes } from '@lomito/ui/src/theme/tokens';

type PaymentMethodType = 'mercado_pago' | 'oxxo' | 'spei';

interface PaymentMethodsProps {
  selectedMethod: PaymentMethodType;
  onMethodChange: (method: PaymentMethodType) => void;
}

interface PaymentMethodOption {
  id: PaymentMethodType;
  icon: typeof CreditCard;
  titleKey: string;
  descriptionKey: string;
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'mercado_pago',
    icon: CreditCard,
    titleKey: 'donate.card',
    descriptionKey: 'donate.cardDescription',
  },
  {
    id: 'oxxo',
    icon: Store,
    titleKey: 'donate.oxxo',
    descriptionKey: 'donate.oxxoDescription',
  },
  {
    id: 'spei',
    icon: Building,
    titleKey: 'donate.spei',
    descriptionKey: 'donate.speiDescription',
  },
];

export function PaymentMethods({ selectedMethod, onMethodChange }: PaymentMethodsProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('donate.paymentMethod')}</Text>

      <View style={styles.methodsList}>
        {PAYMENT_METHODS.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <Pressable
              key={method.id}
              style={[styles.methodCard, isSelected && styles.methodCardSelected]}
              onPress={() => onMethodChange(method.id)}
              accessibilityLabel={t(method.titleKey)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <View style={styles.methodIconContainer}>
                <Icon
                  size={iconSizes.large}
                  color={isSelected ? colors.primary : colors.neutral500}
                  strokeWidth={1.5}
                />
              </View>

              <View style={styles.methodContent}>
                <Text style={[styles.methodTitle, isSelected && styles.methodTitleSelected]}>
                  {t(method.titleKey)}
                </Text>
              </View>

              {isSelected && <View style={styles.selectedIndicator} />}
            </Pressable>
          );
        })}
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
  methodsList: {
    gap: spacing.md,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.card,
    borderWidth: 2,
    borderColor: colors.neutral200,
    backgroundColor: colors.white,
    ...shadowStyles.card,
  },
  methodCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    ...typography.h3,
    color: colors.neutral700,
    marginBottom: spacing.xs,
  },
  methodTitleSelected: {
    color: colors.primary,
  },
  methodDescription: {
    ...typography.small,
    color: colors.neutral500,
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.card,
    backgroundColor: colors.primary,
  },
});
