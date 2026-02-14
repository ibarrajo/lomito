import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { H2, Body } from '@lomito/ui/src/components/typography';
import {
  colors,
  spacing,
  borderRadius,
  shadowStyles,
} from '@lomito/ui/src/theme/tokens';

export function TeamSection() {
  const { t } = useTranslation();

  return (
    <View style={styles.card} accessibilityRole="text">
      <View style={styles.header}>
        <H2 accessibilityLabel={t('about.team')}>{t('about.team')}</H2>
      </View>
      <Body style={styles.teamText} accessibilityLabel={t('about.teamText')}>
        {t('about.teamText')}
      </Body>
      <View style={styles.separator} />
      <View style={styles.openSourceContainer}>
        <H2
          style={styles.openSourceTitle}
          accessibilityLabel={t('about.openSource')}
        >
          {t('about.openSource')}
        </H2>
        <Body
          style={styles.openSourceText}
          accessibilityLabel={t('about.openSourceText')}
        >
          {t('about.openSourceText')}
        </Body>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadowStyles.card,
  },
  header: {
    marginBottom: spacing.md,
  },
  openSourceContainer: {
    marginTop: spacing.md,
  },
  openSourceText: {
    lineHeight: 24,
  },
  openSourceTitle: {
    marginBottom: spacing.sm,
  },
  separator: {
    backgroundColor: colors.neutral200,
    height: 1,
    marginVertical: spacing.md,
  },
  teamText: {
    lineHeight: 24,
  },
});
