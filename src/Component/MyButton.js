import React, { useContext, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import { useLandscape } from '../Context/LandSpaceProvider';
import { ThemeContext } from '../Context/ThemeContext'; // ThemeContext'i dahil edelim

export default function MyButton({ OnChangeButton, iconname, text, visible }) {
  const { theme } = useContext(ThemeContext); // Tema renklerini kullanmak için context'i kullanalım
  const [loading, setLoading] = useState(false);
  const isLandscape = useLandscape();

  const onPress = async () => {
    setLoading(true);
    await OnChangeButton();
    setLoading(false);
  };

  if (!visible) {
    return null; // Görünürlük false olduğunda bileşeni null olarak döndür ve hiçbir şey gösterme
  }

  return (
    <View style={[styles.buttonContainer, isLandscape ? styles.buttonContainerLandscape : styles.buttonContainerPortrait]}>
      <Button
        mode="contained"
        onPress={onPress}
        style={[styles.button, { backgroundColor: theme.primaryColor }]} // Buton rengini tema renklerine göre ayarlayalım
        labelStyle={styles.buttonText}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : text}
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
