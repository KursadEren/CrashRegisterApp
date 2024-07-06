import React, { createContext, useState } from 'react';

export const BasketContext = createContext();

export const BasketProvider = ({ children }) => {
  const [basket, setBasket] = useState([]);

  const addToBasket = (item) => {
    setBasket((prevBasket) => [...prevBasket, item]);
  };

  const clearBasket = () => {
    setBasket([]);
  };

  return (
    <BasketContext.Provider value={{ basket, addToBasket, clearBasket }}>
      {children}
    </BasketContext.Provider>
  );
};
