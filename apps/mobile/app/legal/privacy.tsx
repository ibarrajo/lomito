import { View, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Container, Body } from '@lomito/ui';
import { colors, spacing, borderRadius } from '@lomito/ui/src/theme/tokens';
import { PRIVACY_NOTICE_ES } from '@lomito/shared/src/legal/privacy-es';
import { PRIVACY_NOTICE_EN } from '@lomito/shared/src/legal/privacy-en';
import { LegalTextRenderer } from '../../components/legal/legal-text-renderer';

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
        <Container maxWidth={720}>
          <View style={styles.disclaimer}>
            <Body>{t('legal.disclaimer')}</Body>
          </View>
          <LegalTextRenderer text={privacyText} />
        </Container>
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
  disclaimer: {
    backgroundColor: colors.neutral100,
    borderColor: colors.secondary,
    borderLeftWidth: 4,
    borderRadius: borderRadius.card,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
});
