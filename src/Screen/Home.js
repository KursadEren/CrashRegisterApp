import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';
import MyCard from '../Component/MyCard';

export default function Home({ navigation }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const fetchData = () => {
    setLoading(prevLoading => !prevLoading);
    // Servis çağrısını burada yapabilirsiniz
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={[styles.dot, loading ? styles.dotRed : styles.dotGreen]} />
        <Text style={[styles.statusText, loading ? styles.loadingText : styles.readyText]}>
          {loading ? 'Servis Çalışmıyor...' : 'Servis Durumu: Hazır'}
        </Text>
        <TouchableOpacity style={styles.button} onPress={fetchData}>
          <Text style={styles.buttonText}>Veri Al</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <MyCard navigation={navigation} CardName="Satış" CardPage="Sales" CardColor="#4CAF50" />
          <MyCard navigation={navigation} CardName="Fiyat Gör" CardPage="Product" CardColor="#4CAF50" />
        </View>
        <View style={styles.row}>
          <MyCard navigation={navigation} CardName="İade İşlemi" CardPage="Return" CardColor="#F44336" />
          <MyCard navigation={navigation} CardName="Tahsilatlar" CardPage="Collections" CardColor="#FFEB3B" />
        </View>
        <View style={styles.row}>
          <MyCard navigation={navigation} CardName="Raporlar" CardPage="Reports" CardColor="#2196F3" />
          <MyCard navigation={navigation} CardName="Diğer İşlemler" CardPage="OtherOp" CardColor="#4CAF50" />
        </View>
        <View style={styles.row}>
          <MyCard navigation={navigation} CardName="Direkt Ürün Girişi" CardPage="Product" CardColor="#4CAF50" />
          <MyCard navigation={navigation} CardName="www" CardColor="#4CAF50" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  dotGreen: {
    backgroundColor: 'green',
  },
  dotRed: {
    backgroundColor: 'red',
  },
  statusText: {
    fontSize: 18,
    color: '#fff',
  },
  loadingText: {
    color: 'red',
  },
  readyText: {
    color: 'green',
  },
  button: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
});
