/**
 * Legal Text Renderer
 * Parses legal text constants and renders ALL CAPS lines as semantic <H2> headings
 * for screen reader accessibility.
 */

import { View, StyleSheet } from 'react-native';
import { H2, Body } from '@lomito/ui';
import { colors, spacing } from '@lomito/ui/src/theme/tokens';

interface LegalTextRendererProps {
  text: string;
}

function isHeading(line: string): boolean {
  // ALL CAPS lines with at least 3 words that aren't bullet points or numbers
  const trimmed = line.trim();
  if (
    !trimmed ||
    trimmed.startsWith('•') ||
    trimmed.startsWith('-') ||
    /^\d+\./.test(trimmed)
  ) {
    return false;
  }
  // Check if the line is ALL CAPS (uppercase letters, spaces, accented chars, punctuation)
  return (
    trimmed.length > 5 &&
    trimmed === trimmed.toUpperCase() &&
    /[A-ZÁÉÍÓÚÑÜ]/.test(trimmed)
  );
}

export function LegalTextRenderer({ text }: LegalTextRendererProps) {
  // Split into paragraphs (double newline separated)
  const paragraphs = text.split(/\n\n+/);

  return (
    <View style={styles.container}>
      {paragraphs
        .map((paragraph, index) => {
          const trimmed = paragraph.trim();
          if (!trimmed) return null;

          // Create unique key by combining index with first 20 chars of content
          const uniqueKey = `para-${index}-${trimmed.substring(0, 20)}`;

          if (isHeading(trimmed)) {
            return (
              <H2 key={uniqueKey} style={styles.heading}>
                {trimmed}
              </H2>
            );
          }

          return (
            <Body
              key={uniqueKey}
              style={styles.paragraph}
              color={colors.neutral700}
            >
              {trimmed}
            </Body>
          );
        })
        .filter(Boolean)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  heading: {
    marginTop: spacing.lg,
    textTransform: 'none',
  },
  paragraph: {
    lineHeight: 22,
  },
});
