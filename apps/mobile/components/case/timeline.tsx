/**
 * Timeline Component
 * Displays a vertical timeline of case events.
 */

import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Body, Caption } from '@lomito/ui/components/typography';
import { colors, spacing } from '@lomito/ui/theme/tokens';
import type {
  CaseTimeline,
  TimelineAction,
} from '@lomito/shared/types/database';

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
  marked_unresponsive: '⏰',
};

function getTimelineDescription(
  action: TimelineAction,
  details: Record<string, unknown>,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  switch (action) {
    case 'created':
      return t('timeline.created');
    case 'verified':
      return t('timeline.verified');
    case 'rejected': {
      const reason = details.reason as string | undefined;
      return reason
        ? t('timeline.rejectedWithReason', { reason })
        : t('timeline.rejected');
    }
    case 'escalated': {
      const jurisdictionName = details.jurisdiction_name as string | undefined;
      return jurisdictionName
        ? t('timeline.escalatedTo', { jurisdiction: jurisdictionName })
        : t('timeline.escalated');
    }
    case 'government_response': {
      const responseText = details.response_text as string | undefined;
      if (responseText) {
        const truncated =
          responseText.length > 100
            ? `${responseText.substring(0, 100)}...`
            : responseText;
        return t('timeline.governmentResponse', { response: truncated });
      }
      return t('timeline.governmentResponseGeneric');
    }
    case 'status_changed': {
      const newStatus = details.new_status as string | undefined;
      const oldStatus = details.old_status as string | undefined;
      if (newStatus && oldStatus) {
        return t('timeline.statusChangedFromTo', {
          from: t(`status.${oldStatus}`),
          to: t(`status.${newStatus}`),
        });
      } else if (newStatus) {
        return t('timeline.statusChangedTo', {
          status: t(`status.${newStatus}`),
        });
      }
      return t('timeline.statusChanged');
    }
    case 'flagged':
      return t('timeline.flagged');
    case 'marked_unresponsive': {
      const days = details.days as number | undefined;
      return days
        ? t('timeline.markedUnresponsive', { days })
        : t('timeline.markedUnresponsiveGeneric');
    }
    default:
      return t(`timelineAction.${action}`);
  }
}

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
        const description = getTimelineDescription(
          event.action,
          event.details,
          t,
        );

        return (
          <View
            key={event.id}
            style={styles.eventContainer}
            accessibilityLabel={`${description} - ${formattedDate}`}
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
              <Body style={styles.eventAction}>{description}</Body>
              <Caption color={colors.neutral500} style={styles.eventTime}>
                {formattedDate}
              </Caption>
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
  eventTime: {
    marginTop: spacing.xs,
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: spacing.md,
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
