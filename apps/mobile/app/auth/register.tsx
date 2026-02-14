import { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, TextInput, H1, Body, BodySmall } from '@lomito/ui';
import { colors, spacing, borderRadius } from '@lomito/ui/src/theme/tokens';
import { useAuth } from '../../hooks/use-auth';

const MUNICIPALITIES = [
  'Tijuana',
  'Tecate',
  'Ensenada',
  'Playas de Rosarito',
  'Mexicali',
];

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [password, setPassword] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMunicipalityPicker, setShowMunicipalityPicker] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!fullName.trim()) {
      Alert.alert(t('common.error'), 'Please enter your full name');
      return;
    }
    if (!email.trim()) {
      Alert.alert(t('common.error'), 'Please enter your email address');
      return;
    }
    if (!phone.trim()) {
      Alert.alert(t('common.error'), 'Please enter your phone number');
      return;
    }
    if (!municipality) {
      Alert.alert(t('common.error'), 'Please select your municipality');
      return;
    }
    if (!password.trim() || password.length < 6) {
      Alert.alert(t('common.error'), 'Password must be at least 6 characters');
      return;
    }
    if (!privacyAccepted || !termsAccepted) {
      Alert.alert(
        t('common.error'),
        'Please accept the privacy notice and terms of service',
      );
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, {
        full_name: fullName,
        phone,
        municipality,
      });
      Alert.alert(
        t('common.done'),
        'Account created! Check your email to verify your account.',
        [
          {
            text: t('common.ok'),
            onPress: () => router.replace('/auth/login'),
          },
        ],
      );
    } catch (error) {
      Alert.alert(t('common.error'), (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <H1 accessibilityLabel={t('auth.createAccount')}>
          {t('auth.createAccount')}
        </H1>
      </View>

      <View style={styles.form}>
        <TextInput
          label={t('auth.name')}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Juan Pérez"
          accessibilityLabel={t('auth.name')}
          autoCapitalize="words"
        />

        <TextInput
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          accessibilityLabel={t('auth.email')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          label={t('auth.phone')}
          value={phone}
          onChangeText={setPhone}
          placeholder="+52 664 123 4567"
          accessibilityLabel={t('auth.phone')}
          keyboardType="phone-pad"
        />

        {/* Municipality picker */}
        <View>
          <BodySmall
            color={colors.neutral700}
            style={styles.label}
            accessibilityLabel={t('auth.municipality')}
          >
            {t('auth.municipality')}
          </BodySmall>
          <Pressable
            onPress={() => setShowMunicipalityPicker(true)}
            style={styles.picker}
            accessibilityLabel={t('auth.municipality')}
            accessibilityRole="button"
          >
            <Body
              color={municipality ? colors.neutral900 : colors.neutral400}
              accessibilityLabel={municipality || 'Select municipality'}
            >
              {municipality || 'Select municipality'}
            </Body>
          </Pressable>
        </View>

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 6 characters"
          accessibilityLabel="Password"
          secureTextEntry
          autoCapitalize="none"
        />

        {/* Privacy and terms checkboxes */}
        <Pressable
          onPress={() => setPrivacyAccepted(!privacyAccepted)}
          style={styles.checkbox}
          accessibilityLabel={t('auth.privacyAccept')}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: privacyAccepted }}
        >
          <View style={styles.checkboxBox}>
            {privacyAccepted && <View style={styles.checkboxChecked} />}
          </View>
          <BodySmall
            color={colors.neutral700}
            style={styles.checkboxLabel}
            accessibilityLabel={t('auth.privacyAccept')}
          >
            {t('auth.privacyAccept')}
          </BodySmall>
        </Pressable>

        <Pressable
          onPress={() => setTermsAccepted(!termsAccepted)}
          style={styles.checkbox}
          accessibilityLabel={t('auth.termsAccept')}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: termsAccepted }}
        >
          <View style={styles.checkboxBox}>
            {termsAccepted && <View style={styles.checkboxChecked} />}
          </View>
          <BodySmall
            color={colors.neutral700}
            style={styles.checkboxLabel}
            accessibilityLabel={t('auth.termsAccept')}
          >
            {t('auth.termsAccept')}
          </BodySmall>
        </Pressable>

        <Button
          onPress={handleRegister}
          loading={loading}
          accessibilityLabel={t('auth.createAccount')}
          style={styles.submitButton}
        >
          {t('auth.createAccount')}
        </Button>
      </View>

      {/* Login link */}
      <View style={styles.footer}>
        <Body accessibilityLabel="Already have an account?">
          Already have an account?{' '}
        </Body>
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel={t('auth.login')}
          accessibilityRole="link"
        >
          <Body color={colors.primary} accessibilityLabel={t('auth.login')}>
            {t('auth.login')}
          </Body>
        </Pressable>
      </View>

      {/* Municipality picker modal */}
      <Modal
        visible={showMunicipalityPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMunicipalityPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowMunicipalityPicker(false)}
          accessibilityLabel="Close municipality picker"
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <H1 accessibilityLabel={t('auth.municipality')}>
                {t('auth.municipality')}
              </H1>
            </View>
            {MUNICIPALITIES.map((mun) => (
              <Pressable
                key={mun}
                onPress={() => {
                  setMunicipality(mun);
                  setShowMunicipalityPicker(false);
                }}
                style={styles.modalItem}
                accessibilityLabel={mun}
                accessibilityRole="button"
              >
                <Body
                  color={
                    municipality === mun ? colors.primary : colors.neutral900
                  }
                  accessibilityLabel={mun}
                >
                  {mun}
                </Body>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
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
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    marginTop: spacing.xl,
  },
  form: {
    gap: spacing.md,
    marginTop: spacing.lg,
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
    maxHeight: '50%',
    padding: spacing.lg,
  },
  modalHeader: {
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
  },
  modalItem: {
    paddingVertical: spacing.md,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
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
});
