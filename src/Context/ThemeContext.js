import React, { createContext, useState } from 'react';

export const ThemeContext = createContext();

const lightTheme = {
  primaryColor: '#007bff',
  secondaryColor: '#6c757d',
  accentColor: '#17a2b8',
  backgroundColor: '#f8f9fa',
  textColor: '#343a40',
  placeholderTextColor: '#aaa',
  inputBackground: '#fff',
  cardBackground: '#fff',
  itemBackground: '#e9ecef',
  priceColor: '#e9ecef'
};

const darkTheme = {
  primaryColor: '#343a40',
  secondaryColor: '#6c757d',
  accentColor: '#17a2b8',
  backgroundColor: '#212529',
  textColor: '#f8f9fa',
  placeholderTextColor: '#aaa',
  inputBackground: '#495057',
  cardBackground: '#495057',
  itemBackground: '#6c757d',
  priceColor: '#e9ecef'
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === lightTheme ? darkTheme : lightTheme));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
