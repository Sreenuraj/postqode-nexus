import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllOrders, approveOrder, rejectOrder, Order } from '../services/order';
import { Check, X } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

export default function OrderManagementScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (order: Order) => {
    try {
      await approveOrder(order.id);
      Alert.alert('Success', 'Order approved');
      loadOrders();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to approve order');
    }
  };

  const handleReject = async (order: Order) => {
    try {
      await rejectOrder(order.id);
      Alert.alert('Success', 'Order rejected');
      loadOrders();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to reject order');
    }
  };

  const renderItem = ({ item }: { item: Order }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.productName}>{item.product?.name || 'Unknown Product'}</Text>
        <View style={[styles.badge, getStatusStyle(item.status)]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.details}>
        <Text style={styles.detailText}>Quantity: {item.quantity}</Text>
        <Text style={styles.detailText}>
          Total: ${(item.quantity * (item.product?.price || 0)).toFixed(2)}
        </Text>
        <Text style={styles.date}>
          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
        </Text>
      </View>

      {item.status === 'PENDING' && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]} 
            onPress={() => handleReject(item)}
          >
            <X size={16} color="#dc2626" />
            <Text style={[styles.actionText, { color: '#dc2626' }]}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.approveButton]} 
            onPress={() => handleApprove(item)}
          >
            <Check size={16} color="#16a34a" />
            <Text style={[styles.actionText, { color: '#16a34a' }]}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'APPROVED': return { backgroundColor: '#dcfce7' };
      case 'PENDING': return { backgroundColor: '#fef9c3' };
      case 'REJECTED': return { backgroundColor: '#fee2e2' };
      default: return { backgroundColor: '#f1f5f9' };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0f172a',
  },
  details: {
    gap: 4,
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    color: '#334155',
  },
  date: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
  },
  approveButton: {
    borderColor: '#dcfce7',
    backgroundColor: '#f0fdf4',
  },
  rejectButton: {
    borderColor: '#fee2e2',
    backgroundColor: '#fef2f2',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16,
  },
});
