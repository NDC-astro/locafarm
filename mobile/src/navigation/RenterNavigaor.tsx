import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import SearchScreen from '../screens/renter/SearchScreen';
import MapViewScreen from '../screens/renter/MapViewScreen';
import EquipmentDetailScreen from '../screens/renter/EquipmentDetailScreen';
import BookingScreen from '../screens/renter/BookingScreen';
import MyBookingsScreen from '../screens/renter/MyBookingsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import ChatScreen from '../screens/shared/ChatScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function SearchStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SearchList" component={SearchScreen} options={{ title: 'Find Equipment' }} />
      <Stack.Screen name="EquipmentDetail" component={EquipmentDetailScreen} options={{ title: 'Details' }} />
      <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Book Equipment' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
    </Stack.Navigator>
  );
}

export default function RenterNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = 'search';
          if (route.name === 'Search') iconName = 'search';
          else if (route.name === 'Map') iconName = 'map';
          else if (route.name === 'Bookings') iconName = 'calendar';
          else if (route.name === 'Profile') iconName = 'person';
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Search" component={SearchStack} options={{ headerShown: false }} />
      <Tab.Screen name="Map" component={MapViewScreen} />
      <Tab.Screen name="Bookings" component={MyBookingsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
