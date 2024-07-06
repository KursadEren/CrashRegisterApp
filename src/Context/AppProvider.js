import React from 'react';
import { ThemeProvider } from './ThemeContext';
import { LanguageProvider } from './LanguageContext';
import LandscapeProvider from './LandSpaceProvider';
import { ServiceStatusProvider } from './ServiceStatusContext';
import { BasketProvider } from './BasketContext';
export const AppProvider = ({ children }) => {
  return (
    <ThemeProvider>
      <BasketProvider>
      <ServiceStatusProvider>
        <LanguageProvider>
          <LandscapeProvider>
           {children}
          </LandscapeProvider>
        </LanguageProvider>
      </ServiceStatusProvider>
      </BasketProvider>
    </ThemeProvider>
  );
};
