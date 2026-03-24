import 'react-native-gesture-handler';
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform, StyleSheet } from 'react-native';


import IndexScreen from './index';
import LoginScreen from '../(auth)/login';

// For weather and login tabs at the top
const Tab = createMaterialTopTabNavigator();

export default function TabLayout() {
  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']} // ensures padding on top for notches
    >
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#003da5',
          tabBarInactiveTintColor: '#fff',
          tabBarStyle: { backgroundColor: '#25292e' },
          tabBarIndicatorStyle: { backgroundColor: '#003da5' },
          tabBarLabelStyle: { fontSize: 16, fontWeight: 'bold' },
          swipeEnabled: false, // added so that users can scroll through weather without swiping to login screen
        }}
      >
        <Tab.Screen
          name="index" // kept as index because its the main screen
          component={IndexScreen}
          options={{
            title: 'WEATHER',
          }}
        />

        <Tab.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: 'LOG IN',
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#25292e',
    // Add tiny extra top padding for older devices
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
});
