/**
 * EfficiencyRankingTable Component
 * Paginated table showing jurisdiction efficiency ranking with status badges.
 */

import { memo, useState, useMemo } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Card } from '@lomito/ui/src/components/card';
import { H3, BodySmall } from '@lomito/ui/src/components/typography';
import {
  colors,
  spacing,
  typography,
  borderRadius,
} from '@lomito/ui/src/theme/tokens';

interface JurisdictionEfficiency {
  rank: number;
  jurisdiction: string;
  totalCases: number;
  avgResponseTime: number;
  efficiency: number;
  status: 'high' | 'medium' | 'needs_improvement';
}

interface EfficiencyRankingTableProps {
  data?: JurisdictionEfficiency[];
  pageSize?: number;
}

export const EfficiencyRankingTable = memo(function EfficiencyRankingTable({
  data = [],
  pageSize = 5,
}: EfficiencyRankingTableProps) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);

  // Fallback mock data for demonstration (12 jurisdictions total)
  const jurisdictions = useMemo(() => {
    if (data.length > 0) {
      return data;
    }
    return [
      {
        rank: 1,
        jurisdiction: 'Tijuana',
        totalCases: 124,
        avgResponseTime: 36,
        efficiency: 92,
        status: 'high' as const,
      },
      {
        rank: 2,
        jurisdiction: 'Playas de Tijuana',
        totalCases: 98,
        avgResponseTime: 42,
        efficiency: 88,
        status: 'high' as const,
      },
      {
        rank: 3,
        jurisdiction: 'Centro',
        totalCases: 87,
        avgResponseTime: 48,
        efficiency: 85,
        status: 'high' as const,
      },
      {
        rank: 4,
        jurisdiction: 'Otay',
        totalCases: 76,
        avgResponseTime: 52,
        efficiency: 78,
        status: 'medium' as const,
      },
      {
        rank: 5,
        jurisdiction: 'La Mesa',
        totalCases: 65,
        avgResponseTime: 58,
        efficiency: 74,
        status: 'medium' as const,
      },
      {
        rank: 6,
        jurisdiction: 'Zona Este',
        totalCases: 54,
        avgResponseTime: 64,
        efficiency: 68,
        status: 'medium' as const,
      },
      {
        rank: 7,
        jurisdiction: 'Sánchez Taboada',
        totalCases: 48,
        avgResponseTime: 70,
        efficiency: 62,
        status: 'needs_improvement' as const,
      },
      {
        rank: 8,
        jurisdiction: 'Cerro Colorado',
        totalCases: 42,
        avgResponseTime: 76,
        efficiency: 58,
        status: 'needs_improvement' as const,
      },
      {
        rank: 9,
        jurisdiction: 'Libertad',
        totalCases: 38,
        avgResponseTime: 82,
        efficiency: 54,
        status: 'needs_improvement' as const,
      },
      {
        rank: 10,
        jurisdiction: 'Guaycura',
        totalCases: 32,
        avgResponseTime: 88,
        efficiency: 48,
        status: 'needs_improvement' as const,
      },
      {
        rank: 11,
        jurisdiction: 'Villa del Campo',
        totalCases: 28,
        avgResponseTime: 94,
        efficiency: 42,
        status: 'needs_improvement' as const,
      },
      {
        rank: 12,
        jurisdiction: 'El Florido',
        totalCases: 24,
        avgResponseTime: 100,
        efficiency: 38,
        status: 'needs_improvement' as const,
      },
    ];
  }, [data]);

  const totalPages = Math.ceil(jurisdictions.length / pageSize);
  const paginatedData = useMemo(
    () =>
      jurisdictions.slice(currentPage * pageSize, (currentPage + 1) * pageSize),
    [jurisdictions, currentPage, pageSize],
  );

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'high':
        return {
          label: t('impact.highPerformance'),
          color: colors.success,
          backgroundColor: colors.successBackground,
        };
      case 'medium':
        return {
          label: t('impact.average'),
          color: colors.warning,
          backgroundColor: colors.warningBackground,
        };
      case 'needs_improvement':
        return {
          label: t('impact.needsImprovement'),
          color: colors.error,
          backgroundColor: colors.errorBackground,
        };
      default:
        return {
          label: status,
          color: colors.neutral700,
          backgroundColor: colors.neutral200,
        };
    }
  };

  return (
    <Card accessibilityLabel={t('impact.efficiencyRanking')}>
      <H3 style={styles.title}>{t('impact.efficiencyRanking')}</H3>

      {/* Table Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.rankColumn]}>
          {t('impact.rank')}
        </Text>
        <Text style={[styles.headerCell, styles.jurisdictionColumn]}>
          {t('impact.jurisdiction')}
        </Text>
        <Text style={[styles.headerCell, styles.totalColumn]}>
          {t('impact.total')}
        </Text>
        <Text style={[styles.headerCell, styles.responseColumn]}>
          {t('impact.avgResponse')}
        </Text>
        <Text style={[styles.headerCell, styles.efficiencyColumn]}>
          {t('impact.efficiency')}
        </Text>
        <Text style={[styles.headerCell, styles.statusColumn]}>
          {t('impact.status')}
        </Text>
      </View>

      {/* Table Rows */}
      {paginatedData.map((item) => {
        const statusBadge = getStatusBadge(item.status);
        return (
          <View key={item.rank} style={styles.dataRow}>
            <Text style={[styles.dataCell, styles.rankColumn]}>
              {item.rank}
            </Text>
            <Text
              style={[styles.dataCell, styles.jurisdictionColumn]}
              numberOfLines={1}
            >
              {item.jurisdiction}
            </Text>
            <Text style={[styles.dataCell, styles.totalColumn]}>
              {item.totalCases}
            </Text>
            <Text style={[styles.dataCell, styles.responseColumn]}>
              {item.avgResponseTime}h
            </Text>
            <Text style={[styles.dataCell, styles.efficiencyColumn]}>
              {item.efficiency}%
            </Text>
            <View style={[styles.dataCell, styles.statusColumn]}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusBadge.backgroundColor },
                ]}
              >
                <Text style={[styles.statusText, { color: statusBadge.color }]}>
                  {statusBadge.label}
                </Text>
              </View>
            </View>
          </View>
        );
      })}

      {/* Pagination */}
      <View style={styles.pagination}>
        <Pressable
          onPress={handlePrevPage}
          disabled={currentPage === 0}
          style={[
            styles.pageButton,
            currentPage === 0 && styles.pageButtonDisabled,
          ]}
          accessibilityLabel={t('common.back')}
        >
          <ChevronLeft
            size={20}
            color={currentPage === 0 ? colors.neutral400 : colors.neutral700}
          />
        </Pressable>
        <BodySmall style={styles.pageInfo}>
          {t('impact.pageInfo', {
            current: currentPage + 1,
            total: totalPages,
            defaultValue: `Page ${currentPage + 1} of ${totalPages}`,
          })}
        </BodySmall>
        <Pressable
          onPress={handleNextPage}
          disabled={currentPage === totalPages - 1}
          style={[
            styles.pageButton,
            currentPage === totalPages - 1 && styles.pageButtonDisabled,
          ]}
          accessibilityLabel={t('common.next')}
        >
          <ChevronRight
            size={20}
            color={
              currentPage === totalPages - 1
                ? colors.neutral400
                : colors.neutral700
            }
          />
        </Pressable>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  dataCell: {
    color: colors.neutral900,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.small.fontSize,
    paddingVertical: spacing.sm,
  },
  dataRow: {
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  efficiencyColumn: {
    textAlign: 'right',
    width: 70,
  },
  headerCell: {
    color: colors.neutral700,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    paddingVertical: spacing.sm,
    textTransform: 'uppercase',
  },
  headerRow: {
    borderBottomColor: colors.neutral400,
    borderBottomWidth: 2,
    flexDirection: 'row',
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  jurisdictionColumn: {
    flex: 1,
  },
  pageButton: {
    alignItems: 'center',
    borderColor: colors.neutral200,
    borderRadius: borderRadius.button,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageInfo: {
    color: colors.neutral700,
  },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  rankColumn: {
    textAlign: 'center',
    width: 50,
  },
  responseColumn: {
    textAlign: 'right',
    width: 70,
  },
  statusBadge: {
    borderRadius: borderRadius.tag,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusColumn: {
    width: 120,
  },
  statusText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 10,
    fontWeight: '600',
  },
  title: {
    marginBottom: spacing.sm,
  },
  totalColumn: {
    textAlign: 'right',
    width: 60,
  },
});
