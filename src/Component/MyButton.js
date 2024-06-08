import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useLandscape } from '../Context/LandSpaceProvider'; // Yolun doğru olduğuna dikkat edin

export default function MyButton({ OnChangeButton, iconname, text, visible }) {
  const isLandscape = useLandscape();

  const onPress = () => {
    OnChangeButton();
  };

  if (!visible) {
    return null; // Görünürlük false olduğunda bileşeni null olarak döndür ve hiçbir şey gösterme
  }

  return (
    <View style={[styles.buttonContainer, isLandscape ? styles.buttonContainerLandscape : styles.buttonContainerPortrait]}>
      <Button
        mode="contained"
        onPress={onPress}
        style={styles.button}
        labelStyle={styles.buttonText}
      >
        {text}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    
  },
  buttonContainerPortrait: {
    width: '100%',
  },
  buttonContainerLandscape: {
    width: '100%',
  },
  button: {
    backgroundColor: '#ff6600',
    borderRadius: 5,
   
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
