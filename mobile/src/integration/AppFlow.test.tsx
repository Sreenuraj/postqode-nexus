import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../screens/LoginScreen';
import ProductCatalogScreen from '../screens/ProductCatalogScreen';
import { useAuthStore } from '../store/authStore';

// Mock Navigation
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useNavigation: () => ({
      navigate: jest.fn(),
      replace: jest.fn(),
    }),
    useFocusEffect: (callback: any) => React.useEffect(callback, []),
  };
});

describe('Integration Tests (Real Backend)', () => {
  it('should login and fetch products', async () => {
    // 1. Login
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Enter username'), 'admin');
    fireEvent.changeText(getByPlaceholderText('Enter password'), 'Admin@123');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(useAuthStore.getState().token).toBeTruthy();
    }, { timeout: 5000 });

    // 2. Fetch Products
    // We render ProductCatalogScreen which triggers fetch on mount
    const { getByText: getByTextCatalog } = render(<ProductCatalogScreen />);

    await waitFor(() => {
      // Assuming "Wireless Mouse" is in the demo data
      expect(getByTextCatalog('Wireless Mouse')).toBeTruthy();
    }, { timeout: 10000 });
  });
});
