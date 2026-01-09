import React, { useState, useEffect } from 'react';
import { productApi, categoryApi } from '../services/api';
import { Product } from '../services/graphql';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
}

export const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  open,
  onClose,
  onSuccess,
  product,
}) => {
  const isEdit = !!product;

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    price: '',
    quantity: '',
    status: 'ACTIVE',
    categoryId: 'none',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    console.log('ProductFormDialog mounted. Product:', product);
    const loadCategories = async () => {
      try {
        const data = await categoryApi.getAll();
        console.log('Categories loaded:', data);
        if (Array.isArray(data)) {
          setCategories(data);
          // Log comparison if product exists
          if (product && product.categoryId) {
            const match = data.find((c: any) => c.id === product.categoryId);
            console.log('Category match check:', {
              productCategoryId: product.categoryId,
              foundMatch: !!match,
              availableCategoryIds: data.map((c: any) => c.id)
            });
          }
        } else {
          console.error('Categories data is not an array:', data);
          setCategories([]);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories([]);
      }
    };
    loadCategories();
  }, [product]); // Added product dependency to re-check when product changes

  useEffect(() => {
    console.log('Product changed:', product);
    if (product) {
      try {
        const newFormData = {
          sku: product.sku || '',
          name: product.name || '',
          description: product.description || '',
          price: product.price !== undefined && product.price !== null ? product.price.toString() : '',
          quantity: product.quantity !== undefined && product.quantity !== null ? product.quantity.toString() : '',
          status: product.status || 'ACTIVE',
          categoryId: product.categoryId || 'none',
        };
        console.log('Setting form data:', newFormData);
        setFormData(newFormData);
      } catch (e) {
        console.error('Error setting form data:', e);
      }
    } else {
      // Generate next SKU
      const nextSku = `PRD-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      setFormData((prev) => ({ ...prev, sku: nextSku }));
    }
  }, [product]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.sku) {
      newErrors.sku = 'SKU is required';
    } else if (!isEdit && !/^PRD-\d{3,}$/.test(formData.sku)) {
      // Only validate PRD format for new products
      newErrors.sku = 'SKU must match format: PRD-XXX';
    }

    if (!formData.name) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.length < 3 || formData.name.length > 200) {
      newErrors.name = 'Name must be 3-200 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price)) {
      newErrors.price = 'Price is required';
    } else if (price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    const quantity = parseInt(formData.quantity);
    if (formData.quantity === '' || isNaN(quantity)) {
      newErrors.quantity = 'Quantity is required';
    } else if (quantity < 0) {
      newErrors.quantity = 'Quantity must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        sku: formData.sku,
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        status: formData.status,
      };

      if (formData.categoryId && formData.categoryId !== 'none') {
        payload.categoryId = formData.categoryId;
      }

      if (isEdit && product) {
        await productApi.update(product.id, payload);
        toast.success('Product updated successfully');
      } else {
        await productApi.create(payload);
        toast.success('Product added successfully');
      }

      onSuccess();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to save product';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" id="inventory-modal-product-form">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update product details below.' : 'Fill in the details to add a new product.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-sku">SKU *</Label>
            <Input
              id="product-sku"
              value={formData.sku}
              onChange={(e) => {
                setFormData({ ...formData, sku: e.target.value });
                setErrors({ ...errors, sku: '' });
              }}
              disabled={isEdit || loading}
              placeholder="PRD-001"
              className={errors.sku ? 'border-red-500' : ''}
            />
            {errors.sku && <p className="text-sm text-red-500">{errors.sku}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-name">Product Name *</Label>
            <Input
              id="product-name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setErrors({ ...errors, name: '' });
              }}
              disabled={loading}
              placeholder="Enter product name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-description">Description</Label>
            <textarea
              id="product-description"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                setErrors({ ...errors, description: '' });
              }}
              disabled={loading}
              placeholder="Enter product description"
              className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.description ? 'border-red-500' : ''
              }`}
              rows={3}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-price">Price *</Label>
              <Input
                id="product-price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => {
                  setFormData({ ...formData, price: e.target.value });
                  setErrors({ ...errors, price: '' });
                }}
                disabled={loading}
                placeholder="0.00"
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-quantity">Quantity *</Label>
              <Input
                id="product-quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => {
                  setFormData({ ...formData, quantity: e.target.value });
                  setErrors({ ...errors, quantity: '' });
                }}
                disabled={loading}
                placeholder="0"
                className={errors.quantity ? 'border-red-500' : ''}
              />
              {errors.quantity && <p className="text-sm text-red-500">{errors.quantity}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-category">Category</Label>
            {categories.length === 0 ? (
              <div className="flex h-10 w-full items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm text-muted-foreground">
                Loading categories...
              </div>
            ) : (
              <Select
                value={formData.categoryId || 'none'}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                disabled={loading}
              >
                <SelectTrigger id="product-category">
                  <SelectValue placeholder="Select category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {Array.isArray(categories) && categories.map((cat) => (
                    cat && cat.id ? (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ) : null
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
              disabled={loading}
            >
              <SelectTrigger id="product-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button id="inventory-button-save" type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
