import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import OrderManagementScreen from '../OrderManagementScreen';
import { getAllOrders } from '../../services/order';

jest.mock('../../services/order');

describe('OrderManagementScreen', () => {
  beforeEach(() => {
    (getAllOrders as jest.Mock).mockResolvedValue([
      { id: '1', product: { name: 'Product 1', price: 10 }, quantity: 1, status: 'PENDING', createdAt: new Date().toISOString() },
    ]);
  });

  it('renders orders correctly', async () => {
    const { getByText } = render(<OrderManagementScreen />);

    await waitFor(() => {
      expect(getByText('Product 1')).toBeTruthy();
      expect(getByText('Approve')).toBeTruthy();
      expect(getByText('Reject')).toBeTruthy();
    });
  });
});
