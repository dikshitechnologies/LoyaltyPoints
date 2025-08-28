/**
 * Loyalty Points App
 * 
 * @format
 */

import React from 'react';
import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


// Import screens
import SplashScreen from './src/components/SplashScreen';
import LoginScreen from './src/components/LoginScreen';
import HomeScreen from './src/components/HomeScreen';
import CompanyCreationScreen from './src/CompanyCreation';
import TabNavigator from './src/components/TabNavigator';
import PointsScreen from './src/components/PointsScreen'; 
import RateFixingScreen from './src/RateFixingScreen';
import ReportScreen from './src/components/ReportScreen';
import TotalCustomers from './src/components/TotalCustomers';
import IndividualCustomer from './src/components/IndividualCustomer';
import BirthdayReport from './src/components/BirthdayReport';
import AnniversaryReport from './src/components/AnniversaryReport';
import userAuth from './src/userAuth';
import LoyaltyReportScreen from './src/UserReport';
import OverallReport from './src/components/OverallReport';

const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <NavigationContainer>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={TabNavigator} />
        <Stack.Screen name="Points" component={PointsScreen} />
        <Stack.Screen name="UserAuth" component={userAuth} />
        <Stack.Screen name="LoyaltyReport" component={LoyaltyReportScreen} />

         <Stack.Screen name="Company" component={CompanyCreationScreen} />
           <Stack.Screen name="RateFixing" component={RateFixingScreen} />
           <Stack.Screen name="ReportDashboard" component={ReportScreen} />
           <Stack.Screen name="TotalCustomers" component={TotalCustomers} />
           <Stack.Screen name="IndividualCustomer" component={IndividualCustomer} />
           <Stack.Screen name="BirthdayReport" component={BirthdayReport} />
           <Stack.Screen name="AnniversaryReport" component={AnniversaryReport} />
           <Stack.Screen name="OverallReport" component={OverallReport} />
         </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
