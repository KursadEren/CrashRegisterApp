import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';
import MyButton from '../Component/MyButton';
import { ThemeContext } from '../Context/ThemeContext';
import { useTranslation } from 'react-i18next';
import RNBluetoothClassic from 'react-native-bluetooth-classic';

const SettingsScreen = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);
        if (
          granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
          (granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED || 
          granted['android.permission.ACCESS_COARSE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED)
        ) {
          console.log('Permissions granted');
        } else {
          Alert.alert('İzinler gerekli', 'Bluetooth ve konum izinlerini vermeniz gerekmektedir.');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const handleLanguageChange = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'tr' : 'en');
  };

  const handlePrinterTest = async () => {
    try {
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      if (!enabled) {
        await RNBluetoothClassic.requestEnable();
      }

      const bondedDevices = await RNBluetoothClassic.getBondedDevices();
      setDevices(bondedDevices);

      if (bondedDevices.length > 0) {
        connectToDevice(bondedDevices[0]);
      } else {
        Alert.alert('Yazıcı Testi', 'Herhangi bir yazıcı bulunamadı.');
      }
    } catch (error) {
      Alert.alert('Yazıcı Testi', 'Test sırasında bir hata oluştu.');
      console.error(error);
    }
  };

  const connectToDevice = async (device) => {
    try {
      const connected = await RNBluetoothClassic.connectToDevice(device.address);
      if (connected) {
        await sendTestPrint(device);
        Alert.alert('Yazıcı Testi', 'Test başarılı!');
        await RNBluetoothClassic.disconnectFromDevice(device.address);
      } else {
        Alert.alert('Yazıcı Testi', 'Yazıcıya bağlanılamadı.');
      }
    } catch (error) {
      Alert.alert('Yazıcı Testi', 'Test başarısız oldu.');
      console.error(error);
    }
  };

  const sendTestPrint = async (device) => {
    try {
      const message = 'Yazıcı Testi\nBaşarılı!\n\n';
      await RNBluetoothClassic.writeToDevice(device.address, message);
      return true;
    } catch (error) {
      console.error('Yazdırma hatası:', error);
      return false;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.header, { color: theme.textColor }]}>SettingsScreen</Text>
      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          <MyButton visible={true} iconname="translate" OnChangeButton={handleLanguageChange} text={t('change_language')} />
        </View>
        <View style={styles.buttonWrapper}>
          <MyButton visible={true} iconname="theme-light-dark" OnChangeButton={toggleTheme} text={t('change_theme')} />
        </View>
        <View style={styles.buttonWrapper}>
          <MyButton visible={true} OnChangeButton={handlePrinterTest} text="Yazıcı Testi" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonWrapper: {
    marginBottom: 10,
    width: '100%',
  },
});

export default SettingsScreen;
