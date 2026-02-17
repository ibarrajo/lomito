/**
 * New Report Screen
 * Multi-step form for creating a new case report.
 */

import { View, StyleSheet, ScrollView } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { H2, Body, Button, TextInput, Caption } from '@lomito/ui';
import { colors, spacing, borderRadius } from '@lomito/ui/src/theme/tokens';
import { accessToken } from '../../lib/mapbox';
import type {
  CaseCategory,
  AnimalType,
  UrgencyLevel,
} from '@lomito/shared/types';
import { CategoryPicker } from '../../components/report/category-picker';
import { AnimalTypePicker } from '../../components/report/animal-type-picker';
import { UrgencyPicker } from '../../components/report/urgency-picker';
import { LocationPicker } from '../../components/report/location-picker';
import { PhotoPicker } from '../../components/report/photo-picker';
import { ReviewStep } from '../../components/report/review-step';
import { ReportSidebar } from '../../components/report/report-sidebar';
import { StepProgressBar } from '../../components/report/step-progress-bar';
import { IncidentTimePicker } from '../../components/report/incident-time-picker';
import { useCreateCase } from '../../hooks/use-create-case';
import { useAnalytics } from '../../hooks/use-analytics';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { uploadCaseImages } from '../../lib/image-upload';
import { supabase } from '../../lib/supabase';

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

export default function NewReportScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { createCase, loading, error } = useCreateCase();
  const { trackEvent } = useAnalytics();
  const { isDesktop } = useBreakpoint();

  const [currentStep, setCurrentStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [followUp, setFollowUp] = useState(true);
  const [formData, setFormData] = useState<ReportFormData>({
    category: null,
    animalType: null,
    location: null,
    locationNotes: '',
    description: '',
    urgency: 'medium',
    photos: [],
    incidentAt: null,
  });

  const scrollViewRef = useRef<ScrollView>(null);

  // Sync hook error into local submitError state so ReviewStep can display it
  useEffect(() => {
    if (error !== null) {
      setSubmitError(error);
    }
  }, [error]);

  // Auto-scroll to animal type picker when category is selected
  useEffect(() => {
    if (currentStep === 0 && formData.category !== null) {
      // Delay to allow the AnimalTypePicker to render
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [formData.category, currentStep]);

  const stepTitles = [
    t('report.step1Title'),
    t('report.step2Title'),
    t('report.step3Title'),
    t('report.step5Title'),
    t('report.step4Title'),
  ];

  const stepNames = [
    t('report.stepName1'),
    t('report.stepName2'),
    t('report.stepName3'),
    t('report.stepName4'),
    t('report.stepName5'),
  ];

  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return formData.category !== null && formData.animalType !== null;
      case 1:
        return formData.location !== null;
      case 2:
        return formData.description.trim().length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 4 && canProceedFromStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const resolveSubmitErrorMessage = (err: unknown): string => {
    if (err instanceof Error && err.message === 'AUTH_REQUIRED') {
      return t('report.submitAuthError');
    }
    return t('report.submitUnknownError');
  };

  const handleSubmit = async () => {
    if (!formData.category || !formData.animalType || !formData.location) {
      return;
    }

    // Clear any previous submit error before trying again
    setSubmitError(null);

    try {
      const newCaseId = await createCase({
        category: formData.category,
        animal_type: formData.animalType,
        description: formData.description,
        location: formData.location,
        location_notes: formData.locationNotes || undefined,
        urgency: formData.urgency,
        incident_at: formData.incidentAt || undefined,
      });

      // Upload photos if any were added
      if (formData.photos.length > 0) {
        await uploadCaseImages(newCaseId, formData.photos);
      }

      // Subscribe user to case follow-up updates if opted in.
      // The DB trigger may already auto-subscribe the reporter, so use upsert.
      // Wrap in try-catch: if the subscription already exists and the UPDATE
      // policy is missing (e.g. before migration runs), the error is non-critical
      // because the subscription is already in place.
      if (followUp) {
        try {
          const {
            data: { user: currentUser },
          } = await supabase.auth.getUser();
          if (currentUser) {
            await supabase
              .from('case_subscriptions')
              .upsert(
                { user_id: currentUser.id, case_id: newCaseId } as never,
                { onConflict: 'user_id,case_id' },
              );
          }
        } catch {
          // Subscription already exists (created by DB trigger). Non-critical.
        }
      }

      trackEvent('report_submit');

      // Navigate back to the map
      router.back();
    } catch (err) {
      const message = resolveSubmitErrorMessage(err);
      setSubmitError(message);
    }
  };

  const handleEdit = (step: number) => {
    setCurrentStep(step);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <View style={styles.section}>
              <Body style={styles.sectionLabel}>
                {t('report.selectCategory')}
              </Body>
              <CategoryPicker
                selected={formData.category}
                onSelect={(category) => setFormData({ ...formData, category })}
              />
            </View>

            {formData.category !== null && (
              <View style={styles.section}>
                <Body style={styles.sectionLabel}>
                  {t('report.selectAnimalType')}
                </Body>
                <AnimalTypePicker
                  selected={formData.animalType}
                  onSelect={(animalType) =>
                    setFormData({ ...formData, animalType })
                  }
                />
              </View>
            )}
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContentMap}>
            <Body style={styles.mapInstruction}>{t('report.dropPin')}</Body>
            <LocationPicker
              location={formData.location}
              onLocationChange={(location) =>
                setFormData({ ...formData, location })
              }
            />
            <View style={styles.locationNotesStrip}>
              <TextInput
                label={t('report.locationNotes')}
                value={formData.locationNotes}
                onChangeText={(locationNotes) =>
                  setFormData({ ...formData, locationNotes })
                }
                placeholder={t('report.locationNotesPlaceholder')}
                accessibilityLabel={t('report.locationNotes')}
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View
            style={[styles.stepContent, isDesktop && styles.stepContentDesktop]}
          >
            <View style={isDesktop ? styles.detailsFormDesktop : undefined}>
              <View style={styles.section}>
                <IncidentTimePicker
                  value={formData.incidentAt}
                  onChange={(incidentAt) =>
                    setFormData({ ...formData, incidentAt })
                  }
                />
              </View>

              <View style={styles.section}>
                <TextInput
                  label={t('report.description')}
                  value={formData.description}
                  onChangeText={(description) =>
                    setFormData({ ...formData, description })
                  }
                  placeholder={t('report.descriptionPlaceholder')}
                  accessibilityLabel={t('report.description')}
                  multiline
                  numberOfLines={12}
                  style={styles.textArea}
                  textAlignVertical="top"
                />
                <Caption color={colors.neutral500} style={styles.charCount}>
                  {formData.description.length} / 2000
                </Caption>
              </View>

              <View style={styles.section}>
                <Body style={styles.sectionLabel}>
                  {t('report.selectUrgency')}
                </Body>
                <UrgencyPicker
                  selected={formData.urgency}
                  onSelect={(urgency) => setFormData({ ...formData, urgency })}
                />
              </View>
            </View>

            {/* Desktop mini-map for location reference */}
            {isDesktop && formData.location && (
              <View style={styles.miniMapContainer}>
                <Caption color={colors.neutral500} style={styles.miniMapLabel}>
                  {t('report.locationReference')}
                </Caption>
                <Image
                  source={{
                    uri: `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+13ECC8(${formData.location.longitude},${formData.location.latitude})/${formData.location.longitude},${formData.location.latitude},15/300x300@2x?access_token=${accessToken}`,
                  }}
                  style={styles.miniMap}
                  contentFit="cover"
                  accessibilityLabel={t('report.staticMapAlt')}
                />
                {formData.locationNotes.length > 0 && (
                  <Caption
                    color={colors.neutral700}
                    style={styles.miniMapNotes}
                  >
                    {formData.locationNotes}
                  </Caption>
                )}
              </View>
            )}
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <PhotoPicker
              onImagesChange={(photos) => setFormData({ ...formData, photos })}
              onSkip={handleNext}
            />
          </View>
        );

      case 4:
        return (
          <ReviewStep
            data={formData}
            onEdit={handleEdit}
            onSubmit={handleSubmit}
            loading={loading}
            error={submitError}
            followUp={followUp}
            onFollowUpChange={setFollowUp}
          />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <StepProgressBar
          steps={stepNames}
          currentStep={currentStep}
          onStepPress={(step) => setCurrentStep(step)}
        />
        <H2 style={styles.title}>{stepTitles[currentStep]}</H2>
      </View>

      {/* Main Content Area - Desktop layout with sidebar */}
      <View style={styles.mainContent}>
        {/* Desktop Sidebar */}
        {isDesktop && (
          <View style={styles.sidebarContainer}>
            <ReportSidebar />
          </View>
        )}

        {/* Form Content */}
        <View style={[styles.formContainer, isDesktop && styles.formDesktop]}>
          {currentStep === 1 ? (
            // Map step needs full height
            <View style={styles.contentMap}>{renderStep()}</View>
          ) : (
            // Other steps use scrollview
            <ScrollView
              ref={scrollViewRef}
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
            >
              {renderStep()}
            </ScrollView>
          )}

          {/* Navigation Buttons (except on review step) */}
          {currentStep < 4 && (
            <View style={styles.footer}>
              <View style={styles.footerButtons}>
                {currentStep > 0 && (
                  <Button
                    variant="secondary"
                    onPress={handleBack}
                    accessibilityLabel={t('common.back')}
                    style={styles.footerButtonBack}
                  >
                    {t('common.back')}
                  </Button>
                )}
                <Button
                  variant="primary"
                  onPress={handleNext}
                  disabled={!canProceedFromStep(currentStep)}
                  accessibilityLabel={t('common.next')}
                  style={styles.footerButtonNext}
                >
                  {t('common.next')}
                </Button>
              </View>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  charCount: {
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xl,
  },
  contentMap: {
    flex: 1,
  },
  detailsFormDesktop: {
    flex: 3,
  },
  footer: {
    backgroundColor: colors.white,
    borderTopColor: colors.neutral200,
    borderTopWidth: 1,
    padding: spacing.md,
  },
  footerButtonBack: {
    flex: 1,
  },
  footerButtonNext: {
    flex: 2,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  formContainer: {
    flex: 1,
  },
  formDesktop: {
    flex: 8,
  },
  header: {
    backgroundColor: colors.white,
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  locationNotesStrip: {
    backgroundColor: colors.white,
    borderTopColor: colors.neutral200,
    borderTopWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  mapInstruction: {
    backgroundColor: colors.white,
    padding: spacing.md,
    textAlign: 'center',
  },
  miniMap: {
    aspectRatio: 1,
    borderRadius: borderRadius.card,
    width: '100%',
  },
  miniMapContainer: {
    flex: 2,
    maxWidth: 350,
  },
  miniMapLabel: {
    marginBottom: spacing.sm,
  },
  miniMapNotes: {
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    marginBottom: spacing.md,
  },
  sidebarContainer: {
    flex: 4,
    paddingTop: spacing.lg,
  },
  stepContent: {
    padding: spacing.md,
  },
  stepContentDesktop: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  stepContentMap: {
    flex: 1,
  },
  textArea: {
    height: 240,
    textAlignVertical: 'top',
  },
  title: {
    marginTop: spacing.xs,
  },
});
