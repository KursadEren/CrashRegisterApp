import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, TextInput } from 'react-native';

const MyFlatlist = ({ data, showSearchInput, onItemSelect, onItemRemove }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupedData, setGroupedData] = useState([]);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, data]);

  useEffect(() => {
    groupData(data);
  }, [data]);

  const groupData = (data) => {
    const grouped = data.reduce((acc, item) => {
      const existingItem = acc.find(group => group.id === item.id);
      if (existingItem) {
        existingItem.count++;
      } else {
        acc.push({ ...item, count: 1 });
      }
      return acc;
    }, []);
    setGroupedData(grouped);
  };

  const handleScroll = event => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const viewSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(contentOffset / viewSize);
    setCurrentIndex(index);
  };

  const handleSearch = query => {
    setSearchQuery(query);
    const filtered = groupedData.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
    setGroupedData(filtered);
  };

  const handleItemSelect = item => {
    onItemSelect(item);
  };

  const handleItemRemove = item => {
    onItemRemove(item);
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handleItemSelect(item)}>
        <View style={styles.item}>
          <Text style={styles.title}>{item.title} {item.count > 1 ? `x${item.count}` : ''}</Text>
        </View>
      </TouchableOpacity>
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
        data={groupedData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 5,
    borderBottomWidth: 0.25,
    marginVertical: 10,
    height: 200,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

export default MyFlatlist;
