import React, { useState } from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';

const data1 = [
  { id: '1', title: 'Veri 1' },
  { id: '2', title: 'Veri 2' },
  { id: '3', title: 'Veri 3' },
];

const data2 = [
  { id: 'a', title: 'Alt Veri 1' },
  { id: 'b', title: 'Alt Veri 2' },
  { id: 'c', title: 'Alt Veri 3' },
];

const Deneme = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [data1List, setData1List] = useState(data1);
  const [data2List, setData2List] = useState(data2);

  const handleItemPress = (item) => {
    setSelectedItem(item);
    setData1List(data1List.filter((i) => i.id !== item.id));
    setData2List([...data2List, item]);
  };

  const renderItem1 = ({ item }) => (
    <TouchableOpacity onPress={() => handleItemPress(item)}>
      <View style={{ padding: 10 }}>
        <Text>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderItem2 = ({ item }) => (
    <View style={{ padding: 10, backgroundColor: 'lightblue' }}>
      <Text>{item.title}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data1List}
        renderItem={renderItem1}
        keyExtractor={(item) => item.id}
      />
      <FlatList
        data={data2List}
        renderItem={renderItem2}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default Deneme;
