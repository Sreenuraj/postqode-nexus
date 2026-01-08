import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductFormDialog } from '../ProductFormDialog';
import { productApi } from '../../services/api';
import { Product } from '../../services/graphql';

// Mock the API
vi.mock('../../services/api', () => ({
  productApi: {
    create: vi.fn(),
    update: vi.fn(),
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ProductFormDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Add Product Mode', () => {
    it('renders add product form', () => {
      render(
        <ProductFormDialog
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText('Add New Product')).toBeInTheDocument();
      expect(screen.getByText('Fill in the details to add a new product.')).toBeInTheDocument();
      expect(screen.getByLabelText(/SKU/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Price/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Quantity/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    });

    it('generates SKU automatically', () => {
      render(
        <ProductFormDialog
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const skuInput = screen.getByLabelText(/SKU/i) as HTMLInputElement;
      expect(skuInput.value).toMatch(/^PRD-\d{3}$/);
    });

    it('validates required fields', async () => {
      render(
        <ProductFormDialog
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const saveButton = screen.getByRole('button', { name: /Save/i });
      
      // Clear SKU and submit
      const skuInput = screen.getByLabelText(/SKU/i);
      fireEvent.change(skuInput, { target: { value: '' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('SKU is required')).toBeInTheDocument();
        expect(screen.getByText('Product name is required')).toBeInTheDocument();
        expect(screen.getByText('Price is required')).toBeInTheDocument();
        expect(screen.getByText('Quantity is required')).toBeInTheDocument();
      });
    });

    it('validates SKU format', async () => {
      render(
        <ProductFormDialog
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const skuInput = screen.getByLabelText(/SKU/i);
      const saveButton = screen.getByRole('button', { name: /Save/i });

      fireEvent.change(skuInput, { target: { value: 'INVALID' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('SKU must match format: PRD-XXX')).toBeInTheDocument();
      });
    });

    it('validates product name length', async () => {
      render(
        <ProductFormDialog
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const nameInput = screen.getByLabelText(/Product Name/i);
      const saveButton = screen.getByRole('button', { name: /Save/i });

      fireEvent.change(nameInput, { target: { value: 'AB' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Name must be 3-200 characters')).toBeInTheDocument();
      });
    });

    it('validates price is positive', async () => {
      render(
        <ProductFormDialog
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const priceInput = screen.getByLabelText(/Price/i);
      const saveButton = screen.getByRole('button', { name: /Save/i });

      fireEvent.change(priceInput, { target: { value: '-10' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Price must be greater than 0')).toBeInTheDocument();
      });
    });

    it('validates quantity is non-negative', async () => {
      render(
        <ProductFormDialog
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const quantityInput = screen.getByLabelText(/Quantity/i);
      const saveButton = screen.getByRole('button', { name: /Save/i });

      fireEvent.change(quantityInput, { target: { value: '-5' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Quantity must be 0 or greater')).toBeInTheDocument();
      });
    });

    it('creates product successfully', async () => {
      const mockCreate = vi.mocked(productApi.create);
      mockCreate.mockResolvedValueOnce({
        id: '123',
        sku: 'PRD-001',
        name: 'Test Product',
        price: 99.99,
        quantity: 10,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      render(
        <ProductFormDialog
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill form
      fireEvent.change(screen.getByLabelText(/SKU/i), { target: { value: 'PRD-001' } });
      fireEvent.change(screen.getByLabelText(/Product Name/i), { target: { value: 'Test Product' } });
      fireEvent.change(screen.getByLabelText(/Price/i), { target: { value: '99.99' } });
      fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '10' } });

      // Submit
      const saveButton = screen.getByRole('button', { name: /Save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith({
          sku: 'PRD-001',
          name: 'Test Product',
          description: undefined,
          price: 99.99,
          quantity: 10,
          status: 'ACTIVE',
        });
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('Edit Product Mode', () => {
    const mockProduct: Product = {
      id: '123',
      sku: 'PRD-001',
      name: 'Existing Product',
      description: 'Test description',
      price: 49.99,
      quantity: 25,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('renders edit product form with existing data', () => {
      render(
        <ProductFormDialog
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          product={mockProduct}
        />
      );

      expect(screen.getByText('Edit Product')).toBeInTheDocument();
      expect(screen.getByText('Update product details below.')).toBeInTheDocument();
      
      const skuInput = screen.getByLabelText(/SKU/i) as HTMLInputElement;
      const nameInput = screen.getByLabelText(/Product Name/i) as HTMLInputElement;
      const priceInput = screen.getByLabelText(/Price/i) as HTMLInputElement;
      const quantityInput = screen.getByLabelText(/Quantity/i) as HTMLInputElement;

      expect(skuInput.value).toBe('PRD-001');
      expect(nameInput.value).toBe('Existing Product');
      expect(priceInput.value).toBe('49.99');
      expect(quantityInput.value).toBe('25');
    });

    it('disables SKU field in edit mode', () => {
      render(
        <ProductFormDialog
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          product={mockProduct}
        />
      );

      const skuInput = screen.getByLabelText(/SKU/i) as HTMLInputElement;
      expect(skuInput).toBeDisabled();
    });

    it('updates product successfully', async () => {
      const mockUpdate = vi.mocked(productApi.update);
      mockUpdate.mockResolvedValueOnce({
        ...mockProduct,
        name: 'Updated Product',
      });

      render(
        <ProductFormDialog
          open={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          product={mockProduct}
        />
      );

      // Update name
      const nameInput = screen.getByLabelText(/Product Name/i);
      fireEvent.change(nameInput, { target: { value: 'Updated Product' } });

      // Submit
      const updateButton = screen.getByRole('button', { name: /Update/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith('123', {
          sku: 'PRD-001',
          name: 'Updated Product',
          description: 'Test description',
          price: 49.99,
          quantity: 25,
          status: 'ACTIVE',
        });
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <ProductFormDialog
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
