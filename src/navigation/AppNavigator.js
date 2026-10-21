/**
 * DineEase App Navigation
 * React Navigation 6 with Bottom Tabs and Native Stack
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen.js';
import SearchScreen from '../screens/SearchScreen.js';
import CartScreen from '../screens/CartScreen.js';
import BookingsScreen from '../screens/BookingsScreen.js';
import ProfileScreen from '../screens/ProfileScreen.js';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen.js';
import BookingModalScreen from '../screens/BookingModalScreen.js';
import CheckoutScreen from '../screens/CheckoutScreen.js';
import LoginScreen from '../screens/LoginScreen.js';
import RegisterScreen from '../screens/RegisterScreen.js';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen.js';

import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { COLORS, FONTS, RADIUS, SIZE, SPACE, TYPE } from '../theme/theme.js';

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
function MainTabs() {
  const { itemCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: SIZE.borderWidth,
          height: SIZE.tabBarHeight,
          paddingBottom: SPACE.xs,
          paddingTop: SPACE.xs,
        },
        tabBarLabelStyle: {
          fontFamily: FONTS.bodyMedium,
          fontSize: TYPE.navLabel,
        },
        tabBarIcon: ({ color }) => {
          let iconName = 'home';

          if (route.name === 'SearchTab') iconName = 'search';
          else if (route.name === 'CartTab') iconName = 'shopping-bag';
          else if (route.name === 'BookingsTab') iconName = 'calendar';
          else if (route.name === 'ProfileTab') iconName = 'user';

          return (
            <View style={styles.tabIconContainer}>
              <Feather name={iconName} size={SIZE.icon} color={color} />
              {route.name === 'CartTab' && itemCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{itemCount > 9 ? '9+' : itemCount}</Text>
                </View>
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="SearchTab" component={SearchScreen} options={{ tabBarLabel: 'Search' }} />
      <Tab.Screen name="CartTab" component={CartScreen} options={{ tabBarLabel: 'Cart' }} />
      <Tab.Screen name="BookingsTab" component={BookingsScreen} options={{ tabBarLabel: 'Bookings' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

// Root Stack Navigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerTintColor: COLORS.primary,
        headerStyle: { backgroundColor: COLORS.surface },
        headerTitleStyle: { fontFamily: FONTS.heading, fontSize: TYPE.subtitle },
        headerBackTitleVisible: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign In' }} />
      <AuthStack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Reset Password' }} />
    </AuthStack.Navigator>
  );
}

export function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: COLORS.primary,
          headerStyle: { backgroundColor: COLORS.surface },
          headerTitleStyle: { fontFamily: FONTS.heading, fontSize: TYPE.subtitle },
          headerBackTitleVisible: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="RestaurantDetail"
              component={RestaurantDetailScreen}
              options={{ title: 'Restaurant Details', headerShown: false }}
            />
            <Stack.Screen
              name="BookingModal"
              component={BookingModalScreen}
              options={{
                title: 'Table Reservation',
                presentation: 'modal',
                headerTintColor: COLORS.primary,
              }}
            />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout & Delivery' }} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    width: SIZE.tabIconBox,
    height: SIZE.tabIconBox,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: SIZE.tabBadgeOffset,
    top: SIZE.tabBadgeOffset,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.round,
    minWidth: SIZE.tabBadge,
    height: SIZE.tabBadge,
    paddingHorizontal: SPACE.xxs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.surface,
    fontFamily: FONTS.bodyBold,
    fontSize: TYPE.navLabel,
  },
});
