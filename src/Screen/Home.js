import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MyCard from '../Component/MyCard';
export default function Home() {
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    setLoading(prevLoading => !prevLoading);
    // Servis çağrısını burada yapabilirsiniz
    // Örneğin:
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
          <MyCard CardName={"Satış"} CardColor="green" />
          <MyCard CardName={"Fiyat Gör"} CardColor="green" />
        </View>
        <View style={styles.row}>
          <MyCard CardName={"İade İşlemi"} CardColor="red" />
          <MyCard CardName={"Tahsilatlar"} CardColor="yellow" />
        </View>
        <View style={styles.row}>
          <MyCard  CardName={"Raporlar"} CardColor="blue"/>
          <MyCard CardName={"Diğer İşlemler"} CardColor="green"/>
        </View>
        <View style={styles.row}>
          <MyCard CardName={"Direkt Ürün Girişi"} CardColor="green"/>
          <MyCard CardName={"www"} CardColor="green"/>
        </View>
      </View>
      <View style={{height:30,width:30,borderWidth:1,borderColor:"red", left:3}}>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 10,
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
    marginRight: 'auto',
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
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
});
