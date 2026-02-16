/**
 * Moderation Queue Screen
 * List of pending cases for moderators to review and take action on
 */

import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import { H1, Body } from '@lomito/ui/components/typography';
import { AppModal, TextInput, Button } from '@lomito/ui';
import { Skeleton } from '@lomito/ui/components/skeleton';
import { borderRadius } from '@lomito/ui/theme/tokens';
import { colors, spacing } from '@lomito/ui/theme/tokens';
import { useModerationQueue } from '../../hooks/use-moderation-queue';
import { useReviewActions } from '../../components/moderation/review-actions';
import { CaseReviewCard } from '../../components/moderation/case-review-card';
import { QueueSidebar } from '../../components/moderation/queue-sidebar';
import { ReviewDetailPanel } from '../../components/moderation/review-detail-panel';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { useUserProfile } from '../../hooks/use-user-profile';

export default function ModerationScreen() {
  const { t } = useTranslation();
  const { cases, loading, error, refetch } = useModerationQueue();
  const { isDesktop } = useBreakpoint();
  const { profile, loading: profileLoading } = useUserProfile();
  const isAuthorized =
    profile?.role === 'moderator' || profile?.role === 'admin';
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    handleVerify,
    handleReject,
    handleFlag,
    modal,
    setModal,
    confirmVerify,
    setConfirmVerify,
    confirmReject,
    setConfirmReject,
    rejectReason,
    setRejectReason,
    confirmRejectAction,
    confirmFlag,
    setConfirmFlag,
    confirmVerifyAction,
    confirmFlagAction,
  } = useReviewActions(refetch);

  const selectedCase = selectedCaseId
    ? cases.find((c) => c.id === selectedCaseId)
    : null;

  const handleSelectCase = useCallback((caseId: string) => {
    setSelectedCaseId(caseId);
  }, []);

  const handleVerifySelected = useCallback(() => {
    if (selectedCaseId) {
      handleVerify(selectedCaseId);
    }
  }, [selectedCaseId, handleVerify]);

  const handleRejectSelected = useCallback(() => {
    if (selectedCaseId) {
      handleReject(selectedCaseId);
    }
  }, [selectedCaseId, handleReject]);

  const handleRequestInfo = useCallback(() => {
    if (selectedCaseId) {
      handleFlag(selectedCaseId);
    }
  }, [selectedCaseId, handleFlag]);

  useEffect(() => {
    if (cases.length > 0 && !selectedCaseId && isDesktop) {
      setSelectedCaseId(cases[0].id);
    }
  }, [cases, selectedCaseId, isDesktop]);

  useEffect(() => {
    if (!isDesktop || Platform.OS !== 'web') return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }

      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (event.key === 'v' || event.key === 'V') {
        event.preventDefault();
        handleVerifySelected();
      } else if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        handleRejectSelected();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDesktop, handleVerifySelected, handleRejectSelected]);

  if (!profileLoading && !isAuthorized) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: t('moderation.queue') }} />
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
            title: t('moderation.queue'),
            headerBackTitle: t('common.back'),
          }}
        />
        {!isDesktop && (
          <View style={styles.header}>
            <H1>{t('moderation.pendingCases')}</H1>
          </View>
        )}
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
            title: t('moderation.queue'),
            headerBackTitle: t('common.back'),
          }}
        />
        {!isDesktop && (
          <View style={styles.header}>
            <H1>{t('moderation.pendingCases')}</H1>
          </View>
        )}
        <View style={styles.errorContainer}>
          <Body color={colors.error}>{error}</Body>
        </View>
      </View>
    );
  }

  if (isDesktop) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: t('moderation.queue'),
            headerBackTitle: t('common.back'),
          }}
        />
        <View style={styles.desktopLayout}>
          <QueueSidebar
            cases={cases}
            selectedCaseId={selectedCaseId}
            onSelectCase={handleSelectCase}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <ReviewDetailPanel
            caseData={selectedCase ?? null}
            onVerify={handleVerifySelected}
            onReject={handleRejectSelected}
            onRequestInfo={handleRequestInfo}
            loading={loading}
          />
        </View>

        <AppModal
          visible={!!confirmVerify}
          title={t('moderation.confirmVerify')}
          actions={[
            {
              label: t('moderation.verify'),
              onPress: confirmVerifyAction,
            },
            {
              label: t('common.cancel'),
              onPress: () => setConfirmVerify(null),
              variant: 'ghost',
            },
          ]}
          onClose={() => setConfirmVerify(null)}
        />

        <AppModal
          visible={!!confirmFlag}
          title={t('moderation.confirmFlag')}
          actions={[
            {
              label: t('moderation.flag'),
              onPress: confirmFlagAction,
            },
            {
              label: t('common.cancel'),
              onPress: () => setConfirmFlag(null),
              variant: 'ghost',
            },
          ]}
          onClose={() => setConfirmFlag(null)}
        />

        <Modal
          visible={!!confirmReject}
          transparent
          animationType="fade"
          onRequestClose={() => setConfirmReject(null)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setConfirmReject(null)}
          >
            <View style={styles.modalContent}>
              <Body style={styles.modalTitle}>
                {t('moderation.confirmReject')}
              </Body>
              <TextInput
                label={t('moderation.rejectReason')}
                value={rejectReason}
                onChangeText={setRejectReason}
                placeholder={t('moderation.rejectReason')}
                accessibilityLabel={t('moderation.rejectReason')}
              />
              <View style={styles.modalActions}>
                <Button
                  onPress={() => setConfirmReject(null)}
                  variant="ghost"
                  accessibilityLabel={t('common.cancel')}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onPress={confirmRejectAction}
                  accessibilityLabel={t('moderation.reject')}
                >
                  {t('moderation.reject')}
                </Button>
              </View>
            </View>
          </Pressable>
        </Modal>

        <AppModal
          visible={!!modal}
          title={modal?.title ?? ''}
          message={modal?.message}
          actions={[
            {
              label: t('common.ok'),
              onPress: () => {
                const onDismiss = modal?.onDismiss;
                setModal(null);
                onDismiss?.();
              },
            },
          ]}
          onClose={() => {
            const onDismiss = modal?.onDismiss;
            setModal(null);
            onDismiss?.();
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t('moderation.queue'),
          headerBackTitle: t('common.back'),
        }}
      />
      <View style={styles.header}>
        <H1>{t('moderation.pendingCases')}</H1>
        <Body color={colors.neutral500}>
          {t('moderation.caseCount', { count: cases.length })}
        </Body>
      </View>
      <FlatList
        data={cases}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CaseReviewCard
            id={item.id}
            category={item.category}
            animalType={item.animal_type}
            urgency={item.urgency}
            description={item.description}
            createdAt={item.created_at}
            onVerify={handleVerify}
            onReject={handleReject}
            onFlag={handleFlag}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Body color={colors.neutral500}>{t('moderation.noPending')}</Body>
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

      <AppModal
        visible={!!confirmVerify}
        title={t('moderation.confirmVerify')}
        actions={[
          {
            label: t('moderation.verify'),
            onPress: confirmVerifyAction,
          },
          {
            label: t('common.cancel'),
            onPress: () => setConfirmVerify(null),
            variant: 'ghost',
          },
        ]}
        onClose={() => setConfirmVerify(null)}
      />

      <AppModal
        visible={!!confirmFlag}
        title={t('moderation.confirmFlag')}
        actions={[
          {
            label: t('moderation.flag'),
            onPress: confirmFlagAction,
          },
          {
            label: t('common.cancel'),
            onPress: () => setConfirmFlag(null),
            variant: 'ghost',
          },
        ]}
        onClose={() => setConfirmFlag(null)}
      />

      {/* Reject modal with reason text input */}
      <Modal
        visible={!!confirmReject}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmReject(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setConfirmReject(null)}
        >
          <View style={styles.modalContent}>
            <Body style={styles.modalTitle}>
              {t('moderation.confirmReject')}
            </Body>
            <TextInput
              label={t('moderation.rejectReason')}
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder={t('moderation.rejectReason')}
              accessibilityLabel={t('moderation.rejectReason')}
            />
            <View style={styles.modalActions}>
              <Button
                onPress={() => setConfirmReject(null)}
                variant="ghost"
                accessibilityLabel={t('common.cancel')}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onPress={confirmRejectAction}
                accessibilityLabel={t('moderation.reject')}
              >
                {t('moderation.reject')}
              </Button>
            </View>
          </View>
        </Pressable>
      </Modal>

      <AppModal
        visible={!!modal}
        title={modal?.title ?? ''}
        message={modal?.message}
        actions={[
          {
            label: t('common.ok'),
            onPress: () => {
              const onDismiss = modal?.onDismiss;
              setModal(null);
              onDismiss?.();
            },
          },
        ]}
        onClose={() => {
          const onDismiss = modal?.onDismiss;
          setModal(null);
          onDismiss?.();
        }}
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
  desktopLayout: {
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
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
    marginTop: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    maxWidth: 400,
    padding: spacing.lg,
    width: '90%',
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  modalTitle: {
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  spacer: {
    height: spacing.md,
  },
});
