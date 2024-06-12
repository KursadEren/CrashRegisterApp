import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, BackHandler, ScrollView } from 'react-native';
import MyCard from '../Component/MyCard';
import { useServiceStatus } from '../Context/ServiceStatusContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../GroceryData/Constant';

export default function Home({ navigation }) {
  const { serviceStatus, setServiceStatus } = useServiceStatus();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (serviceStatus) {
      sendUnsentPaymentsToCentral();
    }
  }, [serviceStatus]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('@productData');
        if (!storedData) {
          console.log('Veri alınıyor:');
          const response = await axios.get(`${API_URL}/product/product`);
          const filteredData = response.data.map(item => ({
            objectID: item.objectID,
            name: item.name,
            image: item.image,
            price: item.price,
            categories: item.categories
          }));
          await AsyncStorage.setItem('@productData', JSON.stringify(filteredData));
          console.log('Veri AsyncStorage\'e kaydedildi.');
        } else {
          console.log('Veriler zaten mevcut.');
        }
      } catch (error) {
        console.error('Veri alınırken hata:', error);
      }
    };

    fetchData();
  }, []);

  const toggleServiceStatus = () => {
    setServiceStatus(!serviceStatus);
  };

  const sendUnsentPaymentsToCentral = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const paymentKeys = keys.filter(key => key.startsWith('@payment_'));
      const paymentItems = await AsyncStorage.multiGet(paymentKeys);
      const unsentPayments = paymentItems
        .map(item => [item[0], JSON.parse(item[1])])
        .filter(([key, payment]) => !payment.sentToCentral);

      for (const [key, payment] of unsentPayments) {
        const updatedPayment = {
          ...payment,
          sentToCentral: true,
          centralSendTime: new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }),
        };

        await AsyncStorage.setItem(key, JSON.stringify(updatedPayment));
      }

      console.log('Tüm ödemeler merkeze gönderildi.');
    } catch (e) {
      console.log('Ödemeleri gönderme hatası:', e);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topBar}>
        <View style={[styles.dot, serviceStatus ? styles.dotGreen : styles.dotRed]} />
        <Text style={[styles.statusText, serviceStatus ? styles.readyText : styles.loadingText]}>
          {serviceStatus ? 'Servis Durumu: Hazır' : 'Servis Çalışmıyor...'}
        </Text>
        <TouchableOpacity style={styles.button} onPress={toggleServiceStatus}>
          <Text style={styles.buttonText}>Servis Aç/Kapat</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <MyCard navigation={navigation} CardName="Satış" CardPage="Sales" CardColor="#4CAF50" />
          <MyCard navigation={navigation} CardName="Fiyat Gör" CardPage="Product" CardColor="#4CAF50" />
        </View>
        <View style={styles.row}>
          <MyCard navigation={navigation} CardName="İade İşlemi" CardPage="Return" CardColor="#F44336" />
          <MyCard navigation={navigation} CardName="Tahsilatlar" CardPage="Collections" CardColor="#FFEB3B" />
        </View>
        <View style={styles.row}>
          <MyCard navigation={navigation} CardName="Raporlar" CardPage="Reports" CardColor="#2196F3" />
          <MyCard navigation={navigation} CardName="Diğer İşlemler" CardPage="OtherOp" CardColor="#4CAF50" />
        </View>
        <View style={styles.row}>
          <MyCard navigation={navigation} CardName="Direkt Ürün Girişi" CardPage="Product" CardColor="#4CAF50" />
          <MyCard navigation={navigation} CardName="www" CardColor="#4CAF50" />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  dotGreen: {
    backgroundColor: 'green',
  },
  dotRed: {
    backgroundColor: 'red',
  },
  statusText: {
    fontSize: 18,
    color: '#fff',
  },
  loadingText: {
    color: 'red',
  },
  readyText: {
    color: 'green',
  },
  button: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
});
