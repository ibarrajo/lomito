import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { H2, Body, BodySmall } from '@lomito/ui/src/components/typography';
import { colors, spacing } from '@lomito/ui/src/theme/tokens';

export function AccountabilitySection() {
  const { t } = useTranslation();

  const milestones = [
    {
      day: 1,
      label: t('landing.day1'),
      dotColor: colors.primary,
    },
    {
      day: 5,
      label: t('landing.day5'),
      dotColor: colors.accent,
    },
    {
      day: 15,
      label: t('landing.day15'),
      dotColor: colors.warning,
    },
    {
      day: 30,
      label: t('landing.day30'),
      dotColor: colors.error,
    },
  ];

  return (
    <View style={styles.container}>
      <H2 style={styles.title}>{t('landing.accountabilityTitle')}</H2>
      <Body style={styles.subtitle}>{t('landing.accountabilitySubtitle')}</Body>

      <View style={styles.timeline}>
        {milestones.map((milestone, index) => (
          <View key={milestone.day}>
            <View style={styles.milestoneRow}>
              <View style={styles.dayContainer}>
                <BodySmall style={styles.dayLabel}>
                  Day {milestone.day}
                </BodySmall>
              </View>
              <View style={styles.dotContainer}>
                <View
                  style={[styles.dot, { backgroundColor: milestone.dotColor }]}
                />
                {index < milestones.length - 1 && (
                  <View style={styles.connector} />
                )}
              </View>
              <View style={styles.labelContainer}>
                <Body style={styles.milestoneLabel}>{milestone.label}</Body>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  connector: {
    backgroundColor: colors.neutral200,
    height: 40,
    left: 6,
    position: 'absolute',
    top: 14,
    width: 2,
  },
  container: {
    alignItems: 'flex-start',
  },
  dayContainer: {
    minWidth: 60,
  },
  dayLabel: {
    color: colors.neutral500,
    fontWeight: '600',
  },
  dot: {
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  dotContainer: {
    alignItems: 'center',
    marginHorizontal: spacing.md,
    position: 'relative',
  },
  labelContainer: {
    flex: 1,
  },
  milestoneLabel: {
    color: colors.neutral900,
  },
  milestoneRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  subtitle: {
    color: colors.neutral500,
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
  },
  timeline: {
    width: '100%',
  },
  title: {
    color: colors.neutral900,
  },
});
