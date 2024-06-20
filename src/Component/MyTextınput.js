import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { ThemeContext } from '../Context/ThemeContext'; // ThemeContext'i dahil edelim

function MyTextInput({ label1, icon, onChangeText, value }) {
  const { theme } = useContext(ThemeContext); // Tema renklerini kullanmak için context'i kullanalım
  const [text, setText] = useState(value || '');
  const [isSecureTextEntry, setIsSecureTextEntry] = useState(false);

  useEffect(() => {
    setIsSecureTextEntry(label1.toLowerCase() === 'password' || label1.toLowerCase() === 'confirm password');
  }, [label1]);

  const handleTextChange = (text) => {
    setText(text);
    onChangeText(text);
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        label={label1}
        value={text}
        secureTextEntry={isSecureTextEntry}
        onChangeText={handleTextChange}
        right={icon ? <TextInput.Icon icon={icon} /> : null}
        style={[styles.input, { backgroundColor: theme.secondaryColor }]}
        theme={{
          colors: {
            text: theme.textColor,
            placeholder: theme.textColor,
            primary: theme.primaryColor,
            background: theme.secondaryColor,
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderRadius: 5,
  },
});

export default MyTextInput;
