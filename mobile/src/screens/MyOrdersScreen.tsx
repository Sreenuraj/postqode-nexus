import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMyOrders, cancelOrder, Order } from '../services/order';
import { format } from 'date-fns';
import { XCircle } from 'lucide-react-native';

export default function MyOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (order: Order) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelOrder(order.id);
              loadOrders();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to cancel order');
            }
          },
        },
      ]
    );
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'APPROVED': return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'PENDING': return { backgroundColor: '#fef9c3', color: '#854d0e' };
      case 'REJECTED': return { backgroundColor: '#fee2e2', color: '#991b1b' };
      case 'CANCELLED': return { backgroundColor: '#f1f5f9', color: '#475569' };
      default: return { backgroundColor: '#f1f5f9', color: '#475569' };
    }
  };

  const renderItem = ({ item }: { item: Order }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.productName}>{item.product?.name || 'Unknown Product'}</Text>
          <View style={[styles.badge, { backgroundColor: statusStyle.backgroundColor }]}>
            <Text style={[styles.badgeText, { color: statusStyle.color }]}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.date}>{format(new Date(item.createdAt), 'MMM d, yyyy h:mm a')}</Text>
        <View style={styles.details}>
          <Text style={styles.detailText}>Qty: {item.quantity}</Text>
          <Text style={styles.detailText}>Total: ${(item.product?.price * item.quantity).toFixed(2)}</Text>
        </View>
        {item.status === 'PENDING' && (
          <TouchableOpacity onPress={() => handleCancel(item)} style={styles.cancelButton}>
            <XCircle size={16} color="#64748b" />
            <Text style={styles.cancelText}>Cancel Order</Text>
          </TouchableOpacity>
        )}
      </View>
    );
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
            <View style={styles.emptyContainer}>
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
    borderRadius: 8,
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
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  date: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 6,
  },
  cancelText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
});
