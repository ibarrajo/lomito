/**
 * TextInput Component
 * Labeled text input with error state support.
 */

import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  type TextInputProps as RNTextInputProps,
  type ViewStyle,
} from 'react-native';
import { useState } from 'react';
import { colors, typography, spacing, borderRadius } from '../theme/tokens';

interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  error?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  accessibilityLabel: string;
  style?: ViewStyle;
}

export function TextInput({
  label,
  error,
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
  style,
  ...rest
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral400}
        accessibilityLabel={accessibilityLabel}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
        {...rest}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  error: {
    color: colors.error,
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    lineHeight: typography.caption.fontSize * typography.caption.lineHeight,
    marginTop: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.input,
    borderWidth: 1,
    color: colors.neutral900,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    height: 48,
    lineHeight: typography.body.fontSize * typography.body.lineHeight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  label: {
    color: colors.neutral700,
    fontFamily: typography.small.fontFamily,
    fontSize: typography.small.fontSize,
    fontWeight: typography.small.fontWeight,
    lineHeight: typography.small.fontSize * typography.small.lineHeight,
    marginBottom: spacing.xs,
  },
});
