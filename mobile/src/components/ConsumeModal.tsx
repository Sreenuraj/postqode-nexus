import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { InventoryItem, consumeInventoryItem } from '../services/inventory';

interface ConsumeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  item: InventoryItem | null;
}

export default function ConsumeModal({ visible, onClose, onSave, item }: ConsumeModalProps) {
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!item || !quantity) return;

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    if (qty > item.quantity) {
      Alert.alert('Error', 'Cannot consume more than available quantity');
      return;
    }

    setLoading(true);
    try {
      await consumeInventoryItem(item.id, qty);
      setQuantity('');
      onSave();
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to consume item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Consume Item</Text>
          <Text style={styles.subtitle}>How many {item?.name} did you use?</Text>

          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            placeholder="Quantity"
            autoFocus
            testID="consume-modal-input-quantity"
            accessibilityLabel="Quantity to consume"
            accessible={true}
          />

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
              disabled={loading}
              testID="consume-modal-button-cancel"
              accessibilityLabel="Cancel"
              accessibilityRole="button"
              accessible={true}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={handleSubmit}
              disabled={loading}
              testID="consume-modal-button-submit"
              accessibilityLabel="Consume item"
              accessibilityRole="button"
              accessible={true}
            >
              <Text style={[styles.buttonText, styles.saveButtonText]}>
                {loading ? 'Processing...' : 'Consume'}
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
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    color: '#0f172a',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
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
