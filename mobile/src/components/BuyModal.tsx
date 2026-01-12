import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Product } from '../types';
import { createOrder } from '../services/order';

interface BuyModalProps {
  visible: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: () => void;
}

export default function BuyModal({ visible, onClose, product, onSuccess }: BuyModalProps) {
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(false);

  if (!product) return null;

  const handleBuy = async () => {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }
    if (qty > product.quantity) {
      Alert.alert('Error', `Only ${product.quantity} items available`);
      return;
    }

    setLoading(true);
    try {
      await createOrder(product.id, qty);
      Alert.alert('Success', 'Order placed successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Buy Product</Text>
          
          <View style={styles.info}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            <Text style={styles.stock}>Available: {product.quantity}</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="1"
            />
            <Text style={styles.total}>
              Total: ${((parseInt(quantity) || 0) * product.price).toFixed(2)}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.buyButton]} 
              onPress={handleBuy}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buyButtonText}>Place Order</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  info: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  price: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  stock: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 12,
    textAlign: 'right',
  },
  actions: {
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
  buyButton: {
    backgroundColor: '#0f172a',
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: '600',
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
