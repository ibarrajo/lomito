/**
 * Reports Controls
 * Grid/List toggle and sort dropdown for reports section
 */

import { memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Caption } from '@lomito/ui/components/typography';
import { colors, spacing, borderRadius } from '@lomito/ui/theme/tokens';

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'status' | 'oldest';

interface ReportsControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const ReportsControls = memo(function ReportsControls({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
}: ReportsControlsProps) {
  const { t } = useTranslation();

  const sortOptions: SortOption[] = ['newest', 'status', 'oldest'];

  return (
    <View style={styles.container}>
      {/* View Mode Toggle */}
      <View style={styles.viewToggle}>
        <Pressable
          style={[
            styles.toggleButton,
            viewMode === 'grid' && styles.toggleButtonActive,
          ]}
          onPress={() => onViewModeChange('grid')}
          accessibilityRole="button"
          accessibilityLabel={t('profile.viewMode.grid')}
        >
          <Caption
            style={
              viewMode === 'grid' ? styles.toggleTextActive : styles.toggleText
            }
          >
            {t('profile.viewMode.grid')}
          </Caption>
        </Pressable>
        <Pressable
          style={[
            styles.toggleButton,
            viewMode === 'list' && styles.toggleButtonActive,
          ]}
          onPress={() => onViewModeChange('list')}
          accessibilityRole="button"
          accessibilityLabel={t('profile.viewMode.list')}
        >
          <Caption
            style={
              viewMode === 'list' ? styles.toggleTextActive : styles.toggleText
            }
          >
            {t('profile.viewMode.list')}
          </Caption>
        </Pressable>
      </View>

      {/* Sort Dropdown (simplified as buttons) */}
      <View style={styles.sortContainer}>
        <Caption style={styles.sortLabel}>{t('profile.sort.label')}</Caption>
        <View style={styles.sortButtons}>
          {sortOptions.map((option) => (
            <Pressable
              key={option}
              style={[
                styles.sortButton,
                sortBy === option && styles.sortButtonActive,
              ]}
              onPress={() => onSortChange(option)}
              accessibilityRole="button"
              accessibilityLabel={t(`profile.sort.${option}`)}
            >
              <Caption
                style={
                  sortBy === option ? styles.sortTextActive : styles.sortText
                }
              >
                {t(`profile.sort.${option}`)}
              </Caption>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  sortButton: {
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.tag,
    marginLeft: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  sortButtonActive: {
    backgroundColor: colors.primaryLight,
  },
  sortButtons: {
    flexDirection: 'row',
  },
  sortContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  sortLabel: {
    color: colors.neutral500,
    marginRight: spacing.xs,
  },
  sortText: {
    color: colors.neutral700,
  },
  sortTextActive: {
    color: colors.secondary,
  },
  toggleButton: {
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.button,
    flex: 1,
    paddingVertical: spacing.xs,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    color: colors.neutral700,
    textAlign: 'center',
  },
  toggleTextActive: {
    color: colors.secondary,
  },
  viewToggle: {
    borderColor: colors.neutral200,
    borderRadius: borderRadius.button,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    padding: 2,
    width: 140,
  },
});
