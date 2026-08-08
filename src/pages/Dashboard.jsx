import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Package, Users, ShoppingCart, RefreshCw, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { api } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesGraph, setSalesGraph] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [statsRes, ordersRes, graphRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/dashboard/recent-orders'),
        api.get('/admin/dashboard/sales-graph'),
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (ordersRes.data?.success) setRecentOrders(ordersRes.data.data || []);
      if (graphRes.data?.success) setSalesGraph(graphRes.data.data || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => fetchAll(true), 60000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const overview = stats?.overview || {};
  const inventory = stats?.inventoryAlerts || {};
  const orderBreakdown = stats?.orderBreakdown || {};

  const statCards = [
    {
      title: 'Total Sales',
      value: `₹${(overview.totalSales || 0).toLocaleString('en-IN')}`,
      subtext: `Today: ₹${(overview.todaySales || 0).toLocaleString('en-IN')}`,
      icon: TrendingUp,
      colorClass: 'stat-green',
    },
    {
      title: 'Active Orders',
      value: (overview.totalOrders || 0),
      subtext: `${overview.todayOrders || 0} orders today`,
      icon: ShoppingCart,
      colorClass: 'stat-blue',
    },
    {
      title: 'Total Products',
      value: (overview.totalProducts || 0),
      subtext: `${inventory.outOfStock || 0} out of stock`,
      icon: Package,
      colorClass: 'stat-purple',
    },
    {
      title: 'Total Users',
      value: (overview.totalCustomers || 0),
      subtext: 'Registered customers',
      icon: Users,
      colorClass: 'stat-orange',
    },
  ];

  const maxSales = Math.max(...salesGraph.map(d => d.sales), 1);

  const getStatusBadgeClass = (status) => {
    const map = {
      Delivered: 'badge-delivered',
      Pending: 'badge-pending',
      Processing: 'badge-processing',
      Cancelled: 'badge-cancelled',
      Shipped: 'badge-shipped',
    };
    return map[status] || 'badge-pending';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          {lastUpdated && (
            <p className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          className={`btn btn-outline refresh-btn ${refreshing ? 'refreshing' : ''}`}
          onClick={() => fetchAll(true)}
          disabled={refreshing}
        >
          <RefreshCw size={15} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`stat-card glass ${card.colorClass}`}>
              <div className="stat-icon-wrapper">
                <Icon size={22} />
              </div>
              <div className="stat-info">
                <p className="stat-title">{card.title}</p>
                <p className="stat-value">{card.value}</p>
                <p className="stat-sub">{card.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inventory Alerts */}
      {(inventory.outOfStock > 0 || inventory.lowStock > 0) && (
        <div className="alert-row">
          {inventory.outOfStock > 0 && (
            <div className="alert-pill alert-danger">
              <AlertTriangle size={14} />
              <span>{inventory.outOfStock} products out of stock</span>
            </div>
          )}
          {inventory.lowStock > 0 && (
            <div className="alert-pill alert-warning">
              <AlertTriangle size={14} />
              <span>{inventory.lowStock} products with low stock (≤10)</span>
            </div>
          )}
        </div>
      )}

      {/* Middle Row */}
      <div className="dashboard-mid-row">
        {/* Sales Chart */}
        <div className="chart-container glass">
          <div className="chart-header">
            <h3>Sales Overview</h3>
            <span className="chart-subtitle">Last 6 months</span>
          </div>
          {salesGraph.length === 0 ? (
            <div className="chart-empty">
              <p>No sales data yet</p>
            </div>
          ) : (
            <div className="bar-chart">
              {salesGraph.map((item, i) => {
                const heightPct = (item.sales / maxSales) * 100;
                return (
                  <div key={i} className="bar-group">
                    <div className="bar-tooltip">
                      ₹{item.sales.toLocaleString('en-IN')}<br />
                      {item.orders} orders
                    </div>
                    <div
                      className="bar"
                      style={{ height: `${Math.max(heightPct, 4)}%` }}
                    />
                    <div className="bar-label">{item.month}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Breakdown */}
        <div className="order-breakdown glass">
          <h3>Order Status</h3>
          <div className="breakdown-list">
            {[
              { label: 'Pending', value: orderBreakdown.pendingOrders || 0, color: '#f59e0b' },
              { label: 'Delivered', value: orderBreakdown.deliveredOrders || 0, color: '#10b981' },
              { label: 'Cancelled', value: orderBreakdown.cancelledOrders || 0, color: '#ef4444' },
            ].map((item) => {
              const total = (orderBreakdown.pendingOrders || 0) + (orderBreakdown.deliveredOrders || 0) + (orderBreakdown.cancelledOrders || 0);
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.label} className="breakdown-item">
                  <div className="breakdown-meta">
                    <span className="breakdown-dot" style={{ background: item.color }} />
                    <span className="breakdown-label">{item.label}</span>
                    <span className="breakdown-count">{item.value}</span>
                  </div>
                  <div className="breakdown-bar-bg">
                    <div
                      className="breakdown-bar"
                      style={{ width: `${pct}%`, background: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="recent-orders-container glass">
        <div className="section-header">
          <h3>Recent Orders</h3>
          <a href="/orders" className="view-all-link">
            View all <ArrowUpRight size={14} />
          </a>
        </div>
        {recentOrders.length === 0 ? (
          <p className="empty-state">No orders yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="order-num">#{order.orderNumber}</td>
                    <td>
                      <p className="customer-name">{order.user?.name || 'Guest'}</p>
                      <p className="customer-contact">{order.user?.phone || order.user?.email || '—'}</p>
                    </td>
                    <td>{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</td>
                    <td className="amount">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
