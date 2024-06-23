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
import { API_URL, API_URL2 } from '../GroceryData/Constant';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

function LoginScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();
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
  }, [navigation]);

  const handleLogin = async () => {
    try {
      const storedPassword = await AsyncStorage.getItem('@user_' + username);
      if (storedPassword === password) {
        await AsyncStorage.setItem('@current_user', username); // Şu anki kullanıcıyı kaydet
        navigation.navigate("MyTabs");
        return;
      }

      const response = await axios.post(`${API_URL2}/users/users`, {
        username,
        password
      });

      if (response.status === 200 && response.data) {
        await AsyncStorage.setItem('@user_' + username, password);
        await AsyncStorage.setItem('@current_user', username); // Şu anki kullanıcıyı kaydet
        navigation.navigate("MyTabs");
      } else {
        Alert.alert(t('error'), t('invalid_username_password'));
      }
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
            await AsyncStorage.setItem('@current_user', user.username); // Şu anki kullanıcıyı kaydet
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

  const changeLanguage = async (lang) => {
    await i18n.changeLanguage(lang);
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
        <MyButton visible={true} iconname="login" OnChangeButton={handleLogin} text={t('login')} />
      </View>
      <View style={styles.biometricContainer}>
        <Text style={[styles.text, { color: theme.textColor }]}>{t('biometric_authentication')}</Text>
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
});

export default LoginScreen;
