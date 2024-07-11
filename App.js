import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import LoginScreen from './src/Screen/LoginScreen';
import MyTabs from './src/Component/createBattomTab';
import Product from './src/Screen/Product';
import Reports from './src/Screen/Reports';
import OtherOp from './src/Screen/OtherOp';
import Sales from './src/Screen/Sales';
import Collections from './src/Screen/Collections';
import Deneme from './src/Screen/Deneme';
import Receipt from './src/Screen/Receipt';
import ReceiptPrint from './src/Screen/ReceiptPrint';
import { ButtonProvider } from './src/Context/ButtonContext';
import { AppProvider } from './src/Context/AppProvider';
import RegisterScreen from './src/Screen/RegisterScreen';
import SwipeScreen from './src/Screen/SwipeScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AllReports from './src/Screen/AllReports';
import SalesReport from './src/Screen/SalesReport';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n/i18n'; 

import 'intl';
import 'intl/locale-data/jsonp/en'; // İhtiyacınıza göre farklı dilleri de ekleyebilirsiniz
import 'intl-pluralrules';
import UserListScreen from './src/Screen/UserListScreen';
import { EducationProvider } from './src/Context/EducationContext';


const Stack = createStackNavigator();



function App() {
  return (
<I18nextProvider i18n={i18n}>
  <EducationProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="LoginScreen">
            <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SwipeScreen" component={SwipeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MyTabs" component={MyTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Product" component={Product} options={{ headerShown: false }} />
            <Stack.Screen name="Reports" component={Reports} options={{ headerShown: false }} />
            <Stack.Screen name="Other Operations" component={OtherOp} options={{ headerShown: false }} />
            <Stack.Screen name="Sales" component={Sales} options={{ headerShown: false }} />
            <Stack.Screen name="Receipt" component={Receipt} options={{ headerShown: false }} />
            <Stack.Screen name="ReceiptPrint" component={ReceiptPrint} options={{ headerShown: false }} />
            <Stack.Screen name="Collections" component={Collections} options={{ headerShown: false }} />
            <Stack.Screen name="Deneme" component={Deneme} options={{ headerShown: false }} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="AllReports" component={AllReports} options={{ headerShown: false }}/>
            <Stack.Screen name="SalesReport" component={SalesReport} options={{ headerShown: false }}/>
           <Stack.Screen name="UserListScreen" component={UserListScreen} options={{ headerShown: false }}/>
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>    
    </GestureHandlerRootView>
  </EducationProvider>
</I18nextProvider>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: '#ff6600',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default App;
