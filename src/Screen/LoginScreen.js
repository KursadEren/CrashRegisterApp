import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, BackHandler, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyTextInput from '../Component/MyTextınput';
import MyButton from '../Component/MyButton';
import { useLandscape } from '../Context/LandSpaceProvider';

function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const isLandscape = useLandscape();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const handleLogin = async () => {
    try {
      const storedPassword = await AsyncStorage.getItem('@user_' + username);
      console.log('Stored password:', storedPassword);

      if (storedPassword === password) {
        navigation.navigate("MyTabs");
      } else {
        Alert.alert('Error', 'Invalid username or password');
      }
    } catch (e) {
      console.log('Error:', e);
      Alert.alert('Error', 'Failed to login');
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
        <MyButton visible={true} iconname="login" OnChangeButton={handleLogin} text="Giriş Yap" />
      </View>
      <View style={styles.textInputContainer}>
        <MyButton visible={true} iconname="register" OnChangeButton={() => navigation.navigate('Register')} text="Kayıt Ol" />
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

export default LoginScreen;

