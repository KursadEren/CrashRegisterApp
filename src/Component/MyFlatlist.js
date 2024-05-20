import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, TextInput, Image } from 'react-native';

const MyFlatlist = ({ data, showSearchInput, onItemSelect, onItemRemove, information }) => {
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
      <View style={{ width: "auto", height: "auto" }}>
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
              <Text style={styles.name}> {item.name}</Text>
            </View>
          </View>
          <Text style={styles.price}>Price: ${item.price}</Text>
          {information === 'update' && (
            <View style={{ marginHorizontal: 15 }}>
              <View style={{ flexDirection: "row" }}>
                <Text>Adet: </Text>
                <TextInput
                  style={styles.quantityInput}
                  keyboardType="numeric"
                  placeholder="Quantity"
                  value={item.count ? item.count.toString() : ''}
                  onChangeText={text => handleQuantityChange(item, text)}
                />
              </View>
              <Text>Total: ${calculateTotal(item)}</Text>
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
        />
      )}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
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
    backgroundColor: "white",
    width: 200,
    height: 200,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
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
    fontSize: 11,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    marginTop: 5,
    color: 'rgb(75,217,32)',
    backgroundColor: "black",
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
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  quantityInput: {
   
    borderColor: 'gray',
   
   
   
  }
});

export default MyFlatlist;
