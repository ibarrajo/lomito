/**
 * Category Picker Component
 * Grid of selectable category cards with colored borders.
 */

import { View, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { H3, BodySmall } from '@lomito/ui';
import { colors, spacing, borderRadius, shadowStyles } from '@lomito/ui/src/theme/tokens';
import type { CaseCategory } from '@lomito/shared/types';

interface CategoryPickerProps {
  selected: CaseCategory | null;
  onSelect: (category: CaseCategory) => void;
}

const CATEGORIES: Array<{
  key: CaseCategory;
  color: string;
  backgroundColor: string;
}> = [
  {
    key: 'abuse',
    color: colors.category.abuse.pin,
    backgroundColor: colors.category.abuse.background,
  },
  {
    key: 'stray',
    color: colors.category.stray.pin,
    backgroundColor: colors.category.stray.background,
  },
  {
    key: 'missing',
    color: colors.category.missing.pin,
    backgroundColor: colors.category.missing.background,
  },
];

export function CategoryPicker({ selected, onSelect }: CategoryPickerProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {CATEGORIES.map((category) => {
        const isSelected = selected === category.key;

        return (
          <Pressable
            key={category.key}
            onPress={() => onSelect(category.key)}
            accessibilityLabel={`${t('report.selectCategory')}: ${t(`category.${category.key}`)}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            style={({ pressed }) => [
              styles.card,
              { borderLeftColor: category.color },
              isSelected && styles.cardSelected,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={[styles.iconArea, { backgroundColor: category.backgroundColor }]} />
            <View style={styles.content}>
              <H3>{t(`category.${category.key}`)}</H3>
              <BodySmall color={colors.neutral500}>
                {t(`report.category${category.key.charAt(0).toUpperCase() + category.key.slice(1)}Description`)}
              </BodySmall>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderLeftWidth: 4,
    borderRadius: borderRadius.card,
    flexDirection: 'row',
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: spacing.md,
    ...shadowStyles.card,
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardSelected: {
    borderLeftWidth: 6,
    ...shadowStyles.elevated,
  },
  container: {
    width: '100%',
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  iconArea: {
    borderRadius: borderRadius.button,
    height: 48,
    marginRight: spacing.md,
    width: 48,
  },
});
