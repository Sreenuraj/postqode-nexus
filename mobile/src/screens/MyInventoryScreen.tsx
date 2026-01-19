import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMyInventory, InventoryItem } from '../services/inventory';
import ConsumeModal from '../components/ConsumeModal';
import { MinusCircle } from 'lucide-react-native';

export default function MyInventoryScreen() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [consumeModalVisible, setConsumeModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const data = await getMyInventory();
      setItems(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleConsume = (item: InventoryItem) => {
    setSelectedItem(item);
    setConsumeModalVisible(true);
  };

  const renderItem = ({ item }: { item: InventoryItem }) => (
    <View 
      style={styles.card}
      testID={`my-inventory-item-${item.id}`}
      accessible={true}
      accessibilityLabel={`Inventory item: ${item.name}, Quantity: ${item.quantity}, Source: ${item.source}`}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={[styles.badge, item.source === 'PURCHASED' ? styles.purchasedBadge : styles.manualBadge]}>
            <Text style={[styles.badgeText, item.source === 'PURCHASED' ? styles.purchasedBadgeText : styles.manualBadgeText]}>
              {item.source}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity 
            onPress={() => handleConsume(item)} 
            style={styles.actionButton}
            testID={`my-inventory-button-consume-${item.id}`}
            accessibilityLabel={`Consume ${item.name}`}
            accessibilityRole="button"
            accessible={true}
          >
            <MinusCircle size={20} color="#f59e0b" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.quantity}>Quantity: {item.quantity}</Text>
      {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No items in inventory</Text>
            </View>
          }
        />
      )}

      <ConsumeModal
        visible={consumeModalVisible}
        onClose={() => setConsumeModalVisible(false)}
        onSave={loadInventory}
        item={selectedItem}
      />
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
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  quantity: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 4,
  },
  notes: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  purchasedBadge: {
    backgroundColor: '#dbeafe',
  },
  manualBadge: {
    backgroundColor: '#f1f5f9',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  purchasedBadgeText: {
    color: '#1e40af',
  },
  manualBadgeText: {
    color: '#64748b',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16,
  },
});
