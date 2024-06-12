import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useServiceStatus } from '../Context/ServiceStatusContext';

export default function Reports() {
  const [paymentRecords, setPaymentRecords] = useState([]);
  const { serviceStatus } = useServiceStatus();

  useEffect(() => {
    const loadPaymentRecords = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const paymentKeys = keys.filter(key => key.startsWith('@payment_'));
        const paymentItems = await AsyncStorage.multiGet(paymentKeys);
        const payments = paymentItems.map(item => JSON.parse(item[1]));
        setPaymentRecords(payments);
      } catch (e) {
        console.log('Error loading payment records:', e);
      }
    };

    loadPaymentRecords();
  }, [serviceStatus]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ödeme Raporları</Text>
      <FlatList
        data={paymentRecords}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.record}>
            <Text>Tarih: {item.date}</Text>
            <Text>Ara Toplam: {item.subtotal.toFixed(2)}</Text>
            <Text>Toplam: {item.total.toFixed(2)}</Text>
            <Text>Satılma Tarihi: {item.saleDate}</Text>
            <Text>Merkeze Gönderilme Tarihi: {item.centralSendTime}</Text>
            <Text>Merkeze Gönderildi: {item.sentToCentral ? 'Evet' : 'Hayır'}</Text>
            <FlatList
              data={item.items}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.item}>
                  <Text>{item.name}</Text>
                  <Text>{item.price}</Text>
                  <Text>{item.count}</Text>
                </View>
              )}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  record: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
});
