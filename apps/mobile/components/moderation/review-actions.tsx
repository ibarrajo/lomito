/**
 * Review Actions
 * Handles moderation action dialogs (verify/reject/flag)
 */

import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCaseActions } from '../../hooks/use-case-actions';

interface UseReviewActionsResult {
  handleVerify: (caseId: string) => void;
  handleReject: (caseId: string) => void;
  handleFlag: (caseId: string) => void;
  loading: boolean;
  error: string | null;
}

export function useReviewActions(onSuccess?: () => void): UseReviewActionsResult {
  const { t } = useTranslation();
  const { updateCaseStatus, rejectCase, flagCase, loading, error } = useCaseActions();

  function handleVerify(caseId: string): void {
    Alert.alert(
      t('moderation.confirmVerify'),
      '',
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('moderation.verify'),
          onPress: async () => {
            try {
              await updateCaseStatus(caseId, 'verified');
              Alert.alert(t('common.done'), t('moderation.verifySuccess'));
              onSuccess?.();
            } catch (err) {
              Alert.alert(t('common.error'), t('moderation.actionError'));
            }
          },
        },
      ],
    );
  }

  function handleReject(caseId: string): void {
    Alert.prompt(
      t('moderation.confirmReject'),
      t('moderation.rejectReason'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('moderation.reject'),
          onPress: async (reason?: string) => {
            try {
              await rejectCase(caseId, reason ?? '');
              Alert.alert(t('common.done'), t('moderation.rejectSuccess'));
              onSuccess?.();
            } catch (err) {
              Alert.alert(t('common.error'), t('moderation.actionError'));
            }
          },
        },
      ],
      'plain-text',
    );
  }

  function handleFlag(caseId: string): void {
    Alert.alert(
      t('moderation.confirmFlag'),
      '',
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('moderation.flag'),
          onPress: async () => {
            try {
              await flagCase(caseId);
              Alert.alert(t('common.done'), t('moderation.flagSuccess'));
              onSuccess?.();
            } catch (err) {
              Alert.alert(t('common.error'), t('moderation.actionError'));
            }
          },
        },
      ],
    );
  }

  return {
    handleVerify,
    handleReject,
    handleFlag,
    loading,
    error,
  };
}
