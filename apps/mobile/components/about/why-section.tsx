import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { H2, Body } from '@lomito/ui/src/components/typography';
import {
  colors,
  spacing,
  borderRadius,
  shadowStyles,
} from '@lomito/ui/src/theme/tokens';

export function WhySection() {
  const { t } = useTranslation();

  return (
    <View style={styles.card} accessibilityRole="text">
      <View style={styles.header}>
        <H2 accessibilityLabel={t('about.whyTitle')}>{t('about.whyTitle')}</H2>
      </View>
      <Body style={styles.contentText} accessibilityLabel={t('about.whyContent')}>
        {t('about.whyContent')}
      </Body>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    marginBottom: spacing.lg,
    padding: spacing.md,
    ...shadowStyles.card,
  },
  contentText: {
    lineHeight: 24,
  },
  header: {
    marginBottom: spacing.md,
  },
});
