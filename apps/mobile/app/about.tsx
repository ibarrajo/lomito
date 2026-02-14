import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Stack } from 'expo-router';
import { colors, spacing } from '@lomito/ui/src/theme/tokens';
import { MissionSection } from '../components/about/mission-section';
import { TeamSection } from '../components/about/team-section';
import { LinksSection } from '../components/about/links-section';

export default function AboutScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('about.title'),
          headerBackTitle: t('common.back'),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        accessibilityLabel={t('about.title')}
      >
        <MissionSection />
        <TeamSection />
        <LinksSection />
        <View style={styles.spacer} />
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
  spacer: {
    height: spacing.xl,
  },
});
