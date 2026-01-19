import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCategories, deleteCategory } from '../services/category';
import { Category } from '../types';
import CategoryFormModal from '../components/CategoryFormModal';
import { Plus, Edit2, Trash2 } from 'lucide-react-native';

export default function CategoryScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setModalVisible(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setModalVisible(true);
  };

  const handleDelete = (category: Category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete ${category.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(category.id);
              loadCategories();
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Category }) => (
    <View 
      style={styles.card}
      testID={`categories-item-${item.id}`}
      accessible={true}
      accessibilityLabel={`Category: ${item.name}`}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <View style={styles.actions}>
          <TouchableOpacity 
            onPress={() => handleEdit(item)} 
            style={styles.actionButton}
            testID={`categories-button-edit-${item.id}`}
            accessibilityLabel={`Edit ${item.name}`}
            accessibilityRole="button"
            accessible={true}
          >
            <Edit2 size={20} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleDelete(item)} 
            style={styles.actionButton}
            testID={`categories-button-delete-${item.id}`}
            accessibilityLabel={`Delete ${item.name}`}
            accessibilityRole="button"
            accessible={true}
          >
            <Trash2 size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.toolbar}>
        <TouchableOpacity 
          onPress={handleAdd} 
          style={styles.addButton}
          testID="categories-button-add"
          accessibilityLabel="Add new category"
          accessibilityRole="button"
          accessible={true}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={categories}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      <CategoryFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={loadCategories}
        category={selectedCategory}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
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
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
});
