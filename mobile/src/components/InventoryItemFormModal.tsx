import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { InventoryItem } from '../services/inventory';
import { createInventoryItem, updateInventoryItem } from '../services/inventory';

interface InventoryItemFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  item?: InventoryItem | null;
}

export default function InventoryItemFormModal({ visible, onClose, onSave, item }: InventoryItemFormModalProps) {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    quantity: 0,
    notes: '',
    source: 'MANUAL',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        quantity: item.quantity,
        notes: item.notes,
        source: item.source,
      });
    } else {
      setFormData({
        name: '',
        quantity: 0,
        notes: '',
        source: 'MANUAL',
      });
    }
  }, [item, visible]);

  const handleSubmit = async () => {
    if (!formData.name) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (item) {
        await updateInventoryItem(item.id, formData);
      } else {
        await createInventoryItem(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{item ? 'Edit Item' : 'Add Item'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Item Name"
              editable={!item?.product} // Cannot edit name if linked to product
            />

            <Text style={styles.label}>Quantity *</Text>
            <TextInput
              style={styles.input}
              value={formData.quantity?.toString()}
              onChangeText={(text) => setFormData({ ...formData, quantity: parseInt(text) || 0 })}
              keyboardType="numeric"
              placeholder="0"
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Notes"
              multiline
            />
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
