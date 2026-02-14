/**
 * Profile Screen
 * Display user info and list of their own reports
 */

import { View, FlatList, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { H1, H2, Body, Caption } from '@lomito/ui/components/typography';
import { Badge } from '@lomito/ui/components/badge';
import { Skeleton } from '@lomito/ui/components/skeleton';
import { colors, spacing, borderRadius, typography } from '@lomito/ui/theme/tokens';
import { useUserProfile } from '../../hooks/use-user-profile';
import { useMyCases } from '../../hooks/use-my-cases';
import { MyCaseCard } from '../../components/profile/my-case-card';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { profile, loading: profileLoading } = useUserProfile();
  const { cases, loading: casesLoading, error, refetch } = useMyCases();

  const handleSettingsPress = useCallback(() => {
    router.push('/(tabs)/settings');
  }, [router]);

  const renderHeader = useCallback(() => {
    if (profileLoading || !profile) {
      return (
        <View style={styles.headerContainer}>
          <View style={styles.avatarSection}>
            <Skeleton width={80} height={80} borderRadius={borderRadius.avatar} />
            <View style={styles.userInfo}>
              <Skeleton width={120} height={24} borderRadius={4} />
              <View style={styles.spacerSmall} />
              <Skeleton width={80} height={16} borderRadius={4} />
            </View>
          </View>
        </View>
      );
    }

    const initials = profile.full_name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const roleColors: Record<string, { color: string; backgroundColor: string }> = {
      citizen: { color: colors.neutral700, backgroundColor: colors.neutral100 },
      moderator: { color: colors.secondary, backgroundColor: colors.secondaryLight },
      government: { color: colors.info, backgroundColor: colors.infoBackground },
      admin: { color: colors.primary, backgroundColor: colors.primaryLight },
    };

    const roleStyle = roleColors[profile.role] || roleColors.citizen;

    return (
      <View style={styles.headerContainer}>
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Body style={styles.avatarText} color={colors.white}>
              {initials}
            </Body>
          </View>
          <View style={styles.userInfo}>
            <H2>{profile.full_name}</H2>
            <Badge
              label={t(`profile.${profile.role}`)}
              color={roleStyle.color}
              backgroundColor={roleStyle.backgroundColor}
              accessibilityLabel={t(`profile.role`)}
              style={styles.roleBadge}
            />
          </View>
        </View>

        <View style={styles.detailsSection}>
          {profile.municipality && (
            <View style={styles.detailRow}>
              <Caption style={styles.detailLabel}>{t('auth.municipality')}</Caption>
              <Body>{profile.municipality}</Body>
            </View>
          )}
          {profile.phone && (
            <View style={styles.detailRow}>
              <Caption style={styles.detailLabel}>{t('auth.phone')}</Caption>
              <Body>{profile.phone}</Body>
            </View>
          )}
        </View>

        <Pressable
          style={styles.settingsButton}
          onPress={handleSettingsPress}
          accessibilityLabel={t('nav.settings')}
          accessibilityRole="button"
        >
          <Body color={colors.primary}>{t('nav.settings')}</Body>
        </Pressable>

        <View style={styles.sectionHeader}>
          <H1>{t('profile.myReports')}</H1>
          <Caption color={colors.neutral500}>
            {t('profile.myReportsCount', { count: cases.length })}
          </Caption>
        </View>
      </View>
    );
  }, [profile, profileLoading, cases.length, t, handleSettingsPress]);

  if (error) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: t('nav.profile'),
            headerBackTitle: t('common.back'),
          }}
        />
        {renderHeader()}
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
          title: t('nav.profile'),
          headerBackTitle: t('common.back'),
        }}
      />
      <FlatList
        data={cases}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MyCaseCard
            id={item.id}
            category={item.category}
            status={item.status}
            description={item.description}
            createdAt={item.created_at}
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          casesLoading ? (
            <View style={styles.loadingContainer}>
              <Skeleton width="100%" height={120} borderRadius={borderRadius.card} />
              <View style={styles.spacer} />
              <Skeleton width="100%" height={120} borderRadius={borderRadius.card} />
              <View style={styles.spacer} />
              <Skeleton width="100%" height={120} borderRadius={borderRadius.card} />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Body color={colors.neutral500}>{t('profile.noReports')}</Body>
              <Caption color={colors.neutral400} style={styles.emptyMessage}>
                {t('profile.noReportsMessage')}
              </Caption>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={casesLoading}
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
  avatar: {
    alignItems: 'center',
    borderRadius: borderRadius.avatar,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  avatarSection: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  avatarText: {
    fontSize: typography.display.fontSize,
    fontWeight: typography.display.fontWeight,
  },
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  detailLabel: {
    color: colors.neutral500,
    marginBottom: spacing.xs,
  },
  detailRow: {
    marginBottom: spacing.md,
  },
  detailsSection: {
    borderTopColor: colors.neutral200,
    borderTopWidth: 1,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyMessage: {
    marginTop: spacing.xs,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  headerContainer: {
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: spacing.md,
  },
  loadingContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  roleBadge: {
    marginTop: spacing.xs,
  },
  sectionHeader: {
    borderTopColor: colors.neutral200,
    borderTopWidth: 1,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
  },
  settingsButton: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.button,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  spacer: {
    height: spacing.md,
  },
  spacerSmall: {
    height: spacing.xs,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
