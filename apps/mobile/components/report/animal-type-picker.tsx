/**
 * Animal Type Picker Component
 * Row of selectable pills for animal types.
 */

import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius } from '@lomito/ui/src/theme/tokens';
import type { AnimalType } from '@lomito/shared/types';

interface AnimalTypePickerProps {
  selected: AnimalType | null;
  onSelect: (type: AnimalType) => void;
}

const ANIMAL_TYPES: AnimalType[] = ['dog', 'cat', 'bird', 'other'];

export function AnimalTypePicker({ selected, onSelect }: AnimalTypePickerProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {ANIMAL_TYPES.map((type) => {
        const isSelected = selected === type;

        return (
          <Pressable
            key={type}
            onPress={() => onSelect(type)}
            accessibilityLabel={`${t('report.selectAnimalType')}: ${t(`animal.${type}`)}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            style={({ pressed }) => [
              styles.pill,
              isSelected && styles.pillSelected,
              pressed && styles.pillPressed,
            ]}
          >
            <Text
              style={[
                styles.text,
                isSelected && styles.textSelected,
              ]}
            >
              {t(`animal.${type}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    width: '100%',
  },
  pill: {
    backgroundColor: colors.neutral100,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pillPressed: {
    opacity: 0.7,
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    color: colors.neutral700,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    lineHeight: typography.body.fontSize * typography.body.lineHeight,
  },
  textSelected: {
    color: colors.white,
  },
});
