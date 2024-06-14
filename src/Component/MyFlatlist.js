import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, TextInput, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

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

  const renderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <TouchableOpacity style={styles.touch} onPress={() => {
          if (information === 'update') {
            onItemRemove(item);
          } else {
            onItemSelect(item);
          }
        }}>
          <View style={styles.item}>
            <View style={styles.textContainer}>
              <Image source={{ uri: item.image }} resizeMode="contain" style={styles.image} />
              <Text style={styles.name}>{item.name}</Text>
              {isProductList && (
                <TouchableOpacity onPress={() => onItemSelect(item)}>
                  <Icon
                    name={favoriteList && favoriteList.some(fav => fav.id === item.id) ? 'star' : 'star-o'}
                    size={24}
                    color="#ffcc00"
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Text style={styles.price}>Price: ${item.price}</Text>
          {isProductList && (
            <TouchableOpacity onPress={() => onAddToCart(item)}>
              <Icon name="shopping-cart" size={24} color="#ffcc00" />
            </TouchableOpacity>
          )}
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
    <View style={styles.container}>
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
  image: {
    width: 130,
    height: 80,
    borderRadius: 10,
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
  price: {
    fontSize: 16,
    marginTop: 5,
    color: '#4bc91a',
    backgroundColor: "#000",
    paddingLeft: 20,
    marginHorizontal: 15,
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
  flatListContent: {
    paddingHorizontal: 10,
  },
});

export default MyFlatlist;
