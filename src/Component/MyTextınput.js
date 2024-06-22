import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { ThemeContext } from '../Context/ThemeContext';
import { useTranslation } from 'react-i18next';

function MyTextInput({ label1, icon, onChangeText, value }) {
  const { theme } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();
  const [text, setText] = useState(value || '');
  const [isSecureTextEntry, setIsSecureTextEntry] = useState(false);

  useEffect(() => {
    const labelLower = label1.toLowerCase();
    setIsSecureTextEntry(
      labelLower === t('password').toLowerCase() || labelLower === t('confirm_password').toLowerCase()
    );
  }, [label1, i18n.language]);

  const handleTextChange = (text) => {
    setText(text);
    onChangeText(text);
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        label={t(label1)}
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
