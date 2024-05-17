import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

import MyTextInput from '../Component/MyTextınput';
import MyButton from '../Component/MyButton';

const API_URL = 'http://localhost:3000';

function LoginScreen({ navigation }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    


    
  
    const handleLogin = async () => {
        
        
    
        navigation.navigate("MyTabs");
                 
    }; 
    
    

    

    return (
        <View style={styles.container}>
            <View style={styles.textInputContainer}>
                <MyTextInput onChangeText={setUsername} label1="Name" />
            </View>
            <View style={styles.textInputContainer}>
                <MyTextInput onChangeText={setPassword} label1="password" secureTextEntry />
            </View>
            <View style={styles.textInputContainer}>
                <MyButton visible={true} iconname="login" OnChangeButton={handleLogin} text="Giriş Yap" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderWidth: 1,
        justifyContent: "center",
    },
    textInputContainer: {
        paddingHorizontal: 10,
        paddingVertical: 30,
    }
});

export default LoginScreen;
