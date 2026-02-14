/**
 * FlagButton Component
 * Displays a flag button for community moderation with reason selection.
 */

import { View, StyleSheet, Alert, Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Flag } from 'lucide-react-native';
import { colors, spacing, iconSizes } from '@lomito/ui/theme/tokens';
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

  // Don't show flag button on user's own reports
  if (!user || user.id === reporterId) {
    return null;
  }

  const handleFlagPress = () => {
    if (hasUserFlagged) {
      return;
    }

    Alert.alert(
      t('flag.reason'),
      '',
      [
        {
          text: t('flag.spam'),
          onPress: () => handleFlag('spam'),
        },
        {
          text: t('flag.inappropriate'),
          onPress: () => handleFlag('inappropriate'),
        },
        {
          text: t('flag.duplicate'),
          onPress: () => handleFlag('duplicate'),
        },
        {
          text: t('flag.other'),
          onPress: () => handleFlag('other'),
        },
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  const handleFlag = async (reason: string) => {
    try {
      await flagCase(caseId, reason);
      Alert.alert(t('flag.thankYou'));
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('common.error'),
      );
    }
  };

  return (
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
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
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
    fontSize: 12,
  },
});
