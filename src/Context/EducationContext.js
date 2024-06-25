import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EducationContext = createContext();

export const EducationProvider = ({ children }) => {
  const [educationStep, setEducationStep] = useState(null);

  useEffect(() => {
    const checkEducationStep = async () => {
      const storedStep = await AsyncStorage.getItem('@education_step');
      if (storedStep !== null) {
        setEducationStep(Number(storedStep));
      }
    };

    checkEducationStep();
  }, []);

  const nextStep = async () => {
    const newStep = educationStep !== null ? educationStep + 1 : 1;
    setEducationStep(newStep);
    await AsyncStorage.setItem('@education_step', newStep.toString());
  };

  const resetEducation = async () => {
    setEducationStep(0);
    await AsyncStorage.setItem('@education_step', '0');
  };

  return (
    <EducationContext.Provider value={{ educationStep, nextStep, resetEducation }}>
      {children}
    </EducationContext.Provider>
  );
};

export const useEducation = () => useContext(EducationContext);
