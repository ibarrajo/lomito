/**
 * FilterBar Component
 * Horizontal scrollable filter pills for category and status.
 */

import { memo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, typography } from '@lomito/ui/src/theme/tokens';
import type { CaseCategory, CaseStatus } from '@lomito/shared/types/database';
import type { FilterValue } from '../../hooks/use-map-filters';

interface FilterBarProps {
  selectedCategories: FilterValue<CaseCategory>;
  selectedStatuses: FilterValue<CaseStatus>;
  onToggleCategory: (category: CaseCategory | 'all') => void;
  onToggleStatus: (status: CaseStatus | 'all') => void;
}

const CATEGORIES: Array<CaseCategory | 'all'> = ['all', 'abuse', 'stray', 'missing'];
const STATUSES: Array<CaseStatus | 'all'> = ['all', 'pending', 'verified', 'in_progress', 'resolved'];

const CATEGORY_COLORS: Record<CaseCategory | 'all', string> = {
  all: colors.neutral500,
  abuse: colors.category.abuse.pin,
  stray: colors.category.stray.pin,
  missing: colors.category.missing.pin,
};

const STATUS_COLORS: Record<CaseStatus | 'all', string> = {
  all: colors.neutral500,
  pending: colors.warning,
  verified: colors.info,
  in_progress: colors.accent,
  resolved: colors.success,
  rejected: colors.error,
  archived: colors.neutral400,
};

export const FilterBar = memo(function FilterBar({
  selectedCategories,
  selectedStatuses,
  onToggleCategory,
  onToggleStatus,
}: FilterBarProps) {
  const { t } = useTranslation();

  const isCategorySelected = useCallback((category: CaseCategory | 'all'): boolean => {
    if (category === 'all') {
      return selectedCategories === 'all';
    }
    return selectedCategories !== 'all' && selectedCategories.has(category);
  }, [selectedCategories]);

  const isStatusSelected = useCallback((status: CaseStatus | 'all'): boolean => {
    if (status === 'all') {
      return selectedStatuses === 'all';
    }
    return selectedStatuses !== 'all' && selectedStatuses.has(status);
  }, [selectedStatuses]);

  return (
    <View style={styles.container}>
      {/* Category filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((category) => {
          const selected = isCategorySelected(category);
          const color = CATEGORY_COLORS[category];
          const label = category === 'all'
            ? t('map.allCategories')
            : t(`category.${category}`);

          return (
            <Pressable
              key={category}
              style={[
                styles.pill,
                selected && { backgroundColor: color },
                !selected && { borderColor: color, borderWidth: 1 },
              ]}
              onPress={() => onToggleCategory(category)}
              accessibilityLabel={`${t('map.filterByCategory')}: ${label}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text
                style={[
                  styles.pillText,
                  selected && styles.pillTextSelected,
                  !selected && { color },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Status filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {STATUSES.map((status) => {
          const selected = isStatusSelected(status);
          const color = STATUS_COLORS[status];
          const label = status === 'all'
            ? t('map.allStatuses')
            : t(`status.${status}`);

          return (
            <Pressable
              key={status}
              style={[
                styles.pill,
                selected && { backgroundColor: color },
                !selected && { borderColor: color, borderWidth: 1 },
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
                  !selected && { color },
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
  container: {
    backgroundColor: colors.white,
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    paddingVertical: spacing.sm,
  },
  pill: {
    borderRadius: borderRadius.pill,
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
    color: colors.white,
  },
  scrollContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  scrollView: {
    flexGrow: 0,
  },
});
