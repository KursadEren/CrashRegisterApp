import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';
import { ThemeContext } from '../Context/ThemeContext';
import { useWindowDimensions } from 'react-native';

const SalesReport = () => {
  const { theme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [topProduct, setTopProduct] = useState('');
  const { width } = useWindowDimensions();

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const paymentKeys = keys.filter(key => key.startsWith('@payment_'));
        const paymentItems = await AsyncStorage.multiGet(paymentKeys);
        
        const sales = {};
        const salesOverTime = {};

        paymentItems.forEach(item => {
          const payment = JSON.parse(item[1]);
          const date = new Date(payment.date).toLocaleDateString();
          payment.items.forEach(product => {
            if (sales[product.name]) {
              sales[product.name] += product.count;
            } else {
              sales[product.name] = product.count;
            }

            if (salesOverTime[date]) {
              salesOverTime[date] += product.count;
            } else {
              salesOverTime[date] = product.count;
            }
          });
        });

        const data = Object.keys(sales).map((key) => ({
          name: key.length > 10 ? key.substring(0, 10) + '...' : key,
          count: sales[key],
          color: getRandomColor(),
          legendFontColor: theme.textColor,
          legendFontSize: 15,
        }));

        const barData = {
          labels: Object.keys(sales).map(key => key.length > 10 ? key.substring(0, 10) + '...' : key),
          datasets: [
            {
              data: Object.values(sales)
            }
          ]
        };

        const sortedDates = Object.keys(salesOverTime).sort((a, b) => new Date(a) - new Date(b));
        const lineData = {
          labels: sortedDates,
          datasets: [
            {
              data: sortedDates.map(date => salesOverTime[date])
            }
          ]
        };

        setTotalSales(Object.values(sales).reduce((sum, value) => sum + value, 0));
        setTopProduct(Object.keys(sales).reduce((a, b) => sales[a] > sales[b] ? a : b));
        setPieChartData(data);
        setBarChartData(barData);
        setLineChartData(lineData);
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
      <Text style={[styles.info, { color: theme.textColor }]}>Total Sales: {totalSales}</Text>
      <Text style={[styles.info, { color: theme.textColor }]}>Top Product: {topProduct}</Text>

      <Text style={[styles.subHeader, { color: theme.primaryColor }]}>Pie Chart</Text>
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

      <Text style={[styles.subHeader, { color: theme.primaryColor }]}>Bar Chart</Text>
      <BarChart
        data={barChartData}
        width={width - 40}
        height={220}
        yAxisLabel=""
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
        verticalLabelRotation={30}
      />

      <Text style={[styles.subHeader, { color: theme.primaryColor }]}>Sales Over Time</Text>
      <LineChart
        data={lineChartData}
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
        bezier
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SalesReport;
