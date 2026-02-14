/**
 * Timeline Component
 * Displays a vertical timeline of case events.
 */

import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Body, Caption } from '@lomito/ui/components/typography';
import { colors, spacing } from '@lomito/ui/theme/tokens';
import type { CaseTimeline, TimelineAction } from '@lomito/shared/types/database';

interface TimelineProps {
  events: CaseTimeline[];
}

const ACTION_ICONS: Record<TimelineAction, string> = {
  created: '+',
  verified: '✓',
  rejected: '✕',
  status_changed: '→',
  assigned: '👤',
  escalated: '⬆',
  government_response: '📝',
  comment: '💬',
  media_added: '📷',
  flagged: '⚠',
  resolved: '✓',
  archived: '📦',
};

export function Timeline({ events }: TimelineProps) {
  const { t } = useTranslation();

  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Body color={colors.neutral500}>{t('case.noTimeline')}</Body>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const icon = ACTION_ICONS[event.action];
        const formattedDate = new Date(event.created_at).toLocaleString(
          'es-MX',
          {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          },
        );

        return (
          <View
            key={event.id}
            style={styles.eventContainer}
            accessibilityLabel={`${t(`timelineAction.${event.action}`)} - ${formattedDate}`}
          >
            {/* Icon and line */}
            <View style={styles.iconColumn}>
              <View style={styles.iconCircle}>
                <Body color={colors.white}>{icon}</Body>
              </View>
              {!isLast && <View style={styles.verticalLine} />}
            </View>

            {/* Event details */}
            <View style={styles.eventDetails}>
              <Body style={styles.eventAction}>
                {t(`timelineAction.${event.action}`)}
              </Body>
              <Caption color={colors.neutral500} style={styles.eventTime}>
                {formattedDate}
              </Caption>
              {event.details && Object.keys(event.details).length > 0 && (
                <Caption color={colors.neutral700} style={styles.eventMeta}>
                  {JSON.stringify(event.details)}
                </Caption>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  eventAction: {
    fontWeight: '600',
  },
  eventContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  eventDetails: {
    flex: 1,
    paddingBottom: spacing.sm,
  },
  eventMeta: {
    marginTop: spacing.xs,
  },
  eventTime: {
    marginTop: spacing.xs,
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  iconColumn: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 32,
  },
  verticalLine: {
    backgroundColor: colors.neutral200,
    flex: 1,
    marginTop: spacing.xs,
    width: 2,
  },
});
