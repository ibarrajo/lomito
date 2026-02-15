/**
 * ActivityCaseCard Component
 * Compact case card for the activity feed.
 */

import { memo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock } from 'lucide-react-native';
import { Card, Badge, Body, Caption } from '@lomito/ui';
import { colors, spacing } from '@lomito/ui/src/theme/tokens';
import type {
  CaseCategory,
  CaseStatus,
  AnimalType,
  UrgencyLevel,
} from '@lomito/shared/types/database';
import { CATEGORY_COLORS } from './filter-bar';

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

interface ActivityCaseCardProps {
  caseData: CaseSummary;
  onPress: (caseId: string) => void;
}

const STATUS_BADGE_COLORS: Record<CaseStatus, { color: string; bg: string }> = {
  pending: { color: colors.warning, bg: colors.warningBackground },
  verified: { color: colors.info, bg: colors.infoBackground },
  in_progress: { color: colors.accent, bg: '#FFF8E8' },
  resolved: { color: colors.success, bg: colors.successBackground },
  rejected: { color: colors.error, bg: colors.errorBackground },
  archived: { color: colors.neutral500, bg: colors.neutral100 },
};

const CATEGORY_BG_COLORS: Record<CaseCategory, string> = {
  abuse: colors.category.abuse.background,
  injured: colors.category.injured.background,
  missing: colors.category.missing.background,
  stray: colors.category.stray.background,
};

function getTimeAgo(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return '< 1m';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr}h`;
  return `${diffDay}d`;
}

export const ActivityCaseCard = memo(function ActivityCaseCard({
  caseData,
  onPress,
}: ActivityCaseCardProps) {
  const { t } = useTranslation();

  const statusBadgeColors = STATUS_BADGE_COLORS[caseData.status];
  const categoryBgColor = CATEGORY_BG_COLORS[caseData.category];
  const timeAgo = getTimeAgo(caseData.created_at);

  return (
    <Pressable
      onPress={() => onPress(caseData.id)}
      accessibilityLabel={`${t(`category.${caseData.category}`)}: ${caseData.description}`}
      accessibilityRole="button"
    >
      <Card
        variant="mapSummary"
        categoryColor={CATEGORY_COLORS[caseData.category]}
      >
        <View style={styles.header}>
          <Badge
            label={t(`category.${caseData.category}`)}
            color={CATEGORY_COLORS[caseData.category]}
            backgroundColor={categoryBgColor}
            accessibilityLabel={t(`category.${caseData.category}`)}
          />
          <View style={styles.spacer} />
          <Badge
            label={t(`status.${caseData.status}`)}
            color={statusBadgeColors.color}
            backgroundColor={statusBadgeColors.bg}
            accessibilityLabel={t(`status.${caseData.status}`)}
          />
        </View>
        <Body numberOfLines={2} style={styles.description}>
          {caseData.description}
        </Body>
        <View style={styles.metadata}>
          <View style={styles.metadataItem}>
            <Clock size={12} color={colors.neutral400} />
            <Caption color={colors.neutral500}>{timeAgo}</Caption>
          </View>
          <View style={styles.metadataItem}>
            <MapPin size={12} color={colors.neutral400} />
            <Caption color={colors.neutral500}>
              {t(`animal.${caseData.animal_type}`)}
            </Caption>
          </View>
        </View>
      </Card>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  description: {
    marginBottom: spacing.xs,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  metadata: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  metadataItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  spacer: {
    flex: 1,
  },
});
