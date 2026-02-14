/**
 * Folio Input Component
 * Modal/Alert for assigning government folio/tracking number to a case
 */

import { useState } from 'react';
import { View, TextInput, StyleSheet, Modal, Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { H3, Body } from '@lomito/ui/components/typography';
import { AppModal } from '@lomito/ui';
import { colors, spacing, borderRadius, typography } from '@lomito/ui/theme/tokens';

interface FolioInputProps {
  visible: boolean;
  caseId: string;
  currentFolio: string | null;
  onSave: (caseId: string, folio: string) => Promise<void>;
  onDismiss: () => void;
}

export function FolioInput({
  visible,
  caseId,
  currentFolio,
  onSave,
  onDismiss,
}: FolioInputProps) {
  const { t } = useTranslation();
  const [folio, setFolio] = useState(currentFolio || '');
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<{ title: string; message: string; onDismiss?: () => void } | null>(null);

  async function handleSave() {
    if (!folio.trim()) {
      setModal({ title: t('common.error'), message: t('government.folioRequired') });
      return;
    }

    try {
      setSaving(true);
      await onSave(caseId, folio.trim());
      onDismiss();
      setFolio('');
    } catch (error) {
      setModal({ title: t('common.error'), message: t('government.folioError') });
    } finally {
      setSaving(false);
    }
  }

  function handleDismiss() {
    setFolio(currentFolio || '');
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
            <H3 style={styles.title}>{t('government.assignFolio')}</H3>
            <Body style={styles.description}>{t('government.folioDescription')}</Body>

            <TextInput
              style={styles.input}
              value={folio}
              onChangeText={setFolio}
              placeholder={t('government.folioPlaceholder')}
              placeholderTextColor={colors.neutral400}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!saving}
              accessibilityLabel={t('government.folioPlaceholder')}
            />

            <View style={styles.buttons}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={handleDismiss}
                disabled={saving}
                accessibilityRole="button"
                accessibilityLabel={t('common.cancel')}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>
                  {t('common.cancel')}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={saving || !folio.trim()}
                accessibilityRole="button"
                accessibilityLabel={t('common.save')}
              >
                <Text style={[styles.buttonText, styles.saveButtonText]}>
                  {saving ? t('common.saving') : t('common.save')}
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
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.body.fontSize,
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
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: colors.white,
  },
  title: {
    marginBottom: spacing.sm,
  },
});
