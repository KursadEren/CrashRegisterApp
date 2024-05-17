import * as React from 'react';
import { Text, View } from 'react-native';
import { DataTable } from 'react-native-paper';

const MyDataTable = () => (
      <DataTable    style={{justifyContent:"space-around"}}>
        <DataTable.Header  >
          <DataTable.Title
          >
            Product name
          </DataTable.Title>
           
          <DataTable.Title numeric>Price</DataTable.Title>
          <DataTable.Title numeric>Count</DataTable.Title>
          
        </DataTable.Header>
      </DataTable>
);

export default MyDataTable;