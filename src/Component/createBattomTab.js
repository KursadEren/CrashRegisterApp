import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../Screen/Home';
import BasketScreen from '../Screen/BasketScreen';
import { Icon } from 'react-native-paper';
import { IconAdornment } from 'react-native-paper/lib/typescript/components/TextInput/Adornment/TextInputIcon';

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator  >
      <Tab.Screen 
      options={{headerShown:false}}
      name="Home" 
      component={Home}
     
/>
      <Tab.Screen 
      name="Basket" 
      component={BasketScreen}
      options={{headerShown : false}}
      />
    </Tab.Navigator>
  );
}
export default MyTabs;