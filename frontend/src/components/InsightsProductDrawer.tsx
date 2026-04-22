import React, { useState, useEffect } from 'react';
import { productApi, orderApi } from '../services/api';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { formatRelativeTime } from '../utils/relativeTime';
import { Package, TrendingUp, TrendingDown, Minus, ShoppingCart, Clock } from 'lucide-react';

interface ProductDetail {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  status: string;
  categoryName?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  status: string;
  quantity: number;
  createdAt: string;
  requesterName?: string;
}

interface InsightsProductDrawerProps {
  productId: string | null;
  open: boolean;
  onClose: () => void;
}

export const InsightsProductDrawer: React.FC<InsightsProductDrawerProps> = ({
  productId,
  open,
  onClose,
}) => {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (!productId || !open) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [productData, allOrders] = await Promise.all([
          productApi.getById(productId),
          orderApi.getAllOrders().catch(() => []),
        ]);

        setProduct(productData);

        // Filter orders for this product
        const productOrders = (allOrders || []).filter((o: any) => o.product?.id === productId || o.productId === productId);
        setOrders(productOrders);
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, open]);

  const getStockPercentage = (qty: number) => {
    const max = Math.max(qty, 100);
    return Math.min(100, Math.round((qty / max) * 100));
  };

  const getTrendBadge = () => {
    if (!product) return null;
    if (product.quantity === 0) {
      return <Badge variant="destructive"><TrendingDown className="h-3 w-3 mr-1" /> Out of Stock</Badge>;
    }
    if (product.quantity < 20) {
      return <Badge variant="secondary"><TrendingDown className="h-3 w-3 mr-1" /> Low Stock</Badge>;
    }
    return <Badge variant="default"><TrendingUp className="h-3 w-3 mr-1" /> Healthy</Badge>;
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle id="insights-drawer-title">
            {loading ? <Skeleton className="h-6 w-48" /> : product?.name || 'Product Details'}
          </SheetTitle>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" id="insights-drawer-tab-details">Details</TabsTrigger>
            <TabsTrigger value="activity" id="insights-drawer-tab-activity">Activity</TabsTrigger>
            <TabsTrigger value="orders" id="insights-drawer-tab-orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : product ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center h-32 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <Package className="h-16 w-16 text-slate-400" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">SKU</span>
                  <span className="font-mono text-sm">{product.sku}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Category</span>
                  <span className="text-sm">{product.categoryName || 'Uncategorized'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Price</span>
                  <span className="font-semibold">${product.price.toFixed(2)}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Stock Level</span>
                    {getTrendBadge()}
                  </div>
                  <Progress value={getStockPercentage(product.quantity)} id="insights-drawer-stock-bar" />
                  <p className="text-xs text-slate-500 text-right">{product.quantity} units available</p>
                </div>

                {product.description && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-slate-500 mb-1">Description</p>
                    <p className="text-sm">{product.description}</p>
                  </div>
                )}

                <div className="pt-2 border-t space-y-1">
                  <p className="text-xs text-slate-500">Created: {formatRelativeTime(product.createdAt)}</p>
                  <p className="text-xs text-slate-500">Updated: {formatRelativeTime(product.updatedAt)}</p>
                </div>
              </div>
            ) : (
              <p className="text-center text-slate-500 py-8">Product not found</p>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-3 mt-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <Clock className="h-4 w-4 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm">Product created</p>
                    <p className="text-xs text-slate-500">{product ? formatRelativeTime(product.createdAt) : '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <Minus className="h-4 w-4 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm">Last updated</p>
                    <p className="text-xs text-slate-500">{product ? formatRelativeTime(product.updatedAt) : '-'}</p>
                  </div>
                </div>
                {orders.length > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                    <ShoppingCart className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm">{orders.length} order(s) placed</p>
                      <p className="text-xs text-slate-500">Latest: {formatRelativeTime(orders[0].createdAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-3 mt-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))
            ) : orders.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No orders for this product</p>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  id={`insights-drawer-order-${order.id}`}
                >
                  <div>
                    <p className="text-sm font-medium">Order #{order.id.slice(-6)}</p>
                    <p className="text-xs text-slate-500">{order.requesterName || 'Unknown'} • Qty: {order.quantity}</p>
                  </div>
                  <Badge
                    variant={
                      order.status === 'APPROVED' ? 'default' :
                      order.status === 'PENDING' ? 'secondary' :
                      order.status === 'REJECTED' ? 'destructive' : 'outline'
                    }
                  >
                    {order.status}
                  </Badge>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
