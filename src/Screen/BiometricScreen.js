import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, PanResponder, Dimensions, Alert, Text,Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics from 'react-native-biometrics';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

function BiometricScreen({ navigation }) {
  const translateX = useRef(new Animated.Value(0)).current;

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
        if (gestureState.dx < -width / 4) {
          Animated.timing(translateX, {
            toValue: -width,
            duration: 300, // Transition duration
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
    <View style={styles.container}>
      <Animated.View
        style={[styles.logoContainer, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <Image source={require('../../Image/logo.png')} style={styles.logo} />
      </Animated.View>
      <View style={styles.textContainer}>
        <Text style={styles.text}>Biometric Authentication</Text>
      </View>
      <TouchableOpacity style={styles.fingerprintButton} onPress={handleBiometricAuth}>
        <Ionicons name="finger-print" size={50} color="#fff" />
      </TouchableOpacity>
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
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 40,
  },
  textContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 18,
  },
  fingerprintButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#3b3b3b',
    borderRadius: 50,
  },
});

export default BiometricScreen;
