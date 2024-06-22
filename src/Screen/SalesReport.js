import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart } from 'react-native-chart-kit';
import { ThemeContext } from '../Context/ThemeContext';
import { useWindowDimensions } from 'react-native';

const SalesReport = () => {
  const { theme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [pieChartData, setPieChartData] = useState([]);
  const [productSales, setProductSales] = useState({});
  const { width } = useWindowDimensions();

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const paymentKeys = keys.filter(key => key.startsWith('@payment_'));
        const paymentItems = await AsyncStorage.multiGet(paymentKeys);
        
        const sales = {};

        paymentItems.forEach(item => {
          const payment = JSON.parse(item[1]);
          payment.items.forEach(product => {
            if (sales[product.name]) {
              sales[product.name] += product.count;
            } else {
              sales[product.name] = product.count;
            }
          });
        });

        const data = Object.keys(sales).map((key) => ({
          name: key.length > 10 ? key.substring(0, 10) + '...' : key, // Ürün adını kısaltmak
          count: sales[key],
          color: getRandomColor(),
          legendFontColor: theme.textColor,
          legendFontSize: 15,
        }));

        setProductSales(sales);
        setPieChartData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.backgroundColor }]}>
        <ActivityIndicator size="large" color={theme.primaryColor} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.header, { color: theme.primaryColor }]}>Sales Report</Text>
      <PieChart
        data={pieChartData}
        width={width - 40}
        height={220}
        chartConfig={{
          backgroundColor: theme.primaryColor,
          backgroundGradientFrom: theme.primaryColor,
          backgroundGradientTo: theme.secondaryColor,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16
          }
        }}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center', // İçeriği ortalamak için eklendi
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  salesList: {
    marginTop: 20,
    width: '100%', // Tüm genişliği kaplaması için eklendi
  },
  salesItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Nokta ve metni ortalamak için eklendi
    marginBottom: 10,
  },
  salesText: {
    fontSize: 16,
    textAlign: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
});

export default SalesReport;
