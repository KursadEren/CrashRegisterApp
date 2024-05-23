import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';

export default function MyCard({ CardName, CardColor, CardPage, navigation }) {
  const onPressCard = () => {
    if (navigation) {
      navigation.navigate(CardPage);
    }
  };

  return (
    <TouchableOpacity onPress={onPressCard} style={[styles.card, { backgroundColor: CardColor }]}>
      <View style={styles.cardContent}>
        <Text style={styles.cardText}>{CardName}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginHorizontal: 10,
    marginVertical: 5,
    height: 100,
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
  },
});
