import React, { useState } from 'react';
import { View } from 'react-native';
import MyFlatlist from '../Component/MyFlatlist';
import MyDataTable from '../Component/MyDataTable';

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
const DATA2 = [
    {
      id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
      title: 'Second Item',
    },
    {
      id: '58694a0f-3da1-471f-bd96-145571e29d72',
      title: 'Third Item',
    },
  ];

export default function Sales() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [data1List, setData1List] = useState(DATA);
  const [data2List, setData2List] = useState(DATA2);
  
  const handleItemSelect = (item) => {
    setSelectedProduct(item);
    setData2List((prevData2List) => {
      const updatedData2List = [...prevData2List, item];
      return updatedData2List;
    });
  };
  
  
  return (
    <View style={{ flex: 1 }}>
      {/* MyDataTable component */}
      <MyDataTable />
      {/* MyFlatlist component */}
      <MyFlatlist
        data={data1List}
        showSearchInput={true}
        onItemSelect={handleItemSelect}
      />
      {/* MyFlatlist component with updated data */}
      <MyFlatlist
        data={data2List}
        showSearchInput={false}
        onItemSelect={() => {}} // No need to pass any function here
      />
    </View>
  );
}
