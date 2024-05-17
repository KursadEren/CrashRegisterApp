import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, TextInput } from 'react-native';
import { Image } from 'react-native';
const MyFlatlist = ({ data, showSearchInput, onItemSelect, onItemRemove, information,quantityInput }) => {
  const [searchQuery, setSearchQuery] = useState('');
  


  const handleSearch = query => {
    setSearchQuery(query);
    const filtered = data.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
    groupData(filtered);
  };
  const calculateTotal = item => {
    return (item.count || 0) * parseFloat(item.price);
  };

  

const renderItem = ({ item }) => {
  return (
    <View style={{width:"auto",height:"auto"}}>
      <TouchableOpacity style={styles.touch} onPress={() => {
        if (information === 'update') {
          handleItemRemove(item);
        } else {
          handleItemSelect(item);
        }
      }}>
        <View style={styles.item}>
          <View style={styles.textContainer}>
            <Image source={{ uri: item.image }} resizeMode="contain"  style={styles.image} />
            <Text style={styles.name}> ${item.name}</Text>
          </View>
        </View>
        <Text style={styles.price}>Price: ${item.price}</Text>
        {information === 'update' && (
           <View style={{marginHorizontal:15}} >
          <View style={{flexDirection:"row"}}>
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



  const handleItemSelect = item => {
    onItemSelect(item);
  };

  const handleItemRemove = item => {
    onItemRemove(item);
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
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};



const styles = StyleSheet.create({
  touch: {
      height:200,
      width:100,
  },
  item: {
    backgroundColor: "rgb(75,217,32)",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 8, // Öğeler arası boşluğu azaltmak için marginHorizontal değerini değiştirdim
    flexDirection: 'row',
    width: 80, // Öğe genişliğini 80 olarak ayarladım
    borderRadius: 10,
    
  },
  
  image: {
    marginBottom:10,
    width: 130,
    height: 80,
    borderRadius: 10,
  },
  textContainer: {
    flexDirection:"column",
    justifyContent:"space-around",
    alignItems:"center",
    marginLeft: 10,
    flex: 1,
  },
  name: {
    alignItems:"center",
    width:180,
    height:"auto",
    fontSize: 11,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginTop: 5,
  },
  price: {
    fontSize: 16,
    marginTop: 5,
    color: 'rgb(75,217,32)',
    backgroundColor:"black",
    paddingLeft:20,
    marginHorizontal:15,
    },
  container: {
    
    margin: 5,
    borderBottomWidth: 0.25,
    marginVertical: 10,
    height: 300,
  },
  item: {
    backgroundColor:"white",
    width:200,
      height:200,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius:10,
  },
  title: {
    fontSize: 16,
    marginRight: 5,
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  touch:{
    width:"auto",
    height:"auto",
  }
});

export default MyFlatlist;
