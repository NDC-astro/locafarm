import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import AuthNavigator from './AuthNavigator';
import RenterNavigator from './RenterNavigator';
import OwnerNavigator from './OwnerNavigator';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  // Switch between renter and owner views based on user role
  return user?.role === 'owner' || user?.role === 'both' ? (
    <OwnerNavigator />
  ) : (
    <RenterNavigator />
  );
}
