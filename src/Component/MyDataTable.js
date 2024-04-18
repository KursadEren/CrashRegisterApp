import * as React from 'react';
import { DataTable } from 'react-native-paper';

const MyDataTable = () => (
      <DataTable    style={{borderTopWidth:1,borderBottomWidth:1,justifyContent:"space-around"}}>
        <DataTable.Header  >
          <DataTable.Title
          >
            Product name
          </DataTable.Title>
          <DataTable.Title numeric>Price</DataTable.Title>
          
        </DataTable.Header>
      </DataTable>
);

export default MyDataTable;