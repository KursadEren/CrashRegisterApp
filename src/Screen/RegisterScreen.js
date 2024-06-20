import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, BackHandler, Alert, Animated, PanResponder, Dimensions } from 'react-native';
import MyTextInput from '../Component/MyTextınput';
import MyButton from '../Component/MyButton';
import { useLandscape } from '../Context/LandSpaceProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL, API_URL2 } from '../GroceryData/Constant';
import ReactNativeBiometrics from 'react-native-biometrics';

const { width } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const isLandscape = useLandscape();
  const translateX = useRef(new Animated.Value(0)).current;

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

  const handleBiometricEnrollment = async () => {
    const rnBiometrics = new ReactNativeBiometrics();

    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();

      if (!available) {
        Alert.alert('Error', 'Biometric authentication is not available on this device.');
        return;
      }

      if (!biometryType) {
        Alert.alert('Error', 'No biometrics are enrolled on this device. Please enroll biometrics and try again.');
        return;
      }

      const resultObject = await rnBiometrics.simplePrompt({ promptMessage: 'Confirm fingerprint' });
      const { success } = resultObject;

      if (success) {
        await AsyncStorage.setItem('@biometric_user', username);
        await AsyncStorage.setItem('@biometric_password', password);

        Alert.alert('Success', 'Biometric authentication setup successfully');
        navigation.navigate("LoginScreen");
      } else {
        Alert.alert('Error', 'Biometric authentication failed');
      }
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      Alert.alert('Error', `Biometric authentication failed: ${error.message}`);
    }
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
      const response = await axios.post(`${API_URL2}/users/users`, {
        username,
        password
      });

      if (response.status !== 201) {
        Alert.alert('Error', `User registration failed with status ${response.status}`);
        return;
      }

      await AsyncStorage.setItem('@biometric_user', username);
      await AsyncStorage.setItem('@biometric_password', password);

      Alert.alert('Success', 'User registered successfully');

      // Biometric enrollment
      handleBiometricEnrollment();
    } catch (e) {
      console.log('Kayıt hatası:', e);
      Alert.alert('Error', 'Failed to register user');
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
        if (gestureState.dx < -width / 4) {
          Animated.timing(translateX, {
            toValue: -width,
            duration: 300,
            useNativeDriver: false
          }).start(() => {
            navigation.navigate('LoginScreen');
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
    <View style={[styles.container, isLandscape ? styles.containerLandscape : styles.containerPortrait]}>
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
    backgroundColor: '#f8f9fa', // updated background color
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
});

export default RegisterScreen;
