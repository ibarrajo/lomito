/**
 * TrendLineChart Component
 * Dual-line chart showing 6-month trend (Reported vs Resolved).
 */

import { memo, useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Polyline, Circle } from 'react-native-svg';
import { Card } from '@lomito/ui/src/components/card';
import { H3, BodySmall } from '@lomito/ui/src/components/typography';
import { colors, spacing, typography } from '@lomito/ui/src/theme/tokens';

interface MonthData {
  month: string;
  reported: number;
  resolved: number;
}

interface TrendLineChartProps {
  data?: MonthData[];
}

export const TrendLineChart = memo(function TrendLineChart({
  data = [],
}: TrendLineChartProps) {
  const { t } = useTranslation();

  // Fallback mock data for demonstration (Jan-Jun)
  const monthData = useMemo(() => {
    if (data.length > 0) {
      return data;
    }
    return [
      {
        month: t('impact.monthJan', { defaultValue: 'Jan' }),
        reported: 45,
        resolved: 38,
      },
      {
        month: t('impact.monthFeb', { defaultValue: 'Feb' }),
        reported: 52,
        resolved: 44,
      },
      {
        month: t('impact.monthMar', { defaultValue: 'Mar' }),
        reported: 58,
        resolved: 50,
      },
      {
        month: t('impact.monthApr', { defaultValue: 'Apr' }),
        reported: 65,
        resolved: 55,
      },
      {
        month: t('impact.monthMay', { defaultValue: 'May' }),
        reported: 70,
        resolved: 62,
      },
      {
        month: t('impact.monthJun', { defaultValue: 'Jun' }),
        reported: 75,
        resolved: 68,
      },
    ];
  }, [data, t]);

  const { chartWidth, chartHeight, reportedPoints, resolvedPoints, maxValue } =
    useMemo(() => {
      const width = 300;
      const height = 150;
      const padding = 20;
      const chartW = width - padding * 2;
      const chartH = height - padding * 2;

      const allValues = monthData.flatMap((d) => [d.reported, d.resolved]);
      const max = Math.max(...allValues, 100);

      const stepX = chartW / (monthData.length - 1);

      const reportedPts = monthData
        .map((d, i) => {
          const x = padding + i * stepX;
          const y = padding + chartH - (d.reported / max) * chartH;
          return `${x},${y}`;
        })
        .join(' ');

      const resolvedPts = monthData
        .map((d, i) => {
          const x = padding + i * stepX;
          const y = padding + chartH - (d.resolved / max) * chartH;
          return `${x},${y}`;
        })
        .join(' ');

      return {
        chartWidth: width,
        chartHeight: height,
        reportedPoints: reportedPts,
        resolvedPoints: resolvedPts,
        maxValue: max,
      };
    }, [monthData]);

  return (
    <Card accessibilityLabel={t('impact.sixMonthTrend')}>
      <H3 style={styles.title}>{t('impact.sixMonthTrend')}</H3>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.info }]} />
          <BodySmall>{t('impact.reported')}</BodySmall>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: colors.success }]}
          />
          <BodySmall>{t('impact.resolved')}</BodySmall>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Reported line */}
          <Polyline
            points={reportedPoints}
            fill="none"
            stroke={colors.info}
            strokeWidth={2}
          />
          {/* Resolved line */}
          <Polyline
            points={resolvedPoints}
            fill="none"
            stroke={colors.success}
            strokeWidth={2}
          />
          {/* Plot points for reported */}
          {monthData.map((d, i) => {
            const stepX = (chartWidth - 40) / (monthData.length - 1);
            const x = 20 + i * stepX;
            const y =
              20 +
              (chartHeight - 40) -
              (d.reported / maxValue) * (chartHeight - 40);
            return (
              <Circle
                key={`reported-${i}`}
                cx={x}
                cy={y}
                r={4}
                fill={colors.info}
              />
            );
          })}
          {/* Plot points for resolved */}
          {monthData.map((d, i) => {
            const stepX = (chartWidth - 40) / (monthData.length - 1);
            const x = 20 + i * stepX;
            const y =
              20 +
              (chartHeight - 40) -
              (d.resolved / maxValue) * (chartHeight - 40);
            return (
              <Circle
                key={`resolved-${i}`}
                cx={x}
                cy={y}
                r={4}
                fill={colors.success}
              />
            );
          })}
        </Svg>

        {/* X-axis labels */}
        <View style={styles.xAxisLabels}>
          {monthData.map((d, i) => (
            <Text key={i} style={styles.xAxisLabel}>
              {d.month}
            </Text>
          ))}
        </View>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  legendDot: {
    borderRadius: 4,
    height: 8,
    marginRight: spacing.xs,
    width: 8,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  title: {
    marginBottom: spacing.sm,
  },
  xAxisLabel: {
    color: colors.neutral500,
    flex: 1,
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    textAlign: 'center',
  },
  xAxisLabels: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    width: 300,
  },
});
