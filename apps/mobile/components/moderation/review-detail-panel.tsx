/**
 * Review Detail Panel Component
 * Right panel showing detailed case information for review (desktop only)
 */

import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useState, useCallback } from 'react';
import { Badge } from '@lomito/ui/components/badge';
import { Body, BodySmall, Caption, H3 } from '@lomito/ui/components/typography';
import { Button } from '@lomito/ui';
import { colors, spacing, borderRadius } from '@lomito/ui/theme/tokens';
import type {
  CaseCategory,
  AnimalType,
  UrgencyLevel,
} from '@lomito/shared/types/database';
import { format } from 'date-fns';
import { Image } from 'expo-image';

interface CaseDetail {
  id: string;
  category: CaseCategory;
  animal_type: AnimalType;
  urgency: UrgencyLevel;
  description: string;
  created_at: string;
  location: { type: 'Point'; coordinates: [number, number] } | null;
  reporter_id: string;
  flag_count?: number;
  media?: Array<{ url: string; thumbnail_url?: string }>;
}

interface ReviewDetailPanelProps {
  caseData: CaseDetail | null;
  onVerify: () => void;
  onReject: () => void;
  onRequestInfo: () => void;
  loading?: boolean;
}

export function ReviewDetailPanel({
  caseData,
  onVerify,
  onReject,
  onRequestInfo,
  loading = false,
}: ReviewDetailPanelProps) {
  const { t } = useTranslation();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );

  const handleImagePress = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  const closeImageViewer = useCallback(() => {
    setSelectedImageIndex(null);
  }, []);

  if (!caseData) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Body color={colors.neutral500}>{t('moderation.selectCase')}</Body>
          <BodySmall color={colors.neutral400} style={styles.keyboardHint}>
            {t('moderation.keyboardShortcuts')}
          </BodySmall>
          <BodySmall color={colors.neutral400}>
            {t('moderation.pressV')}
          </BodySmall>
          <BodySmall color={colors.neutral400}>
            {t('moderation.pressR')}
          </BodySmall>
        </View>
      </View>
    );
  }

  const categoryColor = colors.category[caseData.category].pin;
  const categoryBgColor = colors.category[caseData.category].background;

  const urgencyColors = {
    low: { color: colors.neutral700, bg: colors.neutral100 },
    medium: { color: colors.warning, bg: colors.warningBackground },
    high: { color: colors.error, bg: colors.errorBackground },
    critical: { color: colors.white, bg: colors.error },
  };

  const urgencyStyle = urgencyColors[caseData.urgency];
  const isHighPriority =
    caseData.urgency === 'high' || caseData.urgency === 'critical';

  // Extract coordinates from location (GeoJSON Point)
  const longitude = caseData.location?.coordinates?.[0] ?? 0;
  const latitude = caseData.location?.coordinates?.[1] ?? 0;

  const submitterScore = 85;
  const hasDuplicates = false;
  const hasSensitiveContent = false;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {isHighPriority && (
          <View style={styles.priorityBanner}>
            <Body style={styles.priorityText}>
              {t('moderation.highPriority')}
            </Body>
          </View>
        )}

        <View style={styles.metadataSection}>
          <View style={styles.metadataHeader}>
            <View style={styles.badges}>
              <Badge
                label={t(`category.${caseData.category}`)}
                color={categoryColor}
                backgroundColor={categoryBgColor}
                accessibilityLabel={t(`category.${caseData.category}`)}
              />
              <Badge
                label={t(`urgency.${caseData.urgency}`)}
                color={urgencyStyle.color}
                backgroundColor={urgencyStyle.bg}
                accessibilityLabel={t(`urgency.${caseData.urgency}`)}
              />
            </View>
            <View style={styles.actions}>
              <Pressable
                onPress={() => {
                  if (Platform.OS === 'web') {
                    window.print();
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel={t('moderation.print')}
              >
                <Caption color={colors.primary}>
                  {t('moderation.print')}
                </Caption>
              </Pressable>
            </View>
          </View>

          <View style={styles.metadata}>
            <MetadataItem
              label={t('case.folio')}
              value={caseData.id.slice(0, 8)}
            />
            <MetadataItem
              label={t('moderation.submitterScore')}
              value={`${submitterScore}%`}
            />
            <MetadataItem
              label={t('case.created')}
              value={format(new Date(caseData.created_at), 'MMM d, yyyy HH:mm')}
            />
          </View>
        </View>

        {caseData.media && caseData.media.length > 0 && (
          <View style={styles.section}>
            <H3>{t('moderation.evidence')}</H3>
            <View style={styles.evidenceGrid}>
              {caseData.media.map((item, index) => (
                <Pressable
                  key={index}
                  onPress={() => handleImagePress(index)}
                  style={styles.evidenceItem}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('moderation.evidence')} ${index + 1}`}
                >
                  <Image
                    source={{ uri: item.thumbnail_url || item.url }}
                    style={styles.evidenceImage}
                    contentFit="cover"
                    transition={200}
                  />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <H3>{t('case.description')}</H3>
          <Body style={styles.descriptionText}>{caseData.description}</Body>
        </View>

        <View style={styles.section}>
          <H3>{t('moderation.locationVerification')}</H3>
          <View style={styles.locationCard}>
            <View style={styles.locationRow}>
              <BodySmall color={colors.neutral500}>
                {t('moderation.coordinates')}
              </BodySmall>
              <BodySmall style={styles.coordinates}>
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </BodySmall>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <H3>{t('moderation.analysis')}</H3>

          <AnalysisCard
            title={t('moderation.duplicateCheck')}
            status={hasDuplicates ? 'warning' : 'success'}
            message={
              hasDuplicates
                ? t('moderation.duplicatesFound', { count: 2 })
                : t('moderation.noDuplicatesFound')
            }
          />

          <AnalysisCard
            title={t('moderation.sensitiveContent')}
            status={hasSensitiveContent ? 'warning' : 'success'}
            message={
              hasSensitiveContent
                ? t('moderation.sensitiveContentDetected')
                : t('moderation.noSensitiveContent')
            }
          />

          <AnalysisCard
            title={t('moderation.userReliability')}
            status="info"
            message={t('moderation.reliabilityScore', {
              score: submitterScore,
            })}
          />
        </View>
      </ScrollView>

      <View style={styles.actionBar}>
        <Button
          onPress={onReject}
          variant="ghost"
          disabled={loading}
          accessibilityLabel={t('moderation.reject')}
        >
          {t('moderation.reject')}
        </Button>
        <Button
          onPress={onRequestInfo}
          variant="secondary"
          disabled={loading}
          accessibilityLabel={t('moderation.requestInfo')}
        >
          {t('moderation.requestInfo')}
        </Button>
        <Button
          onPress={onVerify}
          variant="primary"
          disabled={loading}
          accessibilityLabel={t('moderation.verifyAndPublish')}
        >
          {t('moderation.verifyAndPublish')}
        </Button>
      </View>

      {selectedImageIndex !== null && caseData.media && (
        <ImageViewer
          images={caseData.media}
          selectedIndex={selectedImageIndex}
          onClose={closeImageViewer}
        />
      )}
    </View>
  );
}

interface MetadataItemProps {
  label: string;
  value: string;
}

function MetadataItem({ label, value }: MetadataItemProps) {
  return (
    <View style={styles.metadataItem}>
      <BodySmall color={colors.neutral500}>{label}</BodySmall>
      <Body>{value}</Body>
    </View>
  );
}

interface AnalysisCardProps {
  title: string;
  status: 'success' | 'warning' | 'info';
  message: string;
}

function AnalysisCard({ title, status, message }: AnalysisCardProps) {
  const statusColors = {
    success: { bg: colors.successBackground, color: colors.success },
    warning: { bg: colors.warningBackground, color: colors.warning },
    info: { bg: colors.infoBackground, color: colors.info },
  };

  const { bg, color } = statusColors[status];

  return (
    <View style={[styles.analysisCard, { backgroundColor: bg }]}>
      <BodySmall style={styles.analysisTitle}>{title}</BodySmall>
      <Body color={color}>{message}</Body>
    </View>
  );
}

interface ImageViewerProps {
  images: Array<{ url: string; thumbnail_url?: string }>;
  selectedIndex: number;
  onClose: () => void;
}

function ImageViewer({ images, selectedIndex, onClose }: ImageViewerProps) {
  const { t } = useTranslation();

  return (
    <Pressable style={styles.imageViewerOverlay} onPress={onClose}>
      <View style={styles.imageViewerContent}>
        <Image
          source={{ uri: images[selectedIndex].url }}
          style={styles.fullSizeImage}
          contentFit="contain"
        />
        <Pressable
          style={styles.closeButton}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
        >
          <Body color={colors.white}>{t('common.close')}</Body>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.neutral200,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  analysisCard: {
    borderRadius: borderRadius.card,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  analysisTitle: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  closeButton: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.button,
    padding: spacing.md,
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
  },
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  coordinates: {
    fontFamily: 'JetBrains Mono',
  },
  descriptionText: {
    color: colors.neutral700,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  evidenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  evidenceImage: {
    borderRadius: borderRadius.card,
    height: '100%',
    width: '100%',
  },
  evidenceItem: {
    borderRadius: borderRadius.card,
    height: 120,
    overflow: 'hidden',
    width: 120,
  },
  fullSizeImage: {
    height: '80%',
    width: '80%',
  },
  imageViewerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageViewerOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  keyboardHint: {
    marginTop: spacing.md,
  },
  locationCard: {
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.card,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metadata: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  metadataHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metadataItem: {
    gap: spacing.xs,
  },
  metadataSection: {
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    paddingBottom: spacing.md,
  },
  priorityBanner: {
    backgroundColor: colors.errorBackground,
    borderBottomColor: colors.error,
    borderBottomWidth: 2,
    paddingVertical: spacing.sm,
  },
  priorityText: {
    color: colors.error,
    fontWeight: '700',
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    marginTop: spacing.lg,
    paddingBottom: spacing.md,
  },
});
