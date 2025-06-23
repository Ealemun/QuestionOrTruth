import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationFR from './fr.json';
import translationEN from './en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: translationFR },
      en: { translation: translationEN }
    },
    fallbackLng: 'fr',
    interpolation: { escapeValue: false },
    // Pour forcer la langue :
    // lng: 'en', // ou 'fr'

  });

export default i18n;
