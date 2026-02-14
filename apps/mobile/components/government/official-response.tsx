/**
 * Official Response Component
 * Modal for posting official government response to a case
 */

import { useState } from 'react';
import { View, TextInput, StyleSheet, Modal, Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { H3, Body } from '@lomito/ui/components/typography';
import { AppModal } from '@lomito/ui';
import { colors, spacing, borderRadius, typography } from '@lomito/ui/theme/tokens';

interface OfficialResponseProps {
  visible: boolean;
  caseId: string;
  onSubmit: (caseId: string, responseText: string) => Promise<void>;
  onDismiss: () => void;
}

export function OfficialResponse({
  visible,
  caseId,
  onSubmit,
  onDismiss,
}: OfficialResponseProps) {
  const { t } = useTranslation();
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<{ title: string; message: string; onDismiss?: () => void } | null>(null);

  async function handleSubmit() {
    if (!response.trim()) {
      setModal({ title: t('common.error'), message: t('government.responseRequired') });
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(caseId, response.trim());
      onDismiss();
      setResponse('');
    } catch (error) {
      setModal({ title: t('common.error'), message: t('government.responseError') });
    } finally {
      setSubmitting(false);
    }
  }

  function handleDismiss() {
    setResponse('');
    onDismiss();
  }

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleDismiss}
      >
        <Pressable style={styles.overlay} onPress={handleDismiss}>
          <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
            <H3 style={styles.title}>{t('government.officialResponse')}</H3>
            <Body style={styles.description}>{t('government.responseDescription')}</Body>

            <TextInput
              style={styles.input}
              value={response}
              onChangeText={setResponse}
              placeholder={t('government.responsePlaceholder')}
              placeholderTextColor={colors.neutral400}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!submitting}
              accessibilityLabel={t('government.responsePlaceholder')}
            />

            <View style={styles.buttons}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={handleDismiss}
                disabled={submitting}
                accessibilityRole="button"
                accessibilityLabel={t('common.cancel')}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>
                  {t('common.cancel')}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
                disabled={submitting || !response.trim()}
                accessibilityRole="button"
                accessibilityLabel={t('common.submit')}
              >
                <Text style={[styles.buttonText, styles.submitButtonText]}>
                  {submitting ? t('common.submitting') : t('common.submit')}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <AppModal
        visible={!!modal}
        title={modal?.title ?? ''}
        message={modal?.message}
        actions={[{
          label: t('common.ok'),
          onPress: () => {
            const onDismiss = modal?.onDismiss;
            setModal(null);
            onDismiss?.();
          },
        }]}
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
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  buttonText: {
    fontFamily: typography.button.fontFamily,
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    backgroundColor: colors.neutral100,
  },
  cancelButtonText: {
    color: colors.neutral700,
  },
  description: {
    color: colors.neutral700,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.input,
    borderWidth: 1,
    color: colors.neutral900,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.body.fontSize,
    minHeight: 120,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    width: '100%',
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(31, 35, 40, 0.7)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  submitButton: {
    backgroundColor: colors.secondary,
  },
  submitButtonText: {
    color: colors.white,
  },
  title: {
    marginBottom: spacing.sm,
  },
});
