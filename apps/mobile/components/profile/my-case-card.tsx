/**
 * My Case Card
 * Card showing user's own case with category, status, description and date
 */

import { memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Badge } from '@lomito/ui/components/badge';
import { Card } from '@lomito/ui/components/card';
import { Body, Caption } from '@lomito/ui/components/typography';
import { colors, spacing } from '@lomito/ui/theme/tokens';
import type { CaseCategory, CaseStatus } from '@lomito/shared/types/database';
import { format } from 'date-fns';

interface MyCaseCardProps {
  id: string;
  category: CaseCategory;
  status: CaseStatus;
  description: string;
  createdAt: string;
}

export const MyCaseCard = memo(function MyCaseCard({
  id,
  category,
  status,
  description,
  createdAt,
}: MyCaseCardProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const categoryColor = colors.category[category].pin;
  const categoryBgColor = colors.category[category].background;

  const statusColors: Record<
    CaseStatus,
    { color: string; backgroundColor: string }
  > = {
    pending: {
      color: colors.warning,
      backgroundColor: colors.warningBackground,
    },
    verified: { color: colors.info, backgroundColor: colors.infoBackground },
    in_progress: {
      color: colors.secondary,
      backgroundColor: colors.secondaryLight,
    },
    resolved: {
      color: colors.success,
      backgroundColor: colors.successBackground,
    },
    rejected: { color: colors.error, backgroundColor: colors.errorBackground },
    archived: { color: colors.neutral500, backgroundColor: colors.neutral100 },
  };

  const statusStyle = statusColors[status];

  function handleCardPress() {
    router.push(`/case/${id}`);
  }

  return (
    <Pressable
      onPress={handleCardPress}
      accessibilityRole="button"
      accessibilityLabel={t('map.viewDetails')}
    >
      <Card
        categoryColor={categoryColor}
        variant="mapSummary"
        style={styles.card}
      >
        {/* Header with category and status badges */}
        <View style={styles.header}>
          <Badge
            label={t(`category.${category}`)}
            color={categoryColor}
            backgroundColor={categoryBgColor}
            accessibilityLabel={t(`category.${category}`)}
          />
          <View style={styles.spacer} />
          <Badge
            label={t(`status.${status}`)}
            color={statusStyle.color}
            backgroundColor={statusStyle.backgroundColor}
            accessibilityLabel={t(`status.${status}`)}
          />
        </View>

        {/* Description */}
        <View style={styles.content}>
          <Body numberOfLines={2} style={styles.description}>
            {description}
          </Body>
        </View>

        {/* Created date */}
        <Caption style={styles.date}>
          {format(new Date(createdAt), 'MMM d, yyyy')}
        </Caption>
      </Card>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  content: {
    marginTop: spacing.sm,
  },
  date: {
    color: colors.neutral500,
    marginTop: spacing.xs,
  },
  description: {
    color: colors.neutral700,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  spacer: {
    width: spacing.sm,
  },
});
