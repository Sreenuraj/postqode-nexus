import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { User } from '../types';
import { createUser, updateUser } from '../services/user';

interface UserFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  user?: User | null;
}

export default function UserFormModal({ visible, onClose, onSave, user }: UserFormModalProps) {
  const [formData, setFormData] = useState<Partial<User>>({
    username: '',
    email: '',
    role: 'USER',
  });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        role: user.role,
      });
      setPassword('');
    } else {
      setFormData({
        username: '',
        email: '',
        role: 'USER',
      });
      setPassword('');
    }
  }, [user, visible]);

  const handleSubmit = async () => {
    if (!formData.username || !formData.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!user && !password) {
      Alert.alert('Error', 'Password is required for new users');
      return;
    }

    setLoading(true);
    try {
      const data = { ...formData, password: password || undefined };
      if (user) {
        await updateUser(user.id, data);
      } else {
        await createUser(data);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{user ? 'Edit User' : 'Add User'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Username *</Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              placeholder="Username"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password {user ? '(Leave blank to keep)' : '*'}</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
            />

            <Text style={styles.label}>Role</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleButton, formData.role === 'USER' && styles.roleButtonActive]}
                onPress={() => setFormData({ ...formData, role: 'USER' })}
              >
                <Text style={[styles.roleText, formData.role === 'USER' && styles.roleTextActive]}>User</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleButton, formData.role === 'ADMIN' && styles.roleButtonActive]}
                onPress={() => setFormData({ ...formData, role: 'ADMIN' })}
              >
                <Text style={[styles.roleText, formData.role === 'ADMIN' && styles.roleTextActive]}>Admin</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={[styles.buttonText, styles.saveButtonText]}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  closeButton: {
    color: '#64748b',
    fontSize: 16,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#0f172a',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  roleText: {
    color: '#64748b',
    fontWeight: '600',
  },
  roleTextActive: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
  saveButton: {
    backgroundColor: '#0f172a',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  saveButtonText: {
    color: '#fff',
  },
});
