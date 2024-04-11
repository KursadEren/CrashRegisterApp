import { View,  StyleSheet, Alert,  } from 'react-native'
import React from 'react';

import MyTextınput from '../Component/MyTextınput';
import MyButton from '../Component/MyButton';

function LoginScreen({navigation}) {
    const [text, setText] = React.useState("");
    const [Id, setId] = React.useState("");
    const [password, setPassword] = React.useState("");

    const LoginButton = () =>{
        
        navigation.navigate("MyTabs");
    }

  return (
    <View style={style.Container}>
        
        <View style={style.TextInputContainer} >
            <MyTextınput onChangeText={setId} label1="Id"  />
            </View>
            <View style={style.TextInputContainer} >
            <MyTextınput onChangeText={setPassword} label1="password"  />
        </View>
        <View style={style.TextInputContainer}>
            <MyButton iconname={"login"} OnChangeButton={LoginButton} text={"Giriş"}/>
        </View>

       
       
    </View>
  )
  
}
const style =StyleSheet.create({
    Container:{
        flex:1,
        borderWidth:1,
        justifyContent:"center",

    },

    TextInputContainer:{
    paddingHorizontal:10,
    paddingVertical:30,
    }
})
export default LoginScreen;