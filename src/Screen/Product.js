import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, ScrollView, BackHandler } from 'react-native';
import axios from 'axios';
import MyFlatlist from '../Component/MyFlatlist';

const Product = ({ navigation }) => {
  const [productList, setProductList] = useState([]);
  const [favoriteList, setFavoriteList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      const response = await axios.get('http://localhost:3001/product');
      setProductList(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
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
      <Text style={styles.header}>All Products</Text>
      <MyFlatlist
        data={productList}
        showSearchInput={true}
        onItemSelect={handleItemSelect}
        information={"notremove"}
      />

      <Text style={styles.header}>Favorite Products</Text>
      <MyFlatlist
        data={favoriteList}
        showSearchInput={false}
        onItemSelect={handleItemRemove}
        information={"update"}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#ff6600',
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
