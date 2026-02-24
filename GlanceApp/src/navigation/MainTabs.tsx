import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import DigestScreen from '../screens/DigestScreen';
import PortfolioScreen from '../screens/PortfolioScreen';
import YouScreen from '../screens/YouScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1C1C1E',
          borderTopWidth: 1,
          borderTopColor: '#2C2C2E',
          paddingBottom: 20,
          paddingTop: 12,
          height: 80,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tab.Screen 
        name="Today" 
        component={HomeScreen}
        options={({ route }) => ({
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>📅</Text>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{ fontSize: 11, fontWeight: focused ? '600' : '500', color: focused ? '#FFFFFF' : '#9CA3AF' }}>
              Today
            </Text>
          ),
        })}
      />
      <Tab.Screen 
        name="Digest" 
        component={DigestScreen}
        options={({ route }) => ({
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>📊</Text>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{ fontSize: 11, fontWeight: focused ? '600' : '500', color: focused ? '#FFFFFF' : '#9CA3AF' }}>
              Digest
            </Text>
          ),
        })}
      />
      <Tab.Screen 
        name="Portfolio" 
        component={PortfolioScreen}
        options={({ route }) => ({
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>💼</Text>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{ fontSize: 11, fontWeight: focused ? '600' : '500', color: focused ? '#FFFFFF' : '#9CA3AF' }}>
              Portfolio
            </Text>
          ),
        })}
      />
      <Tab.Screen 
        name="You" 
        component={YouScreen}
        options={({ route }) => ({
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>👤</Text>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{ fontSize: 11, fontWeight: focused ? '600' : '500', color: focused ? '#FFFFFF' : '#9CA3AF' }}>
              You
            </Text>
          ),
        })}
      />
    </Tab.Navigator>
  );
}
