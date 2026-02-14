/**
 * CaseSummaryCard Component
 * Bottom sheet summary card that appears when a map pin is tapped.
 */

import { StyleSheet, View, Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react-native';
import { Card, Badge, Button } from '@lomito/ui';
import { H3, Caption } from '@lomito/ui/src/components/typography';
import { colors, spacing, iconSizes, typography } from '@lomito/ui/src/theme/tokens';
import type { CaseCategory, CaseStatus, AnimalType } from '@lomito/shared/types/database';

interface CaseSummaryData {
  id: string;
  category: CaseCategory;
  animal_type: AnimalType;
  description: string;
  status: CaseStatus;
  created_at: string;
}

interface CaseSummaryCardProps {
  caseData: CaseSummaryData;
  onClose: () => void;
  onViewDetails: (caseId: string) => void;
}

export function CaseSummaryCard({
  caseData,
  onClose,
  onViewDetails,
}: CaseSummaryCardProps) {
  const { t } = useTranslation();

  const categoryColor = colors.category[caseData.category].pin;
  const categoryBgColor = colors.category[caseData.category].background;

  // Format date
  const date = new Date(caseData.created_at);
  const formattedDate = date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Truncate description
  const maxLength = 120;
  const truncatedDescription =
    caseData.description.length > maxLength
      ? `${caseData.description.substring(0, maxLength)}...`
      : caseData.description;

  return (
    <View style={styles.container}>
      <Card
        variant="mapSummary"
        categoryColor={categoryColor}
        style={styles.card}
        accessibilityLabel={t('map.viewDetails')}
      >
        <View style={styles.header}>
          <View style={styles.badges}>
            <Badge
              label={t(`category.${caseData.category}`)}
              color={categoryColor}
              backgroundColor={categoryBgColor}
              accessibilityLabel={t(`category.${caseData.category}`)}
            />
            <Badge
              label={t(`status.${caseData.status}`)}
              color={colors.neutral700}
              backgroundColor={colors.neutral100}
              accessibilityLabel={t(`status.${caseData.status}`)}
              style={styles.statusBadge}
            />
          </View>
          <Pressable
            onPress={onClose}
            accessibilityLabel={t('common.close')}
            accessibilityRole="button"
            hitSlop={8}
          >
            <X size={iconSizes.default} color={colors.neutral500} />
          </Pressable>
        </View>

        <H3 style={styles.animalType}>
          {t(`animal.${caseData.animal_type}`)}
        </H3>

        <Text style={styles.description} numberOfLines={3}>
          {truncatedDescription}
        </Text>

        <Caption color={colors.neutral500} style={styles.date}>
          {t('map.reportedOn')} {formattedDate}
        </Caption>

        <Button
          variant="primary"
          onPress={() => onViewDetails(caseData.id)}
          accessibilityLabel={t('map.viewDetails')}
          style={styles.button}
        >
          {t('map.viewDetails')}
        </Button>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  animalType: {
    marginBottom: spacing.sm,
  },
  badges: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  button: {
    marginTop: spacing.md,
  },
  card: {
    width: '100%',
  },
  container: {
    bottom: 0,
    left: 0,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    position: 'absolute',
    right: 0,
  },
  date: {
    marginTop: spacing.xs,
  },
  description: {
    color: colors.neutral700,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.fontSize * typography.body.lineHeight,
    marginBottom: spacing.xs,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statusBadge: {
    marginLeft: spacing.xs,
  },
});
