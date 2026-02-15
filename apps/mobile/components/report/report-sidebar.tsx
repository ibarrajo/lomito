/**
 * Report Sidebar Component
 * Desktop-only motivational sidebar shown alongside the report form.
 */

import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Shield, Clock, Eye, Bell } from 'lucide-react-native';
import { H2, Body, BodySmall } from '@lomito/ui';
import {
  colors,
  spacing,
  borderRadius,
  shadowStyles,
  iconSizes,
} from '@lomito/ui/src/theme/tokens';

export function ReportSidebar() {
  const { t } = useTranslation();

  const trustPoints = [
    {
      icon: Clock,
      text: t('report.sidebar.reviewTime'),
    },
    {
      icon: Eye,
      text: t('report.sidebar.identityProtected'),
    },
    {
      icon: Bell,
      text: t('report.sidebar.authoritiesNotified'),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Security Badge */}
      <View style={styles.badge}>
        <Shield
          size={iconSizes.inline}
          color={colors.primary}
          strokeWidth={2}
        />
        <BodySmall style={styles.badgeText} color={colors.primary}>
          {t('report.sidebar.securityBadge')}
        </BodySmall>
      </View>

      {/* Title */}
      <H2 style={styles.title}>{t('report.sidebar.title')}</H2>

      {/* Trust Points */}
      <View style={styles.trustPoints}>
        {trustPoints.map((point, index) => {
          const IconComponent = point.icon;
          return (
            <View
              key={index}
              style={styles.trustPoint}
              accessibilityRole="text"
              accessibilityLabel={point.text}
            >
              <View style={styles.iconContainer}>
                <IconComponent
                  size={iconSizes.default}
                  color={colors.secondary}
                  strokeWidth={1.5}
                />
              </View>
              <Body style={styles.trustPointText}>{point.text}</Body>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  badgeText: {
    fontWeight: '600',
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    gap: spacing.lg,
    padding: spacing.xl,
    ...shadowStyles.card,
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: colors.secondaryLight,
    borderRadius: borderRadius.button,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  title: {
    marginTop: spacing.sm,
  },
  trustPoint: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  trustPointText: {
    flex: 1,
    marginTop: spacing.xs,
  },
  trustPoints: {
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
});
