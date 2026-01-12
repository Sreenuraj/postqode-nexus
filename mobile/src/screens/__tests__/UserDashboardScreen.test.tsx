import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import UserDashboardScreen from '../UserDashboardScreen';
import { getMyOrders } from '../../services/order';
import { getMyInventory } from '../../services/inventory';
import { useAuthStore } from '../../store/authStore';

jest.mock('../../services/order');
jest.mock('../../services/inventory');
jest.mock('../../store/authStore');
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
    useFocusEffect: (callback: any) => React.useEffect(callback, []),
  };
});

describe('UserDashboardScreen', () => {
  beforeEach(() => {
    (getMyOrders as jest.Mock).mockResolvedValue([
      { id: '1', status: 'PENDING', product: { price: 10 }, quantity: 1 },
      { id: '2', status: 'APPROVED', product: { price: 20 }, quantity: 1 },
    ]);
    (getMyInventory as jest.Mock).mockResolvedValue([
      { id: '1', quantity: 5 },
      { id: '2', quantity: 3 },
      { id: '3', quantity: 1 },
    ]);
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: { username: 'testuser' },
    });
  });

  it('renders stats correctly', async () => {
    const { getByText } = render(<UserDashboardScreen />);

    await waitFor(() => {
      expect(getByText('My Orders')).toBeTruthy();
      expect(getByText('2')).toBeTruthy(); // Total Orders
      expect(getByText('Pending')).toBeTruthy();
      expect(getByText('1')).toBeTruthy(); // Pending Orders
    });
  });
});
