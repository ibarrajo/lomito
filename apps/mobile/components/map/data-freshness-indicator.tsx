/**
 * DataFreshnessIndicator Component
 * Shows when map case data was last updated. Displays a pulsing green dot
 * when idle, or a spinner with "Updating..." when a Realtime refresh is in progress.
 */

import { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Caption } from '@lomito/ui/src/components/typography';
import { colors, spacing, borderRadius } from '@lomito/ui/src/theme/tokens';

interface DataFreshnessIndicatorProps {
  lastUpdated: Date;
  isRefreshing: boolean;
}

function formatRelativeTime(
  date: Date,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  const diffMs = Date.now() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);

  if (diffSecs < 10) {
    return t('map.dataUpdatedNow');
  }

  if (diffSecs < 60) {
    return t('map.dataUpdatedAgo', {
      time: t('map.secondsAbbrev', { count: diffSecs }),
    });
  }

  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) {
    return t('map.dataUpdatedAgo', {
      time: t('map.minutesAbbrev', { count: diffMins }),
    });
  }

  const diffHours = Math.floor(diffMins / 60);
  return t('map.dataUpdatedAgo', {
    time: t('map.hoursAbbrev', { count: diffHours }),
  });
}

export function DataFreshnessIndicator({
  lastUpdated,
  isRefreshing,
}: DataFreshnessIndicatorProps) {
  const { t } = useTranslation();
  const [displayText, setDisplayText] = useState<string>(() =>
    formatRelativeTime(lastUpdated, t),
  );

  useEffect(() => {
    // Update the relative time label every 10 seconds
    const interval = setInterval(() => {
      setDisplayText(formatRelativeTime(lastUpdated, t));
    }, 10000);

    // Recalculate immediately whenever lastUpdated changes
    setDisplayText(formatRelativeTime(lastUpdated, t));

    return () => clearInterval(interval);
  }, [lastUpdated, t]);

  return (
    <View
      style={styles.container}
      accessibilityLabel={isRefreshing ? t('map.dataUpdating') : displayText}
      accessibilityRole="text"
    >
      {isRefreshing ? (
        <>
          <ActivityIndicator
            size={12}
            color={colors.neutral500}
            style={styles.spinner}
          />
          <Caption color={colors.neutral700} style={styles.text}>
            {t('map.dataUpdating')}
          </Caption>
        </>
      ) : (
        <>
          <View style={styles.dot} />
          <Caption color={colors.neutral700} style={styles.text}>
            {displayText}
          </Caption>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: borderRadius.pill,
    flexDirection: 'row',
    left: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    position: 'absolute',
    top: spacing.md,
    zIndex: 10,
  },
  dot: {
    backgroundColor: colors.success,
    borderRadius: 3,
    height: 6,
    marginRight: 4,
    width: 6,
  },
  spinner: {
    marginRight: 4,
  },
  text: {
    lineHeight: 16,
  },
});
