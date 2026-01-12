import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUsers, toggleUserStatus } from '../services/user';
import { User } from '../types';
import UserFormModal from '../components/UserFormModal';
import { Plus, Edit2 } from 'lucide-react-native';

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleToggleStatus = async (user: User, value: boolean) => {
    try {
      // Optimistic update
      setUsers(users.map(u => u.id === user.id ? { ...u, enabled: value } : u));
      await toggleUserStatus(user.id, value);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update user status');
      loadUsers(); // Revert on error
    }
  };

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.username}>{item.username}</Text>
          <View style={[styles.badge, item.role === 'ADMIN' ? styles.adminBadge : styles.userBadge]}>
            <Text style={[styles.badgeText, item.role === 'ADMIN' ? styles.adminBadgeText : styles.userBadgeText]}>
              {item.role}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
          <Edit2 size={20} color="#64748b" />
        </TouchableOpacity>
      </View>
      <Text style={styles.email}>{item.email}</Text>
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status: {item.enabled !== false ? 'Active' : 'Disabled'}</Text>
        <Switch
          value={item.enabled !== false}
          onValueChange={(value) => handleToggleStatus(item, value)}
          trackColor={{ false: '#cbd5e1', true: '#0f172a' }}
          thumbColor="#fff"
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      <UserFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={loadUsers}
        user={selectedUser}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  email: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  adminBadge: {
    backgroundColor: '#e0e7ff',
  },
  userBadge: {
    backgroundColor: '#f1f5f9',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  adminBadgeText: {
    color: '#4338ca',
  },
  userBadgeText: {
    color: '#64748b',
  },
  actionButton: {
    padding: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: '#334155',
  },
});
