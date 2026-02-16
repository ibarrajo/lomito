/**
 * Case Detail Panel Component
 * Right-side panel showing case details with assignment, evidence, and status update
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { H3, Body, Caption } from '@lomito/ui/components/typography';
import { Badge } from '@lomito/ui/components/badge';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadowStyles,
} from '@lomito/ui/theme/tokens';
import type {
  CaseCategory,
  AnimalType,
  UrgencyLevel,
  CaseStatus,
} from '@lomito/shared/types/database';
import { format, differenceInDays } from 'date-fns';

interface CaseDetailPanelProps {
  caseId: string;
  category: CaseCategory;
  animalType: AnimalType;
  urgency: UrgencyLevel;
  status: CaseStatus;
  description: string;
  folio: string | null;
  escalatedAt: string | null;
  governmentResponseAt: string | null;
  createdAt: string;
  location: { type: 'Point'; coordinates: [number, number] } | null;
  onAssignFolio: (caseId: string) => void;
  onPostResponse: (caseId: string) => void;
  onUpdateStatus: (caseId: string) => void;
  onClose: () => void;
}

export function CaseDetailPanel({
  caseId,
  category,
  animalType,
  urgency,
  status,
  description,
  folio,
  escalatedAt,
  createdAt,
  location,
  onAssignFolio,
  onPostResponse,
  onUpdateStatus,
  onClose,
}: CaseDetailPanelProps) {
  const { t } = useTranslation();
  const [assignment, setAssignment] = useState('');

  const categoryColor = colors.category[category].pin;
  const categoryBgColor = colors.category[category].background;

  const urgencyColors = {
    low: { color: colors.neutral700, bg: colors.neutral100 },
    medium: { color: colors.warning, bg: colors.warningBackground },
    high: { color: colors.error, bg: colors.errorBackground },
    critical: { color: colors.white, bg: colors.error },
  };

  const urgencyStyle = urgencyColors[urgency];

  function getDaysAgo(date: string): number {
    return differenceInDays(new Date(), new Date(date));
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header with close button */}
        <View style={styles.header}>
          <H3>{t('case.details')}</H3>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
          >
            <Text style={styles.closeButton}>✕</Text>
          </Pressable>
        </View>

        {/* Case ID and Badges */}
        <View style={styles.section}>
          <Caption style={styles.caseId}>
            {folio || t('government.noFolio')}
          </Caption>
          <View style={styles.badges}>
            <Badge
              label={t(`category.${category}`)}
              color={categoryColor}
              backgroundColor={categoryBgColor}
              accessibilityLabel={t(`category.${category}`)}
            />
            <Badge
              label={t(`urgency.${urgency}`)}
              color={urgencyStyle.color}
              backgroundColor={urgencyStyle.bg}
              accessibilityLabel={t(`urgency.${urgency}`)}
            />
          </View>
        </View>

        {/* Animal type and description */}
        <View style={styles.section}>
          <Text style={styles.animalType}>{t(`animal.${animalType}`)}</Text>
          <Body style={styles.description}>{description}</Body>
        </View>

        {/* Metadata */}
        <View style={styles.section}>
          <View style={styles.metaRow}>
            <Caption style={styles.metaLabel}>{t('case.created')}:</Caption>
            <Caption style={styles.metaValue}>
              {format(new Date(createdAt), 'dd/MM/yyyy HH:mm')}
            </Caption>
          </View>
          {escalatedAt && (
            <View style={styles.metaRow}>
              <Caption style={styles.metaLabel}>
                {t('government.escalated')}:
              </Caption>
              <Caption style={styles.metaValue}>
                {t('government.escalatedDaysAgo', {
                  count: getDaysAgo(escalatedAt),
                })}
              </Caption>
            </View>
          )}
          <View style={styles.metaRow}>
            <Caption style={styles.metaLabel}>{t('case.location')}:</Caption>
            <Caption style={styles.metaValue}>
              {location?.coordinates?.[1]?.toFixed(5) ?? '0.00000'},{' '}
              {location?.coordinates?.[0]?.toFixed(5) ?? '0.00000'}
            </Caption>
          </View>
        </View>

        {/* Section 1: Assign Responsibility */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>
            1. {t('government.assignResponsibility')}
          </Text>
          <TextInput
            style={styles.input}
            value={assignment}
            onChangeText={setAssignment}
            placeholder={t('government.assignmentPlaceholder')}
            placeholderTextColor={colors.neutral400}
            accessibilityLabel={t('government.assignmentPlaceholder')}
          />
        </View>

        {/* Section 2: Evidence Upload */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>
            2. {t('government.uploadEvidence')}
          </Text>
          <Pressable
            style={styles.uploadButton}
            onPress={() => {
              // Placeholder for file upload
            }}
            accessibilityRole="button"
            accessibilityLabel={t('government.uploadEvidence')}
          >
            <Text style={styles.uploadButtonText}>
              {t('government.selectFile')}
            </Text>
            <Caption style={styles.uploadHint}>
              {t('government.fileHint')}
            </Caption>
          </Pressable>
        </View>

        {/* Section 3: Status Update */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>
            3. {t('government.updateStatus')}
          </Text>
          <Pressable
            style={styles.radioOption}
            onPress={() => onUpdateStatus(caseId)}
            accessibilityRole="radio"
            accessibilityLabel={t('status.in_progress')}
          >
            <View style={styles.radio}>
              <View
                style={[
                  styles.radioInner,
                  status === 'in_progress' && styles.radioInnerSelected,
                ]}
              />
            </View>
            <Text style={styles.radioLabel}>{t('status.in_progress')}</Text>
          </Pressable>
          <Pressable
            style={styles.radioOption}
            onPress={() => onUpdateStatus(caseId)}
            accessibilityRole="radio"
            accessibilityLabel={t('status.resolved')}
          >
            <View style={styles.radio}>
              <View
                style={[
                  styles.radioInner,
                  status === 'resolved' && styles.radioInnerSelected,
                ]}
              />
            </View>
            <Text style={styles.radioLabel}>{t('status.resolved')}</Text>
          </Pressable>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, styles.folioButton]}
            onPress={() => onAssignFolio(caseId)}
            accessibilityRole="button"
            accessibilityLabel={t('government.assignFolio')}
          >
            <Text style={[styles.actionButtonText, styles.folioButtonText]}>
              {t('government.assignFolio')}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.responseButton]}
            onPress={() => onPostResponse(caseId)}
            accessibilityRole="button"
            accessibilityLabel={t('government.postResponse')}
          >
            <Text style={[styles.actionButtonText, styles.responseButtonText]}>
              {t('government.postResponse')}
            </Text>
          </Pressable>
        </View>

        {/* Activity Timeline Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('case.timeline')}</Text>
          <Caption style={styles.timelinePlaceholder}>
            {t('case.noTimeline')}
          </Caption>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: borderRadius.button,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  actionButtonText: {
    fontFamily: typography.button.fontFamily,
    fontSize: typography.small.fontSize,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  animalType: {
    color: colors.neutral900,
    fontFamily: typography.h3.fontFamily,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    lineHeight: typography.h3.fontSize * typography.h3.lineHeight,
    marginBottom: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  caseId: {
    color: colors.neutral700,
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
  },
  closeButton: {
    color: colors.neutral500,
    fontSize: 24,
  },
  container: {
    backgroundColor: colors.white,
    borderLeftColor: colors.neutral200,
    borderLeftWidth: 1,
    flex: 1,
    maxWidth: 400,
    minWidth: 350,
    ...shadowStyles.card,
  },
  content: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  description: {
    color: colors.neutral700,
  },
  folioButton: {
    backgroundColor: colors.primaryLight,
  },
  folioButtonText: {
    color: colors.secondary,
  },
  formSection: {
    marginTop: spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.input,
    borderWidth: 1,
    color: colors.neutral900,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  metaLabel: {
    color: colors.neutral500,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  metaValue: {
    color: colors.neutral700,
    flex: 2,
    fontWeight: '600',
  },
  radio: {
    alignItems: 'center',
    borderColor: colors.neutral400,
    borderRadius: borderRadius.pill,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 20,
  },
  radioInner: {
    borderRadius: borderRadius.pill,
    height: 10,
    width: 10,
  },
  radioInnerSelected: {
    backgroundColor: colors.primary,
  },
  radioLabel: {
    color: colors.neutral700,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
  },
  radioOption: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  responseButton: {
    backgroundColor: colors.secondary,
  },
  responseButtonText: {
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.secondary,
    fontFamily: typography.h3.fontFamily,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  timelinePlaceholder: {
    color: colors.neutral500,
    fontStyle: 'italic',
  },
  uploadButton: {
    alignItems: 'center',
    backgroundColor: colors.neutral100,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.input,
    borderStyle: 'dashed',
    borderWidth: 2,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  uploadButtonText: {
    color: colors.secondary,
    fontFamily: typography.button.fontFamily,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  uploadHint: {
    color: colors.neutral500,
    marginTop: spacing.xs,
  },
});
