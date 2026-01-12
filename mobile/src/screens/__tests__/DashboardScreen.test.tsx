import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import DashboardScreen from '../DashboardScreen';
import { dashboardApi } from '../../services/graphql';

jest.mock('../../services/graphql');
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
    useFocusEffect: (callback: any) => React.useEffect(callback, []),
  };
});

describe('DashboardScreen', () => {
  beforeEach(() => {
    (dashboardApi.getDashboardMetrics as jest.Mock).mockResolvedValue({
      totalProducts: 10,
      activeProducts: 5,
      lowStockProducts: 3,
      outOfStockProducts: 2,
      productsAddedToday: 1,
      actionsToday: 5,
    });
    (dashboardApi.getProductsByStatus as jest.Mock).mockResolvedValue([]);
    (dashboardApi.getRecentActivity as jest.Mock).mockResolvedValue([]);
  });

  it('renders metrics correctly', async () => {
    const { getByText } = render(<DashboardScreen />);

    await waitFor(() => {
      expect(getByText('Total Products')).toBeTruthy();
      expect(getByText('10')).toBeTruthy();
    });
  });
});
