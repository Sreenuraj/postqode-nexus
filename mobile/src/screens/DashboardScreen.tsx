import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-chart-kit';
import { dashboardApi, DashboardMetrics, StatusCount, ActivityLog } from '../services/graphql';
import { getAllOrders, Order } from '../services/order';
import { useFocusEffect } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [statusData, setStatusData] = useState<StatusCount[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [orderStats, setOrderStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [metricsData, statusData, activityData, orders] = await Promise.all([
        dashboardApi.getDashboardMetrics(),
        dashboardApi.getProductsByStatus(),
        dashboardApi.getRecentActivity(),
        getAllOrders(),
      ]);
      setMetrics(metricsData);
      setStatusData(statusData);
      setRecentActivity(activityData);
      
      const pending = orders.filter(o => o.status === 'PENDING').length;
      const approved = orders.filter(o => o.status === 'APPROVED').length;
      const rejected = orders.filter(o => o.status === 'REJECTED').length;
      setOrderStats({ pending, approved, rejected });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getPieChartData = () => {
    const colors: Record<string, string> = {
      ACTIVE: '#dcfce7',
      LOW_STOCK: '#fef9c3',
      OUT_OF_STOCK: '#fee2e2',
    };

    return statusData.map((item) => ({
      name: item.status.replace('_', ' '),
      population: item.count,
      color: colors[item.status] || '#f1f5f9',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));
  };

  const chartConfig = {
    backgroundGradientFrom: '#1E2923',
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: '#08130D',
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.title}>Dashboard</Text>
        
        {/* Order Overview */}
        <Text style={styles.sectionTitle}>Order Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#ca8a04' }]}>{orderStats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#16a34a' }]}>{orderStats.approved}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#dc2626' }]}>{orderStats.rejected}</Text>
            <Text style={styles.statLabel}>Rejected</Text>
          </View>
        </View>

        {/* Product Overview */}
        <Text style={styles.sectionTitle}>Product Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{metrics?.totalProducts || 0}</Text>
            <Text style={styles.statLabel}>Total Products</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{metrics?.productsAddedToday || 0}</Text>
            <Text style={styles.statLabel}>Added Today</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#16a34a' }]}>{metrics?.activeProducts || 0}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#ca8a04' }]}>{metrics?.lowStockProducts || 0}</Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#dc2626' }]}>{metrics?.outOfStockProducts || 0}</Text>
            <Text style={styles.statLabel}>Out of Stock</Text>
          </View>
        </View>

        {/* Pie Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Product Status</Text>
          {statusData.length > 0 ? (
            <PieChart
              data={getPieChartData()}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              accessor={'population'}
              backgroundColor={'transparent'}
              paddingLeft={'15'}
              center={[10, 0]}
              absolute
            />
          ) : (
            <Text style={styles.emptyText}>No data available</Text>
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          {recentActivity.length > 0 ? (
            recentActivity.map((log) => (
              <View key={log.id} style={styles.activityItem}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityUser}>{log.username}</Text>
                  <Text style={styles.activityTime}>
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </Text>
                </View>
                <Text style={styles.activityText}>
                  {log.actionType.toLowerCase()} {log.productName ? `"${log.productName}"` : ''}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No recent activity</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    padding: 16,
  },
  activityItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  activityUser: {
    fontWeight: '600',
    color: '#0f172a',
  },
  activityTime: {
    fontSize: 12,
    color: '#64748b',
  },
  activityText: {
    color: '#334155',
  },
});
