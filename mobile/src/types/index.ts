export interface User {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
  enabled?: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  status: 'ACTIVE' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  categoryId?: string;
  categoryName?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface ProductParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
