import api from './api';
import { Category } from '../types';

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>('/api/v1/categories');
  return response.data;
};

export const createCategory = async (data: Partial<Category>): Promise<Category> => {
  const response = await api.post<Category>('/api/v1/categories', data);
  return response.data;
};

export const updateCategory = async (id: string, data: Partial<Category>): Promise<Category> => {
  const response = await api.put<Category>(`/api/v1/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/categories/${id}`);
};
