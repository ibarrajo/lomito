import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Button,
  TextInput,
  H1,
  H2,
  Body,
  BodySmall,
  AppModal,
} from '@lomito/ui';
import { colors, spacing, borderRadius } from '@lomito/ui/src/theme/tokens';
import { useAuth } from '../../hooks/use-auth';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { supabase } from '../../lib/supabase';
import type {
  Profile,
  Jurisdiction,
  Database,
} from '@lomito/shared/types/database';

const REPORT_TYPES = [
  'abuse',
  'injured',
  'stray',
  'missing',
  'zoonotic',
  'dead_animal',
  'dangerous_dog',
  'distress',
  'illegal_sales',
  'wildlife',
  'noise_nuisance',
] as const;

const MODAL_OVERLAY_COLOR = 'rgba(0, 0, 0, 0.5)';

export default function SubmitAuthorityScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { isDesktop } = useBreakpoint();

  const [dependencyName, setDependencyName] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [url, setUrl] = useState('');
  const [selectedReportTypes, setSelectedReportTypes] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReportTypePicker, setShowReportTypePicker] = useState(false);
  const [modal, setModal] = useState<{
    title: string;
    message: string;
    onDismiss?: () => void;
  } | null>(null);

  const toggleReportType = (type: string) => {
    setSelectedReportTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleSubmit = async () => {
    // Validation
    if (!dependencyName.trim()) {
      setModal({
        title: t('common.error'),
        message: t('authoritySubmission.dependencyNameRequired'),
      });
      return;
    }

    if (!email.trim() && !phone.trim() && !url.trim()) {
      setModal({
        title: t('common.error'),
        message: t('authoritySubmission.contactRequired'),
      });
      return;
    }

    if (!user) {
      setModal({
        title: t('common.error'),
        message: t('authoritySubmission.mustBeLoggedIn'),
      });
      return;
    }

    setLoading(true);
    try {
      // Get user's municipality from profile to use as jurisdiction
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('municipality')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const profileData = profile as unknown as Profile;

      if (!profileData.municipality) {
        throw new Error(t('authoritySubmission.municipalityRequired'));
      }

      // Get jurisdiction ID from municipality name
      const { data: jurisdiction, error: jurisdictionError } = await supabase
        .from('jurisdictions')
        .select('id')
        .eq('name', profileData.municipality)
        .eq('level', 'municipality')
        .single();

      if (jurisdictionError) throw jurisdictionError;

      const jurisdictionData = jurisdiction as unknown as Jurisdiction;

      const submissionData: Database['public']['Tables']['authority_submissions']['Insert'] =
        {
          jurisdiction_id: jurisdictionData.id,
          submitted_by: user.id,
          status: 'pending',
          dependency_name: dependencyName.trim(),
          department_name: departmentName.trim() || null,
          contact_name: contactName.trim() || null,
          email: email.trim() || null,
          phone: phone.trim() || null,
          url: url.trim() || null,
          handles_report_types: selectedReportTypes,
          notes: notes.trim() || null,
          reviewed_by: null,
          reviewed_at: null,
        };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('authority_submissions')
        .insert(submissionData);

      if (error) throw error;

      setModal({
        title: t('common.done'),
        message: t('authoritySubmission.successMessage'),
        onDismiss: () => router.back(),
      });
    } catch (error) {
      console.error('Error submitting authority:', error);
      setModal({
        title: t('common.error'),
        message: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[styles.outerContainer, isDesktop && styles.outerContainerRow]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.formWrapper}>
          <View style={styles.header}>
            <H1 accessibilityLabel={t('authoritySubmission.title')}>
              {t('authoritySubmission.title')}
            </H1>
            <BodySmall
              color={colors.neutral700}
              style={styles.description}
              accessibilityLabel={t('authoritySubmission.description')}
            >
              {t('authoritySubmission.description')}
            </BodySmall>
          </View>

          <View style={styles.form}>
            <TextInput
              label={t('authoritySubmission.dependencyName')}
              value={dependencyName}
              onChangeText={setDependencyName}
              placeholder={t('authoritySubmission.dependencyNamePlaceholder')}
              accessibilityLabel={t('authoritySubmission.dependencyName')}
            />

            <TextInput
              label={t('authoritySubmission.departmentName')}
              value={departmentName}
              onChangeText={setDepartmentName}
              placeholder={t('authoritySubmission.departmentNamePlaceholder')}
              accessibilityLabel={t('authoritySubmission.departmentName')}
            />

            <TextInput
              label={t('authoritySubmission.contactName')}
              value={contactName}
              onChangeText={setContactName}
              placeholder={t('authoritySubmission.contactNamePlaceholder')}
              accessibilityLabel={t('authoritySubmission.contactName')}
              autoCapitalize="words"
            />

            <TextInput
              label={t('authoritySubmission.email')}
              value={email}
              onChangeText={setEmail}
              placeholder={t('authoritySubmission.emailPlaceholder')}
              accessibilityLabel={t('authoritySubmission.email')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              label={t('authoritySubmission.phone')}
              value={phone}
              onChangeText={setPhone}
              placeholder={t('authoritySubmission.phonePlaceholder')}
              accessibilityLabel={t('authoritySubmission.phone')}
              keyboardType="phone-pad"
            />

            <TextInput
              label={t('authoritySubmission.url')}
              value={url}
              onChangeText={setUrl}
              placeholder={t('authoritySubmission.urlPlaceholder')}
              accessibilityLabel={t('authoritySubmission.url')}
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View>
              <BodySmall
                color={colors.neutral700}
                style={styles.label}
                accessibilityLabel={t('authoritySubmission.handlesReportTypes')}
              >
                {t('authoritySubmission.handlesReportTypes')}
              </BodySmall>
              <Pressable
                onPress={() => setShowReportTypePicker(true)}
                style={styles.picker}
                accessibilityLabel={t('authoritySubmission.handlesReportTypes')}
                accessibilityRole="button"
              >
                <Body
                  color={
                    selectedReportTypes.length > 0
                      ? colors.neutral900
                      : colors.neutral400
                  }
                  accessibilityLabel={
                    selectedReportTypes.length > 0
                      ? t('authoritySubmission.selectedReportTypes', {
                          count: selectedReportTypes.length,
                        })
                      : t('authoritySubmission.selectReportTypes')
                  }
                >
                  {selectedReportTypes.length > 0
                    ? t('authoritySubmission.selectedReportTypes', {
                        count: selectedReportTypes.length,
                      })
                    : t('authoritySubmission.selectReportTypes')}
                </Body>
              </Pressable>
            </View>

            <View>
              <BodySmall
                color={colors.neutral700}
                style={styles.label}
                accessibilityLabel={t('authoritySubmission.notes')}
              >
                {t('authoritySubmission.notes')}
              </BodySmall>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder={t('authoritySubmission.notesPlaceholder')}
                accessibilityLabel={t('authoritySubmission.notes')}
                multiline
                numberOfLines={4}
                style={styles.textArea}
              />
            </View>

            <Button
              onPress={handleSubmit}
              loading={loading}
              accessibilityLabel={t('common.submit')}
              style={styles.submitButton}
            >
              {t('common.submit')}
            </Button>
          </View>
        </View>

        {/* Report type picker modal */}
        <Modal
          visible={showReportTypePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowReportTypePicker(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowReportTypePicker(false)}
            accessibilityLabel={t('common.close')}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <H2
                  accessibilityLabel={t(
                    'authoritySubmission.handlesReportTypes',
                  )}
                >
                  {t('authoritySubmission.handlesReportTypes')}
                </H2>
                <BodySmall
                  color={colors.neutral500}
                  accessibilityLabel={t(
                    'authoritySubmission.reportTypesHelper',
                  )}
                >
                  {t('authoritySubmission.reportTypesHelper')}
                </BodySmall>
              </View>
              <ScrollView style={styles.modalScrollView}>
                {REPORT_TYPES.map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => toggleReportType(type)}
                    style={styles.checkboxRow}
                    accessibilityLabel={t(`category.${type}`)}
                    accessibilityRole="checkbox"
                    accessibilityState={{
                      checked: selectedReportTypes.includes(type),
                    }}
                  >
                    <View style={styles.checkboxBox}>
                      {selectedReportTypes.includes(type) && (
                        <View style={styles.checkboxChecked} />
                      )}
                    </View>
                    <Body
                      color={colors.neutral900}
                      style={styles.checkboxLabel}
                      accessibilityLabel={t(`category.${type}`)}
                    >
                      {t(`category.${type}`)}
                    </Body>
                  </Pressable>
                ))}
              </ScrollView>
              <View style={styles.modalFooter}>
                <Button
                  onPress={() => setShowReportTypePicker(false)}
                  accessibilityLabel={t('common.done')}
                >
                  {t('common.done')}
                </Button>
              </View>
            </View>
          </Pressable>
        </Modal>

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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  checkboxBox: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: 4,
    borderWidth: 1,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderRadius: 2,
    height: 12,
    width: 12,
  },
  checkboxLabel: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  checkboxRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: spacing.md,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  description: {
    marginTop: spacing.sm,
  },
  form: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  formWrapper: {
    alignSelf: 'center',
    maxWidth: 600,
    width: '100%',
  },
  header: {
    marginBottom: spacing.xl,
  },
  label: {
    marginBottom: spacing.xs,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.card,
    borderTopRightRadius: borderRadius.card,
    maxHeight: '80%',
    padding: spacing.lg,
  },
  modalFooter: {
    borderTopColor: colors.neutral200,
    borderTopWidth: 1,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  modalHeader: {
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
  },
  modalOverlay: {
    backgroundColor: MODAL_OVERLAY_COLOR,
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  outerContainer: {
    backgroundColor: colors.white,
    flex: 1,
  },
  outerContainerRow: {
    flexDirection: 'row',
  },
  picker: {
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.input,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  textArea: {
    height: 100,
    paddingTop: spacing.sm,
    textAlignVertical: 'top',
  },
});
