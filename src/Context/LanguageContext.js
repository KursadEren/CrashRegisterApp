import React, { createContext, useState } from 'react';

// Context oluşturma
export const LanguageContext = createContext();

// Varsayılan diller
const initialLanguages = {
  en: 'English',
  tr: 'Türkçe',
};

// Provider komponenti tanımlama
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const setLanguage = (language) => {
    if (initialLanguages[language]) {
      setCurrentLanguage(language);
    } else {
      console.warn(`Language ${language} not found`);
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
