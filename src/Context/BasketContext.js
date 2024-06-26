import React, { createContext, useState } from 'react';

export const BasketContext = createContext();

export const BasketProvider = ({ children }) => {
  const [basket, setBasket] = useState([]);

  const addToBasket = (item) => {
    setBasket([...basket, item]);
  };

  const removeFromBasket = (item) => {
    setBasket(basket.filter(basketItem => basketItem.objectID !== item.objectID));
  };

  const isItemInBasket = (item) => {
    return basket.some(basketItem => basketItem.objectID === item.objectID);
  };

  return (
    <BasketContext.Provider value={{ basket, addToBasket, removeFromBasket, isItemInBasket }}>
      {children}
    </BasketContext.Provider>
  );
};
