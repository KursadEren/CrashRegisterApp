import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';

const LandscapeContext = createContext();

const LandscapeProvider = ({ children }) => {
  const { width, height } = useWindowDimensions();
  const [isLandscape, setIsLandscape] = useState(width > height);

  useEffect(() => {
    setIsLandscape(width > height);
  }, [width, height]);

  return (
    <LandscapeContext.Provider value={isLandscape}>
      {children}
    </LandscapeContext.Provider>
  );
};

export const useLandscape = () => useContext(LandscapeContext);
export default LandscapeProvider;
