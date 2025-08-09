import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import PartyCreation from './PartyCreation';
import PointsScreen from './PointsScreen';
import ReportScreen from './ReportScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// Custom Tab Icon component with actual icons
const TabIcon = ({ focused, color, title, iconType, iconName }) => {
  const activeColor = '#1E88E5';
  const inactiveColor = '#999';
  const currentColor = focused ? activeColor : inactiveColor;
  
  return (
    <View style={styles.iconContainer}>
      {iconType === 'Ionicons' && (
        <Ionicons name={iconName} size={24} color={currentColor} />
      )}
      {iconType === 'MaterialCommunityIcons' && (
        <MaterialCommunityIcons name={iconName} size={24} color={currentColor} />
      )}
      {iconType === 'MaterialIcons' && (
        <MaterialIcons name={iconName} size={24} color={currentColor} />
      )}
      <Text style={[styles.iconText, { color: currentColor }]}>{title}</Text>
    </View>
  );
};

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
            <TabIcon 
              focused={focused} 
              color={color} 
              title="User Creation" 
              iconType="Ionicons" 
              iconName="person-add-outline"
            />
          ),
        }}
      />
      <Tab.Screen 
        name="PointsScreen" 
        component={PointsScreen} 
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon 
              focused={focused} 
              color={color} 
              title="Points" 
              iconType="MaterialCommunityIcons" 
              iconName="card-giftcard"
            />
          ),
        }}
      />
      <Tab.Screen 
        name="ReportScreen" 
        component={ReportScreen} 
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon 
              focused={focused} 
              color={color} 
              title="Reports" 
              iconType="MaterialIcons" 
              iconName="insert-chart"
            />
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
  iconText: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default TabNavigator;
