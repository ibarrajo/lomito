/**
 * Category Picker Component
 * Grid of selectable category cards with colored borders and icons.
 */

import { View, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Dog, Search, Heart, Check } from 'lucide-react-native';
import { H3, BodySmall } from '@lomito/ui';
import {
  colors,
  spacing,
  borderRadius,
  shadowStyles,
} from '@lomito/ui/src/theme/tokens';
import type { CaseCategory } from '@lomito/shared/types';

interface CategoryPickerProps {
  selected: CaseCategory | null;
  onSelect: (category: CaseCategory) => void;
}

const CATEGORIES: Array<{
  key: CaseCategory;
  color: string;
  backgroundColor: string;
  icon: typeof AlertTriangle;
}> = [
  {
    key: 'abuse',
    color: colors.error,
    backgroundColor: colors.errorBackground,
    icon: AlertTriangle,
  },
  {
    key: 'stray',
    color: colors.warning,
    backgroundColor: colors.warningBackground,
    icon: Dog,
  },
  {
    key: 'missing',
    color: colors.info,
    backgroundColor: colors.infoBackground,
    icon: Search,
  },
  {
    key: 'injured',
    color: colors.error,
    backgroundColor: colors.errorBackground,
    icon: Heart,
  },
];

export function CategoryPicker({ selected, onSelect }: CategoryPickerProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {CATEGORIES.map((category) => {
        const isSelected = selected === category.key;
        const IconComponent = category.icon;

        return (
          <Pressable
            key={category.key}
            onPress={() => onSelect(category.key)}
            accessibilityLabel={`${t('report.selectCategory')}: ${t(`category.${category.key}`)}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            style={({ pressed }) => [
              styles.card,
              {
                borderColor: isSelected ? colors.primary : colors.neutral200,
                backgroundColor: isSelected
                  ? 'rgba(19, 236, 200, 0.05)'
                  : colors.white,
              },
              pressed && styles.cardPressed,
            ]}
          >
            {isSelected && (
              <View style={styles.checkmark}>
                <Check size={16} color={colors.primary} strokeWidth={2.5} />
              </View>
            )}
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: category.backgroundColor },
              ]}
            >
              <IconComponent size={40} color={category.color} strokeWidth={2} />
            </View>
            <H3 style={styles.title}>{t(`category.${category.key}`)}</H3>
            <BodySmall color={colors.neutral500} style={styles.description}>
              {t(
                `report.category${category.key.charAt(0).toUpperCase() + category.key.slice(1)}Description`,
              )}
            </BodySmall>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: borderRadius.card,
    borderWidth: 2,
    flexBasis: '48%',
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadowStyles.card,
  },
  cardPressed: {
    opacity: 0.7,
  },
  checkmark: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.pill,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
    width: 24,
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '4%',
    width: '100%',
  },
  description: {
    textAlign: 'center',
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: borderRadius.pill,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  title: {
    textAlign: 'center',
  },
});
