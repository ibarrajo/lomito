/**
 * FilterBar Component
 * Horizontal scrollable filter pills for category and status.
 */

import { memo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  colors,
  spacing,
  borderRadius,
  typography,
} from '@lomito/ui/src/theme/tokens';
import type { CaseCategory, CaseStatus } from '@lomito/shared/types/database';

interface FilterBarProps {
  selectedCategories: CaseCategory | 'all';
  selectedStatuses: CaseStatus | 'all';
  onToggleCategory: (category: CaseCategory | 'all') => void;
  onToggleStatus: (status: CaseStatus | 'all') => void;
}

export const CATEGORIES: Array<CaseCategory | 'all'> = [
  'all',
  'abuse',
  'injured',
  'stray',
  'missing',
  'zoonotic',
  'dead_animal',
  'dangerous_dog',
  'distress',
  'illegal_sales',
  'wildlife',
  'noise_nuisance',
];
export const STATUSES: Array<CaseStatus | 'all'> = [
  'all',
  'pending',
  'verified',
  'in_progress',
  'resolved',
];

export const CATEGORY_COLORS: Record<CaseCategory | 'all', string> = {
  all: colors.neutral500,
  abuse: colors.category.abuse.pin,
  injured: colors.category.injured.pin,
  missing: colors.category.missing.pin,
  stray: colors.category.stray.pin,
  zoonotic: colors.category.zoonotic.pin,
  dead_animal: colors.category.dead_animal.pin,
  dangerous_dog: colors.category.dangerous_dog.pin,
  distress: colors.category.distress.pin,
  illegal_sales: colors.category.illegal_sales.pin,
  wildlife: colors.category.wildlife.pin,
  noise_nuisance: colors.category.noise_nuisance.pin,
};

export const FilterBar = memo(function FilterBar({
  selectedCategories,
  selectedStatuses,
  onToggleCategory,
  onToggleStatus,
}: FilterBarProps) {
  const { t } = useTranslation();

  const isCategorySelected = useCallback(
    (category: CaseCategory | 'all'): boolean => {
      return selectedCategories === category;
    },
    [selectedCategories],
  );

  const isStatusSelected = useCallback(
    (status: CaseStatus | 'all'): boolean => {
      return selectedStatuses === status;
    },
    [selectedStatuses],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* TYPE section */}
        <Text style={styles.sectionLabel}>{t('map.filterType')}</Text>
        {CATEGORIES.map((category) => {
          const selected = isCategorySelected(category);
          const color = CATEGORY_COLORS[category];
          const label =
            category === 'all'
              ? t('map.allCategories')
              : t(`category.${category}`);

          return (
            <Pressable
              key={category}
              style={[
                styles.pill,
                selected && { backgroundColor: colors.primary },
                !selected && {
                  borderColor: colors.neutral200,
                  borderWidth: 1,
                },
              ]}
              onPress={() => onToggleCategory(category)}
              accessibilityLabel={`${t('map.filterByCategory')}: ${label}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              {category !== 'all' && (
                <View
                  style={[styles.categoryDot, { backgroundColor: color }]}
                />
              )}
              <Text
                style={[
                  styles.pillText,
                  selected && styles.pillTextSelected,
                  !selected && { color: colors.neutral700 },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}

        {/* Divider */}
        <View style={styles.divider} />

        {/* STATUS section */}
        <Text style={styles.sectionLabel}>{t('map.filterStatus')}</Text>
        {STATUSES.map((status) => {
          const selected = isStatusSelected(status);
          const label =
            status === 'all' ? t('map.allStatuses') : t(`status.${status}`);

          return (
            <Pressable
              key={status}
              style={[
                styles.pill,
                selected && { backgroundColor: colors.primary },
                !selected && {
                  borderColor: colors.neutral200,
                  borderWidth: 1,
                },
              ]}
              onPress={() => onToggleStatus(status)}
              accessibilityLabel={`${t('map.filterByStatus')}: ${label}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text
                style={[
                  styles.pillText,
                  selected && styles.pillTextSelected,
                  !selected && { color: colors.neutral700 },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  categoryDot: {
    borderRadius: 4,
    height: 8,
    marginRight: 4,
    width: 8,
  },
  container: {
    backgroundColor: colors.white,
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    paddingVertical: spacing.sm,
  },
  divider: {
    alignSelf: 'center',
    backgroundColor: colors.neutral400,
    height: 20,
    marginHorizontal: spacing.sm,
    width: 1,
  },
  pill: {
    alignItems: 'center',
    borderRadius: borderRadius.pill,
    flexDirection: 'row',
    marginRight: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pillText: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.small.fontSize,
    fontWeight: '600',
  },
  pillTextSelected: {
    color: colors.secondary,
  },
  scrollContent: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  scrollView: {
    flexGrow: 0,
  },
  sectionLabel: {
    color: colors.neutral500,
    fontFamily: typography.fontFamily.body,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginRight: spacing.sm,
    textTransform: 'uppercase',
  },
});
