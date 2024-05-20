import React from 'react';

import { ThemeProvider } from './ThemeContext';

import { LanguageProvider } from './LanguageContext';


export const AppProvider = ({ children }) => {
  return (
   
      <ThemeProvider>
       <LanguageProvider>
              {children}
               
     </LanguageProvider>
      </ThemeProvider>
   
  );
};
