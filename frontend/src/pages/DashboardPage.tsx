import React, { useState, useEffect } from 'react';
import { dashboardApi, DashboardMetrics, StatusCount, UserActivity, ActivityLog } from '../services/graphql';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { RefreshCw, Package, CheckCircle, AlertCircle, XCircle, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [statusData, setStatusData] = useState<StatusCount[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [metricsData, statusCounts, activityByUser, recentLogs] = await Promise.all([
        dashboardApi.getDashboardMetrics(),
        dashboardApi.getProductsByStatus(),
        dashboardApi.getActivityByUser(7),
        dashboardApi.getRecentActivity(10),
      ]);

      setMetrics(metricsData);
      setStatusData(statusCounts);
      setUserActivity(activityByUser);
      setRecentActivity(recentLogs);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Real-time inventory analytics and metrics</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchDashboardData}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card id="dashboard-card-total">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{metrics?.totalProducts || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{metrics?.activeProducts || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-yellow-600">{metrics?.lowStockProducts || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-red-600">{metrics?.outOfStockProducts || 0}</div>
            )}
          </CardContent>
        </Card>
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
};
