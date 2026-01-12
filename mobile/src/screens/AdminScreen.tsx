import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Package, Users, Layers, LogOut } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';

export default function AdminScreen() {
  const navigation = useNavigation<any>();
  const logout = useAuthStore((state) => state.logout);

  const menuItems = [
    {
      title: 'Inventory Management',
      description: 'Manage products, stock, and prices',
      icon: <Package size={24} color="#0f172a" />,
      screen: 'Inventory',
    },
    {
      title: 'Category Management',
      description: 'Organize products into categories',
      icon: <Layers size={24} color="#0f172a" />,
      screen: 'Categories',
    },
    {
      title: 'User Management',
      description: 'Manage users and roles',
      icon: <Users size={24} color="#0f172a" />,
      screen: 'Users',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
      </View>

      <ScrollView style={styles.content}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.iconContainer}>
              {item.icon}
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[styles.card, styles.logoutCard]} onPress={logout}>
          <View style={[styles.iconContainer, styles.logoutIconContainer]}>
            <LogOut size={24} color="#ef4444" />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.cardTitle, styles.logoutText]}>Logout</Text>
            <Text style={styles.cardDescription}>Sign out of your account</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  content: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  logoutCard: {
    marginTop: 20,
  },
  logoutIconContainer: {
    backgroundColor: '#fee2e2',
  },
  logoutText: {
    color: '#ef4444',
  },
});
