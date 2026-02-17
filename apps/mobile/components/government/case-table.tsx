/**
 * Case Table Component
 * Desktop table view of cases with sortable columns
 */

import { memo, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge } from '@lomito/ui/components/badge';
import { Caption } from '@lomito/ui/components/typography';
import { colors, spacing, typography } from '@lomito/ui/theme/tokens';
import type {
  CaseCategory,
  AnimalType,
  UrgencyLevel,
} from '@lomito/shared/types/database';
import { differenceInDays, format } from 'date-fns';

interface CaseRow {
  id: string;
  category: CaseCategory;
  animalType: AnimalType;
  urgency: UrgencyLevel;
  description: string;
  folio: string | null;
  escalatedAt: string | null;
  governmentResponseAt: string | null;
  createdAt: string;
}

interface CaseTableProps {
  cases: CaseRow[];
  selectedCaseId: string | null;
  onSelectCase: (caseId: string) => void;
}

export const CaseTable = memo(function CaseTable({
  cases,
  selectedCaseId,
  onSelectCase,
}: CaseTableProps) {
  const { t } = useTranslation();
  const [sortColumn, setSortColumn] = useState<
    'id' | 'category' | 'date' | 'urgency' | 'expiration'
  >('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedCases = useMemo(() => {
    const URGENCY_ORDER: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    return [...cases].sort((a, b) => {
      let comparison = 0;
      switch (sortColumn) {
        case 'id':
          comparison = (a.folio ?? '').localeCompare(b.folio ?? '');
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'urgency':
          comparison =
            (URGENCY_ORDER[a.urgency] ?? 0) - (URGENCY_ORDER[b.urgency] ?? 0);
          break;
        case 'expiration': {
          const aEscalated = a.escalatedAt
            ? new Date(a.escalatedAt).getTime()
            : 0;
          const bEscalated = b.escalatedAt
            ? new Date(b.escalatedAt).getTime()
            : 0;
          comparison = aEscalated - bEscalated;
          break;
        }
        case 'date':
        default:
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [cases, sortColumn, sortDirection]);

  function handleHeaderPress(
    column: 'id' | 'category' | 'date' | 'urgency' | 'expiration',
  ) {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  }

  const urgencyColors = {
    low: { color: colors.neutral700, bg: colors.neutral100 },
    medium: { color: colors.warning, bg: colors.warningBackground },
    high: { color: colors.error, bg: colors.errorBackground },
    critical: { color: colors.white, bg: colors.error },
  };

  function getStatusBadge(
    escalatedAt: string | null,
    governmentResponseAt: string | null,
  ): { label: string; color: string; bg: string } {
    if (governmentResponseAt) {
      return {
        label: t('status.resolved'),
        color: colors.success,
        bg: colors.successBackground,
      };
    }
    if (escalatedAt) {
      return {
        label: t('government.pendingResponse'),
        color: colors.warning,
        bg: colors.warningBackground,
      };
    }
    return {
      label: t('status.pending'),
      color: colors.neutral700,
      bg: colors.neutral100,
    };
  }

  function getExpirationDays(escalatedAt: string | null): number | null {
    if (!escalatedAt) return null;
    const daysSince = differenceInDays(new Date(), new Date(escalatedAt));
    return Math.max(0, 30 - daysSince);
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable
            style={styles.headerCell}
            onPress={() => handleHeaderPress('id')}
            accessibilityRole="button"
            accessibilityLabel={t('case.folio')}
          >
            <Text style={styles.headerText}>{t('case.folio')}</Text>
          </Pressable>
          <Pressable
            style={styles.headerCell}
            onPress={() => handleHeaderPress('category')}
            accessibilityRole="button"
            accessibilityLabel={t('report.category')}
          >
            <Text style={styles.headerText}>{t('report.category')}</Text>
          </Pressable>
          <Pressable
            style={styles.headerCell}
            onPress={() => handleHeaderPress('date')}
            accessibilityRole="button"
            accessibilityLabel={t('case.created')}
          >
            <Text style={styles.headerText}>{t('case.created')}</Text>
          </Pressable>
          <Pressable
            style={styles.headerCell}
            onPress={() => handleHeaderPress('urgency')}
            accessibilityRole="button"
            accessibilityLabel={t('report.urgency')}
          >
            <Text style={styles.headerText}>{t('report.urgency')}</Text>
          </Pressable>
          <Pressable
            style={styles.headerCell}
            onPress={() => handleHeaderPress('expiration')}
            accessibilityRole="button"
            accessibilityLabel={t('government.escalated')}
          >
            <Text style={styles.headerText}>{t('government.escalated')}</Text>
          </Pressable>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>{t('case.status')}</Text>
          </View>
        </View>

        {/* Rows */}
        {sortedCases.map((caseItem) => {
          const urgencyStyle = urgencyColors[caseItem.urgency];
          const categoryColor = colors.category[caseItem.category].pin;
          const categoryBgColor = colors.category[caseItem.category].background;
          const status = getStatusBadge(
            caseItem.escalatedAt,
            caseItem.governmentResponseAt,
          );
          const expirationDays = getExpirationDays(caseItem.escalatedAt);
          const isSelected = selectedCaseId === caseItem.id;

          return (
            <Pressable
              key={caseItem.id}
              style={[styles.row, isSelected && styles.rowSelected]}
              onPress={() => onSelectCase(caseItem.id)}
              accessibilityRole="button"
              accessibilityLabel={t('map.viewDetails')}
            >
              <View style={styles.cell}>
                <Caption style={styles.folioText}>
                  {caseItem.folio || '—'}
                </Caption>
              </View>
              <View style={styles.cell}>
                <Badge
                  label={t(`category.${caseItem.category}`)}
                  color={categoryColor}
                  backgroundColor={categoryBgColor}
                  accessibilityLabel={t(`category.${caseItem.category}`)}
                />
              </View>
              <View style={styles.cell}>
                <Caption>
                  {format(new Date(caseItem.createdAt), 'dd/MM/yyyy')}
                </Caption>
              </View>
              <View style={styles.cell}>
                <Badge
                  label={t(`urgency.${caseItem.urgency}`)}
                  color={urgencyStyle.color}
                  backgroundColor={urgencyStyle.bg}
                  accessibilityLabel={t(`urgency.${caseItem.urgency}`)}
                />
              </View>
              <View style={styles.cell}>
                {expirationDays !== null ? (
                  <Caption
                    style={
                      expirationDays <= 5
                        ? styles.expirationUrgent
                        : styles.expiration
                    }
                  >
                    {expirationDays} {t('dashboard.days')}
                  </Caption>
                ) : (
                  <Caption style={styles.notEscalated}>
                    {t('government.notEscalated')}
                  </Caption>
                )}
              </View>
              <View style={styles.cell}>
                <Badge
                  label={status.label}
                  color={status.color}
                  backgroundColor={status.bg}
                  accessibilityLabel={status.label}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  cell: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    minWidth: 120,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  container: {
    flex: 1,
    minWidth: 900,
  },
  expiration: {
    color: colors.neutral700,
  },
  expirationUrgent: {
    color: colors.error,
    fontWeight: '600',
  },
  folioText: {
    color: colors.neutral700,
    fontFamily: typography.fontFamily.mono,
    fontWeight: '600',
  },
  headerCell: {
    alignItems: 'flex-start',
    backgroundColor: colors.neutral100,
    justifyContent: 'center',
    minWidth: 120,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerRow: {
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  headerText: {
    color: colors.secondary,
    fontFamily: typography.button.fontFamily,
    fontSize: typography.small.fontSize,
    fontWeight: '600',
  },
  notEscalated: {
    color: colors.neutral500,
  },
  row: {
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  rowSelected: {
    backgroundColor: colors.primaryLight,
  },
  scrollView: {
    flex: 1,
  },
});
