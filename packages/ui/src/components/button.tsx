/**
 * Button Component
 * Supports Primary, Secondary, Ghost, and Destructive variants.
 */

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
} from 'react-native';
import {
  colors,
  typography,
  spacing,
  borderRadius,
} from '../theme/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

interface ButtonProps {
  variant?: ButtonVariant;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: string;
  accessibilityLabel: string;
  style?: ViewStyle;
}

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

export function Button({
  variant = 'primary',
  onPress,
  disabled = false,
  loading = false,
  children,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => {
        // eslint-disable-next-line react-native/no-unused-styles
        const variantStyle = styles[variant];
        const pressedStyle = pressed && !isDisabled
          // eslint-disable-next-line react-native/no-unused-styles
          ? styles[`${variant}Pressed` as 'primaryPressed' | 'secondaryPressed' | 'ghostPressed' | 'destructivePressed']
          : undefined;

        return [
          styles.base,
          variantStyle,
          pressedStyle,
          isDisabled && styles.disabled,
          style,
        ];
      }}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'secondary' || variant === 'ghost'
              ? colors.primary
              : colors.white
          }
        />
      ) : (
        <Text
          style={[
            styles.text,
            // eslint-disable-next-line react-native/no-unused-styles
            styles[`${variant}Text` as 'primaryText' | 'secondaryText' | 'ghostText' | 'destructiveText'],
          ]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

/* eslint-disable react-native/no-unused-styles */
const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: borderRadius.button,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  // Destructive variant
  destructive: {
    backgroundColor: colors.error,
  },
  destructivePressed: {
    backgroundColor: colors.errorDark,
  },
  destructiveText: {
    color: colors.white,
  },
  // Disabled state
  disabled: {
    opacity: 0.5,
  },
  // Ghost variant
  ghost: {
    backgroundColor: TRANSPARENT,
  },
  ghostPressed: {
    backgroundColor: colors.primaryLight,
  },
  ghostText: {
    color: colors.primary,
  },
  // Primary variant
  primary: {
    backgroundColor: colors.primary,
  },
  primaryPressed: {
    backgroundColor: colors.primaryDark,
  },
  primaryText: {
    color: colors.white,
  },
  // Secondary variant
  secondary: {
    backgroundColor: TRANSPARENT,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  secondaryPressed: {
    backgroundColor: colors.primaryLight,
  },
  secondaryText: {
    color: colors.primary,
  },
  // Text base
  text: {
    fontFamily: typography.button.fontFamily,
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    lineHeight: typography.button.fontSize * typography.button.lineHeight,
  },
});
