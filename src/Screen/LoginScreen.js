import React, { useContext, useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, BackHandler, Alert, Animated, PanResponder, Dimensions, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import MyTextInput from '../Component/MyTextınput';
import MyButton from '../Component/MyButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ReactNativeBiometrics from 'react-native-biometrics';
import { useLandscape } from '../Context/LandSpaceProvider';
import { ThemeContext } from '../Context/ThemeContext';
import { API_URL ,API_URL2 } from '../GroceryData/Constant';

const { width } = Dimensions.get('window');

function AuthScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const isLandscape = useLandscape();
  const translateX = useRef(new Animated.Value(0)).current;

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
      if (storedPassword === password) {
        navigation.navigate("MyTabs");
        return;
      }

      const response = await axios.post(`${API_URL2}/users/users`, {
        username,
        password
      });

      if (response.status === 200 && response.data) {
        await AsyncStorage.setItem('@user_' + username, password);
        navigation.navigate("MyTabs");
      } else {
        Alert.alert('Error', 'Invalid username or password');
      }
    } catch (e) {
      console.log('Error:', e);
      Alert.alert('Error', 'Failed to login');
    }
  };

  const handleBiometricAuth = async () => {
    const rnBiometrics = new ReactNativeBiometrics();

    try {
      const resultObject = await rnBiometrics.simplePrompt({ promptMessage: 'Confirm fingerprint' });
      const { success } = resultObject;

      if (success) {
        const username = await AsyncStorage.getItem('@biometric_user');
        const password = await AsyncStorage.getItem('@biometric_password');

        if (username && password) {
          Alert.alert('Authentication Successful', 'You have been authenticated successfully');
          navigation.navigate('MyTabs'); // Successful authentication
        } else {
          Alert.alert('Error', 'No biometric credentials found');
        }
      } else {
        Alert.alert('Authentication Failed', 'Fingerprint authentication failed');
      }
    } catch (error) {
      Alert.alert('Authentication Failed', `Fingerprint authentication failed: ${error.message}`);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderMove: Animated.event(
        [
          null,
          { dx: translateX }
        ],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > width / 4) {
          Animated.timing(translateX, {
            toValue: width,
            duration: 300,
            useNativeDriver: false
          }).start(() => {
            navigation.navigate('RegisterScreen');
            translateX.setValue(0);
          });
        } else if (gestureState.dx < -width / 4) {
          Animated.timing(translateX, {
            toValue: -width,
            duration: 300,
            useNativeDriver: false
          }).start(() => {
            navigation.navigate('BiometricScreen');
            translateX.setValue(0);
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false
          }).start();
        }
      }
    })
  ).current;

  return (
    <View style={[styles.container, isLandscape ? styles.containerLandscape : styles.containerPortrait, { backgroundColor: theme.backgroundColor }]}>
      <Animated.View
        style={[styles.logoContainer, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <Image source={require('../../Image/logo1.png')} style={styles.logo} />
      </Animated.View>
      <View style={styles.textInputContainer}>
        <MyTextInput onChangeText={setUsername} label1="Name" />
      </View>
      <View style={styles.textInputContainer}>
        <MyTextInput onChangeText={setPassword} label1="Password" secureTextEntry />
      </View>
      <View style={styles.textInputContainer}>
        <MyButton visible={true} iconname="login" OnChangeButton={handleLogin} text="Giriş Yap" />
      </View>
      <View style={styles.biometricContainer}>
        <Text style={[styles.text, { color: theme.textColor }]}>Biometric Authentication</Text>
        <TouchableOpacity style={[styles.fingerprintButton, { backgroundColor: theme.secondaryColor }]} onPress={handleBiometricAuth}>
          <Ionicons name="finger-print" size={50} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: 20,
  },
  biometricContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  fingerprintButton: {
    padding: 10,
    borderRadius: 50,
  },
});

export default AuthScreen;
