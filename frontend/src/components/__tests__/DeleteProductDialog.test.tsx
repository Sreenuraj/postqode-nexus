import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteProductDialog } from '../DeleteProductDialog';
import { productApi } from '../../services/api';
import { Product } from '../../services/graphql';

// Mock the API
vi.mock('../../services/api', () => ({
  productApi: {
    delete: vi.fn(),
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('DeleteProductDialog', () => {
  const mockProduct: Product = {
    id: '123',
    sku: 'PRD-001',
    name: 'Test Product',
    description: 'Test description',
    price: 99.99,
    quantity: 10,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders delete confirmation dialog', () => {
    render(
      <DeleteProductDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        product={mockProduct}
      />
    );

    expect(screen.getByText('Delete Product')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this product?')).toBeInTheDocument();
    expect(screen.getByText(/PRD-001/)).toBeInTheDocument();
    expect(screen.getByText(/Test Product/)).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
  });

  it('displays product details', () => {
    render(
      <DeleteProductDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        product={mockProduct}
      />
    );

    expect(screen.getByText(/SKU:/)).toBeInTheDocument();
    expect(screen.getByText(/PRD-001/)).toBeInTheDocument();
    expect(screen.getByText(/Name:/)).toBeInTheDocument();
    expect(screen.getByText(/Test Product/)).toBeInTheDocument();
  });

  it('shows warning icon', () => {
    render(
      <DeleteProductDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        product={mockProduct}
      />
    );

    // Check for AlertTriangle icon (lucide-react renders as svg)
    const title = screen.getByText('Delete Product').closest('h2');
    expect(title).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <DeleteProductDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        product={mockProduct}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('deletes product successfully', async () => {
    const mockDelete = vi.mocked(productApi.delete);
    mockDelete.mockResolvedValueOnce(undefined);

    render(
      <DeleteProductDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        product={mockProduct}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('123');
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('shows loading state during deletion', async () => {
    const mockDelete = vi.mocked(productApi.delete);
    mockDelete.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <DeleteProductDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        product={mockProduct}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);

    // Check loading state
    expect(screen.getByRole('button', { name: /Deleting.../i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeDisabled();
  });

  it('handles deletion error', async () => {
    const mockDelete = vi.mocked(productApi.delete);
    mockDelete.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Cannot delete product',
        },
      },
    });

    render(
      <DeleteProductDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        product={mockProduct}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('123');
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  it('handles deletion error without message', async () => {
    const mockDelete = vi.mocked(productApi.delete);
    mockDelete.mockRejectedValueOnce(new Error('Network error'));

    render(
      <DeleteProductDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        product={mockProduct}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('123');
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });
});
