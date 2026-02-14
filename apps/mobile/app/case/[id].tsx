/**
 * Case Detail Screen
 * Shows full case information including photos, timeline, and map.
 */

import { View, ScrollView, StyleSheet, Pressable, Text } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { H1, Body } from '@lomito/ui/components/typography';
import { colors, spacing } from '@lomito/ui/theme/tokens';
import { Skeleton } from '@lomito/ui/components/skeleton';
import { useCase } from '../../hooks/use-case';
import { useUserProfile } from '../../hooks/use-user-profile';
import { useCaseSubscription } from '../../hooks/use-case-subscription';
import { CaseHeader } from '../../components/case/case-header';
import { PhotoGallery } from '../../components/case/photo-gallery';
import { CaseMap } from '../../components/case/case-map';
import { Timeline } from '../../components/case/timeline';
import { FlagButton } from '../../components/case/flag-button';
import { EscalateButton } from '../../components/case/escalate-button';
import { EscalationStatus } from '../../components/case/escalation-status';

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { caseData, media, timeline, loading, error, refetch } = useCase(id ?? '');
  const { profile } = useUserProfile();
  const { isSubscribed, loading: subscriptionLoading, toggle: toggleSubscription } = useCaseSubscription(id ?? '');

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
            {error || t('common.error')}
          </Body>
        </View>
      </View>
    );
  }

  const [longitude, latitude] = caseData.location.coordinates;

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
              <Pressable
                onPress={handleFollowPress}
                disabled={subscriptionLoading}
                style={styles.followButton}
                accessibilityLabel={isSubscribed ? t('case.unfollow') : t('case.follow')}
                accessibilityRole="button"
              >
                <Text style={styles.followIcon}>
                  {isSubscribed ? '❤️' : '🤍'}
                </Text>
              </Pressable>
              <FlagButton caseId={caseData.id} reporterId={caseData.reporter_id} />
            </View>
          ),
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Case Header */}
        <CaseHeader caseData={caseData} />

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
              escalationReminderCount={caseData.escalation_reminder_count || 0}
              markedUnresponsive={caseData.marked_unresponsive || false}
              governmentResponseAt={caseData.government_response_at}
            />
          </View>
        )}

        {/* Description */}
        {caseData.description && (
          <View style={styles.section}>
            <Body>{caseData.description}</Body>
          </View>
        )}

        {/* Photo Gallery */}
        {media.length > 0 && (
          <View style={styles.section}>
            <H1 style={styles.sectionTitle}>{t('case.photos')}</H1>
            <PhotoGallery media={media} />
          </View>
        )}

        {/* Map */}
        <View style={styles.section}>
          <H1 style={styles.sectionTitle}>{t('report.location')}</H1>
          <View style={styles.mapContainer}>
            <CaseMap
              longitude={longitude}
              latitude={latitude}
              category={caseData.category}
            />
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <H1 style={styles.sectionTitle}>{t('case.timeline')}</H1>
          <Timeline events={timeline} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  escalateSection: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  escalationStatusSection: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
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
  mapContainer: {
    paddingHorizontal: spacing.md,
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
    paddingHorizontal: spacing.md,
  },
  smallSpacer: {
    height: spacing.sm,
  },
  spacer: {
    height: spacing.md,
  },
});
