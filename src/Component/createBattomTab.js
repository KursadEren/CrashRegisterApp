import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../Screen/Home';
const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen 
      name="Home" 
      component={Home}
      options={{headerShown : false}}
      />
    </Tab.Navigator>
  );
}
export default MyTabs;