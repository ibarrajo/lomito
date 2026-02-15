import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  colors,
  spacing,
  typography,
  borderRadius,
} from '@lomito/ui/src/theme/tokens';

type Language = 'es' | 'en';

const STORAGE_KEY = '@lomito/language';

const languageNames: Record<Language, string> = {
  es: 'Español',
  en: 'English',
};

export function LanguagePicker() {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    i18n.language as Language,
  );

  const handleLanguageChange = async (lang: Language) => {
    try {
      // Change the language in i18n
      await i18n.changeLanguage(lang);

      // Persist to storage
      if (Platform.OS === 'web') {
        localStorage.setItem(STORAGE_KEY, lang);
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, lang);
      }

      // Update local state
      setCurrentLanguage(lang);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('settings.language')}</Text>

      <Pressable
        style={styles.option}
        onPress={() => handleLanguageChange('es')}
        accessibilityLabel={`Select Spanish language`}
        accessibilityRole="radio"
        accessibilityState={{ checked: currentLanguage === 'es' }}
      >
        <Text style={styles.languageName}>{languageNames.es}</Text>
        <View
          style={[
            styles.radioCircle,
            currentLanguage === 'es' && styles.radioCircleSelected,
          ]}
        >
          {currentLanguage === 'es' && <View style={styles.radioInner} />}
        </View>
      </Pressable>

      <Pressable
        style={styles.option}
        onPress={() => handleLanguageChange('en')}
        accessibilityLabel={`Select English language`}
        accessibilityRole="radio"
        accessibilityState={{ checked: currentLanguage === 'en' }}
      >
        <Text style={styles.languageName}>{languageNames.en}</Text>
        <View
          style={[
            styles.radioCircle,
            currentLanguage === 'en' && styles.radioCircleSelected,
          ]}
        >
          {currentLanguage === 'en' && <View style={styles.radioInner} />}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.card,
    padding: spacing.md,
  },
  languageName: {
    color: colors.neutral900,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.fontSize * typography.body.lineHeight,
  },
  option: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  radioCircle: {
    alignItems: 'center',
    borderColor: colors.neutral400,
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    backgroundColor: colors.primary,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  title: {
    color: colors.neutral900,
    fontFamily: typography.h3.fontFamily,
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    lineHeight: typography.h3.fontSize * typography.h3.lineHeight,
    marginBottom: spacing.md,
  },
});
