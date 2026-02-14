import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { H2, Body } from '@lomito/ui/src/components/typography';
import {
  colors,
  spacing,
  borderRadius,
  shadowStyles,
} from '@lomito/ui/src/theme/tokens';

export function MissionSection() {
  const { t } = useTranslation();

  return (
    <View style={styles.card} accessibilityRole="text">
      <View style={styles.header}>
        <H2 accessibilityLabel={t('about.mission')}>{t('about.mission')}</H2>
      </View>
      <Body
        style={styles.missionText}
        accessibilityLabel={t('about.missionText')}
      >
        {t('about.missionText')}
      </Body>
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
  missionText: {
    lineHeight: 24,
  },
});
