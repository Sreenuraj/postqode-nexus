import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { productApi, categoryApi, orderApi } from '../services/api';
import { dashboardApi, ActivityLog } from '../services/graphql';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { InsightsProductDrawer } from '../components/InsightsProductDrawer';
import { formatRelativeTime } from '../utils/relativeTime';
import {
  RefreshCw,
  Search,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  Activity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { toast } from 'sonner';

type DateRange = '7d' | '30d' | '90d';

interface ProductInsight {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  status: string;
  categoryName?: string;
  price: number;
}

interface OrderRow {
  id: string;
  requesterName?: string;
  productName?: string;
  quantity: number;
  status: string;
  createdAt: string;
  totalPrice?: number;
}

export const InsightsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState<Record<string, boolean>>({
    overview: true,
    products: true,
    orders: true,
    activity: true,
  });

  // Overview state
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    activeUsers: 0,
  });
  const [orderTrend, setOrderTrend] = useState<{ date: string; count: number }[]>([]);

  // Products state
  const [products, setProducts] = useState<ProductInsight[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [productStatus, setProductStatus] = useState('ALL');
  const [productCategory, setProductCategory] = useState('ALL');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);

  // Activity state
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activityLimit, setActivityLimit] = useState(10);
  const [activityFilter, setActivityFilter] = useState<string>('ALL');

  const fetchOverview = async () => {
    setLoading((prev) => ({ ...prev, overview: true }));
    try {
      const allOrders = isAdmin ? await orderApi.getAllOrders() : await orderApi.getMyOrders();
      const allProducts = await productApi.getAll({ page: 0, pageSize: 1 });

      const pending = allOrders.filter((o: any) => o.status === 'PENDING').length;

      setMetrics({
        totalProducts: allProducts.totalElements || allProducts.totalCount || 0,
        totalOrders: allOrders.length,
        pendingOrders: pending,
        activeUsers: 0, // not available without extra call
      });

      // Group orders by date for trend
      const grouped: Record<string, number> = {};
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        grouped[d.toISOString().split('T')[0]] = 0;
      }

      allOrders.forEach((o: any) => {
        const date = o.createdAt?.split('T')[0];
        if (date && grouped[date] !== undefined) {
          grouped[date]++;
        }
      });

      setOrderTrend(
        Object.entries(grouped).map(([date, count]) => ({
          date: date.slice(5), // MM-DD
          count,
        }))
      );
    } catch (error) {
      toast.error('Failed to load overview');
    } finally {
      setLoading((prev) => ({ ...prev, overview: false }));
    }
  };

  const fetchProducts = async () => {
    setLoading((prev) => ({ ...prev, products: true }));
    try {
      const params: any = { page: 0, pageSize: 50 };
      if (productSearch) params.search = productSearch;
      if (productStatus !== 'ALL') params.status = productStatus;
      if (productCategory !== 'ALL') params.categoryId = productCategory;

      const data = await productApi.getAll(params);
      setProducts(data.content || data.items || []);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading((prev) => ({ ...prev, products: false }));
    }
  };

  const fetchOrders = async () => {
    setLoading((prev) => ({ ...prev, orders: true }));
    try {
      const data = isAdmin ? await orderApi.getAllOrders() : await orderApi.getMyOrders();
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading((prev) => ({ ...prev, orders: false }));
    }
  };

  const fetchActivity = async () => {
    setLoading((prev) => ({ ...prev, activity: true }));
    try {
      const logs = await dashboardApi.getRecentActivity(activityLimit);
      setActivityLogs(logs);
    } catch (error) {
      toast.error('Failed to load activity');
    } finally {
      setLoading((prev) => ({ ...prev, activity: false }));
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchCategories();
  }, [dateRange, isAdmin]);

  useEffect(() => {
    if (activeTab === 'products') fetchProducts();
  }, [activeTab, productStatus, productCategory]);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'activity') fetchActivity();
  }, [activeTab, activityLimit]);

  // Debounced product search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'products') fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch]);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
    setDrawerOpen(true);
  };

  const handleExpandOrder = async (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }
    setExpandedOrderId(orderId);
    setOrderDetailLoading(true);
    try {
      const detail = await orderApi.getById(orderId);
      setOrderDetail(detail);
    } catch (error) {
      console.error('Error fetching order detail:', error);
    } finally {
      setOrderDetailLoading(false);
    }
  };

  const getStockPercentage = (qty: number) => {
    const max = Math.max(qty, 100);
    return Math.min(100, Math.round((qty / max) * 100));
  };

  const getTrendIcon = (status: string) => {
    if (status === 'OUT_OF_STOCK') return <TrendingDown className="h-3 w-3 text-red-500" />;
    if (status === 'LOW_STOCK') return <TrendingDown className="h-3 w-3 text-yellow-500" />;
    return <TrendingUp className="h-3 w-3 text-green-500" />;
  };

  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      result = result.filter(
        (o) =>
          o.productName?.toLowerCase().includes(q) ||
          o.requesterName?.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q)
      );
    }
    if (orderStatus !== 'ALL') {
      result = result.filter((o) => o.status === orderStatus);
    }
    return result;
  }, [orders, orderSearch, orderStatus]);

  const filteredActivity = useMemo(() => {
    if (activityFilter === 'ALL') return activityLogs;
    return activityLogs.filter((log) => log.actionType === activityFilter);
  }, [activityLogs, activityFilter]);

  const loadMoreActivity = () => {
    setActivityLimit((prev) => prev + 10);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
          <p className="text-slate-500 mt-1">Deep-dive analytics and operational intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
            <SelectTrigger id="insights-select-range" className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => fetchOverview()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" id="insights-tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="products" id="insights-tab-products">Products</TabsTrigger>
          <TabsTrigger value="orders" id="insights-tab-orders">Orders</TabsTrigger>
          <TabsTrigger value="activity" id="insights-tab-activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card id="insights-card-products">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                {loading.overview ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{metrics.totalProducts}</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                {loading.overview ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{metrics.totalOrders}</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <Users className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                {loading.overview ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold text-yellow-600">{metrics.pendingOrders}</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low-Stock Products</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                {loading.overview ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold text-orange-600">{products.filter((p) => p.status === 'LOW_STOCK').length}</div>}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Orders Over Time</CardTitle>
              <CardDescription>Daily order volume for selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.overview ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={orderTrend} id="insights-chart-orders">
                    <defs>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorOrders)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6 mt-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                id="insights-input-product-search"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={productStatus} onValueChange={setProductStatus}>
              <SelectTrigger id="insights-select-product-status" className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <Select value={productCategory} onValueChange={setProductCategory}>
              <SelectTrigger id="insights-select-product-category" className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
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
            <Button variant="outline" size="icon" onClick={fetchProducts}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Product Grid */}
          {loading.products ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p>No products found</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleProductClick(product.id)}
                  id={`insights-card-product-${product.id}`}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-slate-400" />
                        <span className="font-medium text-sm truncate max-w-[180px]">{product.name}</span>
                      </div>
                      {getTrendIcon(product.status)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Stock</span>
                        <span>{product.quantity} units</span>
                      </div>
                      <Progress value={getStockPercentage(product.quantity)} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <Badge
                        variant={
                          product.status === 'ACTIVE' ? 'default' :
                          product.status === 'LOW_STOCK' ? 'secondary' : 'destructive'
                        }
                        className="text-xs"
                      >
                        {product.status.replace('_', ' ')}
                      </Badge>
                      <span className="font-semibold">${product.price.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                id="insights-input-order-search"
                placeholder="Search orders..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={orderStatus} onValueChange={setOrderStatus}>
              <SelectTrigger id="insights-select-order-status" className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchOrders}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading.orders ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
                        onClick={() => handleExpandOrder(order.id)}
                        id={`insights-row-order-${order.id}`}
                      >
                        <TableCell>
                          {expandedOrderId === order.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">#{order.id.slice(-6)}</TableCell>
                        <TableCell className="text-sm">{order.productName || '-'}</TableCell>
                        <TableCell className="text-sm">{order.requesterName || '-'}</TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === 'APPROVED' ? 'default' :
                              order.status === 'PENDING' ? 'secondary' :
                              order.status === 'REJECTED' ? 'destructive' : 'outline'
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {formatRelativeTime(order.createdAt)}
                        </TableCell>
                      </TableRow>
                      {expandedOrderId === order.id && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-slate-50 dark:bg-slate-900 p-4">
                            {orderDetailLoading ? (
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-4 w-1/3" />
                              </div>
                            ) : orderDetail ? (
                              <div className="space-y-2 text-sm">
                                <p><span className="text-slate-500">Full Order ID:</span> {orderDetail.id}</p>
                                <p><span className="text-slate-500">Product:</span> {orderDetail.product?.name || orderDetail.productName}</p>
                                <p><span className="text-slate-500">Quantity:</span> {orderDetail.quantity}</p>
                                <p><span className="text-slate-500">Status:</span> {orderDetail.status}</p>
                                <p><span className="text-slate-500">Created:</span> {new Date(orderDetail.createdAt).toLocaleString()}</p>
                                {orderDetail.approvedAt && (
                                  <p><span className="text-slate-500">Approved:</span> {new Date(orderDetail.approvedAt).toLocaleString()}</p>
                                )}
                              </div>
                            ) : (
                              <p className="text-slate-500">Unable to load details</p>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6 mt-6">
          <div className="flex flex-wrap gap-2">
            {['ALL', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'].map((type) => (
              <Button
                key={type}
                variant={activityFilter === type ? 'default' : 'outline'}
                size="sm"
                className="text-xs rounded-full"
                onClick={() => setActivityFilter(type)}
                id={`insights-chip-activity-${type.toLowerCase()}`}
              >
                {type === 'ALL' ? 'All' : type.charAt(0) + type.slice(1).toLowerCase()}
              </Button>
            ))}
          </div>

          {loading.activity ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredActivity.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Activity className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p>No activity found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivity.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-4 rounded-lg border bg-white dark:bg-slate-950"
                  id={`insights-activity-${log.id}`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {log.username} {log.actionType.toLowerCase()}d {log.productName ? `"${log.productName}"` : ''}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{formatRelativeTime(log.createdAt)}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {log.actionType}
                  </Badge>
                </div>
              ))}
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={loadMoreActivity} id="insights-button-load-more">
                  Load more
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <InsightsProductDrawer
        productId={selectedProductId}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedProductId(null);
        }}
      />
    </div>
  );
};
