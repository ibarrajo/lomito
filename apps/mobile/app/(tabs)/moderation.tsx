/**
 * Moderation Queue Screen
 * List of pending cases for moderators to review and take action on
 */

import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { H1, Body } from '@lomito/ui/components/typography';
import { Skeleton } from '@lomito/ui/components/skeleton';
import { colors, spacing } from '@lomito/ui/theme/tokens';
import { useModerationQueue } from '../../hooks/use-moderation-queue';
import { useReviewActions } from '../../components/moderation/review-actions';
import { CaseReviewCard } from '../../components/moderation/case-review-card';

export default function ModerationScreen() {
  const { t } = useTranslation();
  const { cases, loading, error, refetch } = useModerationQueue();
  const { handleVerify, handleReject, handleFlag } = useReviewActions(refetch);

  if (loading && cases.length === 0) {
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
            title: t('moderation.queue'),
            headerBackTitle: t('common.back'),
          }}
        />
        <View style={styles.header}>
          <H1>{t('moderation.pendingCases')}</H1>
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
          title: t('moderation.queue'),
          headerBackTitle: t('common.back'),
        }}
      />
      <View style={styles.header}>
        <H1>{t('moderation.pendingCases')}</H1>
        <Body color={colors.neutral500}>
          {cases.length} {cases.length === 1 ? 'case' : 'cases'}
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
