/**
 * Government Portal Screen
 * Case management for government users with folio assignment and official responses
 */

import { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Pressable,
  Text,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { H1, Body } from '@lomito/ui/components/typography';
import { Skeleton } from '@lomito/ui/components/skeleton';
import { colors, spacing, borderRadius, typography } from '@lomito/ui/theme/tokens';
import { useGovernmentCases } from '../../hooks/use-government-cases';
import { useGovernmentActions } from '../../hooks/use-government-actions';
import { CaseActionCard } from '../../components/government/case-action-card';
import { FolioInput } from '../../components/government/folio-input';
import { OfficialResponse } from '../../components/government/official-response';
import type { CaseStatus } from '@lomito/shared/types/database';

type FilterStatus = 'all' | 'escalated' | 'pending_response' | 'in_progress' | 'resolved';

export default function GovernmentScreen() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [folioModalVisible, setFolioModalVisible] = useState(false);
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const { cases, loading, error, refetch } = useGovernmentCases({ statusFilter });
  const { assignFolio, postResponse, updateStatus } = useGovernmentActions();

  const selectedCase = selectedCaseId
    ? cases.find((c) => c.id === selectedCaseId)
    : null;

  function handleAssignFolio(caseId: string) {
    setSelectedCaseId(caseId);
    setFolioModalVisible(true);
  }

  function handlePostResponse(caseId: string) {
    setSelectedCaseId(caseId);
    setResponseModalVisible(true);
  }

  function handleUpdateStatus(caseId: string) {
    // Show action sheet with status options
    Alert.alert(
      t('government.updateStatus'),
      t('government.selectStatus'),
      [
        {
          text: t('status.in_progress'),
          onPress: () => updateStatusAndRefresh(caseId, 'in_progress'),
        },
        {
          text: t('status.resolved'),
          onPress: () => updateStatusAndRefresh(caseId, 'resolved'),
        },
        {
          text: t('status.archived'),
          onPress: () => updateStatusAndRefresh(caseId, 'archived'),
          style: 'destructive',
        },
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
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
          {cases.length} {cases.length === 1 ? 'case' : 'cases'}
        </Body>
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
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
    color: colors.white,
  },
  header: {
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
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
});
