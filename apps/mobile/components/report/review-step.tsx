/**
 * Review Step Component
 * Summary of all form data before submission.
 */

import { View, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { H3, Body, BodySmall, Button, Card, Badge } from '@lomito/ui';
import { colors, spacing } from '@lomito/ui/src/theme/tokens';
import type {
  CaseCategory,
  AnimalType,
  UrgencyLevel,
} from '@lomito/shared/types';

interface ReportFormData {
  category: CaseCategory | null;
  animalType: AnimalType | null;
  location: { latitude: number; longitude: number } | null;
  description: string;
  urgency: UrgencyLevel;
}

interface ReviewStepProps {
  data: ReportFormData;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function ReviewStep({
  data,
  onEdit,
  onSubmit,
  loading,
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
          <BodySmall color={colors.neutral500}>
            {data.location.latitude.toFixed(5)},{' '}
            {data.location.longitude.toFixed(5)}
          </BodySmall>
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
      </Card>

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
  description: {
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
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submitButton: {
    marginTop: spacing.lg,
  },
  urgencyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
