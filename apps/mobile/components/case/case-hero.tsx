/**
 * CaseHero Component
 * Hero section for case detail page with image or colored header.
 * Shows case title, status badge, category, and metadata with gradient overlay if image exists.
 */

import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Badge } from '@lomito/ui/components/badge';
import { H1, Body, Caption } from '@lomito/ui/components/typography';
import { colors, spacing } from '@lomito/ui/theme/tokens';
import type {
  Case,
  CaseMedia,
  CaseCategory,
} from '@lomito/shared/types/database';

interface CaseHeroProps {
  caseData: Case;
  media: CaseMedia[];
}

const CATEGORY_COLORS: Record<
  CaseCategory,
  { color: string; background: string }
> = {
  abuse: { color: colors.error, background: colors.errorBackground },
  stray: { color: colors.warning, background: colors.warningBackground },
  missing: { color: colors.info, background: colors.infoBackground },
  injured: { color: colors.error, background: colors.errorBackground },
};

const STATUS_COLORS: Record<string, { color: string; background: string }> = {
  pending: { color: colors.warning, background: colors.warningBackground },
  verified: { color: colors.info, background: colors.infoBackground },
  in_progress: { color: colors.info, background: colors.infoBackground },
  resolved: { color: colors.success, background: colors.successBackground },
  rejected: { color: colors.error, background: colors.errorBackground },
  archived: { color: colors.neutral500, background: colors.neutral100 },
};

export function CaseHero({ caseData, media }: CaseHeroProps) {
  const { t } = useTranslation();

  const categoryColors = CATEGORY_COLORS[caseData.category];
  const statusColors = STATUS_COLORS[caseData.status];

  const formattedDate = new Date(caseData.created_at).toLocaleDateString(
    'es-MX',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  );

  const heroImage = media.length > 0 ? media[0].url : null;

  if (heroImage) {
    return (
      <View style={styles.heroWithImage}>
        <Image
          source={{ uri: heroImage }}
          style={styles.heroImage}
          contentFit="cover"
          accessibilityLabel={t(`category.${caseData.category}`)}
        />
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <View style={styles.badgeRow}>
              <Badge
                label={t(`status.${caseData.status}`)}
                color={statusColors.color}
                backgroundColor={statusColors.background}
                accessibilityLabel={t(`status.${caseData.status}`)}
              />
              <View style={styles.badgeSpacer} />
              <Badge
                label={t(`category.${caseData.category}`)}
                color={categoryColors.color}
                backgroundColor={categoryColors.background}
                accessibilityLabel={t(`category.${caseData.category}`)}
              />
            </View>
            <H1 color={colors.white} style={styles.title}>
              {t(`animal.${caseData.animal_type}`)}
            </H1>
            <Caption color={colors.white}>{formattedDate}</Caption>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.heroWithoutImage,
        { backgroundColor: categoryColors.background },
      ]}
    >
      <View style={styles.badgeRow}>
        <Badge
          label={t(`status.${caseData.status}`)}
          color={statusColors.color}
          backgroundColor={statusColors.background}
          accessibilityLabel={t(`status.${caseData.status}`)}
        />
        <View style={styles.badgeSpacer} />
        <Badge
          label={t(`category.${caseData.category}`)}
          color={categoryColors.color}
          backgroundColor={categoryColors.background}
          accessibilityLabel={t(`category.${caseData.category}`)}
        />
      </View>
      <H1 color={categoryColors.color} style={styles.title}>
        {t(`animal.${caseData.animal_type}`)}
      </H1>
      <Body color={categoryColors.color}>{formattedDate}</Body>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badgeSpacer: {
    width: spacing.sm,
  },
  heroImage: {
    height: '100%',
    width: '100%',
  },
  heroWithImage: {
    height: 400,
    position: 'relative',
    width: '100%',
  },
  heroWithoutImage: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  overlayContent: {
    bottom: spacing.lg,
    left: spacing.md,
    position: 'absolute',
    right: spacing.md,
  },
  title: {
    marginTop: spacing.md,
  },
});
