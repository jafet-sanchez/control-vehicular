import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { TabNavigator } from './App';


export default function App() {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}
