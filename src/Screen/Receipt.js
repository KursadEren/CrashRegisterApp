import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const Receipt = ({ route }) => {
  const { data2List } = route.params;

  return (
    <View style={styles.container}>
      <View style={{}}>
        <View style={styles.header}>
          <View style={{ flex:2 }}>
            <Text>Product</Text>
          </View>
          <View style={{ flex:1 }}>
            <Text>Price</Text>
          </View>
          <View style={{ flex:0.5 }}>
            <Text>Count</Text>
          </View>
        </View>
      </View>
      <ScrollView style={{ flex:10 }}>
        {data2List.map((item, index) => (
          <View key={index} style={styles.item}>
            <View style={{ flex:2 }}>
              <Text>{item.name}</Text>
            </View>
            <View style={{ flex:1 }}>
              <Text>{item.price}</Text>
            </View>
            <View style={{ flex:0.5 }}>
              <Text>x{item.count}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.totalContainer}>
        <Text style={{ fontSize:20 }}>Ara Toplam:</Text>
        <Text style={{ fontSize:20 }}>       Toplam:</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent:"space-between",
    paddingHorizontal: 20,
  },
  header: {
    backgroundColor:"white",
    marginTop:3,
    borderTopWidth:0.4,
    borderBottomWidth:0.4,
    justifyContent:"space-around",
    alignItems:"center",
    flexDirection:"row",
  },
  item: {
    backgroundColor:"white",
    justifyContent:"space-around",
    alignItems:"center",
    flexDirection:"row",
    paddingVertical: 10,
    borderBottomWidth: 0.4,
  },
  totalContainer: {
    borderWidth:2,
    borderStyle:"solid",
    marginBottom:3,
    padding: 10,
  },
});

export default Receipt;
