/**
 * Typography Components
 * Pre-styled text components for headings and body text.
 */

import { Text, StyleSheet, type TextStyle } from 'react-native';
import { colors, typography } from '../theme/tokens';

interface TypographyProps {
  children: React.ReactNode;
  style?: TextStyle;
  color?: string;
  accessibilityLabel?: string;
}

export function H1({
  children,
  style,
  color = colors.neutral900,
  accessibilityLabel,
}: TypographyProps) {
  return (
    <Text
      style={[styles.h1, { color }, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="header"
    >
      {children}
    </Text>
  );
}

export function H2({
  children,
  style,
  color = colors.neutral900,
  accessibilityLabel,
}: TypographyProps) {
  return (
    <Text
      style={[styles.h2, { color }, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="header"
    >
      {children}
    </Text>
  );
}

export function H3({
  children,
  style,
  color = colors.neutral900,
  accessibilityLabel,
}: TypographyProps) {
  return (
    <Text
      style={[styles.h3, { color }, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="header"
    >
      {children}
    </Text>
  );
}

export function Body({
  children,
  style,
  color = colors.neutral700,
  accessibilityLabel,
}: TypographyProps) {
  return (
    <Text
      style={[styles.body, { color }, style]}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Text>
  );
}

export function BodySmall({
  children,
  style,
  color = colors.neutral700,
  accessibilityLabel,
}: TypographyProps) {
  return (
    <Text
      style={[styles.bodySmall, { color }, style]}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Text>
  );
}

export function Caption({
  children,
  style,
  color = colors.neutral700,
  accessibilityLabel,
}: TypographyProps) {
  return (
    <Text
      style={[styles.caption, { color }, style]}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Text>
  );
}

export function ButtonText({
  children,
  style,
  color = colors.white,
  accessibilityLabel,
}: TypographyProps) {
  return (
    <Text
      style={[styles.button, { color }, style]}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  body: {
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.fontSize * typography.body.lineHeight,
  },
  bodySmall: {
    fontFamily: typography.small.fontFamily,
    fontSize: typography.small.fontSize,
    fontWeight: typography.small.fontWeight,
    lineHeight: typography.small.fontSize * typography.small.lineHeight,
  },
  button: {
    fontFamily: typography.button.fontFamily,
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    lineHeight: typography.button.fontSize * typography.button.lineHeight,
  },
  caption: {
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    lineHeight: typography.caption.fontSize * typography.caption.lineHeight,
  },
  h1: {
    fontFamily: typography.h1.fontFamily,
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    lineHeight: typography.h1.fontSize * typography.h1.lineHeight,
  },
  h2: {
    fontFamily: typography.h2.fontFamily,
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    lineHeight: typography.h2.fontSize * typography.h2.lineHeight,
  },
  h3: {
    fontFamily: typography.h3.fontFamily,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    lineHeight: typography.h3.fontSize * typography.h3.lineHeight,
  },
});
