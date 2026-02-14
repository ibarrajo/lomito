/**
 * CaseHeader Component
 * Displays case header information including category, status, animal type, urgency, and metadata.
 */

import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge } from '@lomito/ui/components/badge';
import { H2, Body, Caption } from '@lomito/ui/components/typography';
import { colors, spacing } from '@lomito/ui/theme/tokens';
import type { Case } from '@lomito/shared/types/database';

interface CaseHeaderProps {
  caseData: Case;
}

const CATEGORY_COLORS: Record<string, { color: string; background: string }> = {
  abuse: { color: colors.error, background: colors.errorBackground },
  stray: { color: colors.warning, background: colors.warningBackground },
  missing: { color: colors.info, background: colors.infoBackground },
};

const STATUS_COLORS: Record<string, { color: string; background: string }> = {
  pending: { color: colors.warning, background: colors.warningBackground },
  verified: { color: colors.info, background: colors.infoBackground },
  in_progress: { color: colors.info, background: colors.infoBackground },
  resolved: { color: colors.success, background: colors.successBackground },
  rejected: { color: colors.error, background: colors.errorBackground },
  archived: { color: colors.neutral500, background: colors.neutral100 },
};

const URGENCY_COLORS: Record<string, string> = {
  low: colors.neutral500,
  medium: colors.warning,
  high: colors.error,
  critical: colors.errorDark,
};

export function CaseHeader({ caseData }: CaseHeaderProps) {
  const { t } = useTranslation();

  const categoryColors = CATEGORY_COLORS[caseData.category];
  const statusColors = STATUS_COLORS[caseData.status];
  const urgencyColor = URGENCY_COLORS[caseData.urgency];

  const formattedDate = new Date(caseData.created_at).toLocaleDateString(
    'es-MX',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  );

  return (
    <View style={styles.container}>
      {/* Category and Status badges */}
      <View style={styles.badgeRow}>
        <Badge
          label={t(`category.${caseData.category}`)}
          color={categoryColors.color}
          backgroundColor={categoryColors.background}
          accessibilityLabel={t(`category.${caseData.category}`)}
        />
        <View style={styles.badgeSpacer} />
        <Badge
          label={t(`status.${caseData.status}`)}
          color={statusColors.color}
          backgroundColor={statusColors.background}
          accessibilityLabel={t(`status.${caseData.status}`)}
        />
      </View>

      {/* Animal type */}
      <H2
        style={styles.animalType}
        accessibilityLabel={t(`animal.${caseData.animal_type}`)}
      >
        {t(`animal.${caseData.animal_type}`)}
      </H2>

      {/* Urgency indicator */}
      <View style={styles.urgencyRow}>
        <View style={[styles.urgencyDot, { backgroundColor: urgencyColor }]} />
        <Body color={urgencyColor}>{t(`urgency.${caseData.urgency}`)}</Body>
      </View>

      {/* Folio number if available */}
      {caseData.folio && (
        <View style={styles.metaRow}>
          <Caption color={colors.neutral500}>{t('case.folio')}:</Caption>
          <Caption style={styles.metaValue} color={colors.neutral700}>
            {caseData.folio}
          </Caption>
        </View>
      )}

      {/* Jurisdiction ID (temporary until we have jurisdiction name join) */}
      {caseData.jurisdiction_id && (
        <View style={styles.metaRow}>
          <Caption color={colors.neutral500}>{t('case.jurisdiction')}:</Caption>
          <Caption style={styles.metaValue} color={colors.neutral700}>
            {caseData.jurisdiction_id}
          </Caption>
        </View>
      )}

      {/* Date created */}
      <View style={styles.metaRow}>
        <Caption color={colors.neutral500}>{t('map.reportedOn')}:</Caption>
        <Caption style={styles.metaValue} color={colors.neutral700}>
          {formattedDate}
        </Caption>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  animalType: {
    marginTop: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badgeSpacer: {
    width: spacing.sm,
  },
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  metaValue: {
    marginLeft: spacing.xs,
  },
  urgencyDot: {
    borderRadius: spacing.xs,
    height: 8,
    marginRight: spacing.sm,
    marginTop: 6,
    width: 8,
  },
  urgencyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
});
