import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, typography } from '@lomito/ui/src/theme/tokens';

interface ReportEntry {
  category: 'abuse' | 'stray' | 'missing';
  location: string;
  timeAgo: string;
  status: 'pending' | 'verified' | 'in_progress' | 'resolved';
}

const MOCK_REPORTS: ReportEntry[] = [
  { category: 'abuse', location: 'Col. Libertad', timeAgo: 'hace 2h', status: 'pending' },
  { category: 'stray', location: 'Zona Centro', timeAgo: 'hace 4h', status: 'verified' },
  { category: 'missing', location: 'Playas de Tijuana', timeAgo: 'hace 6h', status: 'in_progress' },
  { category: 'stray', location: 'Col. Sánchez Taboada', timeAgo: 'hace 8h', status: 'verified' },
  { category: 'abuse', location: 'Zona Río', timeAgo: 'hace 10h', status: 'in_progress' },
  { category: 'missing', location: 'La Mesa', timeAgo: 'hace 12h', status: 'resolved' },
  { category: 'stray', location: 'Col. Cacho', timeAgo: 'hace 14h', status: 'verified' },
  { category: 'abuse', location: 'Otay', timeAgo: 'hace 16h', status: 'pending' },
];

const getCategoryColor = (category: ReportEntry['category']): string => {
  switch (category) {
    case 'abuse':
      return colors.primary;
    case 'stray':
      return colors.accent;
    case 'missing':
      return colors.secondary;
    default:
      return colors.neutral500;
  }
};

const getStatusColor = (status: ReportEntry['status']): string => {
  switch (status) {
    case 'pending':
      return colors.neutral400;
    case 'verified':
      return colors.info;
    case 'in_progress':
      return colors.warning;
    case 'resolved':
      return colors.success;
    default:
      return colors.neutral400;
  }
};

const getStatusBackground = (status: ReportEntry['status']): string => {
  switch (status) {
    case 'pending':
      return colors.neutral100;
    case 'verified':
      return colors.infoBackground;
    case 'in_progress':
      return colors.warningBackground;
    case 'resolved':
      return colors.successBackground;
    default:
      return colors.neutral100;
  }
};

export function RecentReportsTicker() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {MOCK_REPORTS.map((report, index) => (
        <View key={index} style={styles.reportRow}>
          <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(report.category) }]} />
          <View style={styles.reportContent}>
            <Text style={styles.locationText}>{report.location}</Text>
            <Text style={styles.timeText}>{report.timeAgo}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBackground(report.status) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
              {t(`status.${report.status}`)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  categoryDot: {
    borderRadius: borderRadius.pill,
    height: 8,
    width: 8,
  },
  container: {
    gap: spacing.sm,
  },
  locationText: {
    color: colors.neutral700,
    flex: 1,
    fontSize: typography.body.fontSize,
    fontWeight: '400',
  },
  reportContent: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  reportRow: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.button,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusBadge: {
    borderRadius: borderRadius.button,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  timeText: {
    color: colors.neutral400,
    fontSize: typography.small.fontSize,
  },
});
