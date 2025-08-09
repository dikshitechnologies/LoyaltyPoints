import React, { useRef, useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, Animated, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import PartyCreation from './PartyCreation';
import PointsScreen from './PointsScreen';
import ReportScreen from './ReportScreen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Custom Tab Icon component with MaterialIcons and animation
const TabIcon = ({ focused, iconName }) => {
  const activeColor = '#FFFFFF'; // White for icon when active
  const inactiveColor = '#65979Cff'; // Lighter teal for icon when inactive
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  
  // Animation effect when icon is focused (clicked)
  useEffect(() => {
    if (focused) {
      // Create a pop and elevation animation
      Animated.parallel([
        // Scale animation
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.3,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        // Move up animation for floating effect with curve underneath
        Animated.timing(translateYAnim, {
          toValue: -20,  // Float above the tab bar
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset position when not focused
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [focused, scaleAnim, translateYAnim]);

  return (
    <View style={styles.iconContainer}>
      <Animated.View 
        style={[
          styles.iconWrapper,
          { transform: [{ translateY: translateYAnim }] }
        ]}
      >
        <Animated.View 
          style={[
            styles.iconCircle,
            { 
              backgroundColor: focused ? '#006A72ff' : 'white',
              transform: [{ scale: scaleAnim }],
              elevation: focused ? 15 : 0,
              shadowOpacity: focused ? 0.6 : 0,
              shadowRadius: focused ? 10 : 0,
              borderWidth: 0,
              width: focused ? 60 : 50,  // Larger size when active
              height: focused ? 60 : 50, // Larger size when active
              borderRadius: focused ? 30 : 25, // Half of width/height for perfect circle
            }
          ]}
        >
          <MaterialIcons name={iconName} size={focused ? 26 : 22} color={focused ? activeColor : inactiveColor} />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const Tab = createBottomTabNavigator();

// Custom tab bar component with curve
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const focusedOptions = descriptors[state.routes[state.index].key].options;
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  
  // Listen to keyboard events to hide tab bar when keyboard is shown
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);
  
  if (focusedOptions.tabBarVisible === false || isKeyboardVisible) {
    return null;
  }

  return (
    <View style={[
      styles.customTabBarContainer, 
      { paddingBottom: insets.bottom }
    ]}>
      {/* Main tab bar */}
      <View style={styles.tabBarMain}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          
          const onPress = () => {
            // Dismiss keyboard if it's visible
            Keyboard.dismiss();
            
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
          
          return (
            <TouchableWithoutFeedback
              key={route.key}
              onPress={onPress}
              style={styles.tabButton}
            >
              <View style={styles.tabItem}>
                {options.tabBarIcon({ focused: isFocused })}
                {isFocused && (
                  <View style={styles.curveHighlight} />
                )}
              </View>
            </TouchableWithoutFeedback>
          );
        })}
      </View>
    </View>
  );
};

const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
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
              iconName="person-add"
            />
          ),
          tabBarActiveTintColor: '#006A72ff',
          tabBarInactiveTintColor: 'white',
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
              iconName="card-giftcard"
            />
          ),
          tabBarActiveTintColor: '#006A72ff',
          tabBarInactiveTintColor: 'white',
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
              iconName="insert-chart"
            />
          ),
          tabBarActiveTintColor: '#006A72ff',
          tabBarInactiveTintColor: 'white',
        }}
      />
      
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  // Icon styles
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    position: 'relative',
    paddingTop: 5,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    position: 'relative',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#006A72ff',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  
  // Custom tab bar styles
  customTabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  tabBarMain: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
    shadowColor: '#006A72ff',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    overflow: 'visible',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  curveHighlight: {
    position: 'absolute',
    top: -5,
    width: 70,
    height: 30,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    backgroundColor: 'white',
    transform: [{ scaleX: 1.5 }],
    zIndex: -1,
  },
});

export default TabNavigator;
