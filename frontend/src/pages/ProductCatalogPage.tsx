import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { productApi, categoryApi, orderApi } from '../services/api';
import { Product } from '../services/graphql';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Plus, Search, MoreVertical, Edit, Trash2, RefreshCw, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { ProductFormDialog } from '../components/ProductFormDialog';
import { DeleteProductDialog } from '../components/DeleteProductDialog';
import { useWebMcpTool } from '../hooks/useWebMcpTool';

export const ProductCatalogPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
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
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [buyQuantity, setBuyQuantity] = useState(1);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

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

      if (categoryFilter !== 'ALL') {
        params.categoryId = categoryFilter;
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
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, statusFilter, categoryFilter, sortBy, sortOrder]);

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

  // WebMCP: Tool to search catalog products programmatically
  useWebMcpTool(
    {
      name: 'search_products',
      description: 'Search products in catalog with optional query, category, status, and sorting.',
      inputSchema: {
        type: 'object',
        properties: {
          search: { type: 'string', description: 'Keyword to search in product name or SKU' },
          categoryId: { type: 'string', description: 'Filter by category UUID' },
          status: { type: 'string', enum: ['ALL', 'ACTIVE', 'LOW_STOCK', 'OUT_OF_STOCK'] },
          sortBy: { type: 'string', enum: ['name', 'price', 'quantity', 'status'] },
          sortOrder: { type: 'string', enum: ['ASC', 'DESC'] },
        },
      },
      annotations: {
        readOnlyHint: true,
        consequentialHint: false,
      },
      execute: async (params: any = {}) => {
        if (params.search !== undefined) setSearch(params.search);
        if (params.status) setStatusFilter(params.status);
        if (params.categoryId) setCategoryFilter(params.categoryId);
        const res = await productApi.getAll({
          search: params.search ?? search,
          status: params.status && params.status !== 'ALL' ? params.status : (statusFilter !== 'ALL' ? statusFilter : undefined),
          categoryId: params.categoryId && params.categoryId !== 'ALL' ? params.categoryId : (categoryFilter !== 'ALL' ? categoryFilter : undefined),
          sortBy: params.sortBy || sortBy,
          sortOrder: params.sortOrder || sortOrder,
          pageSize: 10,
        });
        return res.content || res.items || [];
      },
    },
    [search, statusFilter, categoryFilter, sortBy, sortOrder]
  );

  // WebMCP: Tool to get specific product details
  useWebMcpTool(
    {
      name: 'get_product_details',
      description: 'Get details, price, and available inventory for a specific product ID.',
      inputSchema: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: 'Product UUID' },
        },
        required: ['productId'],
      },
      annotations: {
        readOnlyHint: true,
      },
      execute: async ({ productId }: { productId: string }) => {
        return await productApi.getById(productId);
      },
    },
    []
  );

  // WebMCP: Tool to place an order directly via AI agent
  useWebMcpTool(
    {
      name: 'place_order',
      description: 'Place an order for a product by ID and quantity. Updates inventory.',
      inputSchema: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: 'Product UUID' },
          quantity: { type: 'number', description: 'Number of units to purchase (min 1)' },
        },
        required: ['productId', 'quantity'],
      },
      annotations: {
        readOnlyHint: false,
        consequentialHint: true, // Consequential: marks financial/order placement action
      },
      execute: async ({ productId, quantity }: { productId: string; quantity: number }) => {
        const order = await orderApi.createOrder(productId, quantity);
        fetchProducts();
        toast.success(`Agent placed order for ${quantity} unit(s)!`);
        return {
          status: 'success',
          order,
          message: `Order successfully placed for ${quantity} unit(s).`,
        };
      },
    },
    []
  );

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

  const handleBuy = async () => {
    if (!selectedProduct) return;
    try {
      await orderApi.createOrder(selectedProduct.id, buyQuantity);
      toast.success('Order placed successfully');
      setBuyDialogOpen(false);
      setSelectedProduct(null);
      setBuyQuantity(1);
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to place order');
    }
  };

  const openBuyDialog = (product: Product) => {
    setSelectedProduct(product);
    setBuyQuantity(1);
    setBuyDialogOpen(true);
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
        <form
          toolname="search_catalog"
          tooldescription="Search and filter product catalog by keyword"
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            fetchProducts();
          }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            id="catalog-input-search"
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            toolparamdescription="Search query keyword for product name or SKU"
          />
        </form>

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

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger id="catalog-select-category" className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
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
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              {!isAdmin && <TableHead className="text-right">Actions</TableHead>}
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
                <TableCell colSpan={isAdmin ? 6 : 6} className="text-center py-8 text-slate-500">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id} id={`catalog-row-${product.id}`}>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-sm text-slate-600">{(product as any).categoryName || '-'}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  {!isAdmin && (
                    <TableCell className="text-right">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => openBuyDialog(product)}
                        disabled={product.quantity === 0}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Buy
                      </Button>
                    </TableCell>
                  )}
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

      {/* Buy Dialog */}
      <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy Product</DialogTitle>
          </DialogHeader>
          <form
            id="catalog-form-buy"
            toolname="place_order_form"
            tooldescription="Submit purchase order for the selected product"
            toolautosubmit=""
            onSubmit={async (e) => {
              e.preventDefault();
              await handleBuy();
              if ((e.nativeEvent as any)?.agentInvoked && (e.nativeEvent as any)?.respondWith) {
                (e.nativeEvent as any).respondWith(Promise.resolve({ status: 'success' }));
              }
            }}
          >
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Product: {selectedProduct?.name}</p>
                <p className="text-sm text-slate-500">Price: ${selectedProduct?.price.toFixed(2)}</p>
                <p className="text-sm text-slate-500">Available: {selectedProduct?.quantity}</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="quantity" className="text-sm font-medium">
                  Quantity
                </label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  max={selectedProduct?.quantity}
                  value={buyQuantity}
                  toolparamdescription="Quantity of product units to purchase"
                  onChange={(e) => setBuyQuantity(Math.max(1, Math.min(selectedProduct?.quantity || 1, parseInt(e.target.value) || 1)))}
                />
              </div>
              <div className="border-t pt-4">
                <p className="text-lg font-semibold">
                  Total: ${((selectedProduct?.price || 0) * buyQuantity).toFixed(2)}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setBuyDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={buyQuantity <= 0 || buyQuantity > (selectedProduct?.quantity || 0)}>
                Place Order
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
