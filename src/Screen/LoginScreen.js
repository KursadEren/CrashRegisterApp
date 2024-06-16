import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, BackHandler, Alert, Animated, PanResponder, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import MyTextInput from '../Component/MyTextınput';
import MyButton from '../Component/MyButton';
import { useLandscape } from '../Context/LandSpaceProvider';
import { API_URL ,API_URL2} from '../GroceryData/Constant';

const { width } = Dimensions.get('window');

function LoginScreen({ navigation }) {
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
    <View style={[styles.container, isLandscape ? styles.containerLandscape : styles.containerPortrait]}>
      <Animated.View
        style={[styles.logoContainer, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <Image source={require('../../Image/logo.png')} style={styles.logo} />
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

export default LoginScreen;
