/**
 * ResolutionRate Component
 * Circular progress indicator showing resolution percentage.
 */

import { memo, useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle } from 'react-native-svg';
import { Card } from '@lomito/ui/src/components/card';
import { H3, BodySmall } from '@lomito/ui/src/components/typography';
import { colors, spacing, typography } from '@lomito/ui/src/theme/tokens';

interface ResolutionRateProps {
  resolvedCount: number;
  totalCount: number;
}

export const ResolutionRate = memo(function ResolutionRate({ resolvedCount, totalCount }: ResolutionRateProps) {
  const { t } = useTranslation();

  const percentage = useMemo(
    () => (totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0),
    [resolvedCount, totalCount]
  );

  // Circle dimensions
  const circleProps = useMemo(() => {
    const size = 140;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return { size, strokeWidth, radius, circumference, strokeDashoffset };
  }, [percentage]);

  const { size, strokeWidth, radius, circumference, strokeDashoffset } = circleProps;

  return (
    <Card accessibilityLabel={`${t('dashboard.resolvedRate')}: ${percentage}%`}>
      <H3 style={styles.title}>
        {t('dashboard.resolvedRate')}
      </H3>
      <View style={styles.circleContainer}>
        <Svg width={size} height={size} style={styles.svg}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.neutral200}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.success}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.percentageContainer}>
          <Text style={styles.percentage}>
            {percentage}%
          </Text>
          <BodySmall color={colors.neutral700}>
            {resolvedCount} / {totalCount}
          </BodySmall>
        </View>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.md,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    transform: [{ scaleX: -1 }],
  },
  percentageContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  percentage: {
    color: colors.success,
    marginBottom: spacing.xs,
    fontSize: typography.display.fontSize,
    fontWeight: typography.display.fontWeight,
    fontFamily: typography.display.fontFamily,
  },
});
