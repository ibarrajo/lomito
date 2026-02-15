import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Camera, MapPin, Shield } from 'lucide-react-native';
import { H3, Body } from '@lomito/ui/src/components/typography';
import {
  colors,
  spacing,
  borderRadius,
  shadowStyles,
} from '@lomito/ui/src/theme/tokens';
import { useBreakpoint } from '../../hooks/use-breakpoint';

export function ProcessSteps() {
  const { t } = useTranslation();
  const { isMobile } = useBreakpoint();

  const steps = [
    {
      number: 1,
      icon: Camera,
      title: t('landing.processStep1Title'),
      description: t('landing.processStep1Desc'),
    },
    {
      number: 2,
      icon: MapPin,
      title: t('landing.processStep2Title'),
      description: t('landing.processStep2Desc'),
    },
    {
      number: 3,
      icon: Shield,
      title: t('landing.processStep3Title'),
      description: t('landing.processStep3Desc'),
    },
  ];

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      {steps.map((step) => {
        const Icon = step.icon;
        return (
          <View
            key={step.number}
            style={styles.stepCard}
            accessibilityRole="text"
          >
            <View style={styles.stepHeader}>
              <View style={styles.numberCircle}>
                <Body style={styles.numberText}>{step.number}</Body>
              </View>
              <View style={styles.iconContainer}>
                <Icon size={24} color={colors.primary} strokeWidth={1.5} />
              </View>
            </View>
            <H3 style={styles.stepTitle}>{step.title}</H3>
            <Body style={styles.stepDescription}>{step.description}</Body>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  containerMobile: {
    flexDirection: 'column',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberCircle: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  numberText: {
    color: colors.secondary,
    fontWeight: '700',
  },
  stepCard: {
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    flex: 1,
    padding: spacing.lg,
    ...shadowStyles.card,
  },
  stepDescription: {
    color: colors.neutral500,
  },
  stepHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  stepTitle: {
    marginBottom: spacing.sm,
  },
});
