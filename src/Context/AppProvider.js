import React from 'react';
import { ThemeProvider } from './ThemeContext';
import { LanguageProvider } from './LanguageContext';
import LandscapeProvider from './LandSpaceProvider';

export const AppProvider = ({ children }) => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <LandscapeProvider>
          {children}
        </LandscapeProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};
