import api from './api';
import { Product } from '../types';

export const getProducts = async (params?: any): Promise<Product[]> => {
  const response = await api.get<Product[]>('/api/v1/products', { params });
  return response.data;
};

export const getProduct = async (id: string): Promise<Product> => {
  const response = await api.get<Product>(`/api/v1/products/${id}`);
  return response.data;
};

// Admin only
export const createProduct = async (data: Partial<Product>): Promise<Product> => {
  const response = await api.post<Product>('/api/v1/products', data);
  return response.data;
};

export const updateProduct = async (id: string, data: Partial<Product>): Promise<Product> => {
  const response = await api.put<Product>(`/api/v1/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/products/${id}`);
};

export const updateProductStatus = async (id: string, status: string): Promise<Product> => {
  const response = await api.patch<Product>(`/api/v1/products/${id}/status`, { status });
  return response.data;
};
