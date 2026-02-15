/**
 * MapActivityPanel Component
 * Right sidebar panel showing recent cases and stats.
 */

import { memo, useMemo } from 'react';
import { View, FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Activity } from 'lucide-react-native';
import { H3, Caption, Skeleton, EmptyState } from '@lomito/ui';
import {
  colors,
  spacing,
  typography,
  layout,
  iconSizes,
} from '@lomito/ui/src/theme/tokens';
import type {
  CaseCategory,
  CaseStatus,
  AnimalType,
  UrgencyLevel,
} from '@lomito/shared/types/database';
import { ActivityCaseCard } from './activity-case-card';

interface CaseSummary {
  id: string;
  category: CaseCategory;
  animal_type: AnimalType;
  description: string;
  status: CaseStatus;
  urgency: UrgencyLevel;
  location: { type: 'Point'; coordinates: [number, number] };
  created_at: string;
}

interface MapActivityPanelProps {
  cases: CaseSummary[];
  onCasePress: (caseId: string) => void;
  onViewAll: () => void;
  isLoading: boolean;
}

export const MapActivityPanel = memo(function MapActivityPanel({
  cases,
  onCasePress,
  onViewAll,
  isLoading,
}: MapActivityPanelProps) {
  const { t } = useTranslation();

  const sortedCases = useMemo(
    () =>
      [...cases].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [cases],
  );

  const stats = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();

    return {
      today: cases.filter((c) => new Date(c.created_at).getTime() >= startOfDay)
        .length,
      resolved: cases.filter((c) => c.status === 'resolved').length,
      critical: cases.filter((c) => c.urgency === 'critical').length,
    };
  }, [cases]);

  return (
    <View style={styles.panel}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Activity size={iconSizes.inline} color={colors.primary} />
          <Text style={styles.headerTitle}>{t('map.recentActivity')}</Text>
        </View>
        <Pressable
          onPress={onViewAll}
          accessibilityLabel={t('map.viewAll')}
          accessibilityRole="button"
        >
          <Text style={styles.viewAllText}>{t('map.viewAll')}</Text>
        </Pressable>
      </View>

      {/* Case list */}
      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <Skeleton width="100%" height={100} borderRadius={12} />
          <Skeleton width="100%" height={100} borderRadius={12} />
          <Skeleton width="100%" height={100} borderRadius={12} />
        </View>
      ) : (
        <FlatList
          data={sortedCases}
          renderItem={({ item }) => (
            <ActivityCaseCard caseData={item} onPress={onCasePress} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon={
                <Activity size={iconSizes.large} color={colors.neutral400} />
              }
              title={t('map.noRecentCases')}
            />
          }
        />
      )}

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <H3 color={colors.neutral900}>{stats.today}</H3>
          <Caption color={colors.neutral500}>{t('map.todayCount')}</Caption>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <H3 color={colors.success}>{stats.resolved}</H3>
          <Caption color={colors.neutral500}>{t('map.resolvedCount')}</Caption>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <H3 color={colors.error}>{stats.critical}</H3>
          <Caption color={colors.neutral500}>{t('map.criticalCount')}</Caption>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerTitle: {
    color: colors.neutral900,
    fontFamily: typography.fontFamily.display,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  panel: {
    backgroundColor: colors.neutral100,
    borderLeftColor: colors.neutral200,
    borderLeftWidth: 1,
    flex: 1,
    width: layout.mapPanelWidth,
  },
  separator: {
    height: spacing.sm,
  },
  skeletonContainer: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    backgroundColor: colors.neutral200,
    marginVertical: spacing.xs,
    width: 1,
  },
  statsBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.neutral200,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingVertical: spacing.md,
  },
  viewAllText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.small.fontSize,
    fontWeight: '600',
  },
});
