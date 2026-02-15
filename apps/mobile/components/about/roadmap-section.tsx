import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { H2, Body, BodySmall } from '@lomito/ui/src/components/typography';
import {
  colors,
  spacing,
  borderRadius,
  shadowStyles,
  typography,
} from '@lomito/ui/src/theme/tokens';

type RoadmapStatus = 'planned' | 'exploring' | 'inProgress' | 'launched';

interface RoadmapItemData {
  key: string;
  status: RoadmapStatus;
}

const ROADMAP_ITEMS: RoadmapItemData[] = [
  { key: 'androidApp', status: 'planned' },
  { key: 'iosApp', status: 'planned' },
  { key: 'petRegistry', status: 'planned' },
  { key: 'missingPetFinder', status: 'exploring' },
  { key: 'osintIngestion', status: 'exploring' },
];

function getStatusColor(status: RoadmapStatus): string {
  switch (status) {
    case 'planned':
      return colors.secondary;
    case 'exploring':
      return colors.accent;
    case 'inProgress':
      return colors.primary;
    case 'launched':
      return colors.success;
  }
}

interface RoadmapItemProps {
  itemKey: string;
  status: RoadmapStatus;
}

function RoadmapItem({ itemKey, status }: RoadmapItemProps) {
  const { t } = useTranslation();
  const title = t(`about.roadmap.${itemKey}.title`);
  const description = t(`about.roadmap.${itemKey}.description`);
  const statusLabel = t(`about.roadmap.status.${status}`);
  const statusColor = getStatusColor(status);

  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <Body
          style={styles.itemTitle}
          accessibilityLabel={title}
          color={colors.neutral900}
        >
          {title}
        </Body>
        <BodySmall
          style={styles.itemDescription}
          accessibilityLabel={description}
          color={colors.neutral700}
        >
          {description}
        </BodySmall>
      </View>
      <View
        style={[styles.statusBadge, { backgroundColor: statusColor }]}
        accessibilityLabel={`${statusLabel} status`}
      >
        <BodySmall style={styles.statusText} color={colors.white}>
          {statusLabel}
        </BodySmall>
      </View>
    </View>
  );
}

export function RoadmapSection() {
  const { t } = useTranslation();

  return (
    <View style={styles.card} accessibilityRole="list">
      <View style={styles.header}>
        <H2 accessibilityLabel={t('about.roadmapTitle')}>
          {t('about.roadmapTitle')}
        </H2>
      </View>
      {ROADMAP_ITEMS.map((item, index) => (
        <View key={item.key}>
          <RoadmapItem itemKey={item.key} status={item.status} />
          {index < ROADMAP_ITEMS.length - 1 && <View style={styles.separator} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    marginBottom: spacing.md,
    padding: spacing.md,
    ...shadowStyles.card,
  },
  header: {
    marginBottom: spacing.md,
  },
  itemContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  itemContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  itemDescription: {
    lineHeight: 18,
    marginTop: 2,
  },
  itemTitle: {
    fontWeight: '600',
  },
  separator: {
    backgroundColor: colors.neutral200,
    height: 1,
    marginVertical: spacing.xs,
  },
  statusBadge: {
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
});
