import { View, Text, Switch, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '@lomito/ui/src/theme/tokens';
import { useNotificationPrefs } from '../../hooks/use-notification-prefs';
import { useUserProfile } from '../../hooks/use-user-profile';

export function NotificationPrefs() {
  const { t } = useTranslation();
  const { prefs, updatePref, loading } = useNotificationPrefs();
  const { profile } = useUserProfile();

  const isModerator = profile?.role === 'moderator' || profile?.role === 'admin';

  if (loading || !prefs) {
    return null;
  }

  const pushEnabled = prefs.push_enabled;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>

      <View style={styles.prefRow}>
        <View style={styles.prefLabelContainer}>
          <Text style={styles.prefLabel}>{t('settings.pushEnabled')}</Text>
        </View>
        <Switch
          value={pushEnabled}
          onValueChange={(value) => updatePref('push_enabled', value)}
          trackColor={{ false: colors.neutral400, true: colors.primary }}
          thumbColor={colors.white}
          accessibilityLabel={t('settings.pushEnabled')}
        />
      </View>

      <View style={styles.prefRow}>
        <View style={styles.prefLabelContainer}>
          <Text
            style={[
              styles.prefLabel,
              !pushEnabled && styles.disabledLabel,
            ]}
          >
            {t('settings.emailEnabled')}
          </Text>
        </View>
        <Switch
          value={prefs.email_enabled}
          onValueChange={(value) => updatePref('email_enabled', value)}
          disabled={!pushEnabled}
          trackColor={{ false: colors.neutral400, true: colors.primary }}
          thumbColor={colors.white}
          accessibilityLabel={t('settings.emailEnabled')}
        />
      </View>

      <View style={styles.prefRow}>
        <View style={styles.prefLabelContainer}>
          <Text
            style={[
              styles.prefLabel,
              !pushEnabled && styles.disabledLabel,
            ]}
          >
            {t('settings.ownCaseUpdates')}
          </Text>
        </View>
        <Switch
          value={prefs.own_case_updates}
          onValueChange={(value) => updatePref('own_case_updates', value)}
          disabled={!pushEnabled}
          trackColor={{ false: colors.neutral400, true: colors.primary }}
          thumbColor={colors.white}
          accessibilityLabel={t('settings.ownCaseUpdates')}
        />
      </View>

      {isModerator && (
        <View style={styles.prefRow}>
          <View style={styles.prefLabelContainer}>
            <Text
              style={[
                styles.prefLabel,
                !pushEnabled && styles.disabledLabel,
              ]}
            >
              {t('settings.flaggedCases')}
            </Text>
          </View>
          <Switch
            value={prefs.flagged_cases}
            onValueChange={(value) => updatePref('flagged_cases', value)}
            disabled={!pushEnabled}
            trackColor={{ false: colors.neutral400, true: colors.primary }}
            thumbColor={colors.white}
            accessibilityLabel={t('settings.flaggedCases')}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  disabledLabel: {
    color: colors.neutral400,
  },
  prefLabel: {
    ...typography.body,
    color: colors.neutral900,
  },
  prefLabelContainer: {
    flex: 1,
  },
  prefRow: {
    alignItems: 'center',
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.neutral900,
    marginBottom: spacing.sm,
  },
});
