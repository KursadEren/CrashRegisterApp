import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, BackHandler, Alert, Animated, PanResponder, Dimensions } from 'react-native';
import MyTextInput from '../Component/MyTextınput';
import MyButton from '../Component/MyButton';
import { useLandscape } from '../Context/LandSpaceProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL2 } from '../GroceryData/Constant';
import ReactNativeBiometrics from 'react-native-biometrics';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const isLandscape = useLandscape();
  const translateX = useRef(new Animated.Value(0)).current;
  const { t } = useTranslation();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  const isValidPassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleBiometricEnrollment = async () => {
    const rnBiometrics = new ReactNativeBiometrics();

    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      console.log(`Biometric sensor available: ${available}, Biometry type: ${biometryType}`);

      if (!available) {
        setHasError(true);
        Alert.alert(t('error'), t('biometric_not_available'));
        return false;
      }

      const { success } = await rnBiometrics.simplePrompt({ promptMessage: t('confirm_biometric') });
      setHasError(false);
      return success;
    } catch (error) {
      setHasError(true);
      console.error('Biometric authentication failed:', error);
      Alert.alert(t('error'), `${t('biometric_auth_failed')}: ${error.message}`);
      return false;
    }
  };

  const handleRegister = async () => {
    if (!username || !password || !confirmPassword) {
      setHasError(true);
      Alert.alert(t('error'), t('fill_all_fields'));
      return;
    }

    if (password !== confirmPassword) {
      setHasError(true);
      Alert.alert(t('error'), t('passwords_do_not_match'));
      return;
    }

    if (!isValidPassword(password)) {
      setHasError(true);
      Alert.alert(t('error'), t('invalid_password'));
      return;
    }

    const biometricSuccess = await handleBiometricEnrollment();
    if (!biometricSuccess) {
      setHasError(true);
      return;
    }

    const user = { username, password };

    try {
      const response = await axios.post(`${API_URL2}/users/users`, user);
      if (response.status !== 201) {
        setHasError(true);
        Alert.alert(t('error'), `${t('user_registration_failed')} ${response.status}`);
        return;
      }

      await AsyncStorage.setItem('@biometric_user_' + username, JSON.stringify(user));
      setHasError(false);
      Alert.alert(t('success'), t('user_registered_successfully'));
      navigation.navigate("LoginScreen");
    } catch (e) {
      setHasError(true);
      console.log('Kayıt hatası:', e);
      Alert.alert(t('error'), t('failed_to_register_user'));
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
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
        <MyTextInput onChangeText={setUsername} label1={t('username')} />
      </View>
      <View style={styles.textInputContainer}>
        <MyTextInput onChangeText={setPassword} label1={t('password')} secureTextEntry />
      </View>
      <View style={styles.textInputContainer}>
        <MyTextInput onChangeText={setConfirmPassword} label1={t('confirm_password')} secureTextEntry />
      </View>
      <View style={styles.textInputContainer}>
        <MyButton hasError={hasError} visible={true} iconname="account-plus" OnChangeButton={handleRegister} text={t('register')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
