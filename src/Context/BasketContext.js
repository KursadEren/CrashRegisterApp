import React, { createContext, useState } from 'react';

export const BasketContext = createContext();



export const BasketProvider = ({ children }) => {
  const [Basket, setBasket] = useState(lightTheme);

  const toggleBasket = () => {
    setBasket=[];
  };

  return (
    <BasketContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </BasketContext.Provider>
  );
};
