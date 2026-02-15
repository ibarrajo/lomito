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
  methodCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.card,
    borderWidth: 2,
    flexDirection: 'row',
    padding: spacing.md,
    ...shadowStyles.card,
  },
  methodCardSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  methodContent: {
    flex: 1,
  },
  methodIconContainer: {
    alignItems: 'center',
    backgroundColor: colors.neutral100,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 48,
  },
  methodTitle: {
    ...typography.h3,
    color: colors.neutral700,
    marginBottom: spacing.xs,
  },
  methodTitleSelected: {
    color: colors.primary,
  },
  methodsList: {
    gap: spacing.md,
  },
  selectedIndicator: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.card,
    height: 20,
    width: 20,
  },
});
