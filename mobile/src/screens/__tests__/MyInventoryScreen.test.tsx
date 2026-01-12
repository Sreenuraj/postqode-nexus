import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import MyInventoryScreen from '../MyInventoryScreen';
import * as inventoryService from '../../services/inventory';

// Mock services
jest.mock('../../services/inventory');

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  Plus: () => 'Plus',
  Edit2: () => 'Edit2',
  Trash2: () => 'Trash2',
  MinusCircle: () => 'MinusCircle',
}));

describe('MyInventoryScreen', () => {
  it('renders correctly and loads inventory', async () => {
    const mockItems = [
      { id: '1', name: 'Item 1', quantity: 5, source: 'MANUAL' },
    ];
    (inventoryService.getMyInventory as jest.Mock).mockResolvedValue(mockItems);

    const { getByText } = render(<MyInventoryScreen />);

    await waitFor(() => {
      expect(getByText('Item 1')).toBeTruthy();
      expect(getByText('Quantity: 5')).toBeTruthy();
    });
  });
});
