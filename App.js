/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React,{ReactDOM} from 'react';

import {
  
  StyleSheet,
  
  useColorScheme,
 
} from 'react-native';

import {
  Colors,
  
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import LoginScreen from './src/Screen/LoginScreen';
import { NavigationContainer } from '@react-navigation/native';
import MyTabs from './src/Component/createBattomTab';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { makeServer } from './src/MockAPI/Server'; // Mirage sunucusunu içe aktarıyoruz




 const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
 


  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  
 

  return (
       <NavigationContainer>
        <Stack.Navigator>
         <Stack.Screen name="LoginScreen" component={LoginScreen} options={{headerShown:false}} />
         <Stack.Screen name="MyTabs" component={MyTabs} />
        </Stack.Navigator>
       </NavigationContainer>
   
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#eaeaea',
  },
 
});
export default App;
