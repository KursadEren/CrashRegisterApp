import React from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';


export default function MyButton({ OnChangeButton,iconname, text,visible  }) {
  const  onPress = (text) =>{
    OnChangeButton(text);
} 
if (!visible) {
  return null; // Görünürlük false olduğunda bileşeni null olarak döndür ve hiçbir şey gösterme
}


  return (
    <View>
      <Button
        
        mode="contained"
        onPress={onPress}>
        {text}
        
      </Button>
    </View>
  );
}
