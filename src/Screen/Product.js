import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, ActivityIndicator,Platform, Text, ScrollView, BackHandler, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import MyFlatlist from '../Component/MyFlatlist';
import { ThemeContext } from '../Context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { BasketContext } from '../Context/BasketContext';
const Product = ({ navigation }) => {
  
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [productList, setProductList] = useState([]);
  const [favoriteList, setFavoriteList] = useState([]);
  const [cartList, setCartList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('Tümü');

  const groups = [
    { label: 'Tümü', range: [] },
    { label: 'A-F', range: ['A', 'B', 'C', 'D', 'E', 'F'] },
    { label: 'G-T', range: ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'] },
    { label: 'U-Z', range: ['U', 'V', 'W', 'X', 'Y', 'Z'] },
  ];

  useEffect(() => {
    fetchProducts();

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const fetchProducts = async () => {
    try {
      const storedProductData = await AsyncStorage.getItem('@productData');
      if (storedProductData) {
        const parsedProductData = JSON.parse(storedProductData);
        setProductList(parsedProductData);
        setFavoriteList(parsedProductData.filter(product => product.favori === 1));
      } else {
        console.log('No product data found in AsyncStorage.');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products from AsyncStorage:', error);
      setError(error);
      setLoading(false);
    }
  };

  const handleItemSelect = async (item) => {
    const updatedProductList = productList.map(product => {
      if (product.objectID === item.objectID) {
        const updatedProduct = { ...product, favori: product.favori === 0 ? 1 : 0 };
        AsyncStorage.getItem('@productData').then(storedData => {
          const parsedData = JSON.parse(storedData);
          const updatedStoredData = parsedData.map(p => p.objectID === item.objectID ? updatedProduct : p);
          AsyncStorage.setItem('@productData', JSON.stringify(updatedStoredData));
        });
        return updatedProduct;
      }
      return product;
    });

    setProductList(updatedProductList);
    setFavoriteList(updatedProductList.filter(product => product.favori === 1));
  };

  const handleItemRemove = (item) => {
    const updatedProductList = productList.map(product => {
      if (product.objectID === item.objectID) {
        const updatedProduct = { ...product, favori: 0 };
        AsyncStorage.getItem('@productData').then(storedData => {
          const parsedData = JSON.parse(storedData);
          const updatedStoredData = parsedData.map(p => p.objectID === item.objectID ? updatedProduct : p);
          AsyncStorage.setItem('@productData', JSON.stringify(updatedStoredData));
        });
        return updatedProduct;
      }
      return product;
    });

    setProductList(updatedProductList);
    setFavoriteList(updatedProductList.filter(product => product.favori === 1));
  };

  const handleAddToCart = (item) => {
    setCartList([...cartList, item]);
  };

  const filterProductsByGroup = (group) => {
    if (group.label === 'Tümü') return productList;
    const filteredProducts = productList.filter(product =>
      group.range.some(letter => product.name[0].toUpperCase() === letter)
    );
    return filteredProducts;
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.backgroundColor }]}>
        <ActivityIndicator size="large" color={theme.primaryColor} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.backgroundColor }]}>
        <Text style={[styles.errorText, { color: theme.textColor }]}>{t('error_loading_products')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: theme.primaryColor }]}>{t('all_products')}</Text>
        <TouchableOpacity style={styles.favoritesButton} onPress={() => setShowFavorites(!showFavorites)}>
          <Icon name="star" size={24} color={theme.accentColor} />
          <Text style={[styles.favoritesButtonText, { color: theme.accentColor }]}>{t('favorites')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Sales', { cartList })}>
          <Icon name="shopping-cart" size={24} color={theme.accentColor} />
          <Text style={[styles.cartButtonText, { color: theme.accentColor }]}>{t('cart')}</Text>
        </TouchableOpacity>
      </View>
      {!showFavorites && (
        <View style={styles.groupButtonsContainer}>
          {groups.map((group, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.groupButton,
                selectedGroup === group.label && styles.selectedGroupButton,
                { backgroundColor: selectedGroup === group.label ? theme.primaryColor : theme.secondaryColor }
              ]}
              onPress={() => setSelectedGroup(group.label)}
            >
              <Text style={[styles.groupButtonText, { color: selectedGroup === group.label ? theme.backgroundColor : theme.textColor }]}>
                {group.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {showFavorites ? (
        <MyFlatlist
          data={favoriteList}
          showSearchInput={false}
          onItemSelect={handleItemRemove}
          isProductList={true}
        />
      ) : (
        <MyFlatlist
          data={filterProductsByGroup(groups.find(group => group.label === selectedGroup))}
          showSearchInput={true}
          Basket={true}
          onItemSelect={handleItemSelect}
          onAddToCart={handleAddToCart}
          favoriteList={favoriteList}
          isProductList={true}
          information={"notremove"}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  favoritesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  favoritesButtonText: {
    marginLeft: 5,
    fontSize: 16,
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  cartButtonText: {
    marginLeft: 5,
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  groupButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  groupButton: {
    padding: 10,
    borderRadius: 5,
  },
  selectedGroupButton: {
    backgroundColor: '#888',
  },
  groupButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Product;
