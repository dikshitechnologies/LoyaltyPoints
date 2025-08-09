import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import PartyCreation from './PartyCreation';
import PointsScreen from './PointsScreen';
import ReportScreen from './ReportScreen';

// You can replace this with icons later
const TabIcon = ({ focused, color, title }) => (
  <View style={styles.iconContainer}>
    <View style={[styles.icon, { backgroundColor: focused ? '#1E88E5' : '#DDDDDD' }]} />
    <Text style={[styles.iconText, { color: focused ? '#1E88E5' : '#999' }]}>{title}</Text>
  </View>
);

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
        },
      }}
    >
      <Tab.Screen 
        name="PartyCreation" 
        component={PartyCreation} 
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} title="Parties" />
          ),
        }}
      />
      <Tab.Screen 
        name="PointsScreen" 
        component={PointsScreen} 
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} title="Points" />
          ),
        }}
      />
      <Tab.Screen 
        name="ReportScreen" 
        component={ReportScreen} 
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} title="Reports" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 3,
  },
  iconText: {
    fontSize: 12,
  },
});

export default TabNavigator;
