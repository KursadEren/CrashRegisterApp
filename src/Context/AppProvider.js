import React from 'react';
import { ThemeProvider } from './ThemeContext';
import { LanguageProvider } from './LanguageContext';
import LandscapeProvider from './LandSpaceProvider';
import { ServiceStatusProvider } from './ServiceStatusContext';
export const AppProvider = ({ children }) => {
  return (
    <ThemeProvider>
      <ServiceStatusProvider>
        <LanguageProvider>
          <LandscapeProvider>
           {children}
          </LandscapeProvider>
        </LanguageProvider>
      </ServiceStatusProvider>
    </ThemeProvider>
  );
};
