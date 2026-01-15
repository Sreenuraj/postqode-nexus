import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { Platform } from 'react-native';

const getBaseUrl = () => {
  const url = API_BASE_URL || 'http://localhost:8080';
  // Only replace localhost with 10.0.2.2 for Android emulator if URL actually contains localhost
  // This allows production URLs to work even in debug builds
  if (__DEV__ && Platform.OS === 'android' && url.includes('localhost')) {
    return url.replace('localhost', '10.0.2.2');
  }
  return url;
};

const GRAPHQL_URL = `${getBaseUrl()}/graphql`;

const graphqlClient = axios.create({
  baseURL: GRAPHQL_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});

graphqlClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
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
};

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
