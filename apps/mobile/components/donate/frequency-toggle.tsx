/**
 * FrequencyToggle Component
 * Toggle between one-time and monthly donations.
 */

import { View, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BodySmall, Caption } from '@lomito/ui';
import { colors, spacing, borderRadius } from '@lomito/ui/src/theme/tokens';

interface FrequencyToggleProps {
  frequency: 'one_time' | 'monthly';
  onFrequencyChange: (frequency: 'one_time' | 'monthly') => void;
}

export function FrequencyToggle({
  frequency,
  onFrequencyChange,
}: FrequencyToggleProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.tab, frequency === 'one_time' && styles.tabActive]}
        onPress={() => onFrequencyChange('one_time')}
        accessibilityLabel={t('donate.oneTime')}
        accessibilityRole="button"
      >
        <BodySmall
          color={frequency === 'one_time' ? colors.primary : colors.neutral500}
          style={styles.tabText}
        >
          {t('donate.oneTime')}
        </BodySmall>
      </Pressable>

      <Pressable
        style={[styles.tab, frequency === 'monthly' && styles.tabActive]}
        onPress={() => onFrequencyChange('monthly')}
        accessibilityLabel={t('donate.monthly')}
        accessibilityRole="button"
      >
        <View style={styles.tabContent}>
          <BodySmall
            color={frequency === 'monthly' ? colors.primary : colors.neutral500}
            style={styles.tabText}
          >
            {t('donate.monthly')}
          </BodySmall>
          <View style={styles.badge}>
            <Caption style={styles.badgeText}>{t('donate.popular')}</Caption>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.pill,
    marginLeft: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '600',
  },
  container: {
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    flexDirection: 'row',
    width: '100%',
  },
  tab: {
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: 'transparent',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  tabActive: {
    borderColor: colors.primary,
  },
  tabContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tabText: {
    fontWeight: '600',
  },
});
