import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, useWindowDimensions, RefreshControl, FlatList, ActivityIndicator, Vibration } from 'react-native';
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
  const { t, i18n } = useTranslation();
  const { serviceStatus } = useServiceStatus();
  const [productData, setProductData] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [chartData, setChartData] = useState({ labels: [], datasets: [{ data: [] }] });
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const fetchPendingPayments = async (month) => {
    try {
      setLoading(true);
      const keys = await AsyncStorage.getAllKeys();
      const paymentKeys = keys.filter(key => key.startsWith('@payment_'));
      const paymentItems = await AsyncStorage.multiGet(paymentKeys);

      const parsedData = paymentItems.map(item => JSON.parse(item[1]));
      const aggregateSales = {};

      parsedData.forEach(payment => {
        const dateTime = payment.saleDate.split(' ')[0];
        const [day, month, year] = dateTime.split('.');
        const totalItems = payment.items.reduce((total, item) => total + item.count, 0);

        if (parseInt(month) - 1 === selectedMonth) {
          if (aggregateSales[day]) {
            aggregateSales[day] += totalItems;
          } else {
            aggregateSales[day] = totalItems;
          }
        }
      });

      const sortedDays = Object.keys(aggregateSales).sort((a, b) => parseInt(a) - parseInt(b));
      const data = sortedDays.map(day => aggregateSales[day]);

      setChartData({
        labels: sortedDays,
        datasets: [{ data }]
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Vibration.vibrate(); // Hata durumunda titreşim
      console.error('Error fetching pending payments:', error);
    }
  };

  const fetchProductData = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Vibration.vibrate(); // Hata durumunda titreşim
      console.error('Error fetching product data:', error);
    }
  };

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await AsyncStorage.getItem('@productData');
      if (data) {
        const products = JSON.parse(data);
        const favoriteProducts = products.filter(product => product.favori === 1);
        setFavorites(favoriteProducts);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Vibration.vibrate(); // Hata durumunda titreşim
      console.error('Error fetching favorites:', error);
    }
  };

  const fetchRecentPurchases = async () => {
    try {
      setLoading(true);
      const keys = await AsyncStorage.getAllKeys();
      const purchaseKeys = keys.filter(key => key.startsWith('@payment_'));
      const purchaseItems = await AsyncStorage.multiGet(purchaseKeys);

      const purchases = purchaseItems
        .map(item => JSON.parse(item[1]))
        .reverse()
        .slice(0, 5);

      setRecentPurchases(purchases);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Vibration.vibrate(); // Hata durumunda titreşim
      console.error('Error fetching recent purchases:', error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const user = await AsyncStorage.getItem('@current_user');
      setCurrentUser(user || '');
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Vibration.vibrate(); // Hata durumunda titreşim
      console.error('Error fetching current user:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProductData();
    await fetchFavorites();
    await fetchRecentPurchases();
    await fetchPendingPayments();
    await fetchCurrentUser();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchProductData();
    fetchFavorites();
    fetchPendingPayments(selectedMonth);
    fetchRecentPurchases();
    fetchCurrentUser();
  }, [selectedMonth]);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const getMonthName = (monthNumber) => {
    return months[monthNumber];
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.backgroundColor }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.primaryColor]}
        />
      }
    >
      {loading && (
        <ActivityIndicator size="large" color={theme.primaryColor} style={styles.activityIndicator} />
      )}
      <View style={styles.header}>
        <Image source={{ uri: 'https://via.placeholder.com/50' }} style={styles.avatar} />
        <View style={styles.headerTextContainer}>
          <Text style={[styles.welcomeMessage, { color: theme.textColor }]}>{t('hello')},</Text>
          <Text style={[styles.userName, { color: theme.textColor }]}>{currentUser}</Text>
          <View style={styles.serviceStatusContainer}>
            <View style={[styles.serviceStatusDot, { backgroundColor: serviceStatus ? 'green' : 'red' }]} />
            <Text style={[styles.serviceStatusText, { color: theme.textColor }]}>
              {serviceStatus ? t('service_available') : t('service_unavailable')}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.chartWrapper}>
        <ScrollView horizontal contentContainerStyle={styles.monthsContentContainer}>
          {months.map((month, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedMonth(index)}
              style={[
                styles.monthButton,
                {
                  backgroundColor: selectedMonth === index ? theme.primaryColor : theme.secondaryColor
                }
              ]}
            >
              <Text style={{ color: selectedMonth === index ? '#fff' : theme.textColor }}>{month}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {chartData.labels.length > 0 && (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: theme.textColor }]}>{getMonthName(selectedMonth)}</Text>
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
              <Text style={[styles.chartInfoText, { color: theme.textColor }]}>{t('sales_per_day')}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.featuredSection}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>{t('favorites')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Product")}>
            <Text style={{color:theme.textColor}}>{t('edit')}</Text>
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

      <View style={styles.recentPurchasesSection}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>{t('recent_purchases')}</Text>
        </View>
        <FlatList
          data={recentPurchases}
          horizontal={true}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item: purchase }) => (
            <TouchableOpacity onPress={() => { setSelectedPurchase(purchase); setModalVisible(true); }}>
              <View style={[styles.purchaseItem, { backgroundColor: theme.itemBackground }]}>
                <Image source={{ uri: purchase.items[0].image }} style={styles.purchaseImage} />
                <Text style={[styles.purchaseText, { color: theme.textColor,alignItems:"center",justifyContent:"center" }]}>
                  {purchase.items[0].name}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

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
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundColor }]}>
            <Text style={[styles.modalTitle, { color: theme.textColor }]}>{t('purchase_details')}</Text>
            {selectedPurchase && (
              <>
                <Text style={[styles.purchaseText, { color: theme.textColor }]}>
                  {t('date')}: {selectedPurchase.saleDate}
                </Text>
                {selectedPurchase.items.map((item, index) => (
                  <View key={index} style={[styles.itemContainer, { backgroundColor: theme.itemBackground }]}>
                    <Text style={[styles.itemName, { color: theme.textColor }]}>{item.name}</Text>
                    <Text style={[styles.itemCount, { color: theme.textColor }]}>{t('count')}: {item.count}</Text>
                  </View>
                ))}
              </>
            )}
            <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.closeButton, { backgroundColor: theme.primaryColor }]}>
              <Text style={styles.closeButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  chartWrapper: {
    marginBottom: 20,
  },
  monthsContentContainer: {
    justifyContent: 'space-between',
  },
  monthsContainer: {
    marginBottom: 10,
  },
  monthButton: {
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
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
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
    width:220,
    height:220
  },
  purchaseImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  purchaseText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
    textAlign:"auto",
    flexWrap:"wrap"
  },
  itemContainer: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemCount: {
    fontSize: 14,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  serviceStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  serviceStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  serviceStatusText: {
    fontSize: 14,
  },
  activityIndicator: {
    marginTop: 20,
  },
});

export default Home;
