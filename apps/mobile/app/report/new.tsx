/**
 * New Report Screen
 * Multi-step form for creating a new case report.
 */

import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { H1, Body, Button, TextInput } from '@lomito/ui';
import { colors, spacing } from '@lomito/ui/src/theme/tokens';
import type { CaseCategory, AnimalType, UrgencyLevel } from '@lomito/shared/types';
import { CategoryPicker } from '../../components/report/category-picker';
import { AnimalTypePicker } from '../../components/report/animal-type-picker';
import { UrgencyPicker } from '../../components/report/urgency-picker';
import { LocationPicker } from '../../components/report/location-picker';
import { ReviewStep } from '../../components/report/review-step';
import { useCreateCase } from '../../hooks/use-create-case';

interface ReportFormData {
  category: CaseCategory | null;
  animalType: AnimalType | null;
  location: { latitude: number; longitude: number } | null;
  description: string;
  urgency: UrgencyLevel;
}

export default function NewReportScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { createCase, loading } = useCreateCase();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ReportFormData>({
    category: null,
    animalType: null,
    location: null,
    description: '',
    urgency: 'medium',
  });

  const stepTitles = [
    t('report.step1Title'),
    t('report.step2Title'),
    t('report.step3Title'),
    t('report.step4Title'),
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
    if (currentStep < 3 && canProceedFromStep(currentStep)) {
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
      await createCase({
        category: formData.category,
        animal_type: formData.animalType,
        description: formData.description,
        location: formData.location,
        urgency: formData.urgency,
      });

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
              <Body style={styles.sectionLabel}>{t('report.selectCategory')}</Body>
              <CategoryPicker
                selected={formData.category}
                onSelect={(category) => setFormData({ ...formData, category })}
              />
            </View>

            <View style={styles.section}>
              <Body style={styles.sectionLabel}>{t('report.selectAnimalType')}</Body>
              <AnimalTypePicker
                selected={formData.animalType}
                onSelect={(animalType) => setFormData({ ...formData, animalType })}
              />
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContentMap}>
            <Body style={styles.mapInstruction}>{t('report.dropPin')}</Body>
            <LocationPicker
              location={formData.location}
              onLocationChange={(location) => setFormData({ ...formData, location })}
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <View style={styles.section}>
              <TextInput
                label={t('report.description')}
                value={formData.description}
                onChangeText={(description) => setFormData({ ...formData, description })}
                placeholder={t('report.descriptionPlaceholder')}
                accessibilityLabel={t('report.description')}
                multiline
                numberOfLines={6}
                style={styles.textArea}
              />
            </View>

            <View style={styles.section}>
              <Body style={styles.sectionLabel}>{t('report.selectUrgency')}</Body>
              <UrgencyPicker
                selected={formData.urgency}
                onSelect={(urgency) => setFormData({ ...formData, urgency })}
              />
            </View>
          </View>
        );

      case 3:
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
            <Body color={colors.primary}>{t('common.back')}</Body>
          </Pressable>
          <Body color={colors.neutral500}>
            {currentStep + 1} / 4
          </Body>
        </View>
        <H1 style={styles.title}>{stepTitles[currentStep]}</H1>

        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          {[0, 1, 2, 3].map((step) => (
            <View
              key={step}
              style={[
                styles.stepDot,
                step === currentStep && styles.stepDotActive,
                step < currentStep && styles.stepDotCompleted,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Step Content */}
      {currentStep === 1 ? (
        // Map step needs full height
        <View style={styles.contentMap}>
          {renderStep()}
        </View>
      ) : (
        // Other steps use scrollview
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {renderStep()}
        </ScrollView>
      )}

      {/* Navigation Buttons (except on review step) */}
      {currentStep < 3 && (
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
  stepContent: {
    padding: spacing.md,
  },
  stepContentMap: {
    flex: 1,
  },
  stepDot: {
    backgroundColor: colors.neutral200,
    borderRadius: 4,
    flex: 1,
    height: 4,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepDotCompleted: {
    backgroundColor: colors.secondary,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  textArea: {
    height: 120,
  },
  title: {
    marginTop: spacing.xs,
  },
});
