/**
 * ImpactSidebar Component
 * Shows where donations go with progress bars, testimonial, and contact card.
 */

import { View, StyleSheet, Platform, Linking, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { H3, Body, BodySmall, Caption, ProgressBar } from '@lomito/ui';
import {
  colors,
  spacing,
  borderRadius,
  shadowStyles,
} from '@lomito/ui/src/theme/tokens';
import { Quote } from 'lucide-react-native';

export function ImpactSidebar() {
  const { t } = useTranslation();

  const handleEmailPress = () => {
    Linking.openURL('mailto:contacto@lomito.org');
  };

  return (
    <View
      style={[styles.container, Platform.OS === 'web' && styles.containerWeb]}
    >
      {/* Where Your Money Goes */}
      <View style={styles.card}>
        <H3 style={styles.sectionTitle}>{t('donate.whereMoneyGoes')}</H3>

        <View style={styles.fundItem}>
          <View style={styles.fundHeader}>
            <BodySmall color={colors.neutral700}>
              {t('donate.rescueVet')}
            </BodySmall>
            <BodySmall color={colors.neutral500} style={styles.percentage}>
              68%
            </BodySmall>
          </View>
          <ProgressBar progress={68} color={colors.primary} />
        </View>

        <View style={styles.fundItem}>
          <View style={styles.fundHeader}>
            <BodySmall color={colors.neutral700}>
              {t('donate.shelterInfra')}
            </BodySmall>
            <BodySmall color={colors.neutral500} style={styles.percentage}>
              22%
            </BodySmall>
          </View>
          <ProgressBar progress={22} color={colors.accent} />
        </View>

        <View style={styles.fundItem}>
          <View style={styles.fundHeader}>
            <BodySmall color={colors.neutral700}>
              {t('donate.platformOps')}
            </BodySmall>
            <BodySmall color={colors.neutral500} style={styles.percentage}>
              10%
            </BodySmall>
          </View>
          <ProgressBar progress={10} color={colors.secondary} />
        </View>
      </View>

      {/* Testimonial */}
      <View style={styles.testimonialCard}>
        <Quote size={24} color={colors.primary} style={styles.quoteIcon} />
        <Body color={colors.neutral700} style={styles.testimonialQuote}>
          {t('donate.testimonialQuote')}
        </Body>
        <Caption color={colors.neutral500} style={styles.testimonialAuthor}>
          {t('donate.testimonialAuthor')}
        </Caption>
      </View>

      {/* Help/Contact */}
      <View style={styles.card}>
        <H3 style={styles.sectionTitle}>{t('donate.haveQuestions')}</H3>
        <Body color={colors.neutral700} style={styles.contactBody}>
          {t('donate.contactUs')}
        </Body>
        <Pressable
          onPress={handleEmailPress}
          accessibilityLabel={t('donate.contactEmail')}
          accessibilityRole="link"
        >
          <BodySmall color={colors.primary} style={styles.contactEmail}>
            {t('donate.contactEmail')}
          </BodySmall>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadowStyles.card,
  },
  contactBody: {
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  contactEmail: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  container: {
    gap: spacing.lg,
  },
  containerWeb: {
    position: 'sticky' as 'relative',
    top: spacing.lg,
  },
  fundHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  fundItem: {
    marginTop: spacing.md,
  },
  percentage: {
    fontWeight: '600',
  },
  quoteIcon: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  testimonialAuthor: {
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  testimonialCard: {
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadowStyles.card,
  },
  testimonialQuote: {
    fontStyle: 'italic',
    lineHeight: 22,
  },
});
