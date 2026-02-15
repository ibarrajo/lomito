import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Database, Clock, Users } from 'lucide-react-native';
import { H2, H3, Body } from '@lomito/ui/src/components/typography';
import {
  colors,
  spacing,
  borderRadius,
  iconSizes,
} from '@lomito/ui/src/theme/tokens';
import { useBreakpoint } from '../../hooks/use-breakpoint';

export function TransparencySection() {
  const { t } = useTranslation();
  const { isMobile } = useBreakpoint();

  const features = [
    {
      icon: Database,
      title: t('landing.openSourceDataTitle'),
      description: t('landing.openSourceDataDesc'),
    },
    {
      icon: Clock,
      title: t('landing.permanentHistoryTitle'),
      description: t('landing.permanentHistoryDesc'),
    },
    {
      icon: Users,
      title: t('landing.communityVerificationTitle'),
      description: t('landing.communityVerificationDesc'),
    },
  ];

  return (
    <View style={styles.container}>
      <H2 style={styles.title}>{t('landing.transparencyTitle')}</H2>
      <Body style={styles.subtitle}>{t('landing.transparencySubtitle')}</Body>

      <View style={[styles.grid, isMobile && styles.gridMobile]}>
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <View key={feature.title} style={styles.featureCard}>
              <View style={styles.iconContainer}>
                <Icon
                  size={iconSizes.large}
                  color={colors.primary}
                  strokeWidth={1.5}
                />
              </View>
              <H3 style={styles.featureTitle}>{feature.title}</H3>
              <Body style={styles.featureDescription}>
                {feature.description}
              </Body>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  featureCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    flex: 1,
    minWidth: 240,
    padding: spacing.lg,
  },
  featureDescription: {
    color: colors.neutral500,
    textAlign: 'center',
  },
  featureTitle: {
    color: colors.neutral900,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  gridMobile: {
    flexDirection: 'column',
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.pill,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  subtitle: {
    color: colors.neutral500,
    marginTop: spacing.sm,
    maxWidth: 640,
    textAlign: 'center',
  },
  title: {
    color: colors.neutral900,
    textAlign: 'center',
  },
});
