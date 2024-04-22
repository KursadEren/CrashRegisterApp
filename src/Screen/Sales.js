import React, { useState } from 'react';
import { View } from 'react-native';
import MyFlatlist from '../Component/MyFlatlist';
import MyDataTable from '../Component/MyDataTable';
import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DATA = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'First Item',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Second Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Third Item',
  },
];

const DATA2 = [];

export default function Sales() {
  const [data1List, setData1List] = useState(DATA);
  const [data2List, setData2List] = useState(DATA2);
  
  const handleItemSelect = (item) => {
    setData2List(prevData2List => [...prevData2List, item]);
  };

  
  const handleItemRemove = (itemToRemove) => {
    setData2List(prevData2List => {
      const updatedData2List = [...prevData2List];
      const index = updatedData2List.findIndex(item => item.id === itemToRemove.id);
      if (index !== -1) {
        const updatedItem = { ...updatedData2List[index] };
        updatedItem.count--; // Öğenin adedini azalt
        if (updatedItem.count === 0) {
          updatedData2List.splice(index, 1); // Eğer adet sıfır olduysa öğeyi listeden tamamen kaldır
        } else {
          updatedData2List[index] = updatedItem;
        }
      }
      return updatedData2List;
    });
  };
  
  const defineAdminUser = async () => {
    try {
      const adminUser = {
        username: 'Kürşad',
        password: '123456',
        role: 'admin'
      };
  
      await AsyncStorage.setItem('adminUser', JSON.stringify(adminUser));
  
      console.log('Admin kullanıcı başarıyla tanımlandı!');
    } catch (error) {
      console.error('Admin kullanıcı tanımlama hatası:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MyDataTable />
      <MyFlatlist
        data={data1List}
        showSearchInput={true}
        onItemSelect={handleItemSelect}
      />
      <MyFlatlist
        data={data2List}
        showSearchInput={false}
        onItemRemove={handleItemRemove} // handleItemRemove işlevini MyFlatlist bileşenine iletiyoruz
        isBasket={true}
      />
      <Button onPress={defineAdminUser}/>
    </View>
  );
}
