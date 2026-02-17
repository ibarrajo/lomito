import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import { Container, H1, Body } from '@lomito/ui';
import { colors, spacing, borderRadius } from '@lomito/ui/src/theme/tokens';
import { WhySection } from '../components/about/why-section';
import { WhatSection } from '../components/about/what-section';
import { MissionSection } from '../components/about/mission-section';
import { TeamSection } from '../components/about/team-section';
import { RoadmapSection } from '../components/about/roadmap-section';
import { LinksSection } from '../components/about/links-section';
import { PageFooter } from '../components/shared/page-footer';
import { PublicWebHeader } from '../components/navigation/public-web-header';
import { useAuth } from '../hooks/use-auth';

export default function AboutScreen() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const isWeb = Platform.OS === 'web';

  return (
    <>
      {Platform.OS === 'web' && (
        <Head>
          <title>Lomito — {t('about.title')}</title>
          <meta name="description" content={t('about.missionText')} />
          <meta property="og:title" content={`Lomito — ${t('about.title')}`} />
          <meta property="og:description" content={t('about.missionText')} />
          <meta property="og:url" content="https://lomito.org/about" />
          <meta property="og:image" content="https://lomito.org/og-image.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`Lomito — ${t('about.title')}`} />
          <meta name="twitter:description" content={t('about.missionText')} />
          <meta
            name="twitter:image"
            content="https://lomito.org/og-image.png"
          />
        </Head>
      )}
      <Stack.Screen
        options={{
          headerShown: Platform.OS !== 'web',
          title: t('about.title'),
          headerBackTitle: t('common.back'),
        }}
      />
      <PublicWebHeader />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        accessibilityLabel={t('about.title')}
      >
        <Container maxWidth={720}>
          <View style={styles.hero}>
            <View style={styles.heroAccent} />
            <H1 style={styles.heroTitle}>{t('about.title')}</H1>
            <Body style={styles.heroSubtitle} color={colors.neutral500}>
              {t('about.mission')}
            </Body>
          </View>
          <View style={styles.disclaimer}>
            <Body>{t('legal.disclaimer')}</Body>
          </View>
          <WhySection />
          <MissionSection />
          <WhatSection />
          <TeamSection />
          <RoadmapSection />
          <LinksSection />
        </Container>
        {!session && isWeb && <PageFooter />}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral100,
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  disclaimer: {
    backgroundColor: colors.neutral100,
    borderColor: colors.secondary,
    borderLeftWidth: 4,
    borderRadius: borderRadius.card,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  hero: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.card,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  heroAccent: {
    backgroundColor: colors.primary,
    borderRadius: 2,
    height: 4,
    marginBottom: spacing.md,
    width: 40,
  },
  heroSubtitle: {
    maxWidth: 560,
  },
  heroTitle: {
    marginBottom: spacing.sm,
  },
});
