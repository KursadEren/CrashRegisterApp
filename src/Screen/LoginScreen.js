import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, BackHandler, Alert, Animated, PanResponder, Dimensions, Text, TouchableOpacity, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import MyTextInput from '../Component/MyTextınput';
import MyButton from '../Component/MyButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ReactNativeBiometrics from 'react-native-biometrics';
import { useLandscape } from '../Context/LandSpaceProvider';
import { ThemeContext } from '../Context/ThemeContext';
import { API_URL2 } from '../GroceryData/Constant';
import { useTranslation } from 'react-i18next';
import { useEducation } from '../Context/EducationContext';

const { width } = Dimensions.get('window');

function LoginScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();
  const { educationStep, nextStep } = useEducation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const isLandscape = useLandscape();
  const translateX = useRef(new Animated.Value(0)).current;
  
  const clearUserAndBiometricData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const userAndBiometricKeys = keys.filter(key => key.startsWith('@user_') || key.startsWith('@biometric_user_'));
      await AsyncStorage.multiRemove(userAndBiometricKeys);
      console.log('User and biometric data cleared successfully!');
    } catch (error) {
      console.error('Failed to clear user and biometric data:', error);
    }
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      clearUserAndBiometricData();
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    clearUserAndBiometricData();
  }, []);

  const handleLogin = async () => {
    try {
      const userData = await AsyncStorage.getItem('@biometric_user_' + username);
      if (userData) {
        const { password: storedPassword } = JSON.parse(userData);
        if (storedPassword === password) {
          await AsyncStorage.setItem('@current_user', username);
          navigation.navigate("MyTabs");
          return;
        }
      }

      Alert.alert(t('error'), t('invalid_username_password'));
    } catch (e) {
      console.log('Error:', e);
      Alert.alert(t('error'), t('failed_login'));
    }
  };

  const handleBiometricAuth = async () => {
    const rnBiometrics = new ReactNativeBiometrics();

    try {
      const resultObject = await rnBiometrics.simplePrompt({ promptMessage: t('confirm_fingerprint') });
      const { success } = resultObject;

      if (success) {
        const keys = await AsyncStorage.getAllKeys();
        const biometricKeys = keys.filter(key => key.startsWith('@biometric_user_'));

        for (let key of biometricKeys) {
          const user = JSON.parse(await AsyncStorage.getItem(key));
          if (user) {
            await AsyncStorage.setItem('@current_user', user.username);
            Alert.alert(t('success'), t('biometric_auth_success'));
            navigation.navigate('MyTabs');
            return;
          }
        }

        Alert.alert(t('error'), t('no_biometrics_enrolled'));
      } else {
        Alert.alert(t('error'), t('biometric_auth_failed'));
      }
    } catch (error) {
      Alert.alert(t('error'), `${t('biometric_auth_failed')}: ${error.message}`);
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
        <Image source={require('../../Image/logo2.png')} style={styles.logo} />
      </Animated.View>
      <View style={styles.textInputContainer}>
        <MyTextInput onChangeText={setUsername} label1={t('username')} />
      </View>
      <View style={styles.textInputContainer}>
        <MyTextInput onChangeText={setPassword} label1={t('password')} secureTextEntry />
      </View>
      <View style={styles.textInputContainer}>
        <MyButton visible={true} iconname="login" OnChangeButton={()=>(navigation.navigate("MyTabs"))} text={t('login')} />
      </View>
      <View style={styles.biometricContainer}>
        <Text style={[styles.text, { color: theme.textColor }]}>{t('biometric_authentication')}</Text>
        <TouchableOpacity style={[styles.fingerprintButton, { backgroundColor: theme.secondaryColor }]} onPress={handleBiometricAuth}>
          <Ionicons name="finger-print" size={50} color="#fff" />
        </TouchableOpacity>
      </View>

      {educationStep === 0 && (
        <Modal transparent={true} animationType="fade" visible={true}>
          <View style={styles.overlay}>
            <View style={[styles.tooltip, { top: '30%', left: '10%' }]}>
              <View style={styles.tooltipArrow} />
              <Text style={styles.tooltipText}>{t('please_register_to_continue')}</Text>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primaryColor }]}
                onPress={nextStep}
              >
                <Text style={styles.modalButtonText}>{t('next')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
  languageContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  languageButton: {
    padding: 10,
    marginHorizontal: 5,
  },
  languageButtonBorder: {
    borderWidth: 1,
  },
  languageText: {
    fontSize: 16,
    color: 'blue',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  tooltipText: {
    fontSize: 14,
    color: '#000',
  },
  tooltipArrow: {
    position: 'absolute',
    top: -10,
    left: 10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
  },
  modalButton: {
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
