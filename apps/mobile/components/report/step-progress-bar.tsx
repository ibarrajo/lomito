/**
 * StepProgressBar
 * Horizontal step indicator with circles connected by lines for the report flow.
 */

import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { Caption } from '@lomito/ui';
import { colors, spacing } from '@lomito/ui/src/theme/tokens';

interface StepProgressBarProps {
  steps: string[];
  currentStep: number;
  onStepPress: (step: number) => void;
}

const CIRCLE_SIZE = 28;
const CIRCLE_RADIUS = 14;

export function StepProgressBar({
  steps,
  currentStep,
  onStepPress,
}: StepProgressBarProps) {
  return (
    <View style={styles.container}>
      {steps.map((stepLabel, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        const circleContent = isCompleted ? (
          <Check size={14} color={colors.white} strokeWidth={2.5} />
        ) : (
          <Text
            style={[
              styles.stepNumber,
              isActive ? styles.stepNumberActive : styles.stepNumberFuture,
            ]}
          >
            {index + 1}
          </Text>
        );

        const circleStyle = [
          styles.circle,
          isCompleted && styles.circleCompleted,
          isActive && styles.circleActive,
          !isCompleted && !isActive && styles.circleFuture,
        ];

        return (
          <View key={index} style={styles.stepWrapper}>
            {/* Row: circle + connecting line */}
            <View style={styles.stepRow}>
              {isCompleted ? (
                <Pressable
                  onPress={() => onStepPress(index)}
                  style={styles.pressableTarget}
                  accessibilityLabel={stepLabel}
                  accessibilityRole="button"
                >
                  <View style={circleStyle}>{circleContent}</View>
                </Pressable>
              ) : (
                <View style={styles.pressableTarget}>
                  <View style={circleStyle}>{circleContent}</View>
                </View>
              )}

              {/* Connecting line after each step except the last */}
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.line,
                    index < currentStep
                      ? styles.lineCompleted
                      : styles.lineFuture,
                  ]}
                />
              )}
            </View>

            {/* Label below the circle */}
            <Caption
              style={styles.label}
              color={
                isCompleted || isActive ? colors.secondary : colors.neutral400
              }
            >
              {stepLabel}
            </Caption>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    borderRadius: CIRCLE_RADIUS,
    height: CIRCLE_SIZE,
    justifyContent: 'center',
    width: CIRCLE_SIZE,
  },
  circleActive: {
    backgroundColor: colors.primary,
  },
  circleCompleted: {
    backgroundColor: colors.secondary,
  },
  circleFuture: {
    backgroundColor: 'transparent',
    borderColor: colors.neutral400,
    borderWidth: 1.5,
  },
  container: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    paddingVertical: spacing.sm,
  },
  label: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  line: {
    flex: 1,
    height: 2,
    marginTop: (CIRCLE_SIZE - 2) / 2,
  },
  lineCompleted: {
    backgroundColor: colors.secondary,
  },
  lineFuture: {
    backgroundColor: colors.neutral200,
  },
  pressableTarget: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: spacing.sm,
  },
  stepNumber: {
    fontFamily: 'Public Sans',
    fontSize: 12,
    fontWeight: '600',
  },
  stepNumberActive: {
    color: colors.secondary,
  },
  stepNumberFuture: {
    color: colors.neutral400,
  },
  stepRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  stepWrapper: {
    alignItems: 'center',
    flex: 1,
  },
});
