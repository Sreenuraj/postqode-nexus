import api from './api';
import { Product } from '../types';

export interface InventoryItem {
  id: string;
  product?: Product;
  name: string;
  quantity: number;
  source: 'PURCHASED' | 'MANUAL';
  notes?: string;
}

export const getMyInventory = async (): Promise<InventoryItem[]> => {
  const response = await api.get<InventoryItem[]>('/api/v1/user-inventory');
  return response.data;
};

export const createInventoryItem = async (data: Partial<InventoryItem>): Promise<InventoryItem> => {
  const response = await api.post<InventoryItem>('/api/v1/user-inventory', data);
  return response.data;
};

export const updateInventoryItem = async (id: string, data: Partial<InventoryItem>): Promise<InventoryItem> => {
  const response = await api.put<InventoryItem>(`/api/v1/user-inventory/${id}`, data);
  return response.data;
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/user-inventory/${id}`);
};

export const consumeInventoryItem = async (id: string, quantity: number): Promise<InventoryItem> => {
  const response = await api.post<InventoryItem>(`/api/v1/user-inventory/${id}/consume`, { quantity });
  return response.data;
};
