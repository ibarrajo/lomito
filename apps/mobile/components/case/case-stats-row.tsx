/**
 * CaseStatsRow Component
 * Three-column stats row showing severity, status, and creation time.
 */

import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Body, Caption } from '@lomito/ui/components/typography';
import {
  colors,
  spacing,
  borderRadius,
  shadowStyles,
} from '@lomito/ui/theme/tokens';
import type { Case } from '@lomito/shared/types/database';

interface CaseStatsRowProps {
  caseData: Case;
}

const URGENCY_COLORS: Record<string, string> = {
  low: colors.success,
  medium: colors.warning,
  high: colors.error,
  critical: colors.errorDark,
};

const STATUS_COLORS: Record<string, string> = {
  pending: colors.warning,
  verified: colors.info,
  in_progress: colors.info,
  resolved: colors.success,
  rejected: colors.error,
  archived: colors.neutral500,
};

function getRelativeTime(
  dateString: string,
  t: (key: string, options?: { count: number }) => string,
): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return t('case.daysAgo', { count: diffDays });
  }
  if (diffHours > 0) {
    return t('case.hoursAgo', { count: diffHours });
  }
  return t('case.hoursAgo', { count: 1 });
}

export function CaseStatsRow({ caseData }: CaseStatsRowProps) {
  const { t } = useTranslation();

  const urgencyColor = URGENCY_COLORS[caseData.urgency];
  const statusColor = STATUS_COLORS[caseData.status];
  const relativeTime = getRelativeTime(caseData.created_at, t);

  return (
    <View style={styles.container}>
      <View style={styles.statCard}>
        <Caption color={colors.neutral500}>{t('case.severity')}</Caption>
        <Body color={urgencyColor} style={styles.statValue}>
          {t(`urgency.${caseData.urgency}`)}
        </Body>
      </View>

      <View style={styles.statCard}>
        <Caption color={colors.neutral500}>{t('case.status')}</Caption>
        <Body color={statusColor} style={styles.statValue}>
          {t(`status.${caseData.status}`)}
        </Body>
      </View>

      <View style={styles.statCard}>
        <Caption color={colors.neutral500}>{t('case.created')}</Caption>
        <Body color={colors.neutral700} style={styles.statValue}>
          {relativeTime}
        </Body>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  statCard: {
    ...shadowStyles.card,
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  statValue: {
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});
