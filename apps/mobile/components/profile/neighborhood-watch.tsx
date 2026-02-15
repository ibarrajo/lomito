/**
 * Neighborhood Watch Section
 * Shows cases the user is subscribed to with urgency tags and timestamps
 */

import { memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { H3, Body, Caption } from '@lomito/ui/components/typography';
import { Badge } from '@lomito/ui/components/badge';
import { Card } from '@lomito/ui/components/card';
import { colors, spacing } from '@lomito/ui/theme/tokens';
import type {
  CaseCategory,
  CaseStatus,
  UrgencyLevel,
} from '@lomito/shared/types/database';
import { formatDistanceToNow } from 'date-fns';

interface SubscribedCase {
  id: string;
  category: CaseCategory;
  description: string;
  urgency: UrgencyLevel;
  status: CaseStatus;
  updated_at: string;
}

interface NeighborhoodWatchProps {
  cases: SubscribedCase[];
  loading: boolean;
}

export const NeighborhoodWatch = memo(function NeighborhoodWatch({
  cases,
  loading,
}: NeighborhoodWatchProps) {
  const { t } = useTranslation();
  const router = useRouter();

  if (loading) {
    return null;
  }

  if (cases.length === 0) {
    return (
      <View style={styles.container}>
        <H3 style={styles.sectionTitle}>{t('dashboard.neighborhoodWatch')}</H3>
        <View style={styles.emptyContainer}>
          <Body color={colors.neutral500}>
            {t('dashboard.noSubscriptions')}
          </Body>
          <Caption color={colors.neutral400} style={styles.emptyCaption}>
            {t('dashboard.browseCases')}
          </Caption>
        </View>
      </View>
    );
  }

  const urgencyColors: Record<
    UrgencyLevel,
    { color: string; backgroundColor: string }
  > = {
    low: { color: colors.neutral700, backgroundColor: colors.neutral100 },
    medium: {
      color: colors.warning,
      backgroundColor: colors.warningBackground,
    },
    high: { color: colors.error, backgroundColor: colors.errorBackground },
    critical: { color: colors.error, backgroundColor: colors.errorBackground },
  };

  return (
    <View style={styles.container}>
      <H3 style={styles.sectionTitle}>{t('dashboard.neighborhoodWatch')}</H3>
      {cases.map((caseItem) => {
        const categoryColor = colors.category[caseItem.category].pin;
        const urgencyStyle = urgencyColors[caseItem.urgency];

        return (
          <Pressable
            key={caseItem.id}
            onPress={() => router.push(`/case/${caseItem.id}`)}
            accessibilityRole="button"
            accessibilityLabel={t('map.viewDetails')}
          >
            <Card
              variant="mapSummary"
              categoryColor={categoryColor}
              style={styles.caseCard}
            >
              <View style={styles.caseHeader}>
                <Badge
                  label={t(`category.${caseItem.category}`)}
                  color={categoryColor}
                  backgroundColor={
                    colors.category[caseItem.category].background
                  }
                  accessibilityLabel={t(`category.${caseItem.category}`)}
                />
                <Badge
                  label={t(`urgency.${caseItem.urgency}`)}
                  color={urgencyStyle.color}
                  backgroundColor={urgencyStyle.backgroundColor}
                  accessibilityLabel={t(`urgency.${caseItem.urgency}`)}
                />
              </View>
              <Body numberOfLines={2} style={styles.description}>
                {caseItem.description}
              </Body>
              <Caption style={styles.timestamp}>
                {formatDistanceToNow(new Date(caseItem.updated_at), {
                  addSuffix: true,
                })}
              </Caption>
            </Card>
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  caseCard: {
    marginBottom: spacing.md,
  },
  caseHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  container: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  description: {
    color: colors.neutral700,
    marginTop: spacing.sm,
  },
  emptyCaption: {
    marginTop: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  timestamp: {
    color: colors.neutral500,
    marginTop: spacing.xs,
  },
});
