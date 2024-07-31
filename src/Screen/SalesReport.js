import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { ThemeContext } from '../Context/ThemeContext';
import { useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

const SalesReport = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
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

        const totalSalesCount = Object.values(sales).reduce((sum, value) => sum + value, 0);
        const data = Object.keys(sales).map((key) => ({
          name: key,
          count: sales[key],
          color: getRandomColor(),
          legendFontColor: theme.textColor,
          legendFontSize: 15,
          percentage: ((sales[key] / totalSalesCount) * 100).toFixed(2)
        }));

        const barData = {
          labels: Object.keys(sales),
          datasets: [
            {
              data: Object.values(sales)
            }
          ]
        };

        setTotalSales(totalSalesCount);
        setTopProduct(Object.keys(sales).reduce((a, b) => sales[a] > sales[b] ? a : b));
        setPieChartData(data);
        setBarChartData(barData);
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
      <Text style={[styles.header, { color: theme.primaryColor }]}>{t('sales_report')}</Text>
      <Text style={[styles.info, { color: theme.textColor }]}>{t('total_sales')}: {totalSales}</Text>
      <Text style={[styles.info, { color: theme.textColor }]}>{t('top_product')}: {topProduct}</Text>

      <Text style={[styles.subHeader, { color: theme.primaryColor }]}>{t('pie_chart')}</Text>
      <ScrollView horizontal>
        <PieChart
          data={pieChartData}
          width={width * 3}
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
          paddingLeft={"15"}
          center={[-120, 0]}
          absolute
        />
      </ScrollView>
      {pieChartData.map((data, index) => (
        <View key={index} style={styles.dataContainer}>
          <View style={[styles.colorBox, { backgroundColor: data.color }]} />
          <Text style={[styles.productInfo, { color: theme.textColor }]}>
            {data.name} - {data.count} ({data.percentage}%)
          </Text>
        </View>
      ))}

      <Text style={[styles.subHeader, { color: theme.primaryColor }]}>{t('bar_chart')}</Text>
      <ScrollView horizontal>
        <BarChart
          data={barChartData}
          width={barChartData.labels.length * 60} // Adjust width dynamically based on the number of labels
          height={300}
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
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 10,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    marginBottom: 5,
  },
  productInfo: {
    fontSize: 14,
    marginVertical: 1,
    textAlign: 'left', 
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    alignSelf: 'flex-start', 
  },
  colorBox: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
});

export default SalesReport;
