import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  colors,
  spacing,
  borderRadius,
  typography,
} from '@lomito/ui/src/theme/tokens';
import { supabase } from '../../lib/supabase';

interface ReportEntry {
  category: 'abuse' | 'stray' | 'missing';
  location: string;
  timeAgo: string;
  status: 'pending' | 'verified' | 'in_progress' | 'resolved';
}

const FALLBACK_REPORTS: ReportEntry[] = [
  {
    category: 'abuse',
    location: 'Col. Libertad',
    timeAgo: '2h',
    status: 'pending',
  },
  {
    category: 'stray',
    location: 'Zona Centro',
    timeAgo: '4h',
    status: 'verified',
  },
  {
    category: 'missing',
    location: 'Playas de Tijuana',
    timeAgo: '6h',
    status: 'in_progress',
  },
  {
    category: 'stray',
    location: 'Col. Sánchez Taboada',
    timeAgo: '8h',
    status: 'verified',
  },
  {
    category: 'abuse',
    location: 'Zona Río',
    timeAgo: '10h',
    status: 'in_progress',
  },
  {
    category: 'missing',
    location: 'La Mesa',
    timeAgo: '12h',
    status: 'resolved',
  },
];

function formatTimeAgo(dateString: string, locale: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return locale === 'es' ? `${diffDays}d` : `${diffDays}d`;
  }
  if (diffHours > 0) {
    return `${diffHours}h`;
  }
  return locale === 'es' ? '<1h' : '<1h';
}

function extractLocation(description: string): string {
  // Use first ~25 chars of description as anonymized location hint
  if (!description) return '---';
  const trimmed = description.slice(0, 30);
  return trimmed.length < description.length ? `${trimmed}...` : trimmed;
}

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
  const { t, i18n } = useTranslation();
  const [reports, setReports] = useState<ReportEntry[]>(FALLBACK_REPORTS);

  useEffect(() => {
    async function fetchRecentCases() {
      try {
        const { data, error } = await supabase
          .from('cases')
          .select('category, description, status, created_at')
          .order('created_at', { ascending: false })
          .limit(8);

        if (error || !data || data.length === 0) return;

        const rows = data as Array<{
          category: string;
          description: string | null;
          status: string;
          created_at: string;
        }>;

        const mapped: ReportEntry[] = rows.map((c) => ({
          category: c.category as ReportEntry['category'],
          location: extractLocation(c.description ?? ''),
          timeAgo: formatTimeAgo(c.created_at, i18n.language),
          status: c.status as ReportEntry['status'],
        }));

        setReports(mapped);
      } catch {
        // Keep fallback data on error
      }
    }

    fetchRecentCases();
  }, [i18n.language]);

  return (
    <View style={styles.container}>
      {reports.map((report, index) => (
        <View key={index} style={styles.reportRow}>
          <View
            style={[
              styles.categoryDot,
              { backgroundColor: getCategoryColor(report.category) },
            ]}
          />
          <View style={styles.reportContent}>
            <Text style={styles.locationText}>{report.location}</Text>
            <Text style={styles.timeText}>{report.timeAgo}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusBackground(report.status) },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(report.status) },
              ]}
            >
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
