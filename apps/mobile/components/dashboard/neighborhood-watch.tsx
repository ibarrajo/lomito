/**
 * Neighborhood Watch Component
 * Displays cases the user is subscribed to (following)
 */

import { View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { ChevronRight, Eye } from 'lucide-react-native';
import {
  Body,
  BodySmall,
  Caption,
  H3,
} from '@lomito/ui/src/components/typography';
import { EmptyState } from '@lomito/ui/src/components/empty-state';
import { Skeleton } from '@lomito/ui/src/components/skeleton';
import {
  colors,
  spacing,
  borderRadius,
  shadowStyles,
} from '@lomito/ui/src/theme/tokens';
import { useSubscribedCases } from '../../hooks/use-subscribed-cases';
import type { CaseCategory, CaseStatus } from '@lomito/shared/types/database';

interface StatusBadgeProps {
  status: CaseStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();

  const getStatusColor = (s: CaseStatus) => {
    switch (s) {
      case 'pending':
        return colors.warning;
      case 'verified':
      case 'in_progress':
        return colors.info;
      case 'resolved':
        return colors.success;
      case 'rejected':
      case 'archived':
        return colors.neutral500;
      default:
        return colors.neutral500;
    }
  };

  return (
    <View
      style={[styles.badge, { backgroundColor: `${getStatusColor(status)}15` }]}
    >
      <Caption style={{ color: getStatusColor(status) }}>
        {t(`status.${status}`)}
      </Caption>
    </View>
  );
}

interface WatchItemProps {
  id: string;
  category: CaseCategory;
  description: string;
  status: CaseStatus;
  updatedAt: string;
}

function WatchItem({
  id,
  category,
  description,
  status,
  updatedAt,
}: WatchItemProps) {
  const { t, i18n } = useTranslation();

  const handlePress = () => {
    router.push(`/case/${id}`);
  };

  const getCategoryColor = (cat: CaseCategory) => {
    switch (cat) {
      case 'abuse':
        return colors.category.abuse.pin;
      case 'stray':
        return colors.category.stray.pin;
      case 'missing':
        return colors.category.missing.pin;
      default:
        return colors.neutral500;
    }
  };

  const timeAgo = formatDistanceToNow(new Date(updatedAt), {
    addSuffix: true,
    locale: i18n.language === 'es' ? es : enUS,
  });

  return (
    <Pressable
      style={({ pressed }) => [
        styles.watchItem,
        pressed && styles.watchItemPressed,
      ]}
      onPress={handlePress}
      accessibilityLabel={`${t('category.' + category)} - ${description.slice(0, 50)}`}
      accessibilityHint={t('map.viewDetails')}
    >
      <View
        style={[
          styles.categoryIndicator,
          { backgroundColor: getCategoryColor(category) },
        ]}
      />
      <View style={styles.watchContent}>
        <View style={styles.watchHeader}>
          <BodySmall style={styles.categoryText}>
            {t(`category.${category}`)}
          </BodySmall>
          <StatusBadge status={status} />
        </View>
        <Body style={styles.watchDescription} numberOfLines={2}>
          {description}
        </Body>
        <BodySmall style={styles.timeText}>{timeAgo}</BodySmall>
      </View>
      <ChevronRight size={20} color={colors.neutral400} strokeWidth={1.5} />
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <H3 style={styles.sectionTitle}>{title}</H3>
    </View>
  );
}

export function NeighborhoodWatch() {
  const { t } = useTranslation();
  const { cases, loading, error } = useSubscribedCases();

  const handleBrowseCases = () => {
    router.push('/(tabs)');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SectionHeader title={t('dashboard.neighborhoodWatch')} />
        <View style={styles.listContainer}>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              width="100%"
              height={100}
              borderRadius={borderRadius.card}
              style={styles.skeleton}
            />
          ))}
        </View>
      </View>
    );
  }

  if (error) {
    return null;
  }

  if (cases.length === 0) {
    return (
      <View style={styles.container}>
        <SectionHeader title={t('dashboard.neighborhoodWatch')} />
        <EmptyState
          icon={<Eye size={48} color={colors.neutral400} />}
          title={t('dashboard.noSubscriptions')}
          ctaLabel={t('dashboard.browseCases')}
          onCtaPress={handleBrowseCases}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionHeader title={t('dashboard.neighborhoodWatch')} />
      <View style={styles.listContainer}>
        {cases.map((caseItem) => (
          <WatchItem
            key={caseItem.id}
            id={caseItem.id}
            category={caseItem.category}
            description={caseItem.description}
            status={caseItem.status}
            updatedAt={caseItem.updated_at}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.tag,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
  },
  categoryIndicator: {
    borderRadius: borderRadius.pill,
    height: 8,
    width: 8,
  },
  categoryText: {
    color: colors.neutral700,
    fontWeight: '600',
  },
  container: {
    marginBottom: spacing.lg,
  },
  listContainer: {
    gap: spacing.sm,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.neutral900,
  },
  skeleton: {
    marginBottom: spacing.sm,
  },
  timeText: {
    color: colors.neutral500,
  },
  watchContent: {
    flex: 1,
    gap: spacing.xs,
  },
  watchDescription: {
    color: colors.neutral700,
  },
  watchHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  watchItem: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    ...shadowStyles.card,
  },
  watchItemPressed: {
    opacity: 0.7,
  },
});
