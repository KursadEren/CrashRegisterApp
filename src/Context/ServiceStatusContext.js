
import React, { createContext, useState, useContext } from 'react';

const ServiceStatusContext = createContext();

export const ServiceStatusProvider = ({ children }) => {
  const [serviceStatus, setServiceStatus] = useState(null);

  return (
    <ServiceStatusContext.Provider value={{ serviceStatus, setServiceStatus }}>
      {children}
    </ServiceStatusContext.Provider>
  );
};

export const useServiceStatus = () => useContext(ServiceStatusContext);
