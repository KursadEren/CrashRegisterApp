import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

function MyTextInput({ label1, icon, onChangeText, value }) {
  const [text, setText] = useState(value || '');
  const [isSecureTextEntry, setIsSecureTextEntry] = useState(false);

  useEffect(() => {
    setIsSecureTextEntry(label1.toLowerCase() === 'password');
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
        style={styles.input}
        placeholderTextColor="#aaa"
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
    color: '#fff',
    borderRadius: 5,
  },
});

export default MyTextInput;
