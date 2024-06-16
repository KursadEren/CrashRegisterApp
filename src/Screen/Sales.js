import React, { useState, useEffect } from 'react';
import { View, Modal, StyleSheet, Text, ScrollView, BackHandler, useWindowDimensions } from 'react-native';
import MyFlatlist from '../Component/MyFlatlist';
import MyButton from '../Component/MyButton';
import MyTextInput from '../Component/MyTextınput'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const DATA2 = [];

const Sales = ({ navigation }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [data1List, setData1List] = useState([]);
  const [data2List, setData2List] = useState(DATA2);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [quantityInput, setQuantityInput] = useState('');
  const [isItemListEmpty, setIsItemListEmpty] = useState(true);
  const [bagModalVisible, setBagModalVisible] = useState(false);
  const [bagQuantity, setBagQuantity] = useState('');

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  useEffect(() => {
    const fetchDataFromAsyncStorage = async () => {
      try {
        const storedData = await AsyncStorage.getItem('@productData');
        if (storedData) {
          setData1List(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('AsyncStorage\'den veri alınırken hata:', error);
      }
    };

    fetchDataFromAsyncStorage();

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    setIsItemListEmpty(data2List.length === 0);
  }, [data2List]);

  const handleItemSelect = (item) => {
    setSelectedProduct({ ...item, quantityInput: quantityInput });
    setQuantityModalVisible(true);
  };

  const handleItemRemove = (item) => {
    const updatedData2List = data2List.filter((product) => product.objectID !== item.objectID);
    setData2List(updatedData2List);
    if (selectedProduct && selectedProduct.objectID === item.objectID) {
      setSelectedProduct(null);
    }
  };

  const handleQuantityUpdate = () => {
    if (selectedProduct) {
      const updatedData2List = [...data2List];
      const selectedItemIndex = updatedData2List.findIndex((item) => item.objectID === selectedProduct.objectID);
      if (selectedItemIndex !== -1) {
        updatedData2List[selectedItemIndex].count = parseInt(quantityInput, 10) || 0;
      } else {
        updatedData2List.push({ ...selectedProduct, count: parseInt(quantityInput, 10) || 0 });
      }
      setData2List(updatedData2List);
      setQuantityInput('');
    }
    setQuantityModalVisible(false);
  };

  const handleCancel = () => {
    setQuantityModalVisible(false);
    setQuantityInput('');
  };

  const handleRouteReceipt = () => {
    setBagModalVisible(true);
  };

  const handleBagQuantityChange = (text) => {
    setBagQuantity(text);
  };

  const handleQuantityChange = (text) => {
    setQuantityInput(text);
  };

  const handleBagQuantitySubmit = () => {
    const bagCount = parseInt(bagQuantity, 10) || 0;
    const bagCost = bagCount * 0.25;
    const updatedData2List = data2List.map(item => ({ ...item, bagCount, bagCost }));
    setData2List(updatedData2List);
    setBagModalVisible(false);
    navigation.navigate("Receipt", { data2List: updatedData2List, bagCount, bagCost });
  };

  return (
    <ScrollView style={[styles.scrollView, { padding: width * 0.05 }]}>
      <MyFlatlist
        data={data1List}
        showSearchInput={true}
        onItemSelect={handleItemSelect}
        information={"notremove"}
      />

      <MyFlatlist
        data={data2List}
        showSearchInput={false}
        onItemSelect={handleItemSelect}
        onItemRemove={handleItemRemove}
        information={"update"}
        selectedProduct={selectedProduct}
        quantityInput={quantityInput}
        onUpdateItemList={(isEmpty) => setIsItemListEmpty(isEmpty)}
      />

      <Modal
        visible={quantityModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, isLandscape ? styles.modalContentLandscape : styles.modalContentPortrait]}>
            <Text style={styles.modalText}>Enter Quantity:</Text>
            <MyTextInput
              label1="Quantity"
              onChangeText={handleQuantityChange}
              value={quantityInput}
            />

            <View style={styles.modalButtonContainer}>
              <View>
                <MyButton visible={true} OnChangeButton={handleQuantityUpdate} text="Update" />
              </View>
              <View>
                <MyButton visible={true} OnChangeButton={handleCancel} text="Cancel" />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={bagModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, isLandscape ? styles.modalContentLandscape : styles.modalContentPortrait]}>
            <Text style={styles.modalText}>Enter Bag Quantity (25 cents per bag):</Text>
            <MyTextInput
              label1="Bag Quantity"
              onChangeText={handleBagQuantityChange}
              value={bagQuantity}
            />

            <View style={styles.modalButtonContainer}>
              <View>
                <MyButton visible={true} OnChangeButton={handleBagQuantitySubmit} text="Submit" />
              </View>
              <View>
                <MyButton visible={true} OnChangeButton={() => setBagModalVisible(false)} text="Cancel" />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <View style={[styles.buttonContainer, { marginBottom: isLandscape ? 50 : 10 }]}>
        <MyButton
          visible={!isItemListEmpty}
          OnChangeButton={handleRouteReceipt}
          text="Go Receipt"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalContentPortrait: {
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentLandscape: {
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalText: {
    color: '#fff',
    marginBottom: 10,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});

export default Sales;
