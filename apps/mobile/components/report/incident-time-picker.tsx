/**
 * IncidentTimePicker Component
 * Lets the user select when an incident occurred via quick-select pills
 * or a custom date entry.
 */

import { useState } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Body, BodySmall, Caption, TextInput } from '@lomito/ui';
import { colors, spacing, borderRadius } from '@lomito/ui/src/theme/tokens';

export interface IncidentTimePickerProps {
  value: string | null;
  onChange: (isoDate: string) => void;
}

type QuickOptionKey =
  | 'justNow'
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'overWeek'
  | 'custom';

/** Returns midnight (start of day) for a date offset by `daysBack` from today. */
function startOfDayOffset(daysBack: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Returns the most recent Monday at midnight. */
function startOfThisWeek(): Date {
  const d = new Date();
  const dayOfWeek = d.getDay(); // 0 = Sunday
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  d.setDate(d.getDate() - daysToMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

function resolveQuickOptionDate(key: QuickOptionKey): Date | null {
  switch (key) {
    case 'justNow':
      return new Date();
    case 'today':
      return startOfDayOffset(0);
    case 'yesterday':
      return startOfDayOffset(1);
    case 'thisWeek':
      return startOfThisWeek();
    case 'overWeek':
      return startOfDayOffset(7);
    case 'custom':
      return null;
  }
}

/** Format an ISO string for display in the review/confirmation area. */
function formatDisplayDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Try to parse a user-entered date string (YYYY-MM-DD) to an ISO timestamp. */
function parseCustomDateInput(input: string): string | null {
  // Accept YYYY-MM-DD format
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.trim());
  if (!match) return null;
  const d = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00`);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function IncidentTimePicker({
  value,
  onChange,
}: IncidentTimePickerProps) {
  const { t } = useTranslation();
  const [selectedKey, setSelectedKey] = useState<QuickOptionKey | null>(null);
  const [customDateInput, setCustomDateInput] = useState('');
  const [customDateError, setCustomDateError] = useState(false);

  const quickOptions: { key: QuickOptionKey; label: string }[] = [
    { key: 'justNow', label: t('report.incidentJustNow') },
    { key: 'today', label: t('report.incidentToday') },
    { key: 'yesterday', label: t('report.incidentYesterday') },
    { key: 'thisWeek', label: t('report.incidentThisWeek') },
    { key: 'overWeek', label: t('report.incidentOverWeek') },
    { key: 'custom', label: t('report.incidentSelectDate') },
  ];

  const handlePillPress = (key: QuickOptionKey) => {
    setSelectedKey(key);
    setCustomDateError(false);

    if (key !== 'custom') {
      const date = resolveQuickOptionDate(key);
      if (date) {
        onChange(date.toISOString());
      }
    }
    // For 'custom', wait for text input
  };

  const handleCustomDateChange = (text: string) => {
    setCustomDateInput(text);
    setCustomDateError(false);

    const parsed = parseCustomDateInput(text);
    if (parsed) {
      onChange(parsed);
      setCustomDateError(false);
    }
  };

  const handleCustomDateBlur = () => {
    if (customDateInput.trim().length > 0) {
      const parsed = parseCustomDateInput(customDateInput);
      setCustomDateError(parsed === null);
    }
  };

  return (
    <View style={styles.container}>
      <Body style={styles.label}>{t('report.whenIncident')}</Body>

      <View style={styles.pillsRow}>
        {quickOptions.map(({ key, label }) => {
          const isSelected = selectedKey === key;
          return (
            <Pressable
              key={key}
              onPress={() => handlePillPress(key)}
              style={[styles.pill, isSelected && styles.pillSelected]}
              accessibilityLabel={label}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <BodySmall
                style={
                  isSelected
                    ? { ...styles.pillText, ...styles.pillTextSelected }
                    : styles.pillText
                }
              >
                {label}
              </BodySmall>
            </Pressable>
          );
        })}
      </View>

      {selectedKey === 'custom' && (
        <View style={styles.customDateContainer}>
          <TextInput
            label={t('report.incidentSelectDate')}
            value={customDateInput}
            onChangeText={handleCustomDateChange}
            onBlur={handleCustomDateBlur}
            placeholder={Platform.OS === 'web' ? 'YYYY-MM-DD' : 'YYYY-MM-DD'}
            accessibilityLabel={t('report.incidentSelectDate')}
            keyboardType="numeric"
          />
          {customDateError && (
            <Caption color={colors.error} style={styles.errorText}>
              {t('report.incidentDateInvalid')}
            </Caption>
          )}
        </View>
      )}

      {value !== null && selectedKey !== null && (
        <Caption color={colors.neutral500} style={styles.selectedDateDisplay}>
          {formatDisplayDate(value)}
        </Caption>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  customDateContainer: {
    marginTop: spacing.sm,
  },
  errorText: {
    marginTop: spacing.xs,
  },
  label: {
    marginBottom: spacing.sm,
  },
  pill: {
    backgroundColor: colors.neutral100,
    borderRadius: borderRadius.pill,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  pillSelected: {
    backgroundColor: colors.primary,
  },
  pillText: {
    color: colors.neutral700,
  },
  pillTextSelected: {
    color: colors.secondary,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  selectedDateDisplay: {
    marginTop: spacing.xs,
  },
});
