import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Modal, useWindowDimensions, RefreshControl, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MyCard from '../Component/MyCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';
import { useServiceStatus } from '../Context/ServiceStatusContext';
import { ThemeContext } from '../Context/ThemeContext';
import { API_URL2 } from '../GroceryData/Constant';
import { useTranslation } from 'react-i18next';
import MyFlatlist from '../Component/MyFlatlist';

const Home = ({ navigation }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { serviceStatus, setServiceStatus } = useServiceStatus();
  const { t, i18n } = useTranslation();
  const [productData, setProductData] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [chartData, setChartData] = useState({ labels: [], datasets: [{ data: [] }] });
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [refreshing, setRefreshing] = useState(false);

  const fetchProductData = async () => {
    try {
      const storedProductData = await AsyncStorage.getItem('@productData');
      if (!storedProductData) {
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
          setProductData(products);
        }
      } else {
        setProductData(JSON.parse(storedProductData));
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const data = await AsyncStorage.getItem('@productData');
      if (data) {
        const products = JSON.parse(data);
        const favoriteProducts = products.filter(product => product.favori === 1);
        setFavorites(favoriteProducts);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const fetchRecentPurchases = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const purchaseKeys = keys.filter(key => key.startsWith('@payment_'));
      const purchaseItems = await AsyncStorage.multiGet(purchaseKeys);

      const purchases = purchaseItems.map(item => JSON.parse(item[1])).slice(0, 5); // Show last 5 purchases
      setRecentPurchases(purchases);
    } catch (error) {
      console.error('Error fetching recent purchases:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProductData();
    await fetchFavorites();
    await fetchRecentPurchases();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchProductData();
    fetchFavorites();
    fetchRecentPurchases();
  }, []);

  useEffect(() => {
    const fetchPendingPayments = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const paymentKeys = keys.filter(key => key.startsWith('@payment_'));
        const paymentItems = await AsyncStorage.multiGet(paymentKeys);

        const parsedData = paymentItems.map(item => JSON.parse(item[1]));
        const aggregateSales = {};

        parsedData.forEach(payment => {
          const dateTime = payment.saleDate.split(' ')[0];
          const day = dateTime.split('.')[0]; // Gün değerini almak için split işlemi
          const totalItems = payment.items.reduce((total, item) => total + item.count, 0);

          if (aggregateSales[day]) {
            aggregateSales[day] += totalItems;
          } else {
            aggregateSales[day] = totalItems;
          }
        });

        const sortedDays = Object.keys(aggregateSales).sort((a, b) => parseInt(a) - parseInt(b));
        const data = sortedDays.map(day => aggregateSales[day]);

        setChartData({
          labels: sortedDays,
          datasets: [{ data }]
        });
      } catch (error) {
        console.error('Error fetching pending payments:', error);
      }
    };

    fetchPendingPayments();
  }, []);

  useEffect(() => {
    if (serviceStatus) {
      sendUnsentPaymentsToCentral();
    }
  }, [serviceStatus]);

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

      setToastMessage(t('all_payments_sent'));
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
      console.log(t('all_payments_sent'));
    } catch (e) {
      console.log('Ödemeleri gönderme hatası:', e);
    }
  };

  const toggleServiceStatus = () => {
    setServiceStatus(!serviceStatus);
    if (!serviceStatus) {
      setToastMessage(t('service_opened'));
    } else {
      setToastMessage(t('service_closed'));
    }
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber);
    return date.toLocaleString('tr-TR', { month: 'long' });
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.backgroundColor }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.primaryColor]} // Temanıza uygun renk
        />
      }
    >
       {/* Başlık ve Hoşgeldiniz Mesajı */}
       <View style={styles.header}>
        <Image source={{ uri: 'https://via.placeholder.com/50' }} style={styles.avatar} />
        <View style={styles.headerTextContainer}>
          <Text style={[styles.welcomeMessage, { color: theme.textColor }]}>{t('hello')},</Text>
          <Text style={[styles.userName, { color: theme.textColor }]}>Kursad</Text>
          <TouchableOpacity style={[styles.themeButton, { backgroundColor: theme.primaryColor }]} onPress={toggleTheme}>
            <Text style={styles.themeButtonText}>{t('change_theme')}</Text>
          </TouchableOpacity>
          <View style={styles.serviceStatusContainer}>
            <Text style={[styles.serviceTitle, { color: theme.textColor }]}>{t('service')}</Text>
            <View style={[styles.dot, serviceStatus ? { backgroundColor: theme.primaryColor } : { backgroundColor: theme.dangerColor }]} />
            <Text style={[styles.statusText, serviceStatus ? { color: theme.primaryColor } : { color: theme.dangerColor }]}>
              {serviceStatus ? t('ready') : t('not_working')}
            </Text>
          </View>
          <TouchableOpacity style={[styles.serviceButton, { backgroundColor: theme.primaryColor }]} onPress={toggleServiceStatus}>
            <Text style={styles.serviceButtonText}>{serviceStatus ? t('close') : t('open')}</Text>
          </TouchableOpacity>
        </View>
      </View>
       {/* Arama Çubuğu */}
       <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={theme.textColor} style={styles.searchIcon} />
        <TextInput style={[styles.searchBar, { borderColor: theme.secondaryColor }]} placeholder={t('search')} placeholderTextColor={theme.textColor} />
      </View>

      {/* Grafik */}
      {chartData.labels.length > 0 ? (
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: theme.textColor }]}>{getMonthName(new Date().getMonth())}</Text>
          </View>
          <LineChart
            data={chartData}
            width={width - 40}
            height={isLandscape ? 180 : 220}
            chartConfig={{
              backgroundColor: theme.primaryColor,
              backgroundGradientFrom: theme.primaryColor,
              backgroundGradientTo: theme.secondaryColor,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
            fromZero={true}
          />
          <View style={styles.chartInfoContainer}>
            <Text style={[styles.chartInfoText, { color: theme.textColor }]}> {t('sales_per_day')} </Text>
          </View>
        </View>
      ) : (
        <Text style={[styles.noDataText, { color: theme.textColor }]}>{t('no_data')}</Text>
      )}

      {/* Öne Çıkanlar (Favoriler) */}
      <View style={styles.featuredSection}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>{t('favorites')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Product")}>
            <Text>{t('edit')}</Text>
          </TouchableOpacity>
        </View>
        <MyFlatlist
          data={favorites}
          showSearchInput={false}
          onItemSelect={() => { }}
          onItemRemove={() => { }}
          favoriteList={favorites}
          isProductList={true}
          information={"notremove"}
          isFavoriteList={true}
        />
      </View>

      {/* Son Alımlar */}
      <View style={styles.recentPurchasesSection}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>{t('recent_purchases')}</Text>
          
        </View>
        {recentPurchases.length > 0 ? (
          <FlatList
            data={recentPurchases}
            horizontal={true}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item: purchase }) => (
              <View style={[styles.purchaseItem, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.purchaseText, { color: theme.textColor }]}>
                  {t('date')}: {purchase.date}
                </Text>
                <MyFlatlist
                  data={purchase.items}
                  showSearchInput={false}
                  onItemSelect={() => { }}
                  onItemRemove={() => { }}
                  isProductList={false}
                />
              </View>
            )}
          />
        ) : (
          <Text style={[styles.noDataText, { color: theme.textColor }]}>{t('no_recent_purchases')}</Text>
        )}
      </View>

     

     
      {/* Kategoriler */}
      <View style={styles.content}>
        <View style={styles.row}>
          <MyCard navigation={navigation} CardName={t('sales')} CardPage="Sales" CardColor={theme.primaryColor} IconName="cash-register" />
          <MyCard navigation={navigation} CardName={t('see_price')} CardPage="Product" CardColor={theme.primaryColor} IconName="tag" />
        </View>
        <View style={styles.row}>
          <MyCard navigation={navigation} CardName={t('return')} CardPage="Return" CardColor={theme.primaryColor} IconName="backup-restore" />
          <MyCard navigation={navigation} CardName={t('collections')} CardPage="Collections" CardColor={theme.primaryColor} IconName="credit-card-check-outline" />
        </View>
        <View style={styles.row}>
          <MyCard navigation={navigation} CardName={t('reports')} CardPage="AllReports" CardColor={theme.primaryColor} IconName="file-chart-outline" />
          <MyCard navigation={navigation} CardName={t('other_operations')} CardPage="SeePrice" CardColor={theme.primaryColor} IconName="cogs" />
        </View>
        <View style={styles.row}>
          <MyCard navigation={navigation} CardName={t('direct_product_entry')} CardPage="Product" CardColor={theme.primaryColor} IconName="cart-plus" />
          <MyCard navigation={navigation} CardName={t('www')} CardColor={theme.primaryColor} IconName="web" />
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  headerTextContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  welcomeMessage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  themeButton: {
    marginTop: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  themeButtonText: {
    color: 'white',
    fontSize: 14,
  },
  serviceStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  serviceTitle: {
    marginRight: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  statusText: {
    fontSize: 14,
  },
  serviceButton: {
    marginTop: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  serviceButtonText: {
    color: 'white',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchIcon: {
    position: 'absolute',
    left: 10,
  },
  searchBar: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 40,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  chartContainer: {
    marginVertical: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  chartInfoText: {
    fontSize: 14,
  },
  featuredSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recentPurchasesSection: {
    marginBottom: 20,
  },
  purchaseItem: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: 200, // Uygun genişlik
  },
  purchaseText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemContainerHorizontal: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    alignItems: 'center',
    width: 150, // uygun genişlik
  },
  itemImage: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: 14,
    textAlign: 'center',
  },
  itemCount: {
    fontSize: 14,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  languageButton: {
    padding: 10,
    marginHorizontal: 5,
  },
  languageButtonBorder: {
    borderWidth: 1,
  },
  languageText: {
    fontSize: 16,
    color: 'blue',
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

export default Home;
