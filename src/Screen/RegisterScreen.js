import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, BackHandler, Alert } from 'react-native';
import MyTextInput from '../Component/MyTextınput';
import MyButton from '../Component/MyButton';
import { useLandscape } from '../Context/LandSpaceProvider'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL,API_URL2 } from '../GroceryData/Constant';


const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const isLandscape = useLandscape();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const isValidPassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleRegister = async () => {
    if (!username || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!isValidPassword(password)) {
      Alert.alert('Error', 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }

    try {
      // Mock servise kullanıcı kaydetme isteği gönder
      const response = await axios.post(`${API_URL2}/users/users`, {
        username,
        password
      });

      console.log('Mock servis yanıtı:', response);

      if (response.status !== 201) {
        Alert.alert('Error', `User registration failed with status ${response.status}`);
        return;
      }

      // Kullanıcı verilerini AsyncStorage'a kaydet
      await AsyncStorage.setItem('@user_' + username, password);

      Alert.alert('Success', 'User registered successfully');
      navigation.navigate("LoginScreen");
    } catch (e) {
      console.log('Kayıt hatası:', e);
      Alert.alert('Error', 'Failed to register user');
    }
  };

  return (
    <View style={[styles.container, isLandscape ? styles.containerLandscape : styles.containerPortrait]}>
      <Image source={require('../../Image/logo.png')} style={styles.logo} />
      <View style={styles.textInputContainer}>
        <MyTextInput onChangeText={setUsername} label1="Name" />
      </View>
      <View style={styles.textInputContainer}>
        <MyTextInput onChangeText={setPassword} label1="Password" secureTextEntry />
      </View>
      <View style={styles.textInputContainer}>
        <MyTextInput onChangeText={setConfirmPassword} label1="Confirm Password" secureTextEntry />
      </View>
      <View style={styles.textInputContainer}>
        <MyButton visible={true} iconname="account-plus" OnChangeButton={handleRegister} text="Kayıt Ol" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  containerPortrait: {
    flexDirection: 'column',
  },
  containerLandscape: {
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 40,
  },
  textInputContainer: {
    width: '80%',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
});

export default RegisterScreen;
