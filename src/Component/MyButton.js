import React, { useContext, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLandscape } from '../Context/LandSpaceProvider';
import { ThemeContext } from '../Context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function MyButton({ OnChangeButton, iconname, text, visible }) {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const isLandscape = useLandscape();

  const onPress = async () => {
    setLoading(true);
    await OnChangeButton();
    setLoading(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.buttonContainer, isLandscape ? styles.buttonContainerLandscape : styles.buttonContainerPortrait]}>
      <Button
        mode="contained"
        onPress={onPress}
        style={[styles.button, { backgroundColor: theme.primaryColor }]}
        labelStyle={styles.buttonText}
        disabled={loading}
        icon={() => (
          <MaterialCommunityIcons
            name={iconname}
            size={24}
            color="#fff"
          />
        )} // İkonu burada ekliyoruz
      >
        {loading ? <ActivityIndicator color="#fff" /> : t(text)}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {},
  buttonContainerPortrait: {
    width: '100%',
  },
  buttonContainerLandscape: {
    width: '100%',
  },
  button: {
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
