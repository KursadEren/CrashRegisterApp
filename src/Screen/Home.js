import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, Modal, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MyCard from '../Component/MyCard';
import MyFlatlist from '../Component/MyFlatlist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';
import { useServiceStatus } from '../Context/ServiceStatusContext';
import { ThemeContext } from '../Context/ThemeContext';
import { API_URL2 } from '../GroceryData/Constant';

const Home = ({ navigation }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { serviceStatus, setServiceStatus } = useServiceStatus();
  const [productData, setProductData] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [chartData, setChartData] = useState({ labels: [], datasets: [{ data: [] }] });
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  useEffect(() => {
    const fetchProductData = async () => {
      try {
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
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    fetchProductData();
  }, []);

  useEffect(() => {
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

    fetchFavorites();
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

      setToastMessage('Tüm ödemeler merkeze gönderildi.');
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
      console.log('Tüm ödemeler merkeze gönderildi.');
    } catch (e) {
      console.log('Ödemeleri gönderme hatası:', e);
    }
  };

  const toggleServiceStatus = () => {
    setServiceStatus(!serviceStatus);
    if (!serviceStatus) {
      setToastMessage('Servis açıldı.');
    } else {
      setToastMessage('Servis kapatıldı.');
    }
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      {/* Başlık ve Hoşgeldiniz Mesajı */}
      <View style={styles.header}>
        <Image source={{ uri: 'https://via.placeholder.com/50' }} style={styles.avatar} />
        <View style={styles.headerTextContainer}>
          <Text style={[styles.welcomeMessage, { color: theme.textColor }]}>Merhaba,</Text>
          <Text style={[styles.userName, { color: theme.textColor }]}>Kursad</Text>
          <TouchableOpacity style={[styles.themeButton, { backgroundColor: theme.primaryColor }]} onPress={toggleTheme}>
            <Text style={styles.themeButtonText}>Temayı Değiştir</Text>
          </TouchableOpacity>
          <View style={styles.serviceStatusContainer}>
            <Text style={[styles.serviceTitle, { color: theme.textColor }]}>Servis</Text>
            <View style={[styles.dot, serviceStatus ? { backgroundColor: theme.primaryColor } : { backgroundColor: theme.dangerColor }]} />
            <Text style={[styles.statusText, serviceStatus ? { color: theme.primaryColor } : { color: theme.dangerColor }]}>
              {serviceStatus ? 'Hazır' : 'Çalışmıyor'}
            </Text>
          </View>
          <TouchableOpacity style={[styles.serviceButton, { backgroundColor: theme.primaryColor }]} onPress={toggleServiceStatus}>
            <Text style={styles.serviceButtonText}>{serviceStatus ? 'Kapat' : 'Aç'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Arama Çubuğu */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={theme.textColor} style={styles.searchIcon} />
        <TextInput style={[styles.searchBar, { borderColor: theme.secondaryColor }]} placeholder="Ara..." placeholderTextColor={theme.textColor} />
      </View>

      {/* Kategoriler */}
      <View style={styles.content}>
        <View style={styles.row}>
          <MyCard navigation={navigation} CardName="Satış" CardPage="Sales" CardColor={theme.primaryColor} IconName="cash-register" />
          <MyCard navigation={navigation} CardName="Fiyat Gör" CardPage="Product" CardColor={theme.primaryColor} IconName="tag" />
        </View>
        <View style={styles.row}>
          <MyCard navigation={navigation} CardName="İade İşlemi" CardPage="Return" CardColor={theme.primaryColor} IconName="backup-restore" />
          <MyCard navigation={navigation} CardName="Tahsilatlar" CardPage="Collections" CardColor={theme.primaryColor} IconName="credit-card-check-outline" />
        </View>
        <View style={styles.row}>
          <MyCard navigation={navigation} CardName="Raporlar" CardPage="Reports" CardColor={theme.primaryColor} IconName="file-chart-outline" />
          <MyCard navigation={navigation} CardName="Diğer İşlemler" CardPage="SeePrice" CardColor={theme.primaryColor} IconName="cogs" />
        </View>
        <View style={styles.row}>
          <MyCard navigation={navigation} CardName="Direkt Ürün Girişi" CardPage="Product" CardColor={theme.primaryColor} IconName="cart-plus" />
          <MyCard navigation={navigation} CardName="www" CardColor={theme.primaryColor} IconName="web" />
        </View>
      </View>

      {/* Grafik */}
      {chartData.labels.length > 0 ? (
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
        />
      ) : (
        <Text style={[styles.noDataText, { color: theme.textColor }]}>Veri bulunamadı.</Text>
      )}

      {/* Öne Çıkanlar (Favoriler) */}
      <View style={styles.featuredSection}>
        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Favoriler</Text>
        <MyFlatlist
          data={favorites}
          showSearchInput={false}
          onItemSelect={() => {}}
          onItemRemove={() => {}}
          favoriteList={favorites}
          isProductList={true}
          information={"notremove"}
          isFavoriteList={true}
        />
      </View>

      {/* Kullanıcı Bilgileri ve Ayarlar */}
      <View style={styles.userSection}>
        <TouchableOpacity style={[styles.userButton, { backgroundColor: theme.primaryColor }]}>
          <Icon name="person" size={20} color="#fff" />
          <Text style={styles.userButtonText}>Profil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.userButton, { backgroundColor: theme.primaryColor }]}>
          <Icon name="settings" size={20} color="#fff" />
          <Text style={styles.userButtonText}>Ayarlar</Text>
        </TouchableOpacity>
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
  featuredSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  featuredScroll: {
    marginBottom: 20,
  },
  featuredItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    width: 160,
    height: 220,
  },
  featuredImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  featuredText: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  featuredPrice: {
    marginTop: 5,
  },
  userSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userButton: {
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
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
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Home;
