/**
 * FlagButton Component
 * Displays a flag button for community moderation with reason selection.
 */

import { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Flag } from 'lucide-react-native';
import {
  colors,
  spacing,
  iconSizes,
  borderRadius,
  typography,
} from '@lomito/ui/theme/tokens';
import { AppModal } from '@lomito/ui';
import { useFlagCase } from '../../hooks/use-flag-case';
import { useAuth } from '../../hooks/use-auth';

interface FlagButtonProps {
  caseId: string;
  reporterId: string;
}

export function FlagButton({ caseId, reporterId }: FlagButtonProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { flagCase, hasUserFlagged, loading } = useFlagCase(caseId);
  const [modal, setModal] = useState<{
    title: string;
    message: string;
    onDismiss?: () => void;
  } | null>(null);
  const [showReasonPicker, setShowReasonPicker] = useState(false);

  // Don't show flag button on user's own reports
  if (!user || user.id === reporterId) {
    return null;
  }

  const handleFlagPress = () => {
    if (hasUserFlagged) {
      return;
    }

    setShowReasonPicker(true);
  };

  const handleFlag = async (reason: string) => {
    setShowReasonPicker(false);
    try {
      await flagCase(caseId, reason);
      setModal({ title: t('flag.thankYou'), message: '' });
    } catch (error) {
      setModal({
        title: t('common.error'),
        message: error instanceof Error ? error.message : t('common.error'),
      });
    }
  };

  return (
    <>
      <Pressable
        onPress={handleFlagPress}
        disabled={hasUserFlagged || loading}
        accessibilityLabel={
          hasUserFlagged ? t('flag.alreadyFlagged') : t('flag.report')
        }
        accessibilityRole="button"
        accessibilityState={{ disabled: hasUserFlagged || loading }}
        style={({ pressed }) => [
          styles.button,
          pressed && !hasUserFlagged && styles.buttonPressed,
          hasUserFlagged && styles.buttonDisabled,
        ]}
      >
        <View style={styles.content}>
          <Flag
            size={iconSizes.default}
            color={hasUserFlagged ? colors.neutral400 : colors.accent}
            strokeWidth={1.5}
          />
          {hasUserFlagged && (
            <Text style={styles.disabledText}>{t('flag.alreadyFlagged')}</Text>
          )}
        </View>
      </Pressable>

      <AppModal
        visible={showReasonPicker}
        title={t('flag.reason')}
        actions={[
          {
            label: t('flag.spam'),
            onPress: () => handleFlag('spam'),
          },
          {
            label: t('flag.inappropriate'),
            onPress: () => handleFlag('inappropriate'),
          },
          {
            label: t('flag.duplicate'),
            onPress: () => handleFlag('duplicate'),
          },
          {
            label: t('flag.other'),
            onPress: () => handleFlag('other'),
          },
          {
            label: t('common.cancel'),
            onPress: () => setShowReasonPicker(false),
            variant: 'ghost',
          },
        ]}
        onClose={() => setShowReasonPicker(false)}
      />

      <AppModal
        visible={!!modal}
        title={modal?.title ?? ''}
        message={modal?.message}
        actions={[
          {
            label: t('common.ok'),
            onPress: () => {
              const onDismiss = modal?.onDismiss;
              setModal(null);
              onDismiss?.();
            },
          },
        ]}
        onClose={() => {
          const onDismiss = modal?.onDismiss;
          setModal(null);
          onDismiss?.();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: borderRadius.button,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    backgroundColor: colors.warningBackground,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  disabledText: {
    color: colors.neutral400,
    fontSize: typography.caption.fontSize,
  },
});
