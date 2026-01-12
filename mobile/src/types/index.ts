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
  category_id?: string;
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
