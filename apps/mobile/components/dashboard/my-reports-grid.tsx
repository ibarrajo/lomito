/**
 * My Reports Grid Component
 * Displays a grid of the user's own case reports
 */

import { View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { MapPin } from 'lucide-react-native';
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
import { useMyCases } from '../../hooks/use-my-cases';
import { useBreakpoint } from '../../hooks/use-breakpoint';
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

interface ReportCardProps {
  id: string;
  category: CaseCategory;
  description: string;
  status: CaseStatus;
  createdAt: string;
}

function ReportCard({
  id,
  category,
  description,
  status,
  createdAt,
}: ReportCardProps) {
  const { t, i18n } = useTranslation();

  const handlePress = () => {
    router.push(`/case/${id}`);
  };

  const getCategoryColor = (cat: CaseCategory) => {
    switch (cat) {
      case 'abuse':
        return colors.category.abuse.pin;
      case 'injured':
        return colors.error;
      case 'missing':
        return colors.category.missing.pin;
      case 'stray':
        return colors.category.stray.pin;
      default:
        return colors.neutral500;
    }
  };

  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: i18n.language === 'es' ? es : enUS,
  });

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={handlePress}
      accessibilityLabel={t('category.' + category)}
      accessibilityHint={t('map.viewDetails')}
    >
      <View
        style={[
          styles.categoryStripe,
          { backgroundColor: getCategoryColor(category) },
        ]}
      />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <H3 style={styles.categoryTitle}>{t(`category.${category}`)}</H3>
          <StatusBadge status={status} />
        </View>
        <Body style={styles.description} numberOfLines={2}>
          {description}
        </Body>
        <View style={styles.footer}>
          <View style={styles.locationRow}>
            <MapPin size={14} color={colors.neutral500} strokeWidth={1.5} />
            <BodySmall style={styles.timeText}>{timeAgo}</BodySmall>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

interface SectionHeaderProps {
  title: string;
  onViewAll?: () => void;
}

function SectionHeader({ title, onViewAll }: SectionHeaderProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.sectionHeader}>
      <H3 style={styles.sectionTitle}>{title}</H3>
      {onViewAll && (
        <Pressable
          onPress={onViewAll}
          accessibilityLabel={t('dashboard.viewAll')}
        >
          <BodySmall style={styles.viewAllText}>
            {t('dashboard.viewAll')}
          </BodySmall>
        </Pressable>
      )}
    </View>
  );
}

export function MyReportsGrid() {
  const { t } = useTranslation();
  const { cases, loading, error } = useMyCases();
  const { isDesktop } = useBreakpoint();

  const handleViewAll = () => {
    router.push('/(tabs)/profile');
  };

  const handleStartReporting = () => {
    router.push('/report');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SectionHeader title={t('dashboard.myReports')} />
        <View style={[styles.grid, isDesktop && styles.gridDesktop]}>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              width="100%"
              height={140}
              borderRadius={borderRadius.card}
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
        <SectionHeader title={t('dashboard.myReports')} />
        <EmptyState
          icon={<MapPin size={48} color={colors.neutral400} />}
          title={t('dashboard.noReports')}
          ctaLabel={t('dashboard.startReporting')}
          onCtaPress={handleStartReporting}
        />
      </View>
    );
  }

  const displayCases = cases.slice(0, 6);

  return (
    <View style={styles.container}>
      <SectionHeader
        title={t('dashboard.myReports')}
        onViewAll={cases.length > 6 ? handleViewAll : undefined}
      />
      <View style={[styles.grid, isDesktop && styles.gridDesktop]}>
        {displayCases.map((caseItem) => (
          <ReportCard
            key={caseItem.id}
            id={caseItem.id}
            category={caseItem.category}
            description={caseItem.description}
            status={caseItem.status}
            createdAt={caseItem.created_at}
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
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    flex: 1,
    flexDirection: 'row',
    minHeight: 120,
    overflow: 'hidden',
    ...shadowStyles.card,
  },
  cardContent: {
    flex: 1,
    padding: spacing.md,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  cardPressed: {
    opacity: 0.7,
  },
  categoryStripe: {
    width: 4,
  },
  categoryTitle: {
    color: colors.neutral900,
    flex: 1,
  },
  container: {
    marginBottom: spacing.lg,
  },
  description: {
    color: colors.neutral700,
    flex: 1,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gridDesktop: {
    gap: spacing.lg,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.neutral900,
  },
  timeText: {
    color: colors.neutral500,
  },
  viewAllText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
