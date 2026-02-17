/**
 * Government Portal Screen
 * Case management for government users with folio assignment and official responses
 * Desktop: KPI cards + table + detail panel
 * Mobile: KPI cards + card list
 */

import { useState, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Pressable,
  Text,
} from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { H1, Body } from '@lomito/ui/components/typography';
import { Skeleton } from '@lomito/ui/components/skeleton';
import { AppModal } from '@lomito/ui';
import {
  colors,
  spacing,
  borderRadius,
  typography,
} from '@lomito/ui/theme/tokens';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { useUserProfile } from '../../hooks/use-user-profile';
import { useGovernmentCases } from '../../hooks/use-government-cases';
import { useGovernmentActions } from '../../hooks/use-government-actions';
import { CaseActionCard } from '../../components/government/case-action-card';
import { KpiCard } from '../../components/government/kpi-card';
import { CaseTable } from '../../components/government/case-table';
import { CaseDetailPanel } from '../../components/government/case-detail-panel';
import { FolioInput } from '../../components/government/folio-input';
import { OfficialResponse } from '../../components/government/official-response';
import type { CaseStatus } from '@lomito/shared/types/database';
import { differenceInDays } from 'date-fns';

type FilterStatus =
  | 'all'
  | 'escalated'
  | 'pending_response'
  | 'in_progress'
  | 'resolved';

export default function GovernmentScreen() {
  const { t } = useTranslation();
  const { isDesktop } = useBreakpoint();
  const { profile, loading: profileLoading } = useUserProfile();
  const isAuthorized =
    profile?.role === 'government' || profile?.role === 'admin';
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [folioModalVisible, setFolioModalVisible] = useState(false);
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const { cases, loading, error, refetch } = useGovernmentCases({
    statusFilter,
  });
  const { assignFolio, postResponse, updateStatus } = useGovernmentActions();
  const [statusModalCaseId, setStatusModalCaseId] = useState<string | null>(
    null,
  );

  const selectedCase = selectedCaseId
    ? cases.find((c) => c.id === selectedCaseId)
    : null;

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalAssigned = cases.length;
    const expiringCases = cases.filter((c) => {
      if (!c.escalated_at) return false;
      const daysSince = differenceInDays(new Date(), new Date(c.escalated_at));
      return daysSince > 25 && daysSince <= 30;
    }).length;

    const resolvedCases = cases.filter(
      (c) => c.status === 'resolved' || c.government_response_at,
    );
    const avgResolutionTime =
      resolvedCases.length > 0
        ? resolvedCases.reduce((acc, c) => {
            if (!c.escalated_at || !c.government_response_at) return acc;
            const days = differenceInDays(
              new Date(c.government_response_at),
              new Date(c.escalated_at),
            );
            return acc + days;
          }, 0) / resolvedCases.length
        : 0;

    return {
      totalAssigned,
      expiringCases,
      avgResolutionTime: avgResolutionTime.toFixed(1),
      systemStatus: t('government.systemStatusOperational'),
    };
  }, [cases, t]);

  function handleAssignFolio(caseId: string) {
    setSelectedCaseId(caseId);
    setFolioModalVisible(true);
  }

  function handlePostResponse(caseId: string) {
    setSelectedCaseId(caseId);
    setResponseModalVisible(true);
  }

  function handleUpdateStatus(caseId: string) {
    setStatusModalCaseId(caseId);
  }

  function handleSelectCase(caseId: string) {
    if (isDesktop) {
      setSelectedCaseId(caseId === selectedCaseId ? null : caseId);
    } else {
      // On mobile, we could navigate to detail screen
      setSelectedCaseId(caseId);
    }
  }

  async function updateStatusAndRefresh(caseId: string, newStatus: CaseStatus) {
    try {
      await updateStatus(caseId, newStatus);
      await refetch();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  }

  async function handleFolioSave(caseId: string, folio: string) {
    await assignFolio(caseId, folio);
    await refetch();
  }

  async function handleResponseSubmit(caseId: string, responseText: string) {
    await postResponse(caseId, responseText);
    await refetch();
  }

  const filters: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: t('map.allStatuses') },
    { key: 'escalated', label: t('government.escalated') },
    { key: 'pending_response', label: t('government.pendingResponse') },
    { key: 'in_progress', label: t('status.in_progress') },
    { key: 'resolved', label: t('status.resolved') },
  ];

  if (!profileLoading && !isAuthorized) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: t('government.portal') }} />
        <View style={styles.accessDenied}>
          <Body color={colors.error}>{t('common.accessDenied')}</Body>
        </View>
      </View>
    );
  }

  if (loading && cases.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: t('government.portal'),
            headerBackTitle: t('common.back'),
          }}
        />
        <View style={styles.header}>
          <H1>{t('government.portal')}</H1>
        </View>
        <View style={styles.loadingContainer}>
          <Skeleton width="100%" height={180} borderRadius={12} />
          <View style={styles.spacer} />
          <Skeleton width="100%" height={180} borderRadius={12} />
          <View style={styles.spacer} />
          <Skeleton width="100%" height={180} borderRadius={12} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: t('government.portal'),
            headerBackTitle: t('common.back'),
          }}
        />
        <View style={styles.header}>
          <H1>{t('government.portal')}</H1>
        </View>
        <View style={styles.errorContainer}>
          <Body color={colors.error}>{error}</Body>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t('government.portal'),
          headerBackTitle: t('common.back'),
        }}
      />
      <View style={styles.header}>
        <H1>{t('government.portal')}</H1>
        <Body color={colors.neutral500}>
          {t('government.caseCount', { count: cases.length })}
        </Body>
      </View>

      {/* KPI Cards Row */}
      {isDesktop ? (
        <View style={styles.kpiContainerDesktop}>
          <View style={styles.kpiCardWrapper}>
            <KpiCard
              icon="📊"
              value={kpis.totalAssigned}
              label={t('government.assignedCases')}
              accessibilityLabel={`${t('government.assignedCases')}: ${kpis.totalAssigned}`}
            />
          </View>
          <View style={styles.kpiCardWrapper}>
            <KpiCard
              icon="⏰"
              value={kpis.expiringCases}
              label={t('government.expiringCases')}
              accessibilityLabel={`${t('government.expiringCases')}: ${kpis.expiringCases}`}
            />
          </View>
          <View style={styles.kpiCardWrapper}>
            <KpiCard
              icon="⏱️"
              value={`${kpis.avgResolutionTime}d`}
              label={t('government.avgResolutionTime')}
              accessibilityLabel={`${t('government.avgResolutionTime')}: ${kpis.avgResolutionTime} days`}
            />
          </View>
          <View style={styles.kpiCardWrapper}>
            <KpiCard
              icon="✅"
              value={kpis.systemStatus}
              label={t('government.systemStatus')}
              accessibilityLabel={`${t('government.systemStatus')}: ${kpis.systemStatus}`}
            />
          </View>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.kpiContainer}
          contentContainerStyle={styles.kpiContent}
        >
          <KpiCard
            icon="📊"
            value={kpis.totalAssigned}
            label={t('government.assignedCases')}
            accessibilityLabel={`${t('government.assignedCases')}: ${kpis.totalAssigned}`}
          />
          <KpiCard
            icon="⏰"
            value={kpis.expiringCases}
            label={t('government.expiringCases')}
            accessibilityLabel={`${t('government.expiringCases')}: ${kpis.expiringCases}`}
          />
          <KpiCard
            icon="⏱️"
            value={`${kpis.avgResolutionTime}d`}
            label={t('government.avgResolutionTime')}
            accessibilityLabel={`${t('government.avgResolutionTime')}: ${kpis.avgResolutionTime} days`}
          />
          <KpiCard
            icon="✅"
            value={kpis.systemStatus}
            label={t('government.systemStatus')}
            accessibilityLabel={`${t('government.systemStatus')}: ${kpis.systemStatus}`}
          />
        </ScrollView>
      )}

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((filter) => (
          <Pressable
            key={filter.key}
            style={[
              styles.filterPill,
              statusFilter === filter.key && styles.filterPillActive,
            ]}
            onPress={() => setStatusFilter(filter.key)}
            accessibilityRole="button"
            accessibilityLabel={filter.label}
          >
            <Text
              style={[
                styles.filterPillText,
                statusFilter === filter.key && styles.filterPillTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Content area: Desktop = table + detail panel, Mobile = card list */}
      {isDesktop ? (
        <View style={styles.desktopContent}>
          <View style={styles.tableContainer}>
            <CaseTable
              cases={cases.map((c) => ({
                id: c.id,
                category: c.category,
                animalType: c.animal_type,
                urgency: c.urgency,
                description: c.description,
                folio: c.folio,
                escalatedAt: c.escalated_at,
                governmentResponseAt: c.government_response_at,
                createdAt: c.created_at,
              }))}
              selectedCaseId={selectedCaseId}
              onSelectCase={handleSelectCase}
            />
          </View>
          {selectedCase && (
            <CaseDetailPanel
              caseId={selectedCase.id}
              category={selectedCase.category}
              animalType={selectedCase.animal_type}
              urgency={selectedCase.urgency}
              status={selectedCase.status}
              description={selectedCase.description}
              folio={selectedCase.folio}
              escalatedAt={selectedCase.escalated_at}
              governmentResponseAt={selectedCase.government_response_at}
              createdAt={selectedCase.created_at}
              location={selectedCase.location}
              onAssignFolio={handleAssignFolio}
              onPostResponse={handlePostResponse}
              onUpdateStatus={handleUpdateStatus}
              onClose={() => setSelectedCaseId(null)}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={cases}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CaseActionCard
              id={item.id}
              category={item.category}
              animalType={item.animal_type}
              urgency={item.urgency}
              description={item.description}
              folio={item.folio}
              escalatedAt={item.escalated_at}
              governmentResponseAt={item.government_response_at}
              onAssignFolio={handleAssignFolio}
              onPostResponse={handlePostResponse}
              onUpdateStatus={handleUpdateStatus}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Body color={colors.neutral500}>{t('government.noCases')}</Body>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Folio input modal */}
      <FolioInput
        visible={folioModalVisible}
        caseId={selectedCaseId || ''}
        currentFolio={selectedCase?.folio || null}
        onSave={handleFolioSave}
        onDismiss={() => {
          setFolioModalVisible(false);
          setSelectedCaseId(null);
        }}
      />

      {/* Official response modal */}
      <OfficialResponse
        visible={responseModalVisible}
        caseId={selectedCaseId || ''}
        onSubmit={handleResponseSubmit}
        onDismiss={() => {
          setResponseModalVisible(false);
          setSelectedCaseId(null);
        }}
      />

      {/* Status update modal */}
      <AppModal
        visible={!!statusModalCaseId}
        title={t('government.updateStatus')}
        message={t('government.selectStatus')}
        actions={[
          {
            label: t('status.in_progress'),
            onPress: () => {
              if (statusModalCaseId)
                updateStatusAndRefresh(statusModalCaseId, 'in_progress');
              setStatusModalCaseId(null);
            },
          },
          {
            label: t('status.resolved'),
            onPress: () => {
              if (statusModalCaseId)
                updateStatusAndRefresh(statusModalCaseId, 'resolved');
              setStatusModalCaseId(null);
            },
          },
          {
            label: t('common.cancel'),
            onPress: () => setStatusModalCaseId(null),
          },
        ]}
        onClose={() => setStatusModalCaseId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  accessDenied: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  desktopContent: {
    flex: 1,
    flexDirection: 'row',
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  filterContainer: {
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    flexGrow: 0,
  },
  filterContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  filterPill: {
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
  },
  filterPillText: {
    color: colors.neutral700,
    fontFamily: typography.button.fontFamily,
    fontSize: typography.small.fontSize,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: colors.secondary,
  },
  header: {
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  kpiCardWrapper: {
    flex: 1,
  },
  kpiContainer: {
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    flexGrow: 0,
  },
  kpiContainerDesktop: {
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  kpiContent: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  loadingContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  spacer: {
    height: spacing.md,
  },
  tableContainer: {
    flex: 2,
  },
});
