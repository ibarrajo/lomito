/**
 * Queue Sidebar Component
 * Left sidebar showing list of pending cases for moderation (desktop only)
 */

import { View, FlatList, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge } from '@lomito/ui/components/badge';
import { Body, Caption, H3 } from '@lomito/ui/components/typography';
import { TextInput } from '@lomito/ui';
import { colors, spacing, borderRadius } from '@lomito/ui/theme/tokens';
import type {
  CaseCategory,
  AnimalType,
  UrgencyLevel,
} from '@lomito/shared/types/database';
import { formatDistanceToNow } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import { memo } from 'react';

interface QueueItem {
  id: string;
  category: CaseCategory;
  animal_type: AnimalType;
  urgency: UrgencyLevel;
  description: string;
  created_at: string;
  flag_count?: number;
}

interface QueueSidebarProps {
  cases: QueueItem[];
  selectedCaseId: string | null;
  onSelectCase: (caseId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  jurisdiction?: string;
}

export const QueueSidebar = memo(function QueueSidebar({
  cases,
  selectedCaseId,
  onSelectCase,
  searchQuery,
  onSearchChange,
  jurisdiction,
}: QueueSidebarProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'es' ? es : enUS;

  const filteredCases = searchQuery
    ? cases.filter(
        (c) =>
          c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : cases;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <H3>{t('moderation.queue')}</H3>
        {jurisdiction && (
          <Badge
            label={jurisdiction}
            color={colors.secondary}
            backgroundColor={colors.secondaryLight}
            accessibilityLabel={`${t('moderation.moderatorStatus')}: ${jurisdiction}`}
          />
        )}
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder={t('moderation.searchPlaceholder')}
          accessibilityLabel={t('moderation.searchPlaceholder')}
        />
      </View>

      <FlatList
        data={filteredCases}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <QueueCard
            item={item}
            isSelected={item.id === selectedCaseId}
            onPress={() => onSelectCase(item.id)}
            locale={locale}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
      />
    </View>
  );
});

interface QueueCardProps {
  item: QueueItem;
  isSelected: boolean;
  onPress: () => void;
  locale: Locale;
}

const QueueCard = memo(function QueueCard({
  item,
  isSelected,
  onPress,
  locale,
}: QueueCardProps) {
  const { t } = useTranslation();

  const categoryColor = colors.category[item.category].pin;
  const categoryBgColor = colors.category[item.category].background;

  const timeAgo = formatDistanceToNow(new Date(item.created_at), {
    addSuffix: true,
    locale,
  });

  const isNew =
    new Date().getTime() - new Date(item.created_at).getTime() < 86400000;
  const isFlagged = (item.flag_count ?? 0) > 0;
  const isHighPriority = item.urgency === 'high' || item.urgency === 'critical';

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, isSelected && styles.cardSelected]}
      accessibilityRole="button"
      accessibilityLabel={`${t(`category.${item.category}`)} - ${t(`animal.${item.animal_type}`)}`}
    >
      <View style={styles.cardHeader}>
        <View style={styles.badges}>
          {isNew && (
            <Badge
              label={t('moderation.newBadge')}
              color={colors.info}
              backgroundColor={colors.infoBackground}
              accessibilityLabel={t('moderation.newBadge')}
            />
          )}
          {isFlagged && (
            <Badge
              label={t('moderation.flaggedBadge')}
              color={colors.warning}
              backgroundColor={colors.warningBackground}
              accessibilityLabel={t('moderation.flaggedBadge')}
            />
          )}
        </View>
        <Caption style={styles.timeAgo}>{timeAgo}</Caption>
      </View>

      <View style={styles.categoryBadgeContainer}>
        <Badge
          label={t(`category.${item.category}`)}
          color={categoryColor}
          backgroundColor={categoryBgColor}
          accessibilityLabel={t(`category.${item.category}`)}
        />
      </View>

      <Body numberOfLines={2} style={styles.description}>
        {item.description}
      </Body>

      {isHighPriority && (
        <Caption style={styles.highPriority}>
          {t('moderation.highPriority')}
        </Caption>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  badges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  cardSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  categoryBadgeContainer: {
    marginBottom: spacing.xs,
  },
  container: {
    backgroundColor: colors.neutral100,
    borderRightColor: colors.neutral200,
    borderRightWidth: 1,
    flex: 1,
    width: 320,
  },
  description: {
    color: colors.neutral700,
  },
  header: {
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    gap: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  highPriority: {
    color: colors.error,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  searchContainer: {
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  timeAgo: {
    color: colors.neutral500,
  },
});
