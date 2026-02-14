/**
 * Case Review Card
 * Card showing case summary with verify/reject/flag actions for moderators
 */

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Badge } from '@lomito/ui/components/badge';
import { Card } from '@lomito/ui/components/card';
import { Body, Caption } from '@lomito/ui/components/typography';
import { colors, spacing, typography, borderRadius } from '@lomito/ui/theme/tokens';
import type { CaseCategory, AnimalType, UrgencyLevel } from '@lomito/shared/types/database';
import { format } from 'date-fns';

interface CaseReviewCardProps {
  id: string;
  category: CaseCategory;
  animalType: AnimalType;
  urgency: UrgencyLevel;
  description: string;
  createdAt: string;
  onVerify: (caseId: string) => void;
  onReject: (caseId: string) => void;
  onFlag: (caseId: string) => void;
}

export function CaseReviewCard({
  id,
  category,
  animalType,
  urgency,
  description,
  createdAt,
  onVerify,
  onReject,
  onFlag,
}: CaseReviewCardProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const categoryColor = colors.category[category].pin;
  const categoryBgColor = colors.category[category].background;

  const urgencyColors = {
    low: { color: colors.neutral700, bg: colors.neutral100 },
    medium: { color: colors.warning, bg: colors.warningBackground },
    high: { color: colors.error, bg: colors.errorBackground },
    critical: { color: colors.white, bg: colors.error },
  };

  const urgencyStyle = urgencyColors[urgency];

  function handleCardPress() {
    router.push(`/case/${id}`);
  }

  return (
    <Pressable onPress={handleCardPress} accessibilityRole="button" accessibilityLabel={t('map.viewDetails')}>
      <Card categoryColor={categoryColor} style={styles.card}>
        {/* Header with badges */}
        <View style={styles.header}>
          <Badge
            label={t(`category.${category}`)}
            color={categoryColor}
            backgroundColor={categoryBgColor}
            accessibilityLabel={t(`category.${category}`)}
          />
          <View style={styles.spacer} />
          <Badge
            label={t(`urgency.${urgency}`)}
            color={urgencyStyle.color}
            backgroundColor={urgencyStyle.bg}
            accessibilityLabel={t(`urgency.${urgency}`)}
          />
        </View>

        {/* Animal type and description */}
        <View style={styles.content}>
          <Text style={styles.animalType}>{t(`animal.${animalType}`)}</Text>
          <Body numberOfLines={2} style={styles.description}>
            {description}
          </Body>
        </View>

        {/* Created date */}
        <Caption style={styles.date}>
          {t('map.reportedOn')} {format(new Date(createdAt), 'MMM d, yyyy')}
        </Caption>

        {/* Action buttons */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, styles.verifyButton]}
            onPress={(e) => {
              e.stopPropagation();
              onVerify(id);
            }}
            accessibilityLabel={t('moderation.verify')}
            accessibilityRole="button"
          >
            <Text style={[styles.actionButtonText, styles.verifyButtonText]}>
              {t('moderation.verify')}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.rejectButton]}
            onPress={(e) => {
              e.stopPropagation();
              onReject(id);
            }}
            accessibilityLabel={t('moderation.reject')}
            accessibilityRole="button"
          >
            <Text style={[styles.actionButtonText, styles.rejectButtonText]}>
              {t('moderation.reject')}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.flagButton]}
            onPress={(e) => {
              e.stopPropagation();
              onFlag(id);
            }}
            accessibilityLabel={t('moderation.flag')}
            accessibilityRole="button"
          >
            <Text style={[styles.actionButtonText, styles.flagButtonText]}>
              {t('moderation.flag')}
            </Text>
          </Pressable>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: borderRadius.button,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  actionButtonText: {
    fontFamily: typography.button.fontFamily,
    fontSize: typography.small.fontSize,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  animalType: {
    color: colors.neutral700,
    fontFamily: typography.h3.fontFamily,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    lineHeight: typography.h3.fontSize * typography.h3.lineHeight,
    marginBottom: spacing.xs,
  },
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
  flagButton: {
    backgroundColor: colors.warningBackground,
  },
  flagButtonText: {
    color: colors.warning,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  rejectButton: {
    backgroundColor: colors.errorBackground,
  },
  rejectButtonText: {
    color: colors.error,
  },
  spacer: {
    width: spacing.sm,
  },
  verifyButton: {
    backgroundColor: colors.successBackground,
  },
  verifyButtonText: {
    color: colors.success,
  },
});
