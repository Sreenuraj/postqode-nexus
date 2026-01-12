import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import CategoryScreen from '../CategoryScreen';
import * as categoryService from '../../services/category';

// Mock services
jest.mock('../../services/category');

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  Plus: () => 'Plus',
  Edit2: () => 'Edit2',
  Trash2: () => 'Trash2',
}));

describe('CategoryScreen', () => {
  it('renders correctly and loads categories', async () => {
    const mockCategories = [
      { id: '1', name: 'Category 1', description: 'Description 1' },
    ];
    (categoryService.getCategories as jest.Mock).mockResolvedValue(mockCategories);

    const { getByText } = render(<CategoryScreen />);

    await waitFor(() => {
      expect(getByText('Category 1')).toBeTruthy();
      expect(getByText('Description 1')).toBeTruthy();
    });
  });
});
