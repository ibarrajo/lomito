/**
 * Review Actions
 * Handles moderation action dialogs (verify/reject/flag)
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCaseActions } from '../../hooks/use-case-actions';

interface UseReviewActionsResult {
  handleVerify: (caseId: string) => void;
  handleReject: (caseId: string) => void;
  handleFlag: (caseId: string) => void;
  loading: boolean;
  error: string | null;
  modal: { title: string; message: string; onDismiss?: () => void } | null;
  setModal: (
    modal: { title: string; message: string; onDismiss?: () => void } | null,
  ) => void;
  confirmVerify: { caseId: string } | null;
  setConfirmVerify: (confirm: { caseId: string } | null) => void;
  confirmReject: { caseId: string } | null;
  setConfirmReject: (confirm: { caseId: string } | null) => void;
  rejectReason: string;
  setRejectReason: (reason: string) => void;
  confirmRejectAction: () => Promise<void>;
  confirmFlag: { caseId: string } | null;
  setConfirmFlag: (confirm: { caseId: string } | null) => void;
  confirmVerifyAction: () => Promise<void>;
  confirmFlagAction: () => Promise<void>;
}

export function useReviewActions(
  onSuccess?: () => void,
): UseReviewActionsResult {
  const { t } = useTranslation();
  const { updateCaseStatus, rejectCase, flagCase, loading, error } =
    useCaseActions();
  const [modal, setModal] = useState<{
    title: string;
    message: string;
    onDismiss?: () => void;
  } | null>(null);
  const [confirmVerify, setConfirmVerify] = useState<{ caseId: string } | null>(
    null,
  );
  const [confirmReject, setConfirmReject] = useState<{ caseId: string } | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState('');
  const [confirmFlag, setConfirmFlag] = useState<{ caseId: string } | null>(
    null,
  );

  function handleVerify(caseId: string): void {
    setConfirmVerify({ caseId });
  }

  async function confirmVerifyAction(): Promise<void> {
    if (!confirmVerify) return;

    try {
      await updateCaseStatus(confirmVerify.caseId, 'verified');
      setConfirmVerify(null);
      setModal({
        title: t('common.done'),
        message: t('moderation.verifySuccess'),
      });
      onSuccess?.();
    } catch (err) {
      setConfirmVerify(null);
      setModal({
        title: t('common.error'),
        message: t('moderation.actionError'),
      });
    }
  }

  function handleReject(caseId: string): void {
    setRejectReason('');
    setConfirmReject({ caseId });
  }

  async function confirmRejectAction(): Promise<void> {
    if (!confirmReject) return;

    try {
      await rejectCase(confirmReject.caseId, rejectReason);
      setConfirmReject(null);
      setRejectReason('');
      setModal({
        title: t('common.done'),
        message: t('moderation.rejectSuccess'),
      });
      onSuccess?.();
    } catch (err) {
      setConfirmReject(null);
      setRejectReason('');
      setModal({
        title: t('common.error'),
        message: t('moderation.actionError'),
      });
    }
  }

  function handleFlag(caseId: string): void {
    setConfirmFlag({ caseId });
  }

  async function confirmFlagAction(): Promise<void> {
    if (!confirmFlag) return;

    try {
      await flagCase(confirmFlag.caseId);
      setConfirmFlag(null);
      setModal({
        title: t('common.done'),
        message: t('moderation.flagSuccess'),
      });
      onSuccess?.();
    } catch (err) {
      setConfirmFlag(null);
      setModal({
        title: t('common.error'),
        message: t('moderation.actionError'),
      });
    }
  }

  return {
    handleVerify,
    handleReject,
    handleFlag,
    loading,
    error,
    modal,
    setModal,
    confirmVerify,
    setConfirmVerify,
    confirmReject,
    setConfirmReject,
    rejectReason,
    setRejectReason,
    confirmRejectAction,
    confirmFlag,
    setConfirmFlag,
    confirmVerifyAction,
    confirmFlagAction,
  };
}
