import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Product API
export const productApi = {
  getAll: async (params?: {
    search?: string;
    status?: string;
    categoryId?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const queryParams: any = { ...params };

    // Transform sortBy and sortOrder to Spring Data sort format (field,direction)
    if (queryParams.sortBy) {
      const order = queryParams.sortOrder || 'ASC';
      queryParams.sort = `${queryParams.sortBy},${order}`;
      delete queryParams.sortBy;
      delete queryParams.sortOrder;
    }

    // Map pageSize to size
    if (queryParams.pageSize) {
      queryParams.size = queryParams.pageSize;
      delete queryParams.pageSize;
    }

    const response = await api.get('/products', { params: queryParams });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  create: async (product: {
    sku: string;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    status?: string;
    categoryId?: string;
  }) => {
    const response = await api.post('/products', product);
    return response.data;
  },
  update: async (id: string, product: {
    name?: string;
    description?: string;
    price?: number;
    quantity?: number;
    categoryId?: string;
  }) => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/products/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },
};

// Category API
export const categoryApi = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  create: async (category: { name: string; description?: string }) => {
    const response = await api.post('/categories', category);
    return response.data;
  },
  update: async (id: string, category: { name: string; description?: string }) => {
    const response = await api.put(`/categories/${id}`, category);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

// Order API
export const orderApi = {
  getMyOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },
  getAllOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  createOrder: async (productId: string, quantity: number) => {
    const response = await api.post('/orders', { productId, quantity });
    return response.data;
  },
  approveOrder: async (id: string) => {
    const response = await api.post(`/orders/${id}/approve`);
    return response.data;
  },
  rejectOrder: async (id: string) => {
    const response = await api.post(`/orders/${id}/reject`);
    return response.data;
  },
  cancelOrder: async (id: string) => {
    const response = await api.post(`/orders/${id}/cancel`);
    return response.data;
  },
};

// User Inventory API
export const userInventoryApi = {
  getMyInventory: async () => {
    const response = await api.get('/user-inventory');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/user-inventory/${id}`);
    return response.data;
  },
  addManualItem: async (name: string, quantity: number, notes?: string) => {
    const response = await api.post('/user-inventory', { name, quantity, notes });
    return response.data;
  },
  updateItem: async (id: string, name: string, quantity: number, notes?: string) => {
    const response = await api.put(`/user-inventory/${id}`, { name, quantity, notes });
    return response.data;
  },
  deleteItem: async (id: string) => {
    const response = await api.delete(`/user-inventory/${id}`);
    return response.data;
  },
  consumeItem: async (id: string, quantity: number) => {
    const response = await api.post(`/user-inventory/${id}/consume`, { quantity });
    return response.data;
  },
};

// User Management API
export const userApi = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  createUser: async (user: {
    username: string;
    password: string;
    email?: string;
    role: string;
  }) => {
    const response = await api.post('/users', user);
    return response.data;
  },
  updateUser: async (id: string, user: {
    username?: string;
    password?: string;
    email?: string;
    role?: string;
  }) => {
    const response = await api.put(`/users/${id}`, user);
    return response.data;
  },
  enableUser: async (id: string) => {
    const response = await api.patch(`/users/${id}/enable`);
    return response.data;
  },
  disableUser: async (id: string) => {
    const response = await api.patch(`/users/${id}/disable`);
    return response.data;
  },
};
