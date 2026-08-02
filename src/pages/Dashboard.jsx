import { useState, useEffect } from 'react';
import { TrendingUp, Package, Users, ShoppingCart } from 'lucide-react';
import { api } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard/stats');
        if (response.data?.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Fallback for mockup purposes if API is not fully running
        setStats({ totalSales: 245000, activeOrders: 15, totalProducts: 120, totalUsers: 3450 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Sales', value: `₹${stats?.totalSales?.toLocaleString() || 0}`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Active Orders', value: stats?.activeOrders || 0, icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Total Products', value: stats?.totalProducts || 0, icon: Package, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <div className="stats-grid">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="stat-card glass">
              <div className="stat-icon-wrapper">
                <Icon size={24} className="stat-icon" />
              </div>
              <div className="stat-info">
                <h3>{card.title}</h3>
                <p className="stat-value">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Sales Graph Placeholder */}
      <div className="chart-container glass mt-8">
        <h3>Sales Overview</h3>
        <div className="chart-placeholder">
          <p>Sales graph visualization would go here</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
