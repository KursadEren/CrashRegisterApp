import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, BackHandler, ScrollView, Dimensions, Modal } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import MyCard from '../Component/MyCard';
import { useServiceStatus } from '../Context/ServiceStatusContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL , API_URL2 } from '../GroceryData/Constant';

export default function Home({ navigation }) {
  const { serviceStatus, setServiceStatus } = useServiceStatus();
  const [loading, setLoading] = useState(false);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [{ data: [] }] });
  const [toastVisible, setToastVisible] = useState(false);
  const [productData, setProductData] = useState([]);

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
    const fetchPendingPayments = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const paymentKeys = keys.filter(key => key.startsWith('@payment_'));
        const paymentItems = await AsyncStorage.multiGet(paymentKeys);

        const parsedData = paymentItems.map(item => JSON.parse(item[1]));
        console.log('Pending Payments:', parsedData); // Veri kontrolü için log
        setPendingPayments(parsedData);
      } catch (error) {
        console.error('Error fetching pending payments:', error);
      }
    };

    fetchPendingPayments();
  }, []);

  useEffect(() => {
    if (pendingPayments.length > 0) {
      const aggregateSales = {};

      pendingPayments.forEach(payment => {
        const dateTime = payment.saleDate.split(' ')[0]; // Sadece tarih kısmını al
        const totalItems = payment.items.reduce((total, item) => total + item.count, 0);
        
        if (aggregateSales[dateTime]) {
          aggregateSales[dateTime] += totalItems;
        } else {
          aggregateSales[dateTime] = totalItems;
        }
      });

      const sortedDateTimes = Object.keys(aggregateSales).sort();
      const data = sortedDateTimes.map(dateTime => aggregateSales[dateTime]);

      setChartData({
        labels: sortedDateTimes,
        datasets: [{ data }]
      });
    }
  }, [pendingPayments]);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await axios.get(`${API_URL2}/products/product`);
        if (response.status === 200) {
          const products = response.data.map(product => ({
            objectID: product.objectID, // objectID alanını ekleyin
            name: product.name,
            price: product.price,
            image: product.image,
            categories: product.categories,
            favori: 0
          }));
          
          await AsyncStorage.setItem('@productData', JSON.stringify(products));
          setProductData(products);
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    fetchProductData();
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

      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
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
      {chartData.labels.length > 0 ? (
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 20}
          height={220}
          yAxisLabel=""
          chartConfig={{
            backgroundColor: '#e26a00',
            backgroundGradientFrom: '#fb8c00',
            backgroundGradientTo: '#ffa726',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16
            },
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
      ) : (
        <Text style={styles.noDataText}>Veri bulunamadı.</Text>
      )}
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
      <Modal
        visible={toastVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setToastVisible(false)}
      >
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>Tüm ödemeler merkeze gönderildi.</Text>
        </View>
      </Modal>
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
  noDataText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
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
