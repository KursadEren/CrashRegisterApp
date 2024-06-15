import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, TextInput, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyFlatlist = ({ data, showSearchInput, onItemSelect, onItemRemove, onAddToCart, favoriteList, isProductList, information }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const handleSearch = query => {
    setSearchQuery(query);
    const filtered = data.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const calculateTotal = item => {
    return (item.count || 0) * parseFloat(item.price);
  };

  const handleQuantityChange = (item, count) => {
    item.count = parseInt(count);
    setFilteredData([...filteredData]);
  };

  const toggleFavorite = async (item) => {
    const updatedData = filteredData.map(product => {
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
    setFilteredData(updatedData);
  };

  const renderItem = ({ item }) => {
    return (
      <View style={[styles.card, isProductList && styles.cardLarge]}>
        {isProductList && (
          <TouchableOpacity style={styles.favoriteIcon} onPress={() => toggleFavorite(item)}>
            <Icon
              name={item.favori === 1 ? 'star' : 'star-o'}
              size={24}
              color="#ffcc00"
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.touch} onPress={() => {
          if (information === 'update') {
            onItemRemove(item);
          } else {
            onItemSelect(item);
          }
        }}>
          <View style={styles.item}>
            <View style={styles.textContainer}>
              <Image source={{ uri: item.image }} resizeMode="contain" style={[styles.image, isProductList && styles.imageLarge]} />
              <Text style={[styles.name, isProductList && styles.nameLarge]}>{item.name}</Text>
            </View>
          </View>
          <Text style={[styles.price, isProductList && styles.priceLarge]}>Price: ${item.price}</Text>
          {information === 'update' && (
            <View style={styles.updateContainer}>
              <View style={styles.quantityContainer}>
                <Text style={styles.label}>Quantity: </Text>
                <TextInput
                  style={styles.quantityInput}
                  keyboardType="numeric"
                  placeholder="Quantity"
                  value={item.count ? item.count.toString() : ''}
                  onChangeText={text => handleQuantityChange(item, text)}
                  placeholderTextColor="#aaa"
                />
              </View>
              <Text style={styles.total}>Total: ${calculateTotal(item)}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={isProductList ? styles.FovoriContainer : styles.container}>
      {showSearchInput && (
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#aaa"
        />
      )}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.objectID.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  touch: {
    width: "auto",
    height: "auto",
  },
  item: {
    backgroundColor: "#333",
    width: 200,
    height: 190,
    padding: 20,
    marginVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 10,
  },
  itemLarge: {
    width: 250,
    height: 250,
  },
  image: {
    width: 130,
    height: 80,
    borderRadius: 10,
  },
  imageLarge: {
    width: 150,
    height: 100,
  },
  textContainer: {
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    marginLeft: 10,
    flex: 1,
  },
  name: {
    alignItems: "center",
    width: 180,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  nameLarge: {
    fontSize: 16,
  },
  price: {
    fontSize: 16,
    marginTop: 5,
    color: '#4bc91a',
    backgroundColor: "#000",
    paddingLeft: 20,
    marginHorizontal: 15,
  },
  priceLarge: {
    fontSize: 18,
  },
  container: {
    margin: 5,
    borderBottomWidth: 0.25,
    marginVertical: 10,
    height: 300,
  },
  searchInput: {
    height: 40,
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: '#fff',
    backgroundColor: '#444',
  },
  quantityInput: {
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: '#fff',
    backgroundColor: '#444',
  },
  updateContainer: {
    marginHorizontal: 15,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: '#fff',
  },
  total: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 10,
    marginVertical: 0,
    marginHorizontal: 5,
  },
  cardLarge: {
    width: 250,
    height: 250,
  },
  flatListContent: {
    paddingHorizontal: 10,
  },
  favoriteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  FovoriContainer:{
    flex:1,
    height:500,
    borderBottomWidth:1
    
  }
});

export default MyFlatlist;
