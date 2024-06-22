import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Alert, useWindowDimensions, FlatList, Linking, PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { useServiceStatus } from '../Context/ServiceStatusContext';
import { ThemeContext } from '../Context/ThemeContext';
import MyButton from '../Component/MyButton';
import MyFlatlist from '../Component/MyFlatlist';
import { useTranslation } from 'react-i18next';

export default function Reports() {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [paymentRecords, setPaymentRecords] = useState([]);
  const { serviceStatus } = useServiceStatus();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  useEffect(() => {
    const loadPaymentRecords = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const paymentKeys = keys.filter(key => key.startsWith('@payment_'));
        const paymentItems = await AsyncStorage.multiGet(paymentKeys);
        const payments = paymentItems.map(item => JSON.parse(item[1])).filter(payment => payment.items.every(item => item.name));
        setPaymentRecords(payments);
      } catch (e) {
        console.log('Error loading payment records:', e);
      }
    };

    loadPaymentRecords();
  }, [serviceStatus]);

  const requestExternalStoragePermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'External Storage Write Permission',
            message: 'App needs access to Storage data',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        return true;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const openPDFFile = async (filePath) => {
    try {
      const hasPermission = await requestExternalStoragePermission();
      if (!hasPermission) {
        Alert.alert(t('permission_denied'), t('storage_permission_required'));
        return;
      }
      
      if (filePath && await RNFS.exists(filePath)) {
        await FileViewer.open(filePath);
      } else {
        Alert.alert(t('error'), t('pdf_not_found'));
      }
    } catch (error) {
      if (error.message.includes('no app associated with this mime type')) {
        Alert.alert(
          t('error'),
          t('pdf_no_viewer'),
          [
            {
              text: t('ok'),
              onPress: () => console.log('Ok pressed'),
            },
            {
              text: t('install_app'),
              onPress: () => Linking.openURL('market://details?id=com.adobe.reader'), // Android için Google Play Store bağlantısı
            },
          ]
        );
      } else {
        Alert.alert(t('error'), `${t('pdf_open_error')}: ${error.message}`);
      }
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={[styles.record, { backgroundColor: theme.cardBackground }]}>
        <Text style={{ color: theme.textColor, fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>{t('date')}: {item.date}</Text>
        <Text style={{ color: theme.textColor, marginBottom: 5 }}>{t('subtotal')}: {item.subtotal.toFixed(2)}</Text>
        <Text style={{ color: theme.textColor, marginBottom: 5 }}>{t('total')}: {item.total.toFixed(2)}</Text>
        <Text style={{ color: theme.textColor, marginBottom: 5 }}>{t('sale_date')}: {item.saleDate}</Text>
        <Text style={{ color: theme.textColor, marginBottom: 5 }}>{t('quantity')}: {item.totalItems}</Text>
        <Text style={{ color: theme.textColor, marginBottom: 5 }}>{t('central_send_time')}: {item.centralSendTime}</Text>
        <Text style={{ color: theme.textColor, marginBottom: 10 }}>{t('sent_to_central')}: {item.sentToCentral ? t('yes') : t('no')}</Text>
        <MyFlatlist
          data={item.items}
          showSearchInput={false}
          isProductList={false}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text style={[styles.itemName, { color: theme.textColor }]}>{item.name}</Text>
              <Text style={[styles.itemPrice, { color: theme.textColor }]}>{t('price')}: {item.price}</Text>
              <Text style={[styles.itemCount, { color: theme.textColor }]}>{t('quantity')}: {item.count}</Text>
            </View>
          )}
        />
        <MyButton
          visible={item.pdfPath !== null}
          OnChangeButton={() => openPDFFile(item.pdfPath)}
          text={t('open_pdf')}
          icon="file-pdf"
          style={styles.pdfButton}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.title, { color: theme.textColor }]}>{t('payment_reports')}</Text>
      <FlatList
        data={paymentRecords}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  record: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 16,
  },
  itemCount: {
    fontSize: 16,
  },
  pdfButton: {
    marginTop: 10,
  },
});
