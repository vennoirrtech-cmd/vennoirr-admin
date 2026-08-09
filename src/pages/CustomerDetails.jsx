import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, ShoppingBag } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import './CustomerDetails.css';

const CustomerDetails = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      // Fetch via search since direct ID lookup doesn't exist on this backend version
      const customerRes = await api.get(`/search/customers`);
      let foundCustomer = null;
      if (customerRes.data?.success) {
        foundCustomer = customerRes.data.data.find(c => c._id === id);
      } else {
        foundCustomer = customerRes.data?.find(c => c._id === id);
      }
      setCustomer(foundCustomer || null);
      
      // Then fetch their orders
      const ordersRes = await api.get(`/admin/orders/customer/${id}`);
      if (ordersRes.data?.success) {
        setOrders(ordersRes.data.data);
      } else {
        setOrders(ordersRes.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch customer details:', error);
      toast.error('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'delivered';
      case 'cancelled': return 'cancelled';
      case 'pending': return 'pending';
      case 'confirmed': return 'info';
      default: return 'info';
    }
  };

  if (loading) {
    return (
      <div className="customer-details-container p-6 w-full flex justify-center items-center h-[50vh]">
        <div className="text-muted">Loading customer details...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="customer-details-container p-6 w-full">
        <Link to="/customers" className="back-btn">
          <ArrowLeft size={16} /> Back to Customers
        </Link>
        <div className="glass p-8 text-center mt-4">
          <h2 className="text-xl font-semibold mb-2">Customer Not Found</h2>
          <p className="text-muted">The customer you are looking for does not exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className="customer-details-container p-6 w-full">
      <Link to="/customers" className="back-btn">
        <ArrowLeft size={16} /> Back to Customers
      </Link>

      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold">Customer Details</h1>
          <p className="text-muted">ID: {customer._id}</p>
        </div>
      </div>

      <div className="details-grid">
        {/* Profile Card */}
        <div className="profile-card glass">
          <div className="profile-header">
            <div className="avatar-circle">
              {getInitial(customer.name)}
            </div>
            <div>
              <h2 className="text-xl font-bold">{customer.name || 'Anonymous User'}</h2>
              <span className="text-muted text-sm">Customer</span>
            </div>
          </div>
          
          <div className="info-list flex flex-col gap-4">
            <div className="info-item">
              <Phone size={18} />
              <div>
                <span className="label">Contact Number (WhatsApp/Call)</span>
                <span className="text-xl font-bold text-accent">{customer.phone || 'Not provided'}</span>
              </div>
            </div>
            
            {(orders.length > 0 && orders[0].address) && (
              <div className="info-item">
                <MapPin size={18} />
                <div>
                  <span className="label">Latest Shipping Address</span>
                  <span className="text-sm">
                    {orders[0].address.houseNo}, {orders[0].address.area}, 
                    <br /> {orders[0].address.city}, {orders[0].address.state} - {orders[0].address.pincode}
                  </span>
                </div>
              </div>
            )}

            <div className="info-item">
              <Calendar size={18} />
              <div>
                <span className="label">Registration Date</span>
                <span>{new Date(customer.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="stat-box">
              <div className="text-muted text-sm">Total Orders</div>
              <div className="value">{customer.totalOrders || orders.length}</div>
            </div>
            <div className="stat-box">
              <div className="text-muted text-sm">Total Spent</div>
              <div className="value">₹{customer.totalSpending || orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)}</div>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="order-history-card glass">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingBag size={20} className="text-accent" />
            <h2 className="text-xl font-bold">Order History</h2>
          </div>

          {orders.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-gray-700 rounded-lg text-muted">
              This customer hasn't placed any orders yet.
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order._id} className="order-item">
                  <div className="order-header">
                    <div>
                      <span className="font-semibold text-accent">Order #{order.orderNumber || (order._id?.substring(0, 8) + '...')}</span>
                      <span className="text-muted text-sm ml-3">
                        {new Date(order.date || order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`status-badge ${getStatusClass(order.orderStatus)}`}>
                      {order.orderStatus || 'Pending'}
                    </span>
                  </div>
                  
                  <div className="order-products flex flex-col gap-2 mt-3 mb-4">
                    {(order.items || []).map((item, idx) => (
                      <div key={item._id || idx} className="flex justify-between items-center text-sm border-b border-gray-800 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center overflow-hidden">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <ShoppingBag size={16} className="text-muted" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{item.name || 'Product'}</div>
                            <div className="text-muted text-xs">Qty: {item.quantity || 1}{item.size ? ` | Size: ${item.size}` : ''}</div>
                          </div>
                        </div>
                        <div className="font-medium">₹{item.totalPrice || (item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 font-semibold">
                    <span>Total Amount</span>
                    <span className="text-lg">₹{order.totalAmount || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
