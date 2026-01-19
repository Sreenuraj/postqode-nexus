import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { LayoutDashboard, ShoppingBag, Users, Layers, LogOut, Box, Clock, ClipboardList } from 'lucide-react-native';

import LoginScreen from './src/screens/LoginScreen';
import ProductCatalogScreen from './src/screens/ProductCatalogScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import UsersScreen from './src/screens/UsersScreen';
import OrderManagementScreen from './src/screens/OrderManagementScreen';
import UserDashboardScreen from './src/screens/UserDashboardScreen';
import MyOrdersScreen from './src/screens/MyOrdersScreen';
import MyInventoryScreen from './src/screens/MyInventoryScreen';
import { useAuthStore } from './src/store/authStore';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AppNavigator() {
  const { user, logout } = useAuthStore();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#0f172a',
        tabBarInactiveTintColor: '#64748b',
        headerRight: () => (
          <TouchableOpacity 
            onPress={logout} 
            style={{ marginRight: 16 }}
            testID="navigation-button-logout"
            accessibilityLabel="Logout"
            accessibilityRole="button"
            accessible={true}
          >
            <LogOut size={20} color="#ef4444" />
          </TouchableOpacity>
        ),
      }}
    >
      {user?.role === 'ADMIN' ? (
        <>
          <Tab.Screen 
            name="Dashboard" 
            component={DashboardScreen} 
            options={{ 
              tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />
            }} 
          />
          <Tab.Screen 
            name="Catalog" 
            component={ProductCatalogScreen} 
            options={{ 
              tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />
            }} 
          />
          <Tab.Screen 
            name="Categories" 
            component={CategoryScreen} 
            options={{ 
              tabBarIcon: ({ color, size }) => <Layers size={size} color={color} />
            }} 
          />
          <Tab.Screen 
            name="Users" 
            component={UsersScreen} 
            options={{ 
              tabBarIcon: ({ color, size }) => <Users size={size} color={color} />
            }} 
          />
          <Tab.Screen 
            name="Orders" 
            component={OrderManagementScreen} 
            options={{ 
              tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />
            }} 
          />
        </>
      ) : (
        <>
          <Tab.Screen 
            name="Dashboard" 
            component={UserDashboardScreen} 
            options={{ 
              tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />
            }} 
          />
          <Tab.Screen 
            name="Catalog" 
            component={ProductCatalogScreen} 
            options={{ 
              tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />
            }} 
          />
          <Tab.Screen 
            name="My Orders" 
            component={MyOrdersScreen} 
            options={{ 
              tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />
            }} 
          />
          <Tab.Screen 
            name="Inventory" 
            component={MyInventoryScreen} 
            options={{ 
              tabBarIcon: ({ color, size }) => <Box size={size} color={color} />
            }} 
          />
        </>
      )}
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const { token, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {token ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
