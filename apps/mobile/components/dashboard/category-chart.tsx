/**
 * CategoryChart Component
 * Horizontal bar chart showing cases by category.
 */

import { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@lomito/ui/src/components/card';
import { H3, Body } from '@lomito/ui/src/components/typography';
import { colors, spacing } from '@lomito/ui/src/theme/tokens';

interface CategoryData {
  abuse: number;
  stray: number;
  missing: number;
}

interface CategoryChartProps {
  data: CategoryData;
}

export const CategoryChart = memo(function CategoryChart({ data }: CategoryChartProps) {
  const { t } = useTranslation();

  const categories = useMemo(() => {
    const total = data.abuse + data.stray + data.missing;
    const abusePercent = total > 0 ? (data.abuse / total) * 100 : 0;
    const strayPercent = total > 0 ? (data.stray / total) * 100 : 0;
    const missingPercent = total > 0 ? (data.missing / total) * 100 : 0;

    return [
      {
        key: 'abuse',
        label: t('category.abuse'),
        count: data.abuse,
        percent: abusePercent,
        color: colors.category.abuse.pin,
      },
      {
        key: 'stray',
        label: t('category.stray'),
        count: data.stray,
        percent: strayPercent,
        color: colors.category.stray.pin,
      },
      {
        key: 'missing',
        label: t('category.missing'),
        count: data.missing,
        percent: missingPercent,
        color: colors.category.missing.pin,
      },
    ];
  }, [data, t]);

  return (
    <Card accessibilityLabel={t('dashboard.byCategory')}>
      <H3 style={styles.title}>
        {t('dashboard.byCategory')}
      </H3>
      <View style={styles.chartContainer}>
        {categories.map((category) => (
          <View key={category.key} style={styles.row}>
            <View style={styles.labelContainer}>
              <View
                style={[styles.colorDot, { backgroundColor: category.color }]}
              />
              <Body style={styles.label}>
                {category.label}
              </Body>
            </View>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    width: `${category.percent}%`,
                    backgroundColor: category.color,
                  },
                ]}
              />
            </View>
            <Body
              style={styles.count}
              accessibilityLabel={`${category.label}: ${category.count} cases`}
            >
              {category.count}
            </Body>
          </View>
        ))}
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  bar: {
    borderRadius: spacing.xs,
    height: '100%',
  },
  barContainer: {
    backgroundColor: colors.neutral200,
    borderRadius: spacing.xs,
    flex: 1,
    height: 24,
    marginHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  chartContainer: {
    gap: spacing.md,
  },
  colorDot: {
    borderRadius: spacing.xs,
    height: 8,
    marginRight: spacing.sm,
    width: 8,
  },
  count: {
    fontWeight: '600',
    textAlign: 'right',
    width: 40,
  },
  label: {
    flex: 1,
  },
  labelContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    width: 100,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  title: {
    marginBottom: spacing.md,
  },
});
