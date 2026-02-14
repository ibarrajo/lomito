/**
 * Case Action Card
 * Card showing case summary with government action buttons (folio, response, status)
 */

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Badge } from '@lomito/ui/components/badge';
import { Card } from '@lomito/ui/components/card';
import { Body, Caption } from '@lomito/ui/components/typography';
import { colors, spacing, typography, borderRadius } from '@lomito/ui/theme/tokens';
import type { CaseCategory, AnimalType, UrgencyLevel } from '@lomito/shared/types/database';
import { differenceInDays } from 'date-fns';

interface CaseActionCardProps {
  id: string;
  category: CaseCategory;
  animalType: AnimalType;
  urgency: UrgencyLevel;
  description: string;
  folio: string | null;
  escalatedAt: string | null;
  governmentResponseAt: string | null;
  onAssignFolio: (caseId: string) => void;
  onPostResponse: (caseId: string) => void;
  onUpdateStatus: (caseId: string) => void;
}

export function CaseActionCard({
  id,
  category,
  animalType,
  urgency,
  description,
  folio,
  escalatedAt,
  governmentResponseAt,
  onAssignFolio,
  onPostResponse,
  onUpdateStatus,
}: CaseActionCardProps) {
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

  // Calculate escalation info
  let escalationInfo = t('government.notEscalated');
  if (escalatedAt) {
    const daysAgo = differenceInDays(new Date(), new Date(escalatedAt));
    escalationInfo = t('government.escalatedDaysAgo', { count: daysAgo });
  }

  return (
    <Pressable
      onPress={handleCardPress}
      accessibilityRole="button"
      accessibilityLabel={t('map.viewDetails')}
    >
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

        {/* Folio and escalation status */}
        <View style={styles.metaRow}>
          {folio && (
            <Caption style={styles.folio}>
              {t('case.folio')}: {folio}
            </Caption>
          )}
          <Caption
            style={
              escalatedAt && !governmentResponseAt
                ? { ...styles.escalationStatus, ...styles.escalationUrgent }
                : styles.escalationStatus
            }
          >
            {escalationInfo}
          </Caption>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, styles.folioButton]}
            onPress={(e) => {
              e.stopPropagation();
              onAssignFolio(id);
            }}
            accessibilityLabel={t('government.assignFolio')}
            accessibilityRole="button"
          >
            <Text style={[styles.actionButtonText, styles.folioButtonText]}>
              {t('government.assignFolio')}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.responseButton]}
            onPress={(e) => {
              e.stopPropagation();
              onPostResponse(id);
            }}
            accessibilityLabel={t('government.postResponse')}
            accessibilityRole="button"
          >
            <Text style={[styles.actionButtonText, styles.responseButtonText]}>
              {t('government.postResponse')}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.statusButton]}
            onPress={(e) => {
              e.stopPropagation();
              onUpdateStatus(id);
            }}
            accessibilityLabel={t('government.updateStatus')}
            accessibilityRole="button"
          >
            <Text style={[styles.actionButtonText, styles.statusButtonText]}>
              {t('government.updateStatus')}
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
  description: {
    color: colors.neutral700,
  },
  escalationStatus: {
    color: colors.neutral500,
  },
  escalationUrgent: {
    color: colors.error,
    fontWeight: '600',
  },
  folio: {
    color: colors.neutral700,
    fontFamily: typography.fontFamily.mono,
    fontWeight: '600',
  },
  folioButton: {
    backgroundColor: colors.infoBackground,
  },
  folioButtonText: {
    color: colors.info,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  responseButton: {
    backgroundColor: colors.secondaryLight,
  },
  responseButtonText: {
    color: colors.secondary,
  },
  spacer: {
    width: spacing.sm,
  },
  statusButton: {
    backgroundColor: colors.primaryLight,
  },
  statusButtonText: {
    color: colors.primary,
  },
});
