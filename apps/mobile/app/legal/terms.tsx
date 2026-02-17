import { View, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Container, Body } from '@lomito/ui';
import { colors, spacing, borderRadius } from '@lomito/ui/src/theme/tokens';
import { TERMS_OF_SERVICE_ES } from '@lomito/shared/src/legal/terms-es';
import { TERMS_OF_SERVICE_EN } from '@lomito/shared/src/legal/terms-en';
import { LegalTextRenderer } from '../../components/legal/legal-text-renderer';
import { PageFooter } from '../../components/shared/page-footer';
import { PublicWebHeader } from '../../components/navigation/public-web-header';
import { useAuth } from '../../hooks/use-auth';
import { Platform } from 'react-native';

export default function TermsScreen() {
  const { t, i18n } = useTranslation();
  const { session } = useAuth();
  const isWeb = Platform.OS === 'web';

  const termsText =
    i18n.language === 'es' ? TERMS_OF_SERVICE_ES : TERMS_OF_SERVICE_EN;

  return (
    <View style={styles.container}>
      <PublicWebHeader />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        accessibilityLabel={t('legal.terms')}
      >
        <Container maxWidth={720}>
          <View style={styles.disclaimer}>
            <Body>{t('legal.disclaimer')}</Body>
          </View>
          <LegalTextRenderer text={termsText} />
        </Container>
        {!session && isWeb && <PageFooter />}
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
