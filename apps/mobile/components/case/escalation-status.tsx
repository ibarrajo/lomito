/**
 * EscalationStatus Component
 * Shows escalation status for escalated cases, including reminder count and response status.
 * Displays color-coded badges: pending (amber), unresponsive (red), responded (green).
 */

import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography, iconSizes } from '@lomito/ui/theme/tokens';

interface EscalationStatusProps {
  escalatedAt: string;
  escalationReminderCount: number;
  markedUnresponsive: boolean;
  governmentResponseAt: string | null;
}

export function EscalationStatus({
  escalatedAt,
  escalationReminderCount,
  markedUnresponsive,
  governmentResponseAt,
}: EscalationStatusProps) {
  const { t } = useTranslation();

  const now = new Date();
  const escalatedDate = new Date(escalatedAt);
  const daysSinceEscalation = Math.floor(
    (now.getTime() - escalatedDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const formattedEscalatedDate = escalatedDate.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Determine status and colors
  let statusIcon: React.ReactNode;
  let statusText: string;
  let statusColor: string;
  let statusBackgroundColor: string;

  if (governmentResponseAt) {
    const responseDate = new Date(governmentResponseAt);
    const formattedResponseDate = responseDate.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    statusIcon = <CheckCircle size={iconSizes.inline} color={colors.success} strokeWidth={2} />;
    statusText = t('escalation.responded');
    statusColor = colors.success;
    statusBackgroundColor = colors.successBackground;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <AlertTriangle size={iconSizes.inline} color={colors.warning} strokeWidth={2} />
          <Text style={styles.headerText}>
            {t('escalation.daysSinceEscalation', { count: daysSinceEscalation })}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>{t('escalation.escalatedAt', { date: formattedEscalatedDate })}</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusBackgroundColor }]}>
          {statusIcon}
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusText} - {formattedResponseDate}
          </Text>
        </View>
      </View>
    );
  }

  if (markedUnresponsive) {
    statusIcon = <XCircle size={iconSizes.inline} color={colors.error} strokeWidth={2} />;
    statusText = t('escalation.unresponsive');
    statusColor = colors.error;
    statusBackgroundColor = colors.errorBackground;
  } else {
    statusIcon = <Clock size={iconSizes.inline} color={colors.warning} strokeWidth={2} />;
    statusText = t('escalation.pendingResponse');
    statusColor = colors.warning;
    statusBackgroundColor = colors.warningBackground;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AlertTriangle size={iconSizes.inline} color={colors.warning} strokeWidth={2} />
        <Text style={styles.headerText}>
          {t('escalation.daysSinceEscalation', { count: daysSinceEscalation })}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>{t('escalation.escalatedAt', { date: formattedEscalatedDate })}</Text>
      </View>

      {escalationReminderCount > 0 && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>
            {t('escalation.remindersSent', { count: escalationReminderCount })}
          </Text>
        </View>
      )}

      <View style={styles.statusBadgeContainer}>
        <View style={[styles.statusBadge, { backgroundColor: statusBackgroundColor }]}>
          {statusIcon}
          <View style={styles.statusTextContainer}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
            {markedUnresponsive && (
              <Text style={[styles.statusSubtext, { color: statusColor }]}>
                {t('escalation.daysNoResponse', { count: daysSinceEscalation })}
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.warningBackground,
    borderLeftColor: colors.warning,
    borderLeftWidth: 4,
    borderRadius: borderRadius.card,
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  headerText: {
    color: colors.neutral900,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  infoRow: {
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.neutral700,
    fontSize: typography.small.fontSize,
    lineHeight: typography.small.lineHeight * typography.small.fontSize,
  },
  statusBadge: {
    alignItems: 'center',
    borderRadius: borderRadius.button,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusBadgeContainer: {
    marginTop: spacing.sm,
  },
  statusSubtext: {
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs / 2,
  },
  statusText: {
    fontSize: typography.small.fontSize,
    fontWeight: '600',
  },
  statusTextContainer: {
    flex: 1,
  },
});
