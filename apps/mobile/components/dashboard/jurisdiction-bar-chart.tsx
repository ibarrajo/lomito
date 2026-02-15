/**
 * JurisdictionBarChart Component
 * Bar chart showing cases resolved by jurisdiction.
 */

import { memo, useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@lomito/ui/src/components/card';
import { H3, BodySmall } from '@lomito/ui/src/components/typography';
import { colors, spacing, typography } from '@lomito/ui/src/theme/tokens';

interface JurisdictionData {
  name: string;
  resolved: number;
}

interface JurisdictionBarChartProps {
  data?: JurisdictionData[];
}

export const JurisdictionBarChart = memo(function JurisdictionBarChart({
  data = [],
}: JurisdictionBarChartProps) {
  const { t } = useTranslation();

  // Fallback mock data for demonstration
  const jurisdictions = useMemo(() => {
    if (data.length > 0) {
      return data;
    }
    // Mock data matching Stitch design (5 jurisdictions)
    return [
      { name: 'Tijuana', resolved: 85 },
      { name: 'Playas', resolved: 72 },
      { name: 'Centro', resolved: 68 },
      { name: 'Otay', resolved: 54 },
      { name: 'La Mesa', resolved: 41 },
    ];
  }, [data]);

  const maxResolved = useMemo(
    () => Math.max(...jurisdictions.map((j) => j.resolved), 100),
    [jurisdictions],
  );

  return (
    <Card accessibilityLabel={t('impact.casesByJurisdiction')}>
      <H3 style={styles.title}>{t('impact.casesByJurisdiction')}</H3>
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={styles.yAxisLabel}>100</Text>
          <Text style={styles.yAxisLabel}>75</Text>
          <Text style={styles.yAxisLabel}>50</Text>
          <Text style={styles.yAxisLabel}>25</Text>
          <Text style={styles.yAxisLabel}>0</Text>
        </View>

        {/* Bars */}
        <View style={styles.barsContainer}>
          {jurisdictions.map((jurisdiction, index) => {
            const heightPercent = (jurisdiction.resolved / maxResolved) * 100;
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${heightPercent}%`,
                        backgroundColor: colors.primaryDark,
                      },
                    ]}
                    accessibilityLabel={`${jurisdiction.name}: ${jurisdiction.resolved} cases resolved`}
                  />
                </View>
                <BodySmall style={styles.barLabel}>
                  {jurisdiction.name}
                </BodySmall>
              </View>
            );
          })}
        </View>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.primaryDark,
    borderRadius: spacing.xs,
    width: '100%',
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barLabel: {
    color: colors.neutral700,
    fontSize: 11,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  barWrapper: {
    alignItems: 'flex-end',
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    height: 200,
  },
  chartContainer: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  title: {
    marginBottom: spacing.sm,
  },
  yAxis: {
    height: 200,
    justifyContent: 'space-between',
    marginRight: spacing.sm,
    width: 30,
  },
  yAxisLabel: {
    color: colors.neutral500,
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    textAlign: 'right',
  },
});
