import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
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
            <Image source={require('../../Image/logo.png')} style={styles.logo} />
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
        backgroundColor: '#1a1a1a',
        justifyContent: "center",
        padding: 20,
    },
    logo: {
        width: 100,
        height: 100,
        alignSelf: 'center',
        marginBottom: 40,
    },
    textInputContainer: {
        paddingHorizontal: 10,
        paddingVertical: 15,
    }
});

export default LoginScreen;
