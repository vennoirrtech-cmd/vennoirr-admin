import { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import { api } from '../services/api';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/orders');
      if (response.data?.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Error updating status');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Delivered': return 'status-success';
      case 'Cancelled': return 'status-danger';
      case 'Ready For Dispatch': return 'status-info';
      default: return 'status-warning';
    }
  };

  return (
    <div className="orders-container p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted">Manage and track customer orders.</p>
        </div>
      </div>

      <div className="orders-controls glass mb-6">
        <div className="search-box">
          <Search size={18} />
          <input type="text" placeholder="Search by Order ID or Customer Name..." />
        </div>
      </div>

      <div className="table-container glass">
        {loading ? (
          <div className="p-8 text-center text-muted">Loading orders...</div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td className="font-medium text-accent">{order._id}</td>
                  <td>{order.customerName}</td>
                  <td>{new Date(order.date).toLocaleDateString()}</td>
                  <td>
                    <select 
                      className={`status-select ${getStatusClass(order.status)}`}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Packed">Packed</option>
                      <option value="Ready For Dispatch">Ready For Dispatch</option>
                      <option value="Out For Delivery">Out For Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="font-semibold">₹{order.total}</td>
                  <td className="text-right">
                    <button className="action-btn text-blue-400 hover:bg-blue-400/10" title="View Details">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Orders;
