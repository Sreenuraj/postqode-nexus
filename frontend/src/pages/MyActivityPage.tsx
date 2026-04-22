import React, { useState, useEffect, useMemo } from 'react';
import { orderApi, userInventoryApi } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { TimelineEntry } from '../components/TimelineEntry';
import { SavedViewsChips } from '../components/SavedViewsChips';
import { useInterval } from '../utils/useInterval';
import {
  RefreshCw,
  Search,
  ShoppingCart,
  Box,
  DollarSign,
  Clock,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';

type FilterType = 'ALL' | 'ORDERS' | 'INVENTORY';

interface TimelineItem {
  id: string;
  type: 'order' | 'inventory';
  title: string;
  subtitle: string;
  status: string;
  createdAt: string;
  amount?: number;
}

export const MyActivityPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [typeFilter, setTypeFilter] = useState<FilterType>('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('ALL');
  const [tick, setTick] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [myOrders, myInventory] = await Promise.all([
        orderApi.getMyOrders(),
        userInventoryApi.getMyInventory(),
      ]);

      const orderItems: TimelineItem[] = myOrders.map((o: any) => ({
        id: `order-${o.id}`,
        type: 'order',
        title: o.product?.name || o.productName || 'Unknown Product',
        subtitle: `Qty: ${o.quantity} • ${o.requesterName || 'You'}`,
        status: o.status,
        createdAt: o.createdAt,
        amount: (o.product?.price || 0) * o.quantity,
      }));

      const inventoryItems: TimelineItem[] = myInventory.map((i: any) => ({
        id: `inv-${i.id}`,
        type: 'inventory',
        title: i.name || i.product?.name || 'Unknown Item',
        subtitle: `Qty: ${i.quantity} • ${i.notes || 'No notes'}`,
        status: i.status || 'ACTIVE',
        createdAt: i.createdAt || i.updatedAt,
        amount: undefined,
      }));

      // Sort reverse chronological
      const combined = [...orderItems, ...inventoryItems].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setTimeline(combined);
    } catch (error) {
      toast.error('Failed to load activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Live tick every 30s for relative time updates
  useInterval(() => {
    setTick((t) => t + 1);
  }, 30000);

  const filteredTimeline = useMemo(() => {
    let result = [...timeline];

    if (typeFilter !== 'ALL') {
      result = result.filter((item) =>
        typeFilter === 'ORDERS' ? item.type === 'order' : item.type === 'inventory'
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((item) => item.status === statusFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) => item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
      );
    }

    if (dateRange !== 'ALL') {
      const now = new Date();
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const cutoff = new Date(now.getTime() - days * 86400000);
      result = result.filter((item) => new Date(item.createdAt) >= cutoff);
    }

    return result;
  }, [timeline, typeFilter, statusFilter, search, dateRange, tick]);

  const summary = useMemo(() => {
    const orders = filteredTimeline.filter((i) => i.type === 'order');
    const pending = orders.filter((o) => o.status === 'PENDING').length;
    const totalSpend = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
    return {
      totalOrders: orders.length,
      pendingOrders: pending,
      totalSpend,
      inventoryItems: filteredTimeline.filter((i) => i.type === 'inventory').length,
    };
  }, [filteredTimeline]);

  const currentFilters = useMemo(
    () => ({ typeFilter, statusFilter, search, dateRange }),
    [typeFilter, statusFilter, search, dateRange]
  );

  const handleApplyView = (filters: Record<string, any>) => {
    setTypeFilter(filters.typeFilter || 'ALL');
    setStatusFilter(filters.statusFilter || 'ALL');
    setSearch(filters.search || '');
    setDateRange(filters.dateRange || 'ALL');
  };

  const handleCancelOrder = async (rawId: string) => {
    const orderId = rawId.replace('order-', '');
    try {
      await orderApi.cancelOrder(orderId);
      toast.success('Order cancelled');
      fetchData();
    } catch (error) {
      toast.error('Failed to cancel order');
      throw error;
    }
  };

  const handleConsumeItem = async (rawId: string) => {
    const invId = rawId.replace('inv-', '');
    try {
      await userInventoryApi.consumeItem(invId, 1);
      toast.success('Item consumed');
      fetchData();
    } catch (error) {
      toast.error('Failed to consume item');
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Activity</h1>
          <p className="text-slate-500 mt-1">Your personal timeline and saved views</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchData}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Saved Views */}
      <SavedViewsChips
        pageKey="my-activity"
        currentFilters={currentFilters}
        onApplyView={handleApplyView}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Timeline */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                id="my-activity-input-search"
                placeholder="Search activity..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as FilterType)}>
              <SelectTrigger id="my-activity-select-type" className="w-full sm:w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="ORDERS">Orders</SelectItem>
                <SelectItem value="INVENTORY">Inventory</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="my-activity-select-status" className="w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger id="my-activity-select-date" className="w-full sm:w-[140px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Time</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Timeline entries */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredTimeline.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border rounded-lg bg-white dark:bg-slate-950">
              <Activity className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p>No activity found</p>
              <p className="text-sm text-slate-400">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="py-2">
              {filteredTimeline.map((item) => (
                <TimelineEntry
                  key={item.id}
                  id={item.id}
                  type={item.type}
                  title={item.title}
                  subtitle={item.subtitle}
                  status={item.status}
                  createdAt={item.createdAt}
                  amount={item.amount}
                  onCancel={item.type === 'order' ? handleCancelOrder : undefined}
                  onConsume={item.type === 'inventory' ? handleConsumeItem : undefined}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Rail: Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Total Orders</span>
                </div>
                <span className="font-semibold">{summary.totalOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Pending</span>
                </div>
                <span className="font-semibold text-yellow-600">{summary.pendingOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Total Spend</span>
                </div>
                <span className="font-semibold text-green-600">${summary.totalSpend.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Box className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Inventory Items</span>
                </div>
                <span className="font-semibold">{summary.inventoryItems}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Order Success Rate</span>
                  <span>
                    {summary.totalOrders > 0
                      ? Math.round(
                          ((summary.totalOrders - summary.pendingOrders) / summary.totalOrders) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{
                      width: `${summary.totalOrders > 0 ? ((summary.totalOrders - summary.pendingOrders) / summary.totalOrders) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Avg. Order Value</span>
                  <span>
                    ${summary.totalOrders > 0 ? (summary.totalSpend / summary.totalOrders).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
