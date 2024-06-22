import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEn from './locales/en.json';
import translationTr from './locales/tr.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: translationEn
      },
      tr: {
        translation: translationTr
      }
    },
    lng: 'en', // Dilinizi buradan ayarlayın
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React zaten XSS koruması sağladığı için gerekli değil
    }
  });

export default i18n;
