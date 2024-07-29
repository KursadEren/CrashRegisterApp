import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../Context/ThemeContext';

export default function Return() {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [paymentData, setPaymentData] = useState([]);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const paymentKeys = keys.filter(key => key.startsWith('@payment_'));
        const paymentItems = await AsyncStorage.multiGet(paymentKeys);

        const parsedData = paymentItems.map(item => JSON.parse(item[1]));
        setPaymentData(parsedData);
      } catch (error) {
        console.error('Error fetching payment data:', error);
      }
    };

    fetchPaymentData();
  }, []);

  const renderItem = ({ item }) => (
    <View style={[styles.itemContainer, { backgroundColor: theme.itemBackground }]}>
      <Text style={[styles.itemText, { color: theme.textColor }]}>{t('date')}: {item.date}</Text>
      <Text style={[styles.itemText, { color: theme.textColor }]}>{t('total')}: {item.total.toFixed(2)}</Text>
      <Text style={[styles.itemText, { color: theme.textColor }]}>{t('items')}:</Text>
      {item.items.map((product, index) => (
        <View key={index} style={styles.productContainer}>
          <Text style={[styles.productText, { color: theme.textColor }]}>{product.name} - {t('count')}: {product.count}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.title, { color: theme.primaryColor }]}>{t('return_items')}</Text>
      <FlatList
        data={paymentData}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  listContainer: {
    flexGrow: 1,
  },
  itemContainer: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemText: {
    fontSize: 16,
    marginBottom: 10,
  },
  productContainer: {
    marginLeft: 10,
    marginBottom: 5,
  },
  productText: {
    fontSize: 14,
  },
});
