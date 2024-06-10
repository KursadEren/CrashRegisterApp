import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, useTheme, Provider as PaperProvider } from 'react-native-paper';

function MyTextInput({ label1, icon, onChangeText, value }) {
  const [text, setText] = useState(value || '');
  const [isSecureTextEntry, setIsSecureTextEntry] = useState(false);

  useEffect(() => {
    setIsSecureTextEntry(label1.toLowerCase() === 'password' || label1.toLowerCase() === 'confirm password');
  }, [label1]);

  const handleTextChange = (text) => {
    setText(text);
    onChangeText(text);
  };

  const theme = {
    colors: {
      text: 'white', // Label rengi
      placeholder: 'white', // Placeholder rengi
    },
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        label={label1}
        value={text}
        textColor='white'
        secureTextEntry={isSecureTextEntry}
        onChangeText={handleTextChange}
        right={icon ? <TextInput.Icon icon={icon} /> : null}
        style={styles.input}
        theme={theme}
        placeholderTextColor="#FFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#333',
    color: "white",
    borderRadius: 5,
  },
});

export default MyTextInput;