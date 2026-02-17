/**
 * New Report Screen
 * Multi-step form for creating a new case report.
 */

import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { H2, Body, Button, TextInput } from '@lomito/ui';
import { colors, spacing } from '@lomito/ui/src/theme/tokens';
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
import { useCreateCase } from '../../hooks/use-create-case';
import { useAnalytics } from '../../hooks/use-analytics';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { uploadCaseImages } from '../../lib/image-upload';

interface ReportFormData {
  category: CaseCategory | null;
  animalType: AnimalType | null;
  location: { latitude: number; longitude: number } | null;
  locationNotes: string;
  description: string;
  urgency: UrgencyLevel;
  photos: string[];
}

export default function NewReportScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { createCase, loading } = useCreateCase();
  const { trackEvent } = useAnalytics();
  const { isDesktop } = useBreakpoint();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ReportFormData>({
    category: null,
    animalType: null,
    location: null,
    locationNotes: '',
    description: '',
    urgency: 'medium',
    photos: [],
  });

  const scrollViewRef = useRef<ScrollView>(null);

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

  const handleSubmit = async () => {
    if (!formData.category || !formData.animalType || !formData.location) {
      return;
    }

    try {
      const newCaseId = await createCase({
        category: formData.category,
        animal_type: formData.animalType,
        description: formData.description,
        location: formData.location,
        urgency: formData.urgency,
      });

      // Upload photos if any were added
      if (formData.photos.length > 0) {
        await uploadCaseImages(newCaseId, formData.photos);
      }

      trackEvent('report_submit');

      // Navigate back to the map
      router.back();
    } catch (error) {
      // Error handling is done in the hook
      console.error('Failed to create case:', error);
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
          <View style={styles.stepContent}>
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
                numberOfLines={9}
                style={styles.textArea}
              />
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
          />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable
            onPress={handleBack}
            accessibilityLabel={t('common.back')}
            accessibilityRole="button"
          >
            <Body color={colors.secondary}>{t('common.back')}</Body>
          </Pressable>
        </View>
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
              <Button
                variant="primary"
                onPress={handleNext}
                disabled={!canProceedFromStep(currentStep)}
                accessibilityLabel={t('common.next')}
              >
                {t('common.next')}
              </Button>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  footer: {
    backgroundColor: colors.white,
    borderTopColor: colors.neutral200,
    borderTopWidth: 1,
    padding: spacing.md,
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
  headerTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
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
  stepContentMap: {
    flex: 1,
  },
  textArea: {
    height: 180,
  },
  title: {
    marginTop: spacing.xs,
  },
});
