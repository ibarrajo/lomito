/**
 * Case Detail Screen
 * Shows full case information with hero image, stats, 2-column desktop layout.
 */

import { useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Text } from 'react-native';
import { useLocalSearchParams, Stack, Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react-native';
import { H2, Body, Caption } from '@lomito/ui/components/typography';
import { colors, spacing, layout } from '@lomito/ui/theme/tokens';
import { Skeleton } from '@lomito/ui/components/skeleton';
import { useCase } from '../../hooks/use-case';
import { useUserProfile } from '../../hooks/use-user-profile';
import { useCaseSubscription } from '../../hooks/use-case-subscription';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { CaseHero } from '../../components/case/case-hero';
import { CaseStatsRow } from '../../components/case/case-stats-row';
import { CaseSidebar } from '../../components/case/case-sidebar';
import { PhotoGallery } from '../../components/case/photo-gallery';
import { Timeline } from '../../components/case/timeline';
import { FlagButton } from '../../components/case/flag-button';
import { ShareButton } from '../../components/case/share-button';
import { EscalateButton } from '../../components/case/escalate-button';
import { EscalationStatus } from '../../components/case/escalation-status';
import { useAnalytics } from '../../hooks/use-analytics';

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { caseData, media, timeline, loading, error, refetch } = useCase(
    id ?? '',
  );
  const { profile } = useUserProfile();
  const {
    isSubscribed,
    loading: subscriptionLoading,
    toggle: toggleSubscription,
  } = useCaseSubscription(id ?? '');
  const { trackEvent } = useAnalytics();
  const { isDesktop } = useBreakpoint();

  useEffect(() => {
    if (id) {
      trackEvent('case_view', { case_id: id });
    }
  }, [id, trackEvent]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: t('case.details'),
            headerBackTitle: t('common.back'),
          }}
        />
        <View style={styles.loadingContainer}>
          <Skeleton width="100%" height={150} borderRadius={12} />
          <View style={styles.spacer} />
          <Skeleton width="80%" height={32} borderRadius={8} />
          <View style={styles.smallSpacer} />
          <Skeleton width="60%" height={24} borderRadius={8} />
          <View style={styles.spacer} />
          <Skeleton width="100%" height={200} borderRadius={12} />
        </View>
      </View>
    );
  }

  if (error || !caseData) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: t('case.details'),
            headerBackTitle: t('common.back'),
          }}
        />
        <View style={styles.errorContainer}>
          <Body color={colors.error}>
            {error === 'CASE_NOT_FOUND'
              ? t('case.notFound')
              : error === 'FETCH_ERROR'
                ? t('case.fetchError')
                : t('common.error')}
          </Body>
        </View>
      </View>
    );
  }

  // Safely extract coordinates from location (GeoJSON Point)
  const longitude = caseData.location?.coordinates?.[0] ?? 0;
  const latitude = caseData.location?.coordinates?.[1] ?? 0;

  const handleFollowPress = () => {
    toggleSubscription();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t('case.details'),
          headerBackTitle: t('common.back'),
          headerRight: () => (
            <View style={styles.headerButtons}>
              {profile && (
                <Pressable
                  onPress={handleFollowPress}
                  disabled={subscriptionLoading}
                  style={styles.followButton}
                  accessibilityLabel={
                    isSubscribed ? t('case.unfollow') : t('case.follow')
                  }
                  accessibilityRole="button"
                >
                  <Text style={styles.followIcon}>
                    {isSubscribed ? '❤️' : '🤍'}
                  </Text>
                </Pressable>
              )}
              <ShareButton
                caseId={caseData.id}
                folio={caseData.folio}
                onShare={() =>
                  trackEvent('share_click', { case_id: caseData.id })
                }
              />
              {profile && (
                <FlagButton
                  caseId={caseData.id}
                  reporterId={caseData.reporter_id}
                />
              )}
            </View>
          ),
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Breadcrumbs - Desktop only */}
        {isDesktop && (
          <View style={styles.breadcrumbs}>
            <Link href="/" asChild>
              <Pressable
                style={styles.breadcrumbLink}
                accessibilityLabel={t('case.breadcrumbHome')}
                accessibilityRole="link"
              >
                <Caption color={colors.neutral500}>
                  {t('case.breadcrumbHome')}
                </Caption>
              </Pressable>
            </Link>
            <ChevronRight
              size={14}
              color={colors.neutral400}
              strokeWidth={1.5}
            />
            <Link href="/map" asChild>
              <Pressable
                style={styles.breadcrumbLink}
                accessibilityLabel={t('case.breadcrumbCases')}
                accessibilityRole="link"
              >
                <Caption color={colors.neutral500}>
                  {t('case.breadcrumbCases')}
                </Caption>
              </Pressable>
            </Link>
            <ChevronRight
              size={14}
              color={colors.neutral400}
              strokeWidth={1.5}
            />
            <Caption color={colors.neutral700}>
              {t('case.folio')} {caseData.folio || caseData.id.slice(0, 8)}
            </Caption>
          </View>
        )}

        {/* Hero Section */}
        <CaseHero caseData={caseData} media={media} />

        {/* Quick Stats Row */}
        <CaseStatsRow caseData={caseData} />

        {/* Main Content - 2-column on desktop */}
        <View
          style={[
            styles.contentWrapper,
            isDesktop && styles.contentWrapperDesktop,
          ]}
        >
          {/* Left Column - Main Content */}
          <View
            style={[styles.mainColumn, isDesktop && styles.mainColumnDesktop]}
          >
            {/* Escalate Button */}
            {profile && (
              <View style={styles.escalateSection}>
                <EscalateButton
                  caseId={caseData.id}
                  status={caseData.status}
                  escalatedAt={caseData.escalated_at}
                  userRole={profile.role}
                  onEscalated={refetch}
                />
              </View>
            )}

            {/* Escalation Status */}
            {caseData.escalated_at && (
              <View style={styles.escalationStatusSection}>
                <EscalationStatus
                  escalatedAt={caseData.escalated_at}
                  escalationReminderCount={
                    caseData.escalation_reminder_count || 0
                  }
                  markedUnresponsive={caseData.marked_unresponsive || false}
                  governmentResponseAt={caseData.government_response_at}
                />
              </View>
            )}

            {/* Description */}
            {caseData.description && (
              <View style={styles.section}>
                <H2 style={styles.sectionTitle}>{t('case.description')}</H2>
                <Body>{caseData.description}</Body>
              </View>
            )}

            {/* Photo Gallery */}
            {media.length > 0 && (
              <View style={styles.section}>
                <H2 style={styles.sectionTitle}>{t('case.photos')}</H2>
                <PhotoGallery media={media} />
              </View>
            )}

            {/* Timeline */}
            <View style={styles.section}>
              <H2 style={styles.sectionTitle}>{t('case.timeline')}</H2>
              <Timeline events={timeline} />
            </View>
          </View>

          {/* Right Column - Sidebar (Desktop only, below main on mobile) */}
          <View
            style={[
              styles.sidebarColumn,
              isDesktop && styles.sidebarColumnDesktop,
            ]}
          >
            <CaseSidebar
              latitude={latitude}
              longitude={longitude}
              locationNotes={caseData.location_notes}
              isSubscribed={isSubscribed}
              subscriptionLoading={subscriptionLoading}
              onSubscribeToggle={toggleSubscription}
              caseId={caseData.id}
              isAuthenticated={!!profile}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  breadcrumbLink: {
    paddingHorizontal: spacing.xs,
  },
  breadcrumbs: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  contentWrapper: {
    flexDirection: 'column',
    paddingHorizontal: spacing.md,
  },
  contentWrapperDesktop: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: spacing.xl,
    maxWidth: layout.maxContentWidth,
    paddingHorizontal: layout.containerPadding.desktop,
    width: '100%',
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  escalateSection: {
    marginBottom: spacing.md,
  },
  escalationStatusSection: {
    marginBottom: spacing.md,
  },
  followButton: {
    marginRight: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  followIcon: {
    fontSize: 20,
  },
  headerButtons: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  loadingContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  mainColumn: {
    flex: 1,
    width: '100%',
  },
  mainColumnDesktop: {
    flex: 1,
    width: '65%',
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  sidebarColumn: {
    marginTop: spacing.lg,
    width: '100%',
  },
  sidebarColumnDesktop: {
    marginTop: 0,
    width: '35%',
  },
  smallSpacer: {
    height: spacing.sm,
  },
  spacer: {
    height: spacing.md,
  },
});
