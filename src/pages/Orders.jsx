import { useState, useEffect } from 'react';
import { Search, Eye, X, MapPin, CreditCard, Package, User, Phone, ChevronDown } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import './Orders.css';

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Packed', 'Ready For Dispatch', 'Out For Delivery', 'Delivered', 'Cancelled'];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterPayment) params.set('paymentStatus', filterPayment);
      const response = await api.get(`/admin/orders?${params.toString()}`);
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
  }, [filterStatus, filterPayment]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(order =>
        order._id === orderId ? { ...order, orderStatus: newStatus } : order
      ));
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus }));
      }
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update status', error);
      toast.error('Error updating order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getOrderStatusClass = (status) => {
    switch (status) {
      case 'Delivered': return 'status-success';
      case 'Cancelled': return 'status-danger';
      case 'Ready For Dispatch':
      case 'Out For Delivery': return 'status-info';
      case 'Confirmed':
      case 'Packed': return 'status-blue';
      default: return 'status-warning';
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case 'Paid': return 'pay-success';
      case 'Failed': return 'pay-danger';
      case 'Refunded': return 'pay-info';
      default: return 'pay-warning';
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    const parts = [
      address.houseNo,
      address.area,
      address.landmark,
      address.city,
      address.state,
      address.pincode,
    ].filter(Boolean);
    return parts.join(', ');
  };

  const filteredOrders = orders.filter(order => {
    const term = searchTerm.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(term) ||
      order._id?.toLowerCase().includes(term) ||
      order.user?.name?.toLowerCase().includes(term) ||
      order.user?.phone?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="orders-container p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-muted">Manage and track customer orders. <strong>{orders.length}</strong> total orders.</p>
        </div>
        <button className="refresh-btn" onClick={fetchOrders}>↻ Refresh</button>
      </div>

      {/* Controls */}
      <div className="orders-controls glass mb-6">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by Order No., Customer Name, Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Order Status</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="filter-select"
          >
            <option value="">All Payment Status</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container glass">
        {loading ? (
          <div className="p-8 text-center text-muted">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-muted">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Order Status</th>
                  <th>Total</th>
                  <th>Address</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order._id} className={updatingId === order._id ? 'updating-row' : ''}>
                    <td className="font-medium text-accent font-mono text-sm">
                      {order.orderNumber || order._id?.substring(0, 12) + '...'}
                    </td>
                    <td>
                      <div className="customer-cell">
                        <span className="font-semibold">{order.user?.name || 'Unknown'}</span>
                        <span className="text-muted text-xs">{order.user?.phone || ''}</span>
                      </div>
                    </td>
                    <td className="text-sm">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      }) : 'N/A'}
                    </td>
                    <td>
                      <span className={`pay-badge ${getPaymentStatusClass(order.paymentStatus)}`}>
                        {order.paymentStatus || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div className="status-select-wrapper">
                        <select
                          className={`status-select ${getOrderStatusClass(order.orderStatus)}`}
                          value={order.orderStatus || 'Pending'}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={updatingId === order._id}
                        >
                          {ORDER_STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <ChevronDown size={12} className="select-chevron" />
                      </div>
                    </td>
                    <td className="font-semibold">₹{order.totalAmount?.toLocaleString('en-IN') || 0}</td>
                    <td className="address-cell">
                      {order.address ? (
                        <span className="address-snippet" title={formatAddress(order.address)}>
                          <MapPin size={12} />
                          {order.address.city}, {order.address.pincode}
                        </span>
                      ) : (
                        <span className="text-muted text-xs">N/A</span>
                      )}
                    </td>
                    <td className="text-right">
                      <button
                        className="action-btn text-blue-400 hover:bg-blue-400/10"
                        title="View Details"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal glass" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="font-bold text-lg">Order Details</h2>
                <span className="text-muted text-sm font-mono">{selectedOrder.orderNumber}</span>
              </div>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Status Badges */}
              <div className="modal-badges">
                <span className={`pay-badge ${getPaymentStatusClass(selectedOrder.paymentStatus)}`}>
                  💳 Payment: {selectedOrder.paymentStatus || 'Pending'}
                </span>
                <span className={`status-badge-lg ${getOrderStatusClass(selectedOrder.orderStatus)}`}>
                  📦 {selectedOrder.orderStatus || 'Pending'}
                </span>
              </div>

              {/* Customer Info */}
              <div className="modal-section">
                <h3><User size={14} /> Customer Information</h3>
                <div className="info-grid">
                  <div><span className="label">Name</span><span>{selectedOrder.user?.name || 'N/A'}</span></div>
                  <div><span className="label">Phone</span><span>{selectedOrder.user?.phone || 'N/A'}</span></div>
                  <div><span className="label">Email</span><span>{selectedOrder.user?.email || 'N/A'}</span></div>
                  <div><span className="label">Order Date</span><span>
                    {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('en-IN') : 'N/A'}
                  </span></div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="modal-section">
                <h3><MapPin size={14} /> Delivery Address</h3>
                {selectedOrder.address ? (
                  <div className="address-box">
                    <div className="address-name">
                      <strong>{selectedOrder.address.name}</strong>
                      {selectedOrder.address.mobile && (
                        <span className="flex items-center gap-1"><Phone size={12} /> {selectedOrder.address.mobile}</span>
                      )}
                    </div>
                    <p>
                      {selectedOrder.address.houseNo && `${selectedOrder.address.houseNo}, `}
                      {selectedOrder.address.area && `${selectedOrder.address.area}, `}
                      {selectedOrder.address.landmark && `Near ${selectedOrder.address.landmark}, `}
                    </p>
                    <p>
                      {selectedOrder.address.city}, {selectedOrder.address.state} — {selectedOrder.address.pincode}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted">No address on record.</p>
                )}
              </div>

              {/* Order Items */}
              <div className="modal-section">
                <h3><Package size={14} /> Ordered Items</h3>
                <div className="items-list">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={item._id || idx} className="order-item-row">
                      <div className="item-img">
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <Package size={16} />
                        )}
                      </div>
                      <div className="item-info">
                        <span className="font-semibold">{item.name || 'Product'}</span>
                        <span className="text-muted text-xs">
                          {item.size && `Size: ${item.size}`}{item.color && ` | Color: ${item.color}`}
                        </span>
                      </div>
                      <div className="item-qty">x{item.quantity}</div>
                      <div className="item-price">₹{(item.totalPrice || (item.price * item.quantity))?.toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="modal-section">
                <h3><CreditCard size={14} /> Price Breakdown</h3>
                <div className="price-breakdown">
                  <div><span>Subtotal</span><span>₹{selectedOrder.subtotal?.toLocaleString('en-IN') || 0}</span></div>
                  {selectedOrder.discount > 0 && (
                    <div className="discount-row"><span>Discount ({selectedOrder.couponCode})</span><span>-₹{selectedOrder.discount?.toLocaleString('en-IN')}</span></div>
                  )}
                  {selectedOrder.deliveryCharges > 0 && (
                    <div><span>Delivery Charges</span><span>₹{selectedOrder.deliveryCharges}</span></div>
                  )}
                  <div><span>GST</span><span>₹{selectedOrder.gst?.toFixed(2) || 0}</span></div>
                  <div className="total-row"><span>Total Amount</span><span>₹{selectedOrder.totalAmount?.toLocaleString('en-IN') || 0}</span></div>
                </div>
              </div>

              {/* Update Status */}
              <div className="modal-section">
                <h3>Update Order Status</h3>
                <div className="status-update-bar">
                  {ORDER_STATUSES.map(s => (
                    <button
                      key={s}
                      className={`status-pill ${selectedOrder.orderStatus === s ? 'active' : ''}`}
                      onClick={() => handleStatusChange(selectedOrder._id, s)}
                      disabled={updatingId === selectedOrder._id}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
