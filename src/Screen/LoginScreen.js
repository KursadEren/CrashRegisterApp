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
        if (!username || !password) {
            console.error('Kullanıcı adı veya şifre boş olamaz.');
            return;
        }
    
        try {
            // Sunucudan kullanıcıları al
            const response = await axios.get(`${API_URL}/data1`);
    
            // Kullanıcılar başarıyla alındıysa
            if (response.status === 200) {
                // Kullanıcıları JSON formatında al
                const users = response.data;
                 
                // Kullanıcı adını içeren bir kullanıcı bul
                const foundUser = users.find(user => user.username === username);
                console.log(foundUser);
                // Kullanıcı bulunduysa
                if (foundUser) {
                    // Şifre kontrolü
                    if (foundUser.password === password) {
                        // Giriş başarılı, istediğiniz işlemi yapabilirsiniz
                        navigation.navigate("MyTabs");
                        return;
                    } else {
                        // Yanlış şifre
                        Alert.alert("Hata", "Kullanıcı adı veya şifre yanlış.");
                    }
                } else {
                    // Kullanıcı bulunamadı
                    Alert.alert("Hata", "Kullanıcı bulunamadı.");
                }
            } else {
                // Sunucudan beklenmeyen bir cevap geldi
                console.error('Beklenmeyen bir cevap:', response);
            }
        } catch (error) {
            // İstek sırasında bir hata oluştu
            console.error('İstek sırasında hata:', error);
        }
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
                <MyButton iconname="login" OnChangeButton={handleLogin} text="Giriş Yap" />
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
