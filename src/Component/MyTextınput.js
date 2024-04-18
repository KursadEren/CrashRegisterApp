import { View, Text } from 'react-native'
import React from 'react'
import { TextInput } from 'react-native-paper'
 function MyTextınput({label1,icon,onChangeText}) {
    const [text, setText] = React.useState("");

    const [isSecureTextEntry, setIsSecureTextEntry] = React.useState(false);

  // label1 "password" ise, isSecureTextEntry özelliğini true yap
  React.useEffect(() => {
    setIsSecureTextEntry(label1 === "password");
  }, [label1]);

  const handleTextChange = (text) =>{
    setText(text);
    onChangeText(text);
  }

  return (
    <View>
     <TextInput
      label={label1}
      value={text}
     secureTextEntry={label1 === "password" ? isSecureTextEntry : false}
      onChangeText={handleTextChange}
      right={
        icon ? (
          <TextInput.Icon icon={icon}/>
        ) : (
          null
        )
      }
      
    />
    </View>
  )
}

export default MyTextınput