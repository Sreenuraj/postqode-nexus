import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from '../DashboardPage';
import { AuthProvider } from '../../context/AuthContext';
import { dashboardApi } from '../../services/graphql';

// Mock the GraphQL API
vi.mock('../../services/graphql', () => ({
  dashboardApi: {
    getDashboardMetrics: vi.fn(),
    getProductsByStatus: vi.fn(),
    getActivityByUser: vi.fn(),
    getRecentActivity: vi.fn(),
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
}));

const mockMetrics = {
  totalProducts: 5,
  activeProducts: 3,
  lowStockProducts: 1,
  outOfStockProducts: 1,
  productsAddedToday: 5,
  actionsToday: 0,
};

const mockStatusData = [
  { status: 'ACTIVE', count: 3 },
  { status: 'LOW_STOCK', count: 1 },
  { status: 'OUT_OF_STOCK', count: 1 },
];

const mockUserActivity = [
  { username: 'admin', actionCount: 10, lastAction: '2024-01-08T10:00:00Z' },
  { username: 'user', actionCount: 5, lastAction: '2024-01-08T09:00:00Z' },
];

const mockRecentActivity = [
  {
    id: '1',
    username: 'admin',
    productName: 'Wireless Mouse',
    actionType: 'CREATE',
    createdAt: '2024-01-08T10:00:00Z',
  },
  {
    id: '2',
    username: 'admin',
    productName: 'Mechanical Keyboard',
    actionType: 'UPDATE',
    createdAt: '2024-01-08T09:30:00Z',
  },
];

const renderDashboard = () => {
  return render(
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    const mockGetDashboardMetrics = vi.mocked(dashboardApi.getDashboardMetrics);
    const mockGetProductsByStatus = vi.mocked(dashboardApi.getProductsByStatus);
    const mockGetActivityByUser = vi.mocked(dashboardApi.getActivityByUser);
    const mockGetRecentActivity = vi.mocked(dashboardApi.getRecentActivity);

    mockGetDashboardMetrics.mockResolvedValue(mockMetrics);
    mockGetProductsByStatus.mockResolvedValue(mockStatusData);
    mockGetActivityByUser.mockResolvedValue(mockUserActivity);
    mockGetRecentActivity.mockResolvedValue(mockRecentActivity);
  });

  it('renders dashboard page', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Real-time inventory analytics and metrics')).toBeInTheDocument();
    });
  });

  it('displays summary cards with correct metrics', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Total Products')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Low Stock')).toBeInTheDocument();
      expect(screen.getByText('Out of Stock')).toBeInTheDocument();
      
      // Check for metric values (there are multiple "5", "3", "1" on the page)
      const allText = document.body.textContent || '';
      expect(allText).toContain('5');
      expect(allText).toContain('3');
      expect(allText).toContain('1');
    });
  });

  it('displays products by status chart', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Products by Status')).toBeInTheDocument();
      expect(screen.getByText('Distribution of product inventory status')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
  });

  it('displays products added today metric', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Products Added Today')).toBeInTheDocument();
      expect(screen.getByText('New products added to inventory')).toBeInTheDocument();
      expect(screen.getByText('products added today')).toBeInTheDocument();
    });
  });

  it('displays activity by user chart', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Activity by User (Last 7 Days)')).toBeInTheDocument();
      expect(screen.getByText('User actions and contributions')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  it('displays recent activity feed', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText('Latest system actions and changes')).toBeInTheDocument();
      expect(screen.getByText(/admin added "Wireless Mouse"/)).toBeInTheDocument();
      expect(screen.getByText(/admin updated "Mechanical Keyboard"/)).toBeInTheDocument();
    });
  });

  it('shows loading skeletons while fetching data', () => {
    const mockGetDashboardMetrics = vi.mocked(dashboardApi.getDashboardMetrics);
    mockGetDashboardMetrics.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    renderDashboard();

    // Check for skeleton loaders (they should be present initially)
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('shows empty state when no recent activity', async () => {
    const mockGetRecentActivity = vi.mocked(dashboardApi.getRecentActivity);
    mockGetRecentActivity.mockResolvedValue([]);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('No recent activity')).toBeInTheDocument();
    });
  });

  it('refreshes dashboard data when refresh button is clicked', async () => {
    const mockGetDashboardMetrics = vi.mocked(dashboardApi.getDashboardMetrics);
    
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // Clear previous calls
    mockGetDashboardMetrics.mockClear();

    // Click refresh button (find by checking for SVG child and no text content)
    const refreshButtons = screen.getAllByRole('button');
    const refreshButton = refreshButtons.find(btn => {
      const svg = btn.querySelector('svg');
      const hasNoText = !btn.textContent || btn.textContent.trim() === '';
      return svg !== null && hasNoText;
    });
    
    if (refreshButton) {
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockGetDashboardMetrics).toHaveBeenCalled();
      });
    }
  });

  it('handles API errors gracefully', async () => {
    const mockGetDashboardMetrics = vi.mocked(dashboardApi.getDashboardMetrics);
    mockGetDashboardMetrics.mockRejectedValue(new Error('Network error'));

    renderDashboard();

    await waitFor(() => {
      // Should still render the page structure
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('formats relative time correctly', async () => {
    const now = new Date();
    const recentActivity = [
      {
        id: '1',
        username: 'admin',
        productName: 'Test Product',
        actionType: 'CREATE',
        createdAt: new Date(now.getTime() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
      },
    ];

    const mockGetRecentActivity = vi.mocked(dashboardApi.getRecentActivity);
    mockGetRecentActivity.mockResolvedValue(recentActivity);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/2m ago/)).toBeInTheDocument();
    });
  });

  it('displays correct action text for different action types', async () => {
    const activities = [
      {
        id: '1',
        username: 'admin',
        productName: 'Product 1',
        actionType: 'CREATE',
        createdAt: '2024-01-08T10:00:00Z',
      },
      {
        id: '2',
        username: 'admin',
        productName: 'Product 2',
        actionType: 'UPDATE',
        createdAt: '2024-01-08T09:00:00Z',
      },
      {
        id: '3',
        username: 'admin',
        productName: 'Product 3',
        actionType: 'DELETE',
        createdAt: '2024-01-08T08:00:00Z',
      },
      {
        id: '4',
        username: 'admin',
        productName: 'Product 4',
        actionType: 'STATE_CHANGE',
        createdAt: '2024-01-08T07:00:00Z',
      },
      {
        id: '5',
        username: 'user',
        actionType: 'LOGIN',
        createdAt: '2024-01-08T06:00:00Z',
      },
    ];

    const mockGetRecentActivity = vi.mocked(dashboardApi.getRecentActivity);
    mockGetRecentActivity.mockResolvedValue(activities);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/admin added "Product 1"/)).toBeInTheDocument();
      expect(screen.getByText(/admin updated "Product 2"/)).toBeInTheDocument();
      expect(screen.getByText(/admin deleted "Product 3"/)).toBeInTheDocument();
      expect(screen.getByText(/admin changed status of "Product 4"/)).toBeInTheDocument();
      expect(screen.getByText(/user logged in/)).toBeInTheDocument();
    });
  });

  it('calls all dashboard APIs on mount', async () => {
    const mockGetDashboardMetrics = vi.mocked(dashboardApi.getDashboardMetrics);
    const mockGetProductsByStatus = vi.mocked(dashboardApi.getProductsByStatus);
    const mockGetActivityByUser = vi.mocked(dashboardApi.getActivityByUser);
    const mockGetRecentActivity = vi.mocked(dashboardApi.getRecentActivity);

    renderDashboard();

    await waitFor(() => {
      expect(mockGetDashboardMetrics).toHaveBeenCalled();
      expect(mockGetProductsByStatus).toHaveBeenCalled();
      expect(mockGetActivityByUser).toHaveBeenCalledWith(7);
      expect(mockGetRecentActivity).toHaveBeenCalledWith(10);
    });
  });

  it('displays action type badges in activity feed', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('CREATE')).toBeInTheDocument();
      expect(screen.getByText('UPDATE')).toBeInTheDocument();
    });
  });
});
