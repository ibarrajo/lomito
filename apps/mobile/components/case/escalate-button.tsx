/**
 * EscalateButton Component
 * Button to escalate a case to jurisdiction authorities via email.
 * Only visible to moderators/admins for verified or in_progress cases.
 */

import { View, StyleSheet, Alert, Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography } from '@lomito/ui/theme/tokens';
import { useEscalateCase } from '../../hooks/use-escalate-case';
import type { CaseStatus, UserRole } from '@lomito/shared/types/database';

interface EscalateButtonProps {
  caseId: string;
  status: CaseStatus;
  escalatedAt: string | null;
  userRole: UserRole;
  onEscalated?: () => void;
}

export function EscalateButton({
  caseId,
  status,
  escalatedAt,
  userRole,
  onEscalated,
}: EscalateButtonProps) {
  const { t } = useTranslation();
  const { escalateCase, loading } = useEscalateCase();

  // Only show to moderators and admins
  if (userRole !== 'moderator' && userRole !== 'admin') {
    return null;
  }

  // Only show for verified or in_progress cases
  if (status !== 'verified' && status !== 'in_progress') {
    return null;
  }

  // If already escalated, show status instead of button
  if (escalatedAt) {
    const escalatedDate = new Date(escalatedAt).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <View style={styles.escalatedContainer}>
        <AlertTriangle
          size={16}
          color={colors.accent}
          strokeWidth={2}
        />
        <Text style={styles.escalatedText}>
          {t('escalation.escalatedAt', { date: escalatedDate })}
        </Text>
      </View>
    );
  }

  const handleEscalate = () => {
    Alert.alert(
      t('escalation.escalate'),
      t('escalation.confirmEscalate'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.confirm'),
          style: 'default',
          onPress: async () => {
            try {
              await escalateCase(caseId);
              Alert.alert(
                t('escalation.escalated'),
                t('escalation.pendingResponse'),
              );
              onEscalated?.();
            } catch (err) {
              Alert.alert(
                t('common.error'),
                err instanceof Error ? err.message : t('common.error'),
              );
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <Pressable
      onPress={handleEscalate}
      disabled={loading}
      accessibilityLabel={t('escalation.escalate')}
      accessibilityRole="button"
      accessibilityState={{ disabled: loading }}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        loading && styles.buttonDisabled,
      ]}
    >
      <View style={styles.content}>
        <AlertTriangle
          size={20}
          color={colors.white}
          strokeWidth={2}
        />
        <Text style={styles.buttonText}>
          {loading ? t('common.loading') : t('escalation.escalate')}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.warning,
    borderRadius: borderRadius.button,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    backgroundColor: '#CC6119',
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  escalatedContainer: {
    alignItems: 'center',
    backgroundColor: colors.warningBackground,
    borderRadius: borderRadius.button,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  escalatedText: {
    color: colors.warning,
    fontSize: typography.small.fontSize,
    fontWeight: '600' as const,
  },
});
