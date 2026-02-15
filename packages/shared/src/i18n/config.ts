import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import es from './es.json';
import en from './en.json';

const resources = {
  es: { translation: es },
  en: { translation: en },
};

const STORAGE_KEY = '@lomito/language';

// Initialize synchronously with default Spanish
i18n.use(initReactI18next).init({
  resources,
  lng: 'es',
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

// Async restore stored language preference
async function restoreLanguage() {
  try {
    let storedLanguage: string | null = null;

    if (Platform.OS === 'web') {
      // Use localStorage on web
      if (typeof localStorage !== 'undefined') {
        storedLanguage = localStorage.getItem(STORAGE_KEY);
      }
    } else {
      // Use AsyncStorage on native
      storedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
    }

    // Only change if we have a valid stored language
    if (
      storedLanguage &&
      (storedLanguage === 'es' || storedLanguage === 'en')
    ) {
      await i18n.changeLanguage(storedLanguage);
    }
  } catch (error) {
    // Silently fail - we'll just use the default language
    console.warn('Failed to restore language preference:', error);
  }
}

// Start restoration process
restoreLanguage();

export default i18n;
export { resources };
