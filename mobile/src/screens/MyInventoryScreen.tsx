import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMyInventory, deleteInventoryItem, InventoryItem } from '../services/inventory';
import InventoryItemFormModal from '../components/InventoryItemFormModal';
import ConsumeModal from '../components/ConsumeModal';
import { Plus, Edit2, Trash2, MinusCircle } from 'lucide-react-native';

export default function MyInventoryScreen() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formModalVisible, setFormModalVisible] = useState(false);
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

  const handleAdd = () => {
    setSelectedItem(null);
    setFormModalVisible(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormModalVisible(true);
  };

  const handleConsume = (item: InventoryItem) => {
    setSelectedItem(item);
    setConsumeModalVisible(true);
  };

  const handleDelete = (item: InventoryItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete ${item.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteInventoryItem(item.id);
              loadInventory();
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: InventoryItem }) => (
    <View style={styles.card}>
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
          <TouchableOpacity onPress={() => handleConsume(item)} style={styles.actionButton}>
            <MinusCircle size={20} color="#f59e0b" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
            <Edit2 size={20} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionButton}>
            <Trash2 size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.quantity}>Quantity: {item.quantity}</Text>
      {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Inventory</Text>
        <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
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

      <InventoryItemFormModal
        visible={formModalVisible}
        onClose={() => setFormModalVisible(false)}
        onSave={loadInventory}
        item={selectedItem}
      />

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  addButton: {
    backgroundColor: '#0f172a',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
