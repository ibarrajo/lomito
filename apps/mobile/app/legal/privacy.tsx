import { View, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Body, Caption } from '@lomito/ui';
import { colors, spacing } from '@lomito/ui/src/theme/tokens';
import { PRIVACY_NOTICE_ES } from '@lomito/shared/src/legal/privacy-es';
import { PRIVACY_NOTICE_EN } from '@lomito/shared/src/legal/privacy-en';

export default function PrivacyScreen() {
  const { t, i18n } = useTranslation();

  const privacyText =
    i18n.language === 'es' ? PRIVACY_NOTICE_ES : PRIVACY_NOTICE_EN;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        accessibilityLabel={t('legal.privacy')}
      >
        <Caption
          style={styles.lastUpdated}
          color={colors.neutral500}
          accessibilityLabel={t('legal.lastUpdated', { date: 'Febrero 2026' })}
        >
          {t('legal.lastUpdated', { date: 'February 2026' })}
        </Caption>

        <Body
          style={styles.text}
          accessibilityLabel="Privacy notice content"
        >
          {privacyText}
        </Body>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  lastUpdated: {
    marginBottom: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  text: {
    lineHeight: 22,
  },
});
