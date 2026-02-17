/**
 * Review Step Component
 * Summary of all form data before submission.
 */

import {
  View,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Switch,
} from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { H3, Body, BodySmall, Caption, Button, Card, Badge } from '@lomito/ui';
import { colors, spacing, borderRadius } from '@lomito/ui/src/theme/tokens';
import { accessToken } from '../../lib/mapbox';
import type {
  CaseCategory,
  AnimalType,
  UrgencyLevel,
} from '@lomito/shared/types';

interface ReportFormData {
  category: CaseCategory | null;
  animalType: AnimalType | null;
  location: { latitude: number; longitude: number } | null;
  locationNotes: string;
  description: string;
  urgency: UrgencyLevel;
  photos: string[];
  incidentAt: string | null;
}

interface ReviewStepProps {
  data: ReportFormData;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  followUp: boolean;
  onFollowUpChange: (value: boolean) => void;
}

export function ReviewStep({
  data,
  onEdit,
  onSubmit,
  loading,
  error,
  followUp,
  onFollowUpChange,
}: ReviewStepProps) {
  const { t } = useTranslation();

  const getCategoryColor = (category: CaseCategory) => {
    const categoryColors: Record<
      CaseCategory,
      { pin: string; background: string }
    > = {
      abuse: { pin: colors.error, background: colors.errorBackground },
      injured: { pin: colors.error, background: colors.errorBackground },
      missing: { pin: colors.info, background: colors.infoBackground },
      stray: { pin: colors.warning, background: colors.warningBackground },
      zoonotic: { pin: '#7C3AED', background: '#F5F3FF' },
      dead_animal: { pin: '#6B7280', background: '#F9FAFB' },
      dangerous_dog: { pin: colors.error, background: colors.errorBackground },
      distress: { pin: colors.warning, background: colors.warningBackground },
      illegal_sales: { pin: '#B91C1C', background: colors.errorBackground },
      wildlife: { pin: colors.success, background: colors.successBackground },
      noise_nuisance: { pin: '#6366F1', background: '#EEF2FF' },
    };
    return categoryColors[category];
  };

  const getUrgencyColor = (urgency: UrgencyLevel) => {
    const urgencyColors: Record<
      UrgencyLevel,
      { color: string; background: string }
    > = {
      low: { color: colors.success, background: colors.successBackground },
      medium: { color: colors.warning, background: colors.warningBackground },
      high: {
        color: colors.category.stray.pin,
        background: colors.category.stray.background,
      },
      critical: { color: colors.error, background: colors.errorBackground },
    };
    return urgencyColors[urgency];
  };

  const buildStaticMapUrl = (lat: number, lng: number) => {
    const pin = `pin-s+13ECC8(${lng},${lat})`;
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${pin}/${lng},${lat},14/400x160@2x?access_token=${accessToken}`;
  };

  const formatIncidentDate = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const incidentDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    if (incidentDay.getTime() === today.getTime()) {
      return t('report.incidentToday');
    }
    if (incidentDay.getTime() === yesterday.getTime()) {
      return t('report.incidentYesterday');
    }
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Category & Animal Type */}
      {data.category && data.animalType && (
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <H3>
              {t('report.category')} & {t('report.animalType')}
            </H3>
            <Pressable
              onPress={() => onEdit(0)}
              accessibilityLabel={t('report.edit')}
              accessibilityRole="button"
            >
              <BodySmall color={colors.primary}>{t('report.edit')}</BodySmall>
            </Pressable>
          </View>
          <View style={styles.badges}>
            <Badge
              label={t(`category.${data.category}`)}
              color={getCategoryColor(data.category).pin}
              backgroundColor={getCategoryColor(data.category).background}
              accessibilityLabel={`${t('report.category')}: ${t(`category.${data.category}`)}`}
            />
            <Badge
              label={t(`animal.${data.animalType}`)}
              color={colors.neutral700}
              backgroundColor={colors.neutral100}
              accessibilityLabel={`${t('report.animalType')}: ${t(`animal.${data.animalType}`)}`}
            />
          </View>
        </Card>
      )}

      {/* Location */}
      {data.location && (
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <H3>{t('report.location')}</H3>
            <Pressable
              onPress={() => onEdit(1)}
              accessibilityLabel={t('report.edit')}
              accessibilityRole="button"
            >
              <BodySmall color={colors.primary}>{t('report.edit')}</BodySmall>
            </Pressable>
          </View>
          <Image
            source={{
              uri: buildStaticMapUrl(
                data.location.latitude,
                data.location.longitude,
              ),
            }}
            style={styles.staticMap}
            contentFit="cover"
            accessibilityLabel={t('report.staticMapAlt')}
          />
          <Caption color={colors.neutral500} style={styles.coordinates}>
            {data.location.latitude.toFixed(5)},{' '}
            {data.location.longitude.toFixed(5)}
          </Caption>
          {data.locationNotes.length > 0 && (
            <Body style={styles.locationNotes}>{data.locationNotes}</Body>
          )}
        </Card>
      )}

      {/* Description & Urgency */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <H3>{t('report.description')}</H3>
          <Pressable
            onPress={() => onEdit(2)}
            accessibilityLabel={t('report.edit')}
            accessibilityRole="button"
          >
            <BodySmall color={colors.primary}>{t('report.edit')}</BodySmall>
          </Pressable>
        </View>
        <Body style={styles.description}>
          {data.description || t('report.descriptionPlaceholder')}
        </Body>
        <View style={styles.urgencyRow}>
          <BodySmall color={colors.neutral500}>
            {t('report.urgency')}:
          </BodySmall>
          <Badge
            label={t(`urgency.${data.urgency}`)}
            color={getUrgencyColor(data.urgency).color}
            backgroundColor={getUrgencyColor(data.urgency).background}
            accessibilityLabel={`${t('report.urgency')}: ${t(`urgency.${data.urgency}`)}`}
          />
        </View>
        {data.incidentAt !== null && (
          <View style={styles.incidentTimeRow}>
            <BodySmall color={colors.neutral500}>
              {t('report.incidentTime')}:
            </BodySmall>
            <BodySmall color={colors.neutral700}>
              {formatIncidentDate(data.incidentAt)}
            </BodySmall>
          </View>
        )}
      </Card>

      {/* Photos */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <H3>{t('report.reviewPhotos')}</H3>
          <Pressable
            onPress={() => onEdit(3)}
            accessibilityLabel={t('report.edit')}
            accessibilityRole="button"
          >
            <BodySmall color={colors.primary}>{t('report.edit')}</BodySmall>
          </Pressable>
        </View>
        {data.photos.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.photoScroll}
          >
            {data.photos.map((uri, index) => (
              <Image
                key={uri}
                source={{ uri }}
                style={styles.photoThumbnail}
                contentFit="cover"
                accessibilityLabel={`${t('report.photos')} ${index + 1}`}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noPhotosContent}>
            <BodySmall color={colors.neutral500} style={styles.noPhotosMessage}>
              {t('report.reviewNoPhotosMessage')}
            </BodySmall>
            <Button
              variant="secondary"
              onPress={() => onEdit(3)}
              accessibilityLabel={t('report.addPhotoToReport')}
              style={styles.addPhotoButton}
            >
              {t('report.addPhotoToReport')}
            </Button>
          </View>
        )}
      </Card>

      {/* Follow-up opt-in */}
      <View style={styles.followUpSection}>
        <View style={styles.followUpRow}>
          <View style={styles.followUpTextContainer}>
            <Body>{t('report.followUpTitle')}</Body>
            <Caption color={colors.neutral500}>
              {t('report.followUpDescription')}
            </Caption>
          </View>
          <Switch
            value={followUp}
            onValueChange={onFollowUpChange}
            trackColor={{ false: colors.neutral200, true: colors.primary }}
            thumbColor={colors.white}
            accessibilityLabel={t('report.followUpTitle')}
          />
        </View>
      </View>

      {/* Submission error banner */}
      {error !== null && (
        <View
          style={styles.errorBanner}
          accessibilityRole="alert"
          accessibilityLabel={error}
        >
          <BodySmall color={colors.error}>{error}</BodySmall>
        </View>
      )}

      {/* Submit Button */}
      <Button
        variant="primary"
        onPress={onSubmit}
        disabled={loading}
        loading={loading}
        accessibilityLabel={t('report.submit')}
        style={styles.submitButton}
      >
        {t('report.submit')}
      </Button>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  addPhotoButton: {
    marginTop: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  container: {
    flex: 1,
    padding: spacing.md,
  },
  coordinates: {
    marginTop: spacing.xs,
  },
  description: {
    marginTop: spacing.sm,
  },
  errorBanner: {
    backgroundColor: colors.errorBackground,
    borderColor: colors.error,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  followUpRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  followUpSection: {
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.card,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  followUpTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  incidentTimeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  loadingOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  locationNotes: {
    marginTop: spacing.xs,
  },
  noPhotosContent: {
    marginTop: spacing.sm,
  },
  noPhotosMessage: {
    marginBottom: spacing.xs,
  },
  photoScroll: {
    marginTop: spacing.sm,
  },
  photoThumbnail: {
    borderRadius: 8,
    height: 80,
    marginRight: spacing.sm,
    width: 80,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  staticMap: {
    borderRadius: 8,
    height: 160,
    marginTop: spacing.sm,
    width: '100%',
  },
  submitButton: {
    marginTop: spacing.md,
  },
  urgencyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
