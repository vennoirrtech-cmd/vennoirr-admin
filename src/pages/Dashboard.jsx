import { TrendingUp, ArrowRight, Loader2, AlertCircle, ShoppingBag, Box, Activity, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const fetchDashboardData = async () => {
  const [statsRes, ordersRes, graphRes, topProductsRes] = await Promise.all([
    api.get('/admin/dashboard/stats'),
    api.get('/admin/dashboard/recent-orders'),
    api.get('/admin/dashboard/sales-graph'),
    api.get('/admin/dashboard/top-products?limit=5'),
  ]);
  return {
    stats: statsRes.data?.data || null,
    recentOrders: ordersRes.data?.data || [],
    salesGraph: graphRes.data?.data || [],
    topProducts: topProductsRes.data?.data || [],
  };
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-data-v2'],
    queryFn: fetchDashboardData,
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-[var(--text-secondary)] gap-4">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--ink)]" />
        <p className="text-[14px]">Loading Command Center...</p>
      </div>
    );
  }

  const { stats, recentOrders, salesGraph, topProducts } = data || {};
  const overview = stats?.overview || {};
  const inventory = stats?.inventoryAlerts || {};
  const orders = stats?.orderBreakdown || {};

  const maxSales = Math.max(...(salesGraph || []).map(d => d.sales), 1);

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
      case 'PAID':
        return 'bg-[var(--success)]/10 text-[var(--success)]';
      case 'PENDING':
      case 'PROCESSING':
        return 'bg-[var(--warning)]/10 text-[var(--warning)]';
      case 'CANCELLED':
      case 'FAILED':
        return 'bg-[var(--error)]/10 text-[var(--error)]';
      default:
        return 'bg-[var(--info)]/10 text-[var(--info)]';
    }
  };

  // Determine actions needed
  const totalActionOrders = (orders.pendingOrders || 0) + (orders.processingOrders || 0);
  const outOfStock = inventory.outOfStock || 0;
  const lowStock = inventory.lowStock || 0;
  // TODO: Add dynamic refund checks when Order logic is upgraded in Phase 4
  const pendingRefunds = 0; 
  // TODO: Add dynamic review checks when Reviews logic is upgraded in Phase 9
  const pendingReviews = 0; 

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="w-full max-w-[1200px] mx-auto pb-12">
      
      {/* HEADER SECTION */}
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-[var(--ink)] tracking-tight">VENNOIRR</h1>
        <p className="text-[14px] text-[var(--text-primary)] mt-1 font-medium">{greeting} 👋</p>
      </div>

      {/* MACRO STATS (Revenue, Orders, Customers, AOV) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--surface)] border border-[var(--border)] p-5">
          <div className="flex items-center gap-2 mb-3 text-[var(--text-secondary)]">
            <DollarSign size={16} />
            <h3 className="text-[12px] font-semibold uppercase tracking-wider">Revenue</h3>
          </div>
          <div className="text-[24px] font-semibold text-[var(--ink)] table-num">
            ₹{(overview.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
        </div>
        
        <div className="bg-[var(--surface)] border border-[var(--border)] p-5">
          <div className="flex items-center gap-2 mb-3 text-[var(--text-secondary)]">
            <ShoppingBag size={16} />
            <h3 className="text-[12px] font-semibold uppercase tracking-wider">Orders</h3>
          </div>
          <div className="text-[24px] font-semibold text-[var(--ink)] table-num">
            {(overview.totalOrders || 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] p-5">
          <div className="flex items-center gap-2 mb-3 text-[var(--text-secondary)]">
            <Activity size={16} />
            <h3 className="text-[12px] font-semibold uppercase tracking-wider">Customers</h3>
          </div>
          <div className="text-[24px] font-semibold text-[var(--ink)] table-num">
            {(overview.totalCustomers || 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] p-5">
          <div className="flex items-center gap-2 mb-3 text-[var(--text-secondary)]">
            <TrendingUp size={16} />
            <h3 className="text-[12px] font-semibold uppercase tracking-wider">Avg Order</h3>
          </div>
          <div className="text-[24px] font-semibold text-[var(--ink)] table-num">
            ₹{Math.round(overview.averageOrderValue || 0).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* LEFT COLUMN: ACTIONS & TOP PRODUCTS */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* ACTION REQUIRED MODULE */}
          <div className="bg-[var(--surface)] border-2 border-[var(--ink)] shadow-[4px_4px_0_0_var(--ink)] p-5">
            <h2 className="text-[14px] font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-2 mb-4">
              <AlertCircle size={16} /> Action Required
            </h2>
            <div className="space-y-1">
              
              <button 
                onClick={() => navigate('/store/orders')}
                className={`w-full flex items-center justify-between p-3 border hover:border-[var(--ink)] transition-colors text-left ${totalActionOrders > 0 ? 'bg-[var(--error)]/10 border-transparent text-[var(--error)]' : 'bg-[var(--surface-muted)] border-transparent text-[var(--text-muted)]'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${totalActionOrders > 0 ? 'bg-[var(--error)]' : 'bg-transparent border border-current'}`} />
                  <span className="text-[14px] font-semibold">{totalActionOrders} orders need processing</span>
                </div>
                <ArrowRight size={16} />
              </button>

              <button 
                onClick={() => navigate('/store/products')}
                className={`w-full flex items-center justify-between p-3 border hover:border-[var(--ink)] transition-colors text-left ${outOfStock > 0 ? 'bg-[var(--error)]/10 border-transparent text-[var(--error)]' : 'bg-[var(--surface-muted)] border-transparent text-[var(--text-muted)]'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${outOfStock > 0 ? 'bg-[var(--error)]' : 'bg-transparent border border-current'}`} />
                  <span className="text-[14px] font-semibold">{outOfStock} products out of stock</span>
                </div>
                <ArrowRight size={16} />
              </button>

              <button 
                onClick={() => navigate('/store/products')}
                className={`w-full flex items-center justify-between p-3 border hover:border-[var(--ink)] transition-colors text-left ${lowStock > 0 ? 'bg-[var(--warning)]/10 border-transparent text-[var(--warning)]' : 'bg-[var(--surface-muted)] border-transparent text-[var(--text-muted)]'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${lowStock > 0 ? 'bg-[var(--warning)]' : 'bg-transparent border border-current'}`} />
                  <span className="text-[14px] font-semibold">{lowStock} products low stock</span>
                </div>
                <ArrowRight size={16} />
              </button>

              <button 
                onClick={() => undefined}
                className={`w-full flex items-center justify-between p-3 border transition-colors text-left bg-[var(--surface-muted)] border-transparent text-[var(--text-muted)]`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full bg-transparent border border-current`} />
                  <span className="text-[14px] font-semibold">{pendingRefunds} refunds pending</span>
                </div>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* TOP PRODUCTS MODULE */}
          <div className="bg-[var(--surface)] border border-[var(--border)] p-5">
            <h2 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-5">
              Top Products
            </h2>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-bold text-[var(--text-muted)] w-4 table-num">{index + 1}.</span>
                    <span className="text-[14px] font-medium text-[var(--ink)] truncate max-w-[150px]">{product.name}</span>
                  </div>
                  <span className="text-[14px] font-semibold table-num text-[var(--text-primary)]">
                    {product.soldCount || 0} sold
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: GRAPH & RECENT ORDERS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* RECENT ORDERS TABLE */}
          <div className="bg-[var(--surface)] border border-[var(--border)]">
            <div className="flex justify-between items-center p-5 border-b border-[var(--border)]">
              <h2 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Recent Orders
              </h2>
              <button 
                onClick={() => navigate('/store/orders')}
                className="text-[12px] font-semibold text-[var(--ink)] hover:underline"
              >
                View all
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {recentOrders.slice(0, 5).map((order) => (
                    <tr key={order._id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-muted)] transition-colors">
                      <td className="py-4 px-5 text-[14px] font-medium text-[var(--ink)]">
                        #{order.orderNumber}
                      </td>
                      <td className="py-4 px-5 text-[14px] text-[var(--ink)] truncate max-w-[120px]">
                        {order.user?.name || 'Guest'}
                      </td>
                      <td className="py-4 px-5 text-[14px] font-semibold table-num">
                        ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-5 text-right w-[100px]">
                        <span className={`inline-flex items-center px-2 py-1 rounded-sm text-[11px] font-semibold uppercase tracking-wide ${getStatusBadge(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-[13px] text-[var(--text-muted)]">
                        No recent orders
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* DYNAMIC SALES CHART */}
          <div className="bg-[var(--surface)] border border-[var(--border)] p-5">
            <h2 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-8">
              Sales (Last 6 Months)
            </h2>
            <div className="h-[280px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesGraph} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="month" 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => value.substring(0, 3).toUpperCase()}
                    tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'var(--surface-muted)' }}
                    contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}
                    formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Sales']}
                    labelStyle={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}
                  />
                  <Bar 
                    dataKey="sales" 
                    fill="var(--ink)" 
                    radius={[4, 4, 0, 0]} 
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Dashboard;
