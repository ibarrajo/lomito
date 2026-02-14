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
  title: {
    marginBottom: spacing.md,
  },
  chartContainer: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: spacing.xs,
    marginRight: spacing.sm,
  },
  label: {
    flex: 1,
  },
  barContainer: {
    flex: 1,
    height: 24,
    backgroundColor: colors.neutral200,
    borderRadius: spacing.xs,
    overflow: 'hidden',
    marginHorizontal: spacing.sm,
  },
  bar: {
    height: '100%',
    borderRadius: spacing.xs,
  },
  count: {
    width: 40,
    textAlign: 'right',
    fontWeight: '600',
  },
});
