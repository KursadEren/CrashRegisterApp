import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

function MyTextınput({ label1, icon, onChangeText }) {
  const [text, setText] = React.useState("");
  const [isSecureTextEntry, setIsSecureTextEntry] = React.useState(false);

  // label1 "password" ise, isSecureTextEntry özelliğini true yap
  React.useEffect(() => {
    setIsSecureTextEntry(label1 === "password");
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
        secureTextEntry={label1 === "password" ? isSecureTextEntry : false}
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

export default MyTextınput;
