import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

export default function MyButton({ OnChangeButton, iconname, text, visible }) {
  const onPress = () => {
    OnChangeButton();
  };

  if (!visible) {
    return null; // Görünürlük false olduğunda bileşeni null olarak döndür ve hiçbir şey gösterme
  }

  return (
    <View style={styles.buttonContainer}>
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
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#ff6600',
    borderRadius: 5,
    padding: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
