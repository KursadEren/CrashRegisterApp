import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Alert, useWindowDimensions, FlatList, Linking, PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { useServiceStatus } from '../Context/ServiceStatusContext';
import { ThemeContext } from '../Context/ThemeContext';
import MyButton from '../Component/MyButton';
import MyFlatlist from '../Component/MyFlatlist'; // MyFlatlist bileşenini içeri aktarın

export default function Reports() {
  const { theme } = useContext(ThemeContext);
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
        Alert.alert('Permission Denied', 'You need to give storage permission to access this file');
        return;
      }
      
      if (filePath && await RNFS.exists(filePath)) {
        await FileViewer.open(filePath);
      } else {
        Alert.alert('Hata', 'PDF dosyası bulunamadı');
      }
    } catch (error) {
      if (error.message.includes('no app associated with this mime type')) {
        Alert.alert(
          'Hata',
          'PDF dosyası açılamadı çünkü cihazınızda PDF görüntüleyici uygulaması yüklü değil. Lütfen bir PDF görüntüleyici yükleyin.',
          [
            {
              text: 'Tamam',
              onPress: () => console.log('Tamam pressed'),
            },
            {
              text: 'Uygulamayı Yükle',
              onPress: () => Linking.openURL('market://details?id=com.adobe.reader'), // Android için Google Play Store bağlantısı
            },
          ]
        );
      } else {
        Alert.alert('Hata', `PDF dosyası açılamadı: ${error.message}`);
      }
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={[styles.record, { backgroundColor: theme.cardBackground }]}>
        <Text style={{ color: theme.textColor, fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Tarih: {item.date}</Text>
        <Text style={{ color: theme.textColor, marginBottom: 5 }}>Ara Toplam: {item.subtotal.toFixed(2)}</Text>
        <Text style={{ color: theme.textColor, marginBottom: 5 }}>Toplam: {item.total.toFixed(2)}</Text>
        <Text style={{ color: theme.textColor, marginBottom: 5 }}>Satılma Tarihi: {item.saleDate}</Text>
        <Text style={{ color: theme.textColor, marginBottom: 5 }}>Adet: {item.totalItems}</Text>
        <Text style={{ color: theme.textColor, marginBottom: 5 }}>Merkeze Gönderilme Tarihi: {item.centralSendTime}</Text>
        <Text style={{ color: theme.textColor, marginBottom: 10 }}>Merkeze Gönderildi: {item.sentToCentral ? 'Evet' : 'Hayır'}</Text>
        <MyFlatlist
          data={item.items}
          showSearchInput={false}
          isProductList={false}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text style={[styles.itemName, { color: theme.textColor }]}>{item.name}</Text>
              <Text style={[styles.itemPrice, { color: theme.textColor }]}>Fiyat: {item.price}</Text>
              <Text style={[styles.itemCount, { color: theme.textColor }]}>Adet: {item.count}</Text>
            </View>
          )}
        />
        <MyButton
          visible={item.pdfPath !== null}
          OnChangeButton={() => openPDFFile(item.pdfPath)}
          text="PDF Aç"
          icon="file-pdf"
          style={styles.pdfButton}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.title, { color: theme.textColor }]}>Ödeme Raporları</Text>
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
