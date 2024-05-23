import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-paper';
import Home from '../Screen/Home';
import BasketScreen from '../Screen/BasketScreen';

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Basket') {
            iconName = focused ? 'shopping-basket' : 'shopping-basket-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ff6600',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopWidth: 0,
        },
        headerStyle: {
          backgroundColor: '#1a1a1a',
        },
        headerTintColor: '#ff6600',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Basket"
        component={BasketScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

export default MyTabs;
