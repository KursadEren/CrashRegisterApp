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
import SeePrice from './src/Screen/SeePrice';
import Collections from './src/Screen/Collections';
import Deneme from './src/Screen/Deneme';
import Receipt from './src/Screen/Receipt';
import ReceiptPrint from './src/Screen/ReceiptPrint';
import { ButtonProvider } from './src/Context/ButtonContext';
import { AppProvider } from './src/Context/AppProvider';
import RegisterScreen from './src/Screen/RegisterScreen';
import SwipeScreen from './src/Screen/SwipeScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Stack = createStackNavigator();

function CustomHeader({ title }) {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>{title}</Text>
    </View>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="LoginScreen">
            
          
            <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SwipeScreen" component={SwipeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MyTabs" component={MyTabs} options={{ header: () => <CustomHeader title="MyTabs" /> }} />
            <Stack.Screen name="Product" component={Product} options={{ header: () => <CustomHeader title="Product" /> }} />
            <Stack.Screen name="Reports" component={Reports} options={{ header: () => <CustomHeader title="Reports" /> }} />
            <Stack.Screen name="Other Operations" component={OtherOp} options={{ header: () => <CustomHeader title="Other Operations" /> }} />
            <Stack.Screen name="Sales" component={Sales} options={{ header: () => <CustomHeader title="Sales" /> }} />
            <Stack.Screen name="Receipt" component={Receipt} options={{ header: () => <CustomHeader title="Receipt" /> }} />
            <Stack.Screen name="ReceiptPrint" component={ReceiptPrint} options={{ header: () => <CustomHeader title="ReceiptPrint" /> }} />
            <Stack.Screen name="Price" component={SeePrice} options={{ header: () => <CustomHeader title="Price" /> }} />
            <Stack.Screen name="Collections" component={Collections} options={{ header: () => <CustomHeader title="Collections" /> }} />
            <Stack.Screen name="Deneme" component={Deneme} options={{ header: () => <CustomHeader title="Deneme" /> }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ header: () => <CustomHeader title="Register" /> }} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </GestureHandlerRootView>
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
