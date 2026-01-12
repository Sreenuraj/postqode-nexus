import api from './api';
import { Product, Page, ProductParams } from '../types';

export const getProducts = async (params?: ProductParams): Promise<Page<Product>> => {
  const { sortBy, sortOrder, ...rest } = params || {};
  const queryParams: any = { ...rest };
  
  if (sortBy) {
    queryParams.sort = `${sortBy},${sortOrder || 'ASC'}`;
  }

  const response = await api.get<Page<Product>>('/api/v1/products', { params: queryParams });
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
