import React, { useState, useEffect } from 'react';
import { View, Modal, TextInput, StyleSheet, Text, ScrollView } from 'react-native';
import MyFlatlist from '../Component/MyFlatlist';
import axios from "axios";
import MyButton from '../Component/MyButton';

const DATA2 = [];

const Sales = ({ navigation }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [data1List, setData1List] = useState([]);
  const [data2List, setData2List] = useState(DATA2);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [quantityInput, setQuantityInput] = useState('');
  const [isItemListEmpty, setIsItemListEmpty] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setIsItemListEmpty(data2List.length === 0);
  }, [data2List]);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/product");
      setData1List(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleItemSelect = (item) => {
    setSelectedProduct({ ...item, quantityInput: quantityInput });
    setQuantityModalVisible(true);
  };

  const handleItemRemove = (item) => {
    const updatedData2List = data2List.filter((product) => product.id !== item.id);
    setData2List(updatedData2List);
    if (selectedProduct && selectedProduct.id === item.id) {
      setSelectedProduct(null);
    }
  };
  
  const handleQuantityUpdate = () => {
    if (selectedProduct) {
      const updatedData2List = [...data2List];
      const selectedItemIndex = updatedData2List.findIndex((item) => item.id === selectedProduct.id);
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
  
  const HandleRouteReceipt = () =>{
    navigation.navigate("Receipt", { data2List: data2List });
  }
  const handleQuantityChange = (text) => {
    setQuantityInput(text);
  };

  return (
    <ScrollView style={{ flex: 1 }}>
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
          <View style={styles.modalContent}>
            <Text>Enter Quantity:</Text>
            <TextInput
              style={styles.input}
              keyboardType={'number-pad'}
              onChangeText={handleQuantityChange}
              value={quantityInput}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <MyButton visible={true} OnChangeButton={handleQuantityUpdate} text="Update" />
              <MyButton visible={true} OnChangeButton={handleCancel} text="Cancel" />
            </View>
          </View>
        </View>
      </Modal>

     
        <View style={{ marginTop: 20 }}>
          <MyButton
          visible={!isItemListEmpty}
            OnChangeButton={HandleRouteReceipt}
            text="Go Receipt"
          />
        </View>
    
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});

export default Sales;
