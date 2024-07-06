import React, { useState, useEffect, useContext } from 'react';
import { View, Modal, StyleSheet, Text, ScrollView, BackHandler, useWindowDimensions, Alert, TouchableOpacity } from 'react-native';
import MyFlatlist from '../Component/MyFlatlist';
import MyButton from '../Component/MyButton';
import MyTextInput from '../Component/MyTextınput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../Context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { CameraHighlights, useBarcodeScanner } from "@mgcrea/vision-camera-barcode-scanner";
import { useCameraDevices, Camera } from "react-native-vision-camera";
import BarcodeCamera from '../Component/BarcodeCamera';
import { BasketContext } from '../Context/BasketContext';

const DATA2 = [];



const Sales = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const { basket, setBasket, clearBasket } = useContext(BasketContext);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [data1List, setData1List] = useState([]);
  const [data2List, setData2List] = useState(DATA2);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [quantityInput, setQuantityInput] = useState('');
  const [isItemListEmpty, setIsItemListEmpty] = useState(true);
  const [bagModalVisible, setBagModalVisible] = useState(false);
  const [bagQuantity, setBagQuantity] = useState('');
  const [bagCost, setBagCost] = useState(0);
  const [barcodeModalVisible, setBarcodeModalVisible] = useState(false);

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
        console.error("AsyncStorage'den veri alırken hata:", error);
      }
    };

    fetchDataFromAsyncStorage();

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    setIsItemListEmpty(data2List.length === 0);
  }, [data2List]);

  useEffect(() => {
    // BasketContext'teki verileri data2List'e ekleme ve sepeti temizleme
    if (basket.length > 0) {
      setData2List((prevData2List) => {
        const newData2List = [...prevData2List];
        basket.forEach(item => {
          if (!newData2List.find(product => product.objectID === item.objectID)) {
            newData2List.push(item);
          }
        });
        return newData2List;
      });
      clearBasket(); // Sepeti temizleme
    }
  }, [basket, clearBasket]);

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
    const quantity = parseInt(quantityInput, 10) || 0;
    if (quantity === 0 || !quantityInput) {
      handleItemRemove(selectedProduct);
    } else {
      if (selectedProduct) {
        const updatedData2List = [...data2List];
        const selectedItemIndex = updatedData2List.findIndex((item) => item.objectID === selectedProduct.objectID);
        if (selectedItemIndex !== -1) {
          updatedData2List[selectedItemIndex].count = quantity;
        } else {
          updatedData2List.push({ ...selectedProduct, count: quantity });
        }
        setData2List(updatedData2List);
      }
    }
    setQuantityInput('');
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
    setBagCost(bagCost);
    const updatedData2List = data2List.map(item => ({ ...item, bagCount, bagCost }));
    setData2List(updatedData2List);
    setBagModalVisible(false);
    navigation.navigate("Receipt", { data2List: updatedData2List, bagCount, bagCost });
  };

  

  const totalCost = data2List.reduce((total, item) => total + (item.price * item.count), 0) + bagCost;

  return (
    <ScrollView style={[styles.scrollView, { padding: width * 0.05, backgroundColor: theme.backgroundColor }]}>
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
          <View style={[styles.modalContent, isLandscape ? styles.modalContentLandscape : styles.modalContentPortrait, { backgroundColor: theme.modalBackground }]}>
            <Text style={[styles.modalText, { color: theme.textColor }]}>{t('enter_quantity')}:</Text>
            <MyTextInput
              label1={t('quantity')}
              onChangeText={handleQuantityChange}
              value={quantityInput}
            />

            <View style={styles.modalButtonContainer}>
              <View>
                <MyButton visible={true} OnChangeButton={handleQuantityUpdate} text={t('update')} />
              </View>
              <View>
                <MyButton visible={true} OnChangeButton={handleCancel} text={t('cancel')} />
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
          <View style={[styles.modalContent, isLandscape ? styles.modalContentLandscape : styles.modalContentPortrait, { backgroundColor: theme.modalBackground }]}>
            <Text style={[styles.modalText, { color: theme.textColor }]}>{t('enter_bag_quantity')}:</Text>
            <MyTextInput
              label1={t('bag_quantity')}
              onChangeText={handleBagQuantityChange}
              value={bagQuantity}
            />

            <View style={styles.modalButtonContainer}>
              <View>
                <MyButton visible={true} OnChangeButton={handleBagQuantitySubmit} text={t('submit')} />
              </View>
              <View>
                <MyButton visible={true} OnChangeButton={() => setBagModalVisible(false)} text={t('cancel')} />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={barcodeModalVisible}
        animationType="slide"
        transparent={true}
      >
      
      </Modal>

      <View style={[styles.buttonContainer, { marginBottom: isLandscape ? 50 : 10 }]}>
        <Text style={[styles.totalText, { color: theme.textColor }]}>{t('total_cost')}: ${totalCost.toFixed(2)}</Text>
        <MyButton
          visible={!isItemListEmpty}
          OnChangeButton={handleRouteReceipt}
          text={t('go_receipt')}
        />
       
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
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
  totalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    width: '100%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    bottom: 20,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default Sales;
