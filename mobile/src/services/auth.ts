import api from './api';
import { AuthResponse, User } from '../types';

export const login = async (username: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/v1/auth/login', { username, password });
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/api/v1/auth/logout');
};

export const getMe = async (): Promise<User> => {
  const response = await api.get<User>('/api/v1/auth/me');
  return response.data;
};
