import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/Screen/LoginScreen';
import MyTabs from './src/Component/createBattomTab';
import Product from './src/Screen/Product';
import Reports from './src/Screen/Reports';
import OtherOp from './src/Screen/OtherOp';
import Sales from './src/Screen/Sales';
import SeePrice from './src/Screen/SeePrice';
import Collections from './src/Screen/Collections';
import Deneme from './src/Screen/Deneme';
import Receipt from './src/Screen/Receipt';
import ReceiptPrint from './src/Screen/ReceiptPrint';
import { ButtonProvider } from './src/Context/ButtonContext';
import { AppProvider } from './src/Context/AppProvider';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="LoginScreen">
          <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MyTabs" component={MyTabs} />
          <Stack.Screen name="Product" component={Product} />
          <Stack.Screen name="Reports" component={Reports} />
          <Stack.Screen name="Other Operations" component={OtherOp} />
          <Stack.Screen name="Sales" component={Sales} />
          <Stack.Screen name="Receipt" component={Receipt} />
          <Stack.Screen name="ReceiptPrint" component={ReceiptPrint} />
          <Stack.Screen name="Price" component={SeePrice} />
          <Stack.Screen name="Collections" component={Collections} />
          <Stack.Screen name="Deneme" component={Deneme} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}

export default App;
