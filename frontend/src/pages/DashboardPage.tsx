import React, { useState, useEffect } from 'react';
import { dashboardApi, DashboardMetrics, StatusCount, UserActivity, ActivityLog } from '../services/graphql';
import { orderApi, userInventoryApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { RefreshCw, Package, CheckCircle, AlertCircle, XCircle, TrendingUp, ShoppingCart, Clock, DollarSign, Box } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AdminOrderStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

interface UserStats {
  pendingOrders: number;
  totalOrders: number;
  totalSpend: number;
  inventoryItems: number;
  inventoryQuantity: number;
}

export const DashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);

  // Admin State
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [statusData, setStatusData] = useState<StatusCount[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [adminOrderStats, setAdminOrderStats] = useState<AdminOrderStats | null>(null);

  // User State
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        await fetchAdminData();
      } else {
        await fetchUserData();
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    const [metricsData, statusCounts, activityByUser, recentLogs, orders] = await Promise.all([
      dashboardApi.getDashboardMetrics(),
      dashboardApi.getProductsByStatus(),
      dashboardApi.getActivityByUser(7),
      dashboardApi.getRecentActivity(10),
      orderApi.getAllOrders(),
    ]);

    setMetrics(metricsData);
    setStatusData(statusCounts);
    setUserActivity(activityByUser);
    setRecentActivity(recentLogs);

    // Calculate admin order stats
    const stats = orders.reduce(
      (acc: AdminOrderStats, order: any) => {
        acc.total++;
        if (order.status === 'PENDING') acc.pending++;
        else if (order.status === 'APPROVED') acc.approved++;
        else if (order.status === 'REJECTED') acc.rejected++;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0, total: 0 }
    );
    setAdminOrderStats(stats);
  };

  const fetchUserData = async () => {
    const [myOrders, myInventory] = await Promise.all([
      orderApi.getMyOrders(),
      userInventoryApi.getMyInventory(),
    ]);

    const pendingOrders = myOrders.filter((o: any) => o.status === 'PENDING').length;
    const totalSpend = myOrders.reduce((sum: number, o: any) => {
      return sum + (o.product?.price || 0) * o.quantity;
    }, 0);

    const inventoryQuantity = myInventory.reduce((sum: number, i: any) => sum + i.quantity, 0);

    setUserStats({
      pendingOrders,
      totalOrders: myOrders.length,
      totalSpend,
      inventoryItems: myInventory.length,
      inventoryQuantity,
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, [isAdmin]);

  const COLORS = {
    ACTIVE: '#22c55e',
    LOW_STOCK: '#eab308',
    OUT_OF_STOCK: '#ef4444',
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getActionText = (log: ActivityLog) => {
    const username = log.username;
    const productName = log.productName || 'a product';

    switch (log.actionType) {
      case 'CREATE':
        return `${username} added "${productName}"`;
      case 'UPDATE':
        return `${username} updated "${productName}"`;
      case 'DELETE':
        return `${username} deleted "${productName}"`;
      case 'STATE_CHANGE':
        return `${username} changed status of "${productName}"`;
      case 'LOGIN':
        return `${username} logged in`;
      case 'LOGOUT':
        return `${username} logged out`;
      default:
        return `${username} performed an action`;
    }
  };

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Product Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card id="dashboard-card-total">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{metrics?.totalProducts || 0}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold text-green-600">{metrics?.activeProducts || 0}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold text-yellow-600">{metrics?.lowStockProducts || 0}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold text-red-600">{metrics?.outOfStockProducts || 0}</div>}
          </CardContent>
        </Card>
      </div>

      {/* Order Summary Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Order Overview</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{adminOrderStats?.total || 0}</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold text-yellow-600">{adminOrderStats?.pending || 0}</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold text-green-600">{adminOrderStats?.approved || 0}</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold text-red-600">{adminOrderStats?.rejected || 0}</div>}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Products by Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Products by Status</CardTitle>
            <CardDescription>Distribution of product inventory status</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart id="dashboard-chart-status">
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status.replace('_', ' ')}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Products Added Today */}
        <Card>
          <CardHeader>
            <CardTitle>Products Added Today</CardTitle>
            <CardDescription>New products added to inventory</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-center">
                  <TrendingUp className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <div className="text-6xl font-bold text-green-600">{metrics?.productsAddedToday || 0}</div>
                  <p className="text-slate-500 mt-2">products added today</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Activity by User */}
        <Card>
          <CardHeader>
            <CardTitle>Activity by User (Last 7 Days)</CardTitle>
            <CardDescription>User actions and contributions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userActivity} id="dashboard-chart-users">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="username" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="actionCount" fill="#3b82f6" name="Actions" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system actions and changes</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3" id="dashboard-list-activity">
                {recentActivity.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No recent activity</p>
                ) : (
                  recentActivity.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{getActionText(log)}</p>
                        <p className="text-xs text-slate-500 mt-1">{formatRelativeTime(log.createdAt)}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {log.actionType}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderUserDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{userStats?.totalOrders || 0}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold text-yellow-600">{userStats?.pendingOrders || 0}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold text-green-600">${userStats?.totalSpend.toFixed(2) || '0.00'}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
            <Box className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-20" /> : (
              <div className="flex items-end gap-2">
                <div className="text-2xl font-bold text-blue-600">{userStats?.inventoryItems || 0}</div>
                <div className="text-sm text-slate-500 mb-1">({userStats?.inventoryQuantity || 0} units)</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome back, {user?.username}!</CardTitle>
          <CardDescription>
            This is your personal dashboard. Here you can track your orders and manage your inventory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={() => window.location.href = '/my-orders'}>View My Orders</Button>
            <Button variant="outline" onClick={() => window.location.href = '/my-inventory'}>Manage Inventory</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            {isAdmin ? 'Real-time inventory analytics and metrics' : 'Your personal overview'}
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchDashboardData}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {isAdmin ? renderAdminDashboard() : renderUserDashboard()}
    </div>
  );
};
