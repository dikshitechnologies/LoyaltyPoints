import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import PartyCreation from './PartyCreation';
import PointsScreen from './PointsScreen';
import ReportScreen from './ReportScreen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Custom Tab Icon component with MaterialIcons
const TabIcon = ({ focused, title, iconName }) => {
  const activeColor = '#1E88E5';
  const inactiveColor = '#999';
  const currentColor = focused ? activeColor : inactiveColor;

  return (
    <View style={styles.iconContainer}>
      <MaterialIcons name={iconName} size={24} color={currentColor} />
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
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused}
              title="Party"
              iconName="person-add"
            />
          ),
        }}
      />
      <Tab.Screen
        name="PointsScreen"
        component={PointsScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused}
              title="Points"
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
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused}
              title="Reports"
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
