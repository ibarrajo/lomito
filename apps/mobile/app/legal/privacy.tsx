import { View, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Container } from '@lomito/ui';
import { colors, spacing } from '@lomito/ui/src/theme/tokens';
import { PRIVACY_NOTICE_ES } from '@lomito/shared/src/legal/privacy-es';
import { PRIVACY_NOTICE_EN } from '@lomito/shared/src/legal/privacy-en';
import { LegalTextRenderer } from '../../components/legal/legal-text-renderer';
import { PageFooter } from '../../components/shared/page-footer';

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
          <LegalTextRenderer text={privacyText} />
        </Container>
        <PageFooter />
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
scrollView: {
    flex: 1,
  },
});
