import React, { createContext, useState } from 'react';

// Context oluşturma
export const ButtonContext = createContext();

// Provider komponenti tanımlama
export const ButtonProvider = ({ children }) => {
  const [buttons, setButtons] = useState([]);

  const addButton = (button) => {
    setButtons((prevButtons) => [...prevButtons, button]);
  };

  return (
    <ButtonContext.Provider value={{ buttons, addButton }}>
      {children}
    </ButtonContext.Provider>
  );
};
