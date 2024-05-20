import React from 'react';

import { ThemeProvider } from './ThemeContext';
import { ColorProvider } from './ColorContext';
import { LanguageProvider } from './LanguageContext';
import { ButtonProvider } from './ButtonContext';

export const AppProvider = ({ children }) => {
  return (
   
      <ThemeProvider>
        <ColorProvider>
          
            <ButtonProvider>
              {children}
            </ButtonProvider>
         
        </ColorProvider>
      </ThemeProvider>
   
  );
};
