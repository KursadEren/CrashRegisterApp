import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Alert, PermissionsAndroid, Platform, Modal } from 'react-native';
import MyButton from '../Component/MyButton';
import { ThemeContext } from '../Context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useServiceStatus } from '../Context/ServiceStatusContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import { API_URL2 } from '../GroceryData/Constant';

const SettingsScreen = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();
  const { serviceStatus, setServiceStatus } = useServiceStatus();
  const [devices, setDevices] = useState([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [unsentPaymentsCount, setUnsentPaymentsCount] = useState(0); // Yeni state
  const [isProcessing, setIsProcessing] = useState(false); // İşleme durumunu kontrol etmek için
  const isFocused = useIsFocused();

  useEffect(() => {
    loadUnsentPaymentsCount(); // Sayfa açıldığında unsent payments count'u yükle
    if (serviceStatus) {
      sendUnsentPaymentsToCentral();
    }
  }, [isFocused]);

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
          Alert.alert(t('permissions_needed'), t('permissions_message'));
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const loadUnsentPaymentsCount = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const paymentKeys = keys.filter(key => key.startsWith('@payment_'));
      const paymentItems = await AsyncStorage.multiGet(paymentKeys);
      const unsentPayments = paymentItems
        .map(item => [item[0], JSON.parse(item[1])])
        .filter(([key, payment]) => !payment.sentToCentral);

      setUnsentPaymentsCount(unsentPayments.length); // Unsent payments count'u güncelle
    } catch (e) {
      console.log('Unsent payments count yüklenirken hata:', e);
    }
  };

  const toggleServiceStatus = () => {
    setServiceStatus(prevStatus => !prevStatus);
    if (!serviceStatus) {
      setToastMessage(t('service_opened'));
    } else {
      setToastMessage(t('service_closed'));
    }
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
    if (!serviceStatus) {
      sendUnsentPaymentsToCentral();
    }
  };

  const sendUnsentPaymentsToCentral = async () => {
    if (isProcessing) {
      return; // Eğer işlem halindeyse tekrar çalıştırma
    }
    setIsProcessing(true); // İşlem başladığında durumu güncelle

    try {
      const keys = await AsyncStorage.getAllKeys();
      const paymentKeys = keys.filter(key => key.startsWith('@payment_'));
      const paymentItems = await AsyncStorage.multiGet(paymentKeys);
      const unsentPayments = paymentItems
        .map(item => [item[0], JSON.parse(item[1])])
        .filter(([key, payment]) => !payment.sentToCentral);

      const updatePromises = unsentPayments.map(async ([key, payment]) => {
        const updatedPayment = {
          ...payment,
          sentToCentral: true,
          centralSendTime: new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }),
        };

        await AsyncStorage.setItem(key, JSON.stringify(updatedPayment));
      });

      await Promise.all(updatePromises);

      setToastMessage(t('all_payments_sent'));
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
      console.log(t('all_payments_sent'));

      // Unsent payments count'u güncelle
      loadUnsentPaymentsCount();
    } catch (e) {
      console.log('Ödemeleri gönderme hatası:', e);
    } finally {
      setIsProcessing(false); // İşlem tamamlandığında durumu sıfırla
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
        Alert.alert(t('printer_test'), t('no_printer_found'));
      }
    } catch (error) {
      Alert.alert(t('printer_test'), t('printer_test_error'));
      console.error(error);
    }
  };

  const connectToDevice = async (device) => {
    try {
      const connected = await RNBluetoothClassic.connectToDevice(device.address);
      if (connected) {
        await sendTestPrint(device);
        Alert.alert(t('printer_test'), t('test_successful'));
        await RNBluetoothClassic.disconnectFromDevice(device.address);
      } else {
        Alert.alert(t('printer_test'), t('printer_not_connected'));
      }
    } catch (error) {
      Alert.alert(t('printer_test'), t('test_failed'));
      console.error(error);
    }
  };

  const sendTestPrint = async (device) => {
    try {
      const message = `${t('printer_test')}\n${t('test_successful')}\n\n`;
      await RNBluetoothClassic.writeToDevice(device.address, message);
      return true;
    } catch (error) {
      console.error('Print error:', error);
      return false;
    }
  };

  const handleResetProductData = async () => {
    try {
      await AsyncStorage.removeItem('@productData');
      const response = await axios.get(`${API_URL2}/products/product`);
      if (response.status === 200) {
        const products = response.data.map(product => ({
          objectID: product.objectID,
          name: product.name,
          price: product.price,
          image: product.image,
          categories: product.categories,
          favori: 0
        }));
        await AsyncStorage.setItem('@productData', JSON.stringify(products));
        Alert.alert(t('success'), t('product_data_reset_success'));
      }
    } catch (error) {
      console.error('Product data reset error:', error);
      Alert.alert(t('error'), t('product_data_reset_error'));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.header, { color: theme.textColor }]}>{t('settings')}</Text>
      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          <MyButton visible={true} iconname="translate" OnChangeButton={handleLanguageChange} text={t('change_language')} />
        </View>
        <View style={styles.buttonWrapper}>
          <MyButton visible={true} iconname="theme-light-dark" OnChangeButton={toggleTheme} text={t('change_theme')} />
        </View>
        <View style={styles.buttonWrapper}>
          <MyButton visible={true} OnChangeButton={toggleServiceStatus} text={serviceStatus ? t('close_service') : t('open_service')} />
          {unsentPaymentsCount > 0 && (
            <View style={styles.badgeContainer}>
              <MaterialCommunityIcons name="alert-circle" style={{ height: 17, width: 17 }} color="red" />
              <Text style={styles.badgeText}>{unsentPaymentsCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.buttonWrapper}>
          <MyButton visible={true} OnChangeButton={handlePrinterTest} text={t('printer_test')} />
        </View>
        <View style={styles.buttonWrapper}>
          <MyButton visible={true} OnChangeButton={handleResetProductData} text={t('reset_product_data')} />
        </View>
      </View>
      <Modal
        visible={toastVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setToastVisible(false)}
      >
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      </Modal>
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
    position: 'relative', // Badge için konumlandırma
  },
  badgeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  toastContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  toastText: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 10,
  },
});

export default SettingsScreen;
