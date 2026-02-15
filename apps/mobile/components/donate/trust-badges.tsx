/**
 * TrustBadges Component
 * Shows security badges (SSL Secure, PCI DSS compliance) for donation page.
 */

import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Shield, Lock } from 'lucide-react-native';
import { BodySmall, Caption } from '@lomito/ui';
import {
  colors,
  spacing,
  borderRadius,
  iconSizes,
} from '@lomito/ui/src/theme/tokens';

export function TrustBadges() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Lock size={iconSizes.default} color={colors.success} strokeWidth={2} />
        <View style={styles.badgeContent}>
          <BodySmall color={colors.neutral700} style={styles.badgeTitle}>
            {t('donate.sslSecure')}
          </BodySmall>
          <Caption color={colors.neutral500}>
            {t('donate.sslDescription')}
          </Caption>
        </View>
      </View>

      <View style={styles.badge}>
        <Shield
          size={iconSizes.default}
          color={colors.success}
          strokeWidth={2}
        />
        <View style={styles.badgeContent}>
          <BodySmall color={colors.neutral700} style={styles.badgeTitle}>
            {t('donate.pciCompliant')}
          </BodySmall>
          <Caption color={colors.neutral500}>
            {t('donate.pciDescription')}
          </Caption>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    flexDirection: 'row',
    padding: spacing.md,
  },
  badgeContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  badgeTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  container: {
    gap: spacing.sm,
  },
});
