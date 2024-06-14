import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, ScrollView, BackHandler, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import MyFlatlist from '../Component/MyFlatlist';

const Product = ({ navigation }) => {
  const [productList, setProductList] = useState([]);
  const [favoriteList, setFavoriteList] = useState([]);
  const [cartList, setCartList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);

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

  const handleItemSelect = (item) => {
    if (favoriteList.some((fav) => fav.id === item.id)) {
      setFavoriteList(favoriteList.filter((fav) => fav.id !== item.id));
    } else {
      setFavoriteList([...favoriteList, item]);
    }
  };

  const handleItemRemove = (item) => {
    setFavoriteList(favoriteList.filter((fav) => fav.id !== item.id));
  };

  const handleAddToCart = (item) => {
    setCartList([...cartList, item]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff6600" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error loading products</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>All Products</Text>
        <TouchableOpacity style={styles.favoritesButton} onPress={() => setShowFavorites(!showFavorites)}>
          <Icon name="star" size={24} color="#ffcc00" />
          <Text style={styles.favoritesButtonText}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Sales', { cartList })}>
          <Icon name="shopping-cart" size={24} color="#ffcc00" />
          <Text style={styles.cartButtonText}>Cart</Text>
        </TouchableOpacity>
      </View>
      {showFavorites ? (
        <MyFlatlist
          data={favoriteList}
          showSearchInput={false}
          onItemSelect={handleItemRemove}
          isProductList={true}
          information={"update"}
        />
      ) : (
        <MyFlatlist
          data={productList}
          showSearchInput={true}
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
    backgroundColor: '#1a1a1a',
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
    color: '#ff6600',
  },
  favoritesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  favoritesButtonText: {
    color: '#ffcc00',
    marginLeft: 5,
    fontSize: 16,
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  cartButtonText: {
    color: '#ffcc00',
    marginLeft: 5,
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  errorText: {
    color: 'red',
  },
});

export default Product;
