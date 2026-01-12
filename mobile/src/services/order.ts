import api from './api';
import { Product } from '../types';

export interface Order {
  id: string;
  product: Product;
  quantity: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
}

export const getMyOrders = async (): Promise<Order[]> => {
  const response = await api.get<Order[]>('/api/v1/orders/my-orders');
  return response.data;
};

export const createOrder = async (productId: string, quantity: number): Promise<Order> => {
  const response = await api.post<Order>('/api/v1/orders', { productId, quantity });
  return response.data;
};

export const getAllOrders = async (): Promise<Order[]> => {
  const response = await api.get<Order[]>('/api/v1/orders');
  return response.data;
};

export const approveOrder = async (id: string): Promise<Order> => {
  const response = await api.post<Order>(`/api/v1/orders/${id}/approve`);
  return response.data;
};

export const rejectOrder = async (id: string): Promise<Order> => {
  const response = await api.post<Order>(`/api/v1/orders/${id}/reject`);
  return response.data;
};

export const cancelOrder = async (id: string): Promise<Order> => {
  const response = await api.post<Order>(`/api/v1/orders/${id}/cancel`);
  return response.data;
};
