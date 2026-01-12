import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import ProductCatalogScreen from './src/screens/ProductCatalogScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import UsersScreen from './src/screens/UsersScreen';
import AdminScreen from './src/screens/AdminScreen';
import OrderManagementScreen from './src/screens/OrderManagementScreen';
import UserDashboardScreen from './src/screens/UserDashboardScreen';
import MyOrdersScreen from './src/screens/MyOrdersScreen';
import MyInventoryScreen from './src/screens/MyInventoryScreen';
import { useAuthStore } from './src/store/authStore';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const AdminStack = createNativeStackNavigator();
const UserStack = createNativeStackNavigator();

function AdminNavigator() {
  return (
    <AdminStack.Navigator>
      <AdminStack.Screen name="AdminDashboard" component={AdminScreen} options={{ headerShown: false }} />
      <AdminStack.Screen name="Inventory" component={InventoryScreen} options={{ headerShown: false }} />
      <AdminStack.Screen name="Categories" component={CategoryScreen} options={{ headerShown: false }} />
      <AdminStack.Screen name="Users" component={UsersScreen} options={{ headerShown: false }} />
      <AdminStack.Screen name="Orders" component={OrderManagementScreen} options={{ headerShown: false }} />
    </AdminStack.Navigator>
  );
}

function UserNavigator() {
  return (
    <UserStack.Navigator>
      <UserStack.Screen name="UserDashboard" component={UserDashboardScreen} options={{ headerShown: false }} />
      <UserStack.Screen name="MyOrders" component={MyOrdersScreen} options={{ headerShown: false }} />
      <UserStack.Screen name="MyInventory" component={MyInventoryScreen} options={{ headerShown: false }} />
    </UserStack.Navigator>
  );
}

function AppNavigator() {
  const user = useAuthStore((state) => state.user);
  
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Catalog" component={ProductCatalogScreen} options={{ headerShown: false }} />
      {user?.role === 'ADMIN' ? (
        <Tab.Screen name="Admin" component={AdminNavigator} options={{ headerShown: false }} />
      ) : (
        <Tab.Screen name="Profile" component={UserNavigator} options={{ headerShown: false }} />
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
