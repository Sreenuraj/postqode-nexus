import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import InventoryScreen from '../InventoryScreen';
import * as productService from '../../services/product';

// Mock services
jest.mock('../../services/product');

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  Plus: () => 'Plus',
  Edit2: () => 'Edit2',
  Trash2: () => 'Trash2',
}));

describe('InventoryScreen', () => {
  it('renders correctly and loads products', async () => {
    const mockProducts = [
      { id: '1', name: 'Product 1', sku: 'SKU1', price: 10, quantity: 5, status: 'ACTIVE' },
    ];
    (productService.getProducts as jest.Mock).mockResolvedValue(mockProducts);

    const { getByText } = render(<InventoryScreen />);

    await waitFor(() => {
      expect(getByText('Product 1')).toBeTruthy();
      expect(getByText('SKU: SKU1')).toBeTruthy();
    });
  });
});
