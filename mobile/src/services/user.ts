import api from './api';
import { User } from '../types';

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/api/v1/users');
  return response.data;
};

export const createUser = async (data: Partial<User>): Promise<User> => {
  const response = await api.post<User>('/api/v1/users', data);
  return response.data;
};

export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
  const response = await api.put<User>(`/api/v1/users/${id}`, data);
  return response.data;
};

export const toggleUserStatus = async (id: string, enabled: boolean): Promise<User> => {
  const response = await api.patch<User>(`/api/v1/users/${id}/status`, { enabled });
  return response.data;
};
