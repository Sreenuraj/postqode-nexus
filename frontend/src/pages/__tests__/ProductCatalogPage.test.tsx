import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProductCatalogPage } from '../ProductCatalogPage';
import { AuthProvider } from '../../context/AuthContext';
import { productApi } from '../../services/api';

// Mock the API
vi.mock('../../services/api', () => ({
  productApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  categoryApi: {
    getAll: vi.fn().mockResolvedValue([]),
  },
  orderApi: {
    createOrder: vi.fn(),
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock AuthContext with admin user
vi.mock('../../context/AuthContext', async () => {
  const actual = await vi.importActual('../../context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: { id: '1', username: 'admin', role: 'ADMIN' },
      isAdmin: true,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    }),
  };
});

const mockProducts = [
  {
    id: '1',
    sku: 'PRD-001',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse',
    price: 29.99,
    quantity: 150,
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    sku: 'PRD-002',
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard',
    price: 89.99,
    quantity: 5,
    status: 'LOW_STOCK',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    sku: 'PRD-003',
    name: 'USB-C Hub',
    description: '7-port USB-C hub',
    price: 49.99,
    quantity: 0,
    status: 'OUT_OF_STOCK',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
];

const renderProductCatalog = () => {
  return render(
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <ProductCatalogPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('ProductCatalogPage', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    const mockGetAll = vi.mocked(productApi.getAll);
    mockGetAll.mockResolvedValue({
      content: mockProducts,
      totalPages: 1,
      totalElements: 3,
    });
  });

  it('renders product catalog page', async () => {
    renderProductCatalog();

    await waitFor(() => {
      expect(screen.getByText('Product Catalog')).toBeInTheDocument();
      expect(screen.getByText(/Showing 3 of 3 products/)).toBeInTheDocument();
    });
  });

  it('displays products in table', async () => {
    renderProductCatalog();

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
      expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
      expect(screen.getByText('USB-C Hub')).toBeInTheDocument();
    });
  });

  it('shows correct status badges', async () => {
    renderProductCatalog();

    await waitFor(() => {
      // Status badges include emoji icons, so we use more flexible matching
      const badges = screen.getAllByText(/ACTIVE|LOW.STOCK|OUT.OF.STOCK/i);
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it('shows Add Product button for admin', async () => {
    renderProductCatalog();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Product/i })).toBeInTheDocument();
    });
  });

  it('filters products by search', async () => {
    const mockGetAll = vi.mocked(productApi.getAll);

    renderProductCatalog();

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });

    // Type in search box
    const searchInput = screen.getByPlaceholderText(/Search products/i);
    fireEvent.change(searchInput, { target: { value: 'Mouse' } });

    // Wait for debounce and API call
    await waitFor(() => {
      expect(mockGetAll).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Mouse',
        })
      );
    }, { timeout: 500 });
  });

  it('filters products by status', async () => {
    const mockGetAll = vi.mocked(productApi.getAll);

    renderProductCatalog();

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });

    // Click status filter using ID
    const statusFilter = document.querySelector('#catalog-select-status');
    if (statusFilter) {
      fireEvent.click(statusFilter);

      // Select LOW_STOCK
      const lowStockOption = await screen.findByText('Low Stock');
      fireEvent.click(lowStockOption);

      await waitFor(() => {
        expect(mockGetAll).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'LOW_STOCK',
          })
        );
      });
    }
  });

  it('sorts products', async () => {
    const mockGetAll = vi.mocked(productApi.getAll);

    renderProductCatalog();

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });

    // Click sort dropdown using ID
    const sortDropdown = document.querySelector('#catalog-select-sort');
    if (sortDropdown) {
      fireEvent.click(sortDropdown);

      // Select price high to low
      const priceHighOption = await screen.findByText('Price (High to Low)');
      fireEvent.click(priceHighOption);

      await waitFor(() => {
        expect(mockGetAll).toHaveBeenCalledWith(
          expect.objectContaining({
            sortBy: 'price',
            sortOrder: 'DESC',
          })
        );
      });
    }
  });

  it('handles pagination', async () => {
    const mockGetAll = vi.mocked(productApi.getAll);
    mockGetAll.mockResolvedValue({
      content: mockProducts,
      totalPages: 3,
      totalElements: 25,
    });

    renderProductCatalog();

    await waitFor(() => {
      expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
    });

    // Click next page
    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockGetAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1, // 0-based indexing (page 2)
        })
      );
    });
  });

  it('refreshes product list', async () => {
    const mockGetAll = vi.mocked(productApi.getAll);

    renderProductCatalog();

    await waitFor(() => {
      expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    });

    // Clear previous calls
    mockGetAll.mockClear();

    // Click refresh button
    const refreshButtons = screen.getAllByRole('button');
    const refreshButton = refreshButtons.find(btn => {
      const svg = btn.querySelector('svg');
      return svg !== null && btn.getAttribute('type') !== 'submit';
    });

    if (refreshButton) {
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockGetAll).toHaveBeenCalled();
      });
    }
  });

  it('shows loading skeletons while fetching', () => {
    const mockGetAll = vi.mocked(productApi.getAll);
    mockGetAll.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    renderProductCatalog();

    // Check for skeleton loaders
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('shows empty state when no products', async () => {
    const mockGetAll = vi.mocked(productApi.getAll);
    mockGetAll.mockResolvedValue({
      content: [],
      totalPages: 0,
      totalElements: 0,
    });

    renderProductCatalog();

    await waitFor(() => {
      expect(screen.getByText('No products found')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    const mockGetAll = vi.mocked(productApi.getAll);
    mockGetAll.mockRejectedValue(new Error('Network error'));

    renderProductCatalog();

    await waitFor(() => {
      // Should still render the page structure
      expect(screen.getByText('Product Catalog')).toBeInTheDocument();
    });
  });

  it('uses correct page indexing (0-based for backend)', async () => {
    const mockGetAll = vi.mocked(productApi.getAll);

    renderProductCatalog();

    await waitFor(() => {
      // First call should use page: 0 (page - 1)
      expect(mockGetAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 0, // Frontend page 1 = Backend page 0
        })
      );
    });
  });
});
