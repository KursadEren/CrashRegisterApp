import React, { createContext, useState } from 'react';

// Context oluşturma
export const ColorContext = createContext();

// Varsayılan renkler
const initialColors = {
  red: '#ff0000',
  green: '#00ff00',
  blue: '#0000ff',
  yellow: '#ffff00'
};

// Provider komponenti tanımlama
export const ColorProvider = ({ children }) => {
  const [colors, setColors] = useState(initialColors);
  const [currentColor, setCurrentColor] = useState(initialColors.red);

  const setColorByName = (colorName) => {
    if (colors[colorName]) {
      setCurrentColor(colors[colorName]);
    } else {
      console.warn(`Color ${colorName} not found`);
    }
  };

  return (
    <ColorContext.Provider value={{ colors, currentColor, setColorByName }}>
      {children}
    </ColorContext.Provider>
  );
};
