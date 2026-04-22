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

// Product Request API (Mock - simulated with delays)
export const productRequestApi = {
  // Simulate fetching categories with variable delay
  getCategories: async (): Promise<any[]> => {
    const delay = 300 + Math.random() * 500; // 300-800ms
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return [
      { id: 'cat-1', name: 'Electronics', description: 'Electronic devices and accessories' },
      { id: 'cat-2', name: 'Office Supplies', description: 'Office equipment and supplies' },
      { id: 'cat-3', name: 'Furniture', description: 'Office and home furniture' },
      { id: 'cat-4', name: 'Software', description: 'Software licenses and subscriptions' },
      { id: 'cat-5', name: 'Hardware', description: 'Computer hardware and peripherals' },
    ];
  },

  // Simulate fetching subcategories with variable delay
  getSubcategories: async (categoryId: string): Promise<any[]> => {
    const delay = 400 + Math.random() * 800; // 400-1200ms
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const subcategories: Record<string, any[]> = {
      'cat-1': [
        { id: 'sub-1-1', name: 'Monitors', categoryId: 'cat-1' },
        { id: 'sub-1-2', name: 'Keyboards', categoryId: 'cat-1' },
        { id: 'sub-1-3', name: 'Mice', categoryId: 'cat-1' },
        { id: 'sub-1-4', name: 'Webcams', categoryId: 'cat-1' },
      ],
      'cat-2': [
        { id: 'sub-2-1', name: 'Pens & Pencils', categoryId: 'cat-2' },
        { id: 'sub-2-2', name: 'Paper Products', categoryId: 'cat-2' },
        { id: 'sub-2-3', name: 'Organizers', categoryId: 'cat-2' },
      ],
      'cat-3': [
        { id: 'sub-3-1', name: 'Desks', categoryId: 'cat-3' },
        { id: 'sub-3-2', name: 'Chairs', categoryId: 'cat-3' },
        { id: 'sub-3-3', name: 'Storage', categoryId: 'cat-3' },
      ],
      'cat-4': [
        { id: 'sub-4-1', name: 'Productivity', categoryId: 'cat-4' },
        { id: 'sub-4-2', name: 'Design Tools', categoryId: 'cat-4' },
        { id: 'sub-4-3', name: 'Development', categoryId: 'cat-4' },
      ],
      'cat-5': [
        { id: 'sub-5-1', name: 'Laptops', categoryId: 'cat-5' },
        { id: 'sub-5-2', name: 'Desktops', categoryId: 'cat-5' },
        { id: 'sub-5-3', name: 'Accessories', categoryId: 'cat-5' },
      ],
    };
    
    return subcategories[categoryId] || [];
  },

  // Simulate searching for similar products with variable delay
  searchSimilarProducts: async (name: string): Promise<any[]> => {
    const delay = 600 + Math.random() * 900; // 600-1500ms
    await new Promise(resolve => setTimeout(resolve, delay));
    
    if (!name || name.length < 3) return [];
    
    const allProducts = [
      { id: 'p-1', name: 'Wireless Mouse', price: 29.99, inStock: true },
      { id: 'p-2', name: 'Mechanical Keyboard', price: 89.99, inStock: false },
      { id: 'p-3', name: 'USB-C Hub', price: 49.99, inStock: true },
      { id: 'p-4', name: 'Monitor Stand', price: 45.00, inStock: true },
      { id: 'p-5', name: 'Webcam HD', price: 79.99, inStock: false },
      { id: 'p-6', name: 'Desk Lamp', price: 35.00, inStock: true },
      { id: 'p-7', name: 'Ergonomic Chair', price: 299.99, inStock: false },
      { id: 'p-8', name: 'Laptop Stand', price: 55.00, inStock: true },
    ];
    
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(name.toLowerCase())
    );
  },

  // Simulate fetching vendors with variable delay
  getVendors: async (budgetRange: string): Promise<any[]> => {
    const delay = 500 + Math.random() * 500; // 500-1000ms
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const allVendors = [
      { id: 'v-1', name: 'TechSupply Co', rating: 4.5, expedited: true, budget: false },
      { id: 'v-2', name: 'Office Depot', rating: 4.2, expedited: true, budget: true },
      { id: 'v-3', name: 'Amazon Business', rating: 4.7, expedited: true, budget: false },
      { id: 'v-4', name: 'Budget Office Supplies', rating: 3.8, expedited: false, budget: true },
      { id: 'v-5', name: 'Premium Tech', rating: 4.9, expedited: true, budget: false },
      { id: 'v-6', name: 'Local Supplier', rating: 4.0, expedited: false, budget: true },
    ];
    
    // Filter based on budget range
    if (budgetRange === 'under-100') {
      return allVendors.filter(v => v.budget);
    }
    
    return allVendors;
  },

  // Simulate budget validation with variable delay
  validateBudget: async (amount: number): Promise<{ valid: boolean; message?: string }> => {
    const delay = 200 + Math.random() * 400; // 200-600ms
    await new Promise(resolve => setTimeout(resolve, delay));
    
    if (amount <= 0) {
      return { valid: false, message: 'Budget must be greater than 0' };
    }
    
    if (amount > 10000) {
      return { valid: false, message: 'Budget exceeds maximum allowed ($10,000)' };
    }
    
    return { valid: true };
  },

  // Simulate submitting a request with delay
  submitRequest: async (_requestData: any): Promise<{ id: string; status: string }> => {
    const delay = 2000 + Math.random() * 1000; // 2-3 seconds
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Simulate occasional failures (10% chance)
    if (Math.random() < 0.1) {
      throw new Error('Failed to submit request. Please try again.');
    }
    
    return {
      id: `REQ-${Date.now()}`,
      status: 'PENDING',
    };
  },

  // Simulate auto-save with delay
  autoSave: async (_requestData: any): Promise<{ saved: boolean; timestamp: Date }> => {
    const delay = 300 + Math.random() * 200; // 300-500ms
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return {
      saved: true,
      timestamp: new Date(),
    };
  },
};

// Preferences API
export const preferencesApi = {
  getMetadata: async (profile: string) => {
    const response = await api.get('/preferences/metadata', { params: { profile } });
    return response.data;
  },
  submit: async (payload: any) => {
    const response = await api.post('/preferences', payload);
    return response.data;
  },
};
