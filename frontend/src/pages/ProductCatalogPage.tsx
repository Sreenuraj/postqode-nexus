import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { productApi } from '../services/api';
import { Product } from '../services/graphql';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Plus, Search, MoreVertical, Edit, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { ProductFormDialog } from '../components/ProductFormDialog';
import { DeleteProductDialog } from '../components/DeleteProductDialog';

export const ProductCatalogPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: page - 1, // Spring Data uses 0-based page indexing
        pageSize,
        sortBy,
        sortOrder,
      };

      if (search) {
        params.search = search;
      }

      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      const response = await productApi.getAll(params);
      setProducts(response.content || response.items || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalElements || response.totalCount || 0);
    } catch (error: any) {
      toast.error('Failed to load products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, statusFilter, sortBy, sortOrder]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchProducts();
      } else {
        setPage(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: string }> = {
      ACTIVE: { variant: 'default', icon: '🟢' },
      LOW_STOCK: { variant: 'secondary', icon: '🟡' },
      OUT_OF_STOCK: { variant: 'destructive', icon: '🔴' },
    };

    const config = variants[status] || variants.ACTIVE;

    return (
      <Badge variant={config.variant}>
        {config.icon} {status.replace('_', ' ')}
      </Badge>
    );
  };

  const handleProductSaved = () => {
    fetchProducts();
    setShowAddDialog(false);
    setEditingProduct(null);
  };

  const handleProductDeleted = () => {
    fetchProducts();
    setDeletingProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Catalog</h1>
          <p className="text-slate-500 mt-1">
            Showing {products.length} of {totalCount} products
          </p>
        </div>
        {isAdmin && (
          <Button id="inventory-button-add" onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            id="catalog-input-search"
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger id="catalog-select-status" className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
            <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={`${sortBy}-${sortOrder}`}
          onValueChange={(value) => {
            const [field, order] = value.split('-');
            setSortBy(field);
            setSortOrder(order as 'ASC' | 'DESC');
          }}
        >
          <SelectTrigger id="catalog-select-sort" className="w-full sm:w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-ASC">Name (A-Z)</SelectItem>
            <SelectItem value="name-DESC">Name (Z-A)</SelectItem>
            <SelectItem value="price-ASC">Price (Low to High)</SelectItem>
            <SelectItem value="price-DESC">Price (High to Low)</SelectItem>
            <SelectItem value="quantity-ASC">Quantity (Low to High)</SelectItem>
            <SelectItem value="quantity-DESC">Quantity (High to Low)</SelectItem>
            <SelectItem value="createdAt-DESC">Newest First</SelectItem>
            <SelectItem value="createdAt-ASC">Oldest First</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" onClick={fetchProducts}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table id="catalog-table-products">
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  {isAdmin && <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>}
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-slate-500">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id} id={`catalog-row-${product.id}`}>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeletingProduct(product)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      {showAddDialog && (
        <ProductFormDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSuccess={handleProductSaved}
        />
      )}

      {editingProduct && (
        <ProductFormDialog
          open={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={handleProductSaved}
          product={editingProduct}
        />
      )}

      {deletingProduct && (
        <DeleteProductDialog
          open={!!deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onSuccess={handleProductDeleted}
          product={deletingProduct}
        />
      )}
    </div>
  );
};
