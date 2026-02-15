/**
 * MapFilterSidebar Component
 * Desktop-only vertical filter sidebar for the map page.
 * Displays categories and statuses as full-width rows with checkmarks.
 */

import { memo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Check, Info } from 'lucide-react-native';
import {
  colors,
  spacing,
  typography,
  layout,
  iconSizes,
} from '@lomito/ui/src/theme/tokens';
import { Caption } from '@lomito/ui';
import type { CaseCategory, CaseStatus } from '@lomito/shared/types/database';
import { CATEGORIES, STATUSES, CATEGORY_COLORS } from './filter-bar';

interface MapFilterSidebarProps {
  selectedCategories: CaseCategory | 'all';
  selectedStatuses: CaseStatus | 'all';
  onToggleCategory: (category: CaseCategory | 'all') => void;
  onToggleStatus: (status: CaseStatus | 'all') => void;
  onReset: () => void;
}

export const MapFilterSidebar = memo(function MapFilterSidebar({
  selectedCategories,
  selectedStatuses,
  onToggleCategory,
  onToggleStatus,
  onReset,
}: MapFilterSidebarProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.sidebar}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('map.filters')}</Text>
        <Pressable
          onPress={onReset}
          accessibilityLabel={t('map.resetFilters')}
          accessibilityRole="button"
        >
          <Text style={styles.resetText}>{t('map.resetFilters')}</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* CATEGORÍA section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('map.categoryLabel')}</Text>

          {CATEGORIES.filter((c) => c !== 'all').map((category) => {
            const isActive =
              selectedCategories === 'all' || selectedCategories === category;

            return (
              <Pressable
                key={category}
                style={styles.filterRow}
                onPress={() => onToggleCategory(category)}
                accessibilityLabel={`${t('map.filterByCategory')}: ${t(`category.${category}`)}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                <View style={styles.filterRowContent}>
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: CATEGORY_COLORS[category] },
                    ]}
                  />
                  <Text style={styles.filterLabel}>
                    {t(`category.${category}`)}
                  </Text>
                </View>
                {isActive && (
                  <Check
                    size={iconSizes.inline}
                    color={colors.primary}
                    strokeWidth={2.5}
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* ESTADO section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('map.statusLabel')}</Text>

          {STATUSES.filter((s) => s !== 'all').map((status) => {
            const isActive =
              selectedStatuses === 'all' || selectedStatuses === status;

            return (
              <Pressable
                key={status}
                style={styles.filterRow}
                onPress={() => onToggleStatus(status)}
                accessibilityLabel={`${t('map.filterByStatus')}: ${t(`status.${status}`)}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                <Text style={styles.filterLabel}>{t(`status.${status}`)}</Text>
                {isActive && (
                  <Check
                    size={iconSizes.inline}
                    color={colors.primary}
                    strokeWidth={2.5}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer info */}
      <View style={styles.footer}>
        <Info size={16} color={colors.info} />
        <Caption color={colors.neutral500}>{t('map.dataUpdated')}</Caption>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  divider: {
    backgroundColor: colors.neutral200,
    height: 1,
    marginHorizontal: spacing.md,
  },
  dot: {
    borderRadius: 5,
    height: 10,
    marginRight: spacing.sm,
    width: 10,
  },
  filterLabel: {
    color: colors.neutral900,
    flex: 1,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.body.fontSize,
  },
  filterRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 44,
    paddingVertical: spacing.sm + 2,
  },
  filterRowContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  footer: {
    alignItems: 'flex-start',
    borderTopColor: colors.neutral200,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    color: colors.neutral900,
    fontFamily: typography.fontFamily.display,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  resetText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.small.fontSize,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: spacing.md,
  },
  sectionHeader: {
    color: colors.neutral500,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  sidebar: {
    backgroundColor: colors.white,
    borderRightColor: colors.neutral200,
    borderRightWidth: 1,
    flex: 1,
    width: layout.sidebarWidth,
  },
});
