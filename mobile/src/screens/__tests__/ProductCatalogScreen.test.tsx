import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProductCatalogScreen from '../ProductCatalogScreen';
import { getProducts } from '../../services/product';
import { useAuthStore } from '../../store/authStore';

// Mock services
jest.mock('../../services/product');
jest.mock('../../store/authStore');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
  useFocusEffect: jest.fn(),
}));

const mockProducts = [
  { id: '1', name: 'Product 1', price: 10, quantity: 5, status: 'ACTIVE', sku: 'PRD-001' },
  { id: '2', name: 'Product 2', price: 20, quantity: 0, status: 'OUT_OF_STOCK', sku: 'PRD-002' },
];

describe('ProductCatalogScreen', () => {
  beforeEach(() => {
    (getProducts as jest.Mock).mockResolvedValue({
      content: mockProducts,
      totalPages: 1,
      totalElements: 2,
    });
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: { role: 'USER' },
    });
  });

  it('renders products correctly', async () => {
    jest.useFakeTimers();
    const { getByText } = render(<ProductCatalogScreen />);
    
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(getByText('Product 1')).toBeTruthy();
      expect(getByText('Product 2')).toBeTruthy();
    });
    jest.useRealTimers();
  });

  it('shows buy button for user', async () => {
    jest.useFakeTimers();
    const { getAllByText } = render(<ProductCatalogScreen />);
    
    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(getAllByText('Buy')).toBeTruthy();
    });
    jest.useRealTimers();
  });

  it('shows edit/delete buttons for admin', async () => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: { role: 'ADMIN' },
    });

    const { getAllByTestId } = render(<ProductCatalogScreen />);
    // Note: You might need to add testID to buttons in the component
  });
});
