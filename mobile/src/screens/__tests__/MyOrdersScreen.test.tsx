import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import MyOrdersScreen from '../MyOrdersScreen';
import * as orderService from '../../services/order';

// Mock services
jest.mock('../../services/order');

describe('MyOrdersScreen', () => {
  it('renders correctly and loads orders', async () => {
    const mockOrders = [
      {
        id: '1',
        product: { name: 'Product 1', price: 10 },
        quantity: 2,
        status: 'APPROVED',
        createdAt: '2023-01-01T00:00:00Z',
      },
    ];
    (orderService.getMyOrders as jest.Mock).mockResolvedValue(mockOrders);

    const { getByText } = render(<MyOrdersScreen />);

    await waitFor(() => {
      expect(getByText('Product 1')).toBeTruthy();
      expect(getByText('APPROVED')).toBeTruthy();
    });
  });
});
