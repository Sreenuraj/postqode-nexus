import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, ArrowUpDown, Plus, ShoppingCart, Edit, Trash2, X } from 'lucide-react-native';
import { getProducts, deleteProduct } from '../services/product';
import { Product } from '../types';
import { useAuthStore } from '../store/authStore';
import BuyModal from '../components/BuyModal';
import ProductFormModal from '../components/ProductFormModal';
import { useFocusEffect } from '@react-navigation/native';

export default function ProductCatalogScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  
  // UI States
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [buyModalVisible, setBuyModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  const loadProducts = async (reset = false) => {
    if (reset) {
      setLoading(true);
      setPage(0);
    }

    try {
      const currentPage = reset ? 0 : page;
      const response = await getProducts({
        page: currentPage,
        pageSize: 10,
        search,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        sortBy,
        sortOrder,
      });

      if (reset) {
        setProducts(response.content);
      } else {
        setProducts(prev => {
          const newProducts = response.content.filter(
            p => !prev.some(existing => existing.id === p.id)
          );
          return [...prev, ...newProducts];
        });
      }
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts(true);
    }, [statusFilter, sortBy, sortOrder])
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleLoadMore = () => {
    if (page < totalPages - 1 && !loading) {
      setPage(prev => prev + 1);
      loadProducts();
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProducts(true);
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete ${product.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(product.id);
              loadProducts(true);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.sku}>{item.sku}</Text>
        </View>
        <View style={[styles.badge, getStatusStyle(item.status)]}>
          <Text style={styles.badgeText}>{item.status.replace('_', ' ')}</Text>
        </View>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          <Text style={styles.quantity}>{item.quantity} in stock</Text>
        </View>
        
        <View style={styles.actions}>
          {isAdmin ? (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]}
                onPress={() => {
                  setEditingProduct(item);
                  setFormModalVisible(true);
                }}
              >
                <Edit size={16} color="#0f172a" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(item)}
              >
                <Trash2 size={16} color="#ef4444" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={[styles.buyButton, item.quantity === 0 && styles.disabledButton]}
              onPress={() => {
                setSelectedProduct(item);
                setBuyModalVisible(true);
              }}
              disabled={item.quantity === 0}
            >
              <ShoppingCart size={16} color="#fff" />
              <Text style={styles.buyButtonText}>Buy</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ACTIVE': return { backgroundColor: '#dcfce7' };
      case 'LOW_STOCK': return { backgroundColor: '#fef9c3' };
      case 'OUT_OF_STOCK': return { backgroundColor: '#fee2e2' };
      default: return { backgroundColor: '#f1f5f9' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={16} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.filterActions}>
          <TouchableOpacity 
            style={[styles.iconButton, statusFilter !== 'ALL' && styles.activeFilter]} 
            onPress={() => setShowFilters(true)}
          >
            <Filter size={20} color={statusFilter !== 'ALL' ? '#fff' : '#0f172a'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => setShowSort(true)}>
            <ArrowUpDown size={20} color="#0f172a" />
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity 
              style={[styles.iconButton, styles.addButton]} 
              onPress={() => {
                setEditingProduct(undefined);
                setFormModalVisible(true);
              }}
            >
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && products.length > 0 ? (
            <ActivityIndicator style={styles.footerLoader} />
          ) : null
        }
      />

      {/* Filter Modal */}
      <Modal visible={showFilters} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowFilters(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Status</Text>
            {['ALL', 'ACTIVE', 'LOW_STOCK', 'OUT_OF_STOCK'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.filterOption, statusFilter === status && styles.selectedOption]}
                onPress={() => {
                  setStatusFilter(status);
                  setShowFilters(false);
                }}
              >
                <Text style={[styles.filterText, statusFilter === status && styles.selectedText]}>
                  {status.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sort Modal */}
      <Modal visible={showSort} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowSort(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort by</Text>
            {[
              { label: 'Name (A-Z)', value: 'name', order: 'ASC' },
              { label: 'Name (Z-A)', value: 'name', order: 'DESC' },
              { label: 'Price (Low-High)', value: 'price', order: 'ASC' },
              { label: 'Price (High-Low)', value: 'price', order: 'DESC' },
              { label: 'Quantity (Low-High)', value: 'quantity', order: 'ASC' },
              { label: 'Quantity (High-Low)', value: 'quantity', order: 'DESC' },
            ].map((option) => (
              <TouchableOpacity
                key={`${option.value}-${option.order}`}
                style={[
                  styles.filterOption, 
                  sortBy === option.value && sortOrder === option.order && styles.selectedOption
                ]}
                onPress={() => {
                  setSortBy(option.value);
                  setSortOrder(option.order as 'ASC' | 'DESC');
                  setShowSort(false);
                }}
              >
                <Text style={[
                  styles.filterText, 
                  sortBy === option.value && sortOrder === option.order && styles.selectedText
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <BuyModal
        visible={buyModalVisible}
        onClose={() => setBuyModalVisible(false)}
        product={selectedProduct}
        onSuccess={() => loadProducts(true)}
      />

      {isAdmin && (
        <ProductFormModal
          visible={formModalVisible}
          onClose={() => setFormModalVisible(false)}
          onSave={() => loadProducts(true)}
          product={editingProduct}
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
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#0f172a',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#0f172a',
  },
  addButton: {
    backgroundColor: '#0f172a',
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
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  sku: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  quantity: {
    fontSize: 12,
    color: '#64748b',
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
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#e2e8f0',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16,
  },
  footerLoader: {
    paddingVertical: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  selectedOption: {
    backgroundColor: '#f8fafc',
  },
  filterText: {
    fontSize: 16,
    color: '#0f172a',
    textAlign: 'center',
  },
  selectedText: {
    fontWeight: '600',
    color: '#0f172a',
  },
});
