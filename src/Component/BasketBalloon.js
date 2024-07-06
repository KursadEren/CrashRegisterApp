import React, { useContext, useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Dimensions, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { BasketContext } from '../Context/BasketContext';
import { ThemeContext } from '../Context/ThemeContext';

const BasketBalloon = ({ navigation }) => {
  const { basket, addToBasket } = useContext(BasketContext);
  const { theme } = useContext(ThemeContext);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const position = useRef(new Animated.ValueXY({ x: 100, y: 100 })).current;
  const screenDimensions = Dimensions.get('window');
  const balloonSize = 60; // Sepet balonunun boyutu

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        position.setOffset({
          x: position.x._value,
          y: position.y._value
        });
        position.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        position.flattenOffset();

        // Balonun yeni pozisyonunu hesapla
        const finalX = Math.min(Math.max(position.x._value, 0), screenDimensions.width - balloonSize);
        const finalY = Math.min(Math.max(position.y._value, 0), screenDimensions.height - balloonSize);

        // En yakın kenarı bul
        const closestX = finalX < screenDimensions.width / 2 ? 0 : screenDimensions.width - balloonSize;
        const closestY = finalY < screenDimensions.height / 2 ? 0 : screenDimensions.height - balloonSize;

        // En yakın kenara animasyonla hareket et
        Animated.spring(position, {
          toValue: {
            x: Math.abs(finalX - closestX) < Math.abs(finalY - closestY) ? closestX : finalX,
            y: Math.abs(finalX - closestX) < Math.abs(finalY - closestY) ? finalY : closestY
          },
          useNativeDriver: false
        }).start();
      }
    })
  ).current;

  const handleAddToCart = (item) => {
    setSelectedItem(item);
    setQuantity(1);
    setQuantityModalVisible(true);
  };

  const handleConfirmAddToCart = () => {
    if (selectedItem) {
      addToBasket({ ...selectedItem, count: quantity });
    }
    setQuantityModalVisible(false);
  };

  return (
    <View>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.balloon,
          {
            backgroundColor: theme.accentColor,
            transform: position.getTranslateTransform(),
          }
        ]}
      >
        <TouchableOpacity onPress={() => navigation.navigate('Sales')}>
          <Icon name="shopping-cart" size={24} color={theme.textColor} />
          <Text style={[styles.text, { color: theme.textColor }]}>{basket.length}</Text>
        </TouchableOpacity>
      </Animated.View>
      <Modal
        visible={quantityModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setQuantityModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundColor }]}>
            <Text style={[styles.modalText, { color: theme.textColor }]}>Enter quantity:</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.primaryColor, color: theme.textColor }]}
              keyboardType="numeric"
              value={quantity.toString()}
              onChangeText={(text) => setQuantity(Number(text))}
            />
            <Button title="Add to Cart" onPress={handleConfirmAddToCart} />
            <Button title="Cancel" onPress={() => setQuantityModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  balloon: {
    position: 'absolute',
    padding: 10,
    borderRadius: 30,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
    height: 60,
    justifyContent: 'center'
  },
  text: {
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalText: {
    marginBottom: 10,
    fontSize: 18,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default BasketBalloon;
