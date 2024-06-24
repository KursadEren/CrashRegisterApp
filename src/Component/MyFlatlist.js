import React, { useContext, useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, TextInput, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../Context/ThemeContext';
import { useTranslation } from 'react-i18next';

const MyFlatlist = ({ data, showSearchInput,Touch, onItemSelect, onItemRemove, onAddToCart, favoriteList, isProductList, information }) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
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
      <View style={[styles.card, isProductList && styles.cardLarge, { backgroundColor: theme.primaryColor }]}>
        {isProductList && (
          <TouchableOpacity style={styles.favoriteIcon} onPress={() => toggleFavorite(item)}>
            <Icon
              name={item.favori === 1 ? 'star' : 'star-o'}
              size={24}
              color={theme.accentColor}
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
          <View style={[styles.item, { backgroundColor: theme.itemBackground }]}>
            <View style={styles.textContainer}>
              <Image source={{ uri: item.image }} resizeMode="contain" style={[styles.image, isProductList && styles.imageLarge]} />
              <Text style={[styles.name, isProductList && styles.nameLarge, { color: theme.textColor }]}>{item.name}</Text>
            </View>
          </View>
          <Text style={[styles.price, isProductList && styles.priceLarge, { color: theme.priceColor }]}>{t('price')}: ${item.price}</Text>
          {information === 'update' && (
            <View style={styles.updateContainer}>
              <View style={styles.quantityContainer}>
                <Text style={[styles.label, { color: theme.textColor }]}>{t('quantity')}: </Text>
                <TextInput
                  style={[styles.quantityInput, { borderColor: theme.secondaryColor, color: theme.textColor, backgroundColor: theme.inputBackground }]}
                  keyboardType="numeric"
                  placeholder={t('quantity')}
                  value={item.count ? item.count.toString() : ''}
                  onChangeText={text => handleQuantityChange(item, text)}
                  placeholderTextColor="#"
                />
              </View>
              <Text style={[styles.total, { color: theme.textColor }]}>{t('total')}: ${calculateTotal(item)}</Text>
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
          style={[styles.searchInput, { borderColor: theme.secondaryColor, color: theme.textColor, backgroundColor: theme.inputBackground }]}
          placeholder={t('search')}
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor={theme.placeholderTextColor}
        />
      )}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.objectID ? item.objectID.toString() : index.toString()}
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
  },
  nameLarge: {
    fontSize: 16,
  },
  price: {
    fontSize: 16,
    marginTop: 5,
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
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  quantityInput: {
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  updateContainer: {
    marginHorizontal: 15,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {},
  total: {},
  card: {
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
  FovoriContainer: {
    flex: 1,
    height: 300,
  }
});

export default MyFlatlist;
