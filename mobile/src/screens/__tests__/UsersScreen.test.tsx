import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import UsersScreen from '../UsersScreen';
import * as userService from '../../services/user';

// Mock services
jest.mock('../../services/user');

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => ({
  Plus: () => 'Plus',
  Edit2: () => 'Edit2',
}));

describe('UsersScreen', () => {
  it('renders correctly and loads users', async () => {
    const mockUsers = [
      { id: '1', username: 'user1', email: 'user1@example.com', role: 'USER', enabled: true },
    ];
    (userService.getUsers as jest.Mock).mockResolvedValue(mockUsers);

    const { getByText } = render(<UsersScreen />);

    await waitFor(() => {
      expect(getByText('user1')).toBeTruthy();
      expect(getByText('user1@example.com')).toBeTruthy();
    });
  });
});
