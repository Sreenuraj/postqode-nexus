import React, { useState } from 'react';
import { productApi } from '../services/api';
import { Product } from '../services/graphql';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface DeleteProductDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: Product;
}

export const DeleteProductDialog: React.FC<DeleteProductDialogProps> = ({
  open,
  onClose,
  onSuccess,
  product,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await productApi.delete(product.id);
      toast.success('Product deleted successfully');
      onSuccess();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete product';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Delete Product
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>Are you sure you want to delete this product?</p>
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md space-y-1">
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  <strong>SKU:</strong> {product.sku}
                </div>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  <strong>Name:</strong> {product.name}
                </div>
              </div>
              <p className="text-red-600 font-medium">This action cannot be undone.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
