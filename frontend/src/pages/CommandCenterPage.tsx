import React, { useState, useEffect, useMemo } from 'react';
import { orderApi, productApi } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Checkbox } from '../components/ui/checkbox';
import { OrderQueueCard } from '../components/OrderQueueCard';
import { QuickQtyStepper } from '../components/QuickQtyStepper';
import { InsightsProductDrawer } from '../components/InsightsProductDrawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  MoreVertical,
  Eye,
  Ban,
  Loader2,
  Clock,
  CheckSquare,
} from 'lucide-react';

interface PendingOrder {
  id: string;
  requesterName: string;
  productName: string;
  quantity: number;
  createdAt: string;
  status: string;
}

interface WatchlistProduct {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  status: string;
  price: number;
}

export const CommandCenterPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [products, setProducts] = useState<WatchlistProduct[]>([]);
  const [productFilter, setProductFilter] = useState('ALL');
  const [productSearch, setProductSearch] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approvedToday: 0, rejectedToday: 0 });
  const [statsKey, setStatsKey] = useState(0);
  const [drawerProductId, setDrawerProductId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allOrders, allProducts] = await Promise.all([
        orderApi.getAllOrders(),
        productApi.getAll({ page: 0, pageSize: 100 }),
      ]);

      const pending = allOrders
        .filter((o: any) => o.status === 'PENDING')
        .map((o: any) => ({
          id: o.id,
          requesterName: o.requesterName || o.requester?.username || 'Unknown',
          productName: o.product?.name || o.productName || 'Unknown',
          quantity: o.quantity,
          createdAt: o.createdAt,
          status: o.status,
        }));

      setPendingOrders(pending);

      const prods = (allProducts.content || allProducts.items || []).map((p: any) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        quantity: p.quantity,
        status: p.status,
        price: p.price,
      }));
      setProducts(prods);

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const approvedToday = allOrders.filter(
        (o: any) => o.status === 'APPROVED' && o.updatedAt?.startsWith(today)
      ).length;
      const rejectedToday = allOrders.filter(
        (o: any) => o.status === 'REJECTED' && o.updatedAt?.startsWith(today)
      ).length;

      setStats({
        pending: pending.length,
        approvedToday,
        rejectedToday,
      });
      setStatsKey((k) => k + 1);
    } catch (error) {
      toast.error('Failed to load command center data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string) => {
    const order = pendingOrders.find((o) => o.id === id);
    if (!order) return;

    try {
      await orderApi.approveOrder(id);
      
      // Optimistic update
      setPendingOrders((prev) => prev.filter((o) => o.id !== id));
      setSelectedOrderIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setStats((s) => ({ ...s, pending: s.pending - 1, approvedToday: s.approvedToday + 1 }));
      setStatsKey((k) => k + 1);

      // 5-second undo toast with client-only revert
      toast.success('Order approved', {
        duration: 5000,
        action: {
          label: 'Undo',
          onClick: () => {
            // Client-only revert: restore order to pending list without API call
            setPendingOrders((prev) => {
              if (prev.some((o) => o.id === id)) return prev; // already restored
              return [...prev, order].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            });
            setStats((s) => ({ ...s, pending: s.pending + 1, approvedToday: s.approvedToday - 1 }));
            setStatsKey((k) => k + 1);
            toast.dismiss();
          },
        },
      });
    } catch (error) {
      toast.error('Failed to approve order');
      throw error;
    }
  };

  const handleReject = async (id: string) => {
    const order = pendingOrders.find((o) => o.id === id);
    if (!order) return;

    try {
      await orderApi.rejectOrder(id);
      
      // Optimistic update
      setPendingOrders((prev) => prev.filter((o) => o.id !== id));
      setSelectedOrderIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setStats((s) => ({ ...s, pending: s.pending - 1, rejectedToday: s.rejectedToday + 1 }));
      setStatsKey((k) => k + 1);

      // 5-second undo toast with client-only revert
      toast.success('Order rejected', {
        duration: 5000,
        action: {
          label: 'Undo',
          onClick: () => {
            // Client-only revert: restore order to pending list without API call
            setPendingOrders((prev) => {
              if (prev.some((o) => o.id === id)) return prev; // already restored
              return [...prev, order].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            });
            setStats((s) => ({ ...s, pending: s.pending + 1, rejectedToday: s.rejectedToday - 1 }));
            setStatsKey((k) => k + 1);
            toast.dismiss();
          },
        },
      });
    } catch (error) {
      toast.error('Failed to reject order');
      throw error;
    }
  };

  const handleBulkApprove = async () => {
    if (selectedOrderIds.size === 0) return;
    setBulkActionLoading(true);
    const ids = Array.from(selectedOrderIds);
    try {
      await Promise.all(ids.map((id) => orderApi.approveOrder(id)));
      toast.success(`Approved ${ids.length} orders`);
      setPendingOrders((prev) => prev.filter((o) => !selectedOrderIds.has(o.id)));
      setStats((s) => ({
        ...s,
        pending: s.pending - ids.length,
        approvedToday: s.approvedToday + ids.length,
      }));
      setStatsKey((k) => k + 1);
      setSelectedOrderIds(new Set());
    } catch (error) {
      toast.error('Some orders failed to approve');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedOrderIds.size === 0) return;
    setBulkActionLoading(true);
    const ids = Array.from(selectedOrderIds);
    try {
      await Promise.all(ids.map((id) => orderApi.rejectOrder(id)));
      toast.success(`Rejected ${ids.length} orders`);
      setPendingOrders((prev) => prev.filter((o) => !selectedOrderIds.has(o.id)));
      setStats((s) => ({
        ...s,
        pending: s.pending - ids.length,
        rejectedToday: s.rejectedToday + ids.length,
      }));
      setStatsKey((k) => k + 1);
      setSelectedOrderIds(new Set());
    } catch (error) {
      toast.error('Some orders failed to reject');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    await productApi.update(id, { quantity });
  };

  const handleMarkInactive = async (id: string) => {
    try {
      await productApi.updateStatus(id, 'OUT_OF_STOCK');
      toast.success('Product marked inactive');
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'OUT_OF_STOCK' } : p))
      );
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (productFilter !== 'ALL') {
      result = result.filter((p) => p.status === productFilter);
    }
    if (productSearch) {
      const q = productSearch.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    return result;
  }, [products, productFilter, productSearch]);

  const allSelected = pendingOrders.length > 0 && pendingOrders.every((o) => selectedOrderIds.has(o.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
          <p className="text-slate-500 mt-1">Triage orders and manage inventory in real-time</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchData}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Pending Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              Pending Queue
              <Badge variant="secondary">{pendingOrders.length}</Badge>
            </h2>
            {selectedOrderIds.size > 0 && (
              <div className="flex items-center gap-2 animate-in slide-in-from-right">
                <span className="text-sm text-slate-500">{selectedOrderIds.size} selected</span>
                <Button
                  size="sm"
                  variant="default"
                  disabled={bulkActionLoading}
                  onClick={handleBulkApprove}
                  id="command-center-button-bulk-approve"
                >
                  {bulkActionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckSquare className="h-4 w-4 mr-1" />}
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={bulkActionLoading}
                  onClick={handleBulkReject}
                  id="command-center-button-bulk-reject"
                >
                  Reject
                </Button>
              </div>
            )}
          </div>

          {pendingOrders.length > 0 && (
            <div className="flex items-center gap-2 px-1">
              <Checkbox
                id="command-center-checkbox-select-all"
                checked={allSelected}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedOrderIds(new Set(pendingOrders.map((o) => o.id)));
                  } else {
                    setSelectedOrderIds(new Set());
                  }
                }}
              />
              <label htmlFor="command-center-checkbox-select-all" className="text-sm text-slate-500 cursor-pointer">
                Select all
              </label>
            </div>
          )}

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))
            ) : pendingOrders.length === 0 ? (
              <div className="text-center py-12 text-slate-500 border rounded-lg bg-white dark:bg-slate-950">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-300" />
                <p>No pending orders</p>
                <p className="text-sm text-slate-400">All caught up!</p>
              </div>
            ) : (
              pendingOrders.map((order) => (
                <OrderQueueCard
                  key={order.id}
                  order={order}
                  selected={selectedOrderIds.has(order.id)}
                  onSelect={(checked) => toggleSelect(order.id, checked)}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))
            )}
          </div>
        </div>

        {/* Right: Product Watchlist */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-500" />
            Product Watchlist
          </h2>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sticky top-0 bg-slate-50 dark:bg-slate-900 py-2 z-10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                id="command-center-input-search"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger id="command-center-select-status" className="w-full sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-slate-500 border rounded-lg bg-white dark:bg-slate-950">
                <Search className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>No products match your filters</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-4 rounded-lg border bg-white dark:bg-slate-950 space-y-3"
                  id={`command-center-tile-${product.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{product.sku}</p>
                    </div>
                    <Badge
                      variant={
                        product.status === 'ACTIVE' ? 'default' :
                        product.status === 'LOW_STOCK' ? 'secondary' : 'destructive'
                      }
                    >
                      {product.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <QuickQtyStepper
                      productId={product.id}
                      initialValue={product.quantity}
                      onSave={handleUpdateQuantity}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setDrawerProductId(product.id);
                            setDrawerOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleMarkInactive(product.id)}
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Mark inactive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Stats Strip */}
      <div className="grid gap-4 md:grid-cols-3">
        <CardMetric
          key={`pending-${statsKey}`}
          label="Pending Orders"
          value={stats.pending}
          icon={<Clock className="h-4 w-4 text-yellow-500" />}
          color="text-yellow-600"
        />
        <CardMetric
          key={`approved-${statsKey}`}
          label="Approved Today"
          value={stats.approvedToday}
          icon={<CheckCircle className="h-4 w-4 text-green-500" />}
          color="text-green-600"
        />
        <CardMetric
          key={`rejected-${statsKey}`}
          label="Rejected Today"
          value={stats.rejectedToday}
          icon={<XCircle className="h-4 w-4 text-red-500" />}
          color="text-red-600"
        />
      </div>

      <InsightsProductDrawer
        productId={drawerProductId}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerProductId(null);
        }}
      />
    </div>
  );
};

const CardMetric: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ label, value, icon, color }) => (
  <div className="flex items-center justify-between p-4 rounded-lg border bg-white dark:bg-slate-950 transition-all">
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-2xl font-bold ${color} transition-all duration-500`}>{value}</p>
    </div>
    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
      {icon}
    </div>
  </div>
);
