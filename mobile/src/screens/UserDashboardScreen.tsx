import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ShoppingCart, Clock, DollarSign, Box, LogOut } from 'lucide-react-native';
import { getMyOrders, Order } from '../services/order';
import { getMyInventory } from '../services/inventory';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';

interface UserStats {
  pendingOrders: number;
  totalOrders: number;
  totalSpend: number;
  inventoryItems: number;
  inventoryQuantity: number;
}

export default function UserDashboardScreen() {
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [myOrders, myInventory] = await Promise.all([
        getMyOrders(),
        getMyInventory(),
      ]);

      const pendingOrders = myOrders.filter((o: any) => o.status === 'PENDING').length;
      const totalSpend = myOrders.reduce((sum: number, o: any) => {
        return sum + (o.product?.price || 0) * o.quantity;
      }, 0);

      const inventoryQuantity = myInventory.reduce((sum: number, i: any) => sum + i.quantity, 0);

      setStats({
        pendingOrders,
        totalOrders: myOrders.length,
        totalSpend,
        inventoryItems: myInventory.length,
        inventoryQuantity,
      });

      // Sort by date desc
      const sortedOrders = myOrders.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentOrders(sortedOrders.slice(0, 5));
    } catch (error) {
      console.error('Error loading user dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return '#16a34a';
      case 'PENDING': return '#ca8a04';
      case 'REJECTED': return '#dc2626';
      case 'CANCELLED': return '#64748b';
      default: return '#0f172a';
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back,</Text>
          <Text style={styles.username}>{user?.username}!</Text>
          <Text style={styles.subtitle}>
            This is your personal dashboard. Here you can track your orders and manage your inventory.
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.iconContainer}>
              <ShoppingCart size={24} color="#64748b" />
            </View>
            <Text style={styles.statValue}>{stats?.totalOrders || 0}</Text>
            <Text style={styles.statLabel}>My Orders</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.iconContainer}>
              <Clock size={24} color="#ca8a04" />
            </View>
            <Text style={[styles.statValue, { color: '#ca8a04' }]}>{stats?.pendingOrders || 0}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.iconContainer}>
              <DollarSign size={24} color="#16a34a" />
            </View>
            <Text style={[styles.statValue, { color: '#16a34a' }]}>${stats?.totalSpend.toFixed(2) || '0.00'}</Text>
            <Text style={styles.statLabel}>Total Spend</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.iconContainer}>
              <Box size={24} color="#2563eb" />
            </View>
            <View style={styles.inventoryValue}>
              <Text style={[styles.statValue, { color: '#2563eb' }]}>{stats?.inventoryItems || 0}</Text>
              <Text style={styles.inventorySub}>({stats?.inventoryQuantity || 0} units)</Text>
            </View>
            <Text style={styles.statLabel}>Inventory Items</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('MyOrders')}
          >
            <Text style={styles.actionButtonText}>View My Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('MyInventory')}
          >
            <Text style={styles.secondaryButtonText}>Manage Inventory</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <View key={order.id} style={styles.orderItem}>
                <View style={styles.orderLeft}>
                  <Text style={styles.orderProduct}>{order.product?.name || 'Unknown Product'}</Text>
                  <Text style={styles.orderDate}>
                    {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                  </Text>
                </View>
                <View style={styles.orderRight}>
                  <Text style={[styles.orderStatus, { color: getStatusColor(order.status) }]}>
                    {order.status}
                  </Text>
                  <Text style={styles.orderPrice}>
                    ${((order.product?.price || 0) * order.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No orders yet</Text>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    color: '#0f172a',
  },
  username: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  inventoryValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  inventorySub: {
    fontSize: 12,
    color: '#64748b',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontWeight: '600',
    fontSize: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderLeft: {
    flex: 1,
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderProduct: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#64748b',
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 8,
    marginTop: 32,
    marginBottom: 32,
    gap: 8,
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 16,
  },
});
