import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Simgeler için kütüphane

export default function MyCard({ CardName, CardColor, CardPage, navigation, IconName }) {
  const onPressCard = () => {
    if (navigation) {
      navigation.navigate(CardPage);
    }
  };

  return (
    <TouchableOpacity onPress={onPressCard} style={[styles.card, { backgroundColor: CardColor }]}>
      <View style={styles.cardContent}>
        <Icon name={IconName} size={40} color="#fff" />
        <Text style={styles.cardText}>{CardName}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 10,
    height: 120,
    borderRadius: 10,
    borderWidth: 0.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center', // Metni ortalamak için
  },
});
