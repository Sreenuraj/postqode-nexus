import axios from 'axios';

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8080/graphql';

const graphqlClient = axios.create({
  baseURL: GRAPHQL_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
graphqlClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const query = async <T>(query: string, variables?: Record<string, any>): Promise<T> => {
  const response = await graphqlClient.post('', { query, variables });
  if (response.data.errors) {
    throw new Error(response.data.errors[0].message);
  }
  return response.data.data;
};

// Dashboard Queries
export const dashboardApi = {
  getDashboardMetrics: async () => {
    const q = `
      query {
        dashboardMetrics {
          totalProducts
          activeProducts
          lowStockProducts
          outOfStockProducts
          productsAddedToday
          actionsToday
        }
      }
    `;
    const data = await query<{ dashboardMetrics: DashboardMetrics }>(q);
    return data.dashboardMetrics;
  },

  getProductsByStatus: async () => {
    const q = `
      query {
        productsByStatus {
          status
          count
        }
      }
    `;
    const data = await query<{ productsByStatus: StatusCount[] }>(q);
    return data.productsByStatus;
  },

  getActivityByUser: async (days: number = 7) => {
    const q = `
      query($days: Int) {
        activityByUser(days: $days) {
          username
          actionCount
          lastAction
        }
      }
    `;
    const data = await query<{ activityByUser: UserActivity[] }>(q, { days });
    return data.activityByUser;
  },

  getRecentActivity: async (limit: number = 10) => {
    const q = `
      query($limit: Int) {
        recentActivity(limit: $limit) {
          id
          username
          productName
          actionType
          createdAt
        }
      }
    `;
    const data = await query<{ recentActivity: ActivityLog[] }>(q, { limit });
    return data.recentActivity;
  },

  getProductsAddedToday: async () => {
    const q = `
      query {
        productsAddedToday
      }
    `;
    const data = await query<{ productsAddedToday: number }>(q);
    return data.productsAddedToday;
  },
};

// Product Queries (GraphQL alternative)
export const productGraphQL = {
  getProducts: async (params?: {
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const q = `
      query($search: String, $status: ProductStatus, $sortBy: ProductSortField, $sortOrder: SortOrder, $page: Int, $pageSize: Int) {
        products(search: $search, status: $status, sortBy: $sortBy, sortOrder: $sortOrder, page: $page, pageSize: $pageSize) {
          items {
            id
            sku
            name
            description
            price
            quantity
            status
            createdAt
            updatedAt
          }
          totalCount
          pageInfo {
            currentPage
            pageSize
            totalPages
            hasNextPage
            hasPreviousPage
          }
        }
      }
    `;
    const data = await query<{ products: ProductConnection }>(q, params);
    return data.products;
  },
};

// Types
export interface DashboardMetrics {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  productsAddedToday: number;
  actionsToday: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface UserActivity {
  username: string;
  actionCount: number;
  lastAction: string;
}

export interface ActivityLog {
  id: string;
  username: string;
  productName?: string;
  actionType: string;
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  status: string;
  categoryId?: string;
  categoryName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductConnection {
  items: Product[];
  totalCount: number;
  pageInfo: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
