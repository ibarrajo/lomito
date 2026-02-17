/**
 * Urgency Picker Component
 * Horizontal row of urgency level selectors with semantic colors.
 */

import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BodySmall } from '@lomito/ui';
import {
  colors,
  typography,
  spacing,
  borderRadius,
} from '@lomito/ui/src/theme/tokens';
import type { UrgencyLevel } from '@lomito/shared/types';

interface UrgencyPickerProps {
  selected: UrgencyLevel;
  onSelect: (level: UrgencyLevel) => void;
}

const URGENCY_LEVELS: Array<{
  key: UrgencyLevel;
  color: string;
  backgroundColor: string;
}> = [
  {
    key: 'low',
    color: colors.success,
    backgroundColor: colors.successBackground,
  },
  {
    key: 'medium',
    color: colors.warning,
    backgroundColor: colors.warningBackground,
  },
  {
    key: 'high',
    color: colors.category.stray.pin,
    backgroundColor: colors.category.stray.background,
  },
  {
    key: 'critical',
    color: colors.error,
    backgroundColor: colors.errorBackground,
  },
];

export function UrgencyPicker({ selected, onSelect }: UrgencyPickerProps) {
  const { t } = useTranslation();

  return (
    <View>
      <View style={styles.pillRow}>
        {URGENCY_LEVELS.map((level) => {
          const isSelected = selected === level.key;

          return (
            <Pressable
              key={level.key}
              onPress={() => onSelect(level.key)}
              accessibilityLabel={`${t('report.selectUrgency')}: ${t(`urgency.${level.key}`)}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: isSelected
                    ? level.color
                    : level.backgroundColor,
                },
                isSelected && styles.optionSelected,
                pressed && styles.optionPressed,
              ]}
            >
              <Text
                style={[
                  styles.text,
                  { color: isSelected ? colors.white : level.color },
                ]}
              >
                {t(`urgency.${level.key}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <BodySmall color={colors.neutral500} style={styles.description}>
        {t(`urgency.${selected}Description`)}
      </BodySmall>
    </View>
  );
}

const styles = StyleSheet.create({
  description: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  option: {
    alignItems: 'center',
    borderRadius: borderRadius.button,
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionSelected: {
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 2,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  text: {
    fontFamily: typography.body.fontFamily,
    fontSize: typography.small.fontSize,
    fontWeight: '600',
    lineHeight: typography.small.fontSize * typography.small.lineHeight,
    textAlign: 'center',
  },
});
