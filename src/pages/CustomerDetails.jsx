import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Calendar, ShoppingBag, Loader2, User } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';

const fetchCustomerData = async (id) => {
  const customerRes = await api.get('/search/customers');
  let foundCustomer = null;
  if (customerRes.data?.success) {
    foundCustomer = customerRes.data.data.find(c => c._id === id);
  } else {
    foundCustomer = customerRes.data?.find(c => c._id === id);
  }
  
  if (!foundCustomer) {
    throw new Error('Customer not found');
  }

  const ordersRes = await api.get(`/admin/orders/customer/${id}`);
  let orders = [];
  if (ordersRes.data?.success) {
    orders = ordersRes.data.data;
  } else {
    orders = ordersRes.data || [];
  }

  return { customer: foundCustomer, orders };
};

const CustomerDetails = () => {
  const { id } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => fetchCustomerData(id),
    retry: false
  });

  const getStatusBadge = (status) => {
    switch(status?.toUpperCase()) {
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-[var(--text-secondary)]">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--ink)]" />
        <div className="text-[14px]">Loading customer details...</div>
      </div>
    );
  }

  if (isError || !data?.customer) {
    return (
      <div className="w-full">
        <Link to="/customers" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text-secondary)] hover:text-[var(--ink)] transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Customers
        </Link>
        <div className="bg-[var(--surface)] border border-[var(--border)] p-12 text-center flex flex-col items-center">
          <h2 className="text-[16px] font-semibold text-[var(--ink)] mb-2">Customer Not Found</h2>
          <p className="text-[13px] text-[var(--text-secondary)]">The customer you are looking for does not exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  const { customer, orders } = data;

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-6">
        <Link to="/customers" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text-secondary)] hover:text-[var(--ink)] transition-colors">
          <ArrowLeft size={16} /> Back to Customers
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--ink)]">Customer Details</h1>
          <p className="text-[12px] text-[var(--text-muted)] font-mono uppercase tracking-wide mt-1">ID: {customer._id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 border border-[var(--border)] bg-[var(--surface)] h-fit flex flex-col">
          <div className="p-6 border-b border-[var(--border)] flex items-center gap-4 bg-[var(--surface)]">
            <div className="h-14 w-14 bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center text-xl font-bold text-[var(--ink)] shrink-0">
              {getInitial(customer.name)}
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[var(--ink)] leading-tight">{customer.name || 'Anonymous User'}</h2>
              <span className="text-[var(--text-secondary)] text-[12px] uppercase tracking-wide font-semibold mt-1 block">Customer</span>
            </div>
          </div>
          
          <div className="p-6 flex flex-col gap-6 border-b border-[var(--border)]">
            <div className="flex items-start gap-4">
              <div className="shrink-0 text-[var(--text-muted)] mt-0.5">
                <Phone size={16} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-1 block">Contact Number</span>
                <span className="text-[14px] font-semibold text-[var(--ink)] truncate table-num">{customer.phone || 'Not provided'}</span>
              </div>
            </div>
            
            {(orders.length > 0 && orders[0].address) && (
              <div className="flex items-start gap-4">
                <div className="shrink-0 text-[var(--text-muted)] mt-0.5">
                  <MapPin size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-1 block">Latest Address</span>
                  <span className="text-[13px] text-[var(--ink)] leading-relaxed">
                    {orders[0].address.houseNo && `${orders[0].address.houseNo}, `}{orders[0].address.area}, 
                    <br /> {orders[0].address.city}, {orders[0].address.state} <span className="font-semibold">{orders[0].address.pincode}</span>
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4">
              <div className="shrink-0 text-[var(--text-muted)] mt-0.5">
                <Calendar size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-1 block">Registered</span>
                <span className="text-[13px] font-medium text-[var(--ink)]">{new Date(customer.createdAt || Date.now()).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[var(--surface-muted)]/50 grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-1">Total Orders</span>
              <span className="text-[20px] font-semibold text-[var(--ink)] table-num">{customer.totalOrders || orders.length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-1">Total Spent</span>
              <span className="text-[20px] font-semibold text-[var(--ink)] table-num">₹{customer.totalSpending || orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="lg:col-span-2 border border-[var(--border)] bg-[var(--surface)] flex flex-col">
          <div className="p-5 border-b border-[var(--border)] flex items-center gap-3">
            <ShoppingBag size={16} className="text-[var(--text-secondary)]" />
            <h2 className="text-[14px] font-semibold text-[var(--ink)] uppercase tracking-[0.04em]">Order History</h2>
          </div>

          <div className="p-6 flex-1 bg-[var(--surface)]">
            {orders.length === 0 ? (
              <div className="text-center p-12 border border-dashed border-[var(--border)] bg-[var(--surface-muted)]">
                <ShoppingBag size={32} className="mx-auto text-[var(--text-muted)] mb-3" />
                <p className="text-[13px] text-[var(--text-secondary)]">This customer hasn't placed any orders yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map(order => (
                  <div key={order._id} className="border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--ink)]/30 transition-colors">
                    <div className="bg-[var(--surface-muted)] px-5 py-3 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="font-semibold text-[13px] text-[var(--ink)] mr-3 uppercase tracking-wide">Order #{order.orderNumber || (order._id?.substring(0, 8))}</span>
                        <span className="inline-block text-[var(--text-secondary)] text-[12px] table-num">
                          {new Date(order.date || order.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </div>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[11px] font-semibold uppercase tracking-wide ${getStatusBadge(order.orderStatus)}`}>
                        {order.orderStatus || 'Pending'}
                      </span>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex flex-col gap-4">
                        {(order.items || []).map((item, idx) => (
                          <div key={item._id || idx} className="flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center overflow-hidden shrink-0">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <ShoppingBag size={14} className="text-[var(--text-muted)]" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-[var(--ink)] text-[13px] truncate">{item.name || 'Product'}</div>
                                <div className="text-[var(--text-secondary)] text-[12px] mt-0.5">Qty: {item.quantity || 1}{item.size ? ` | Size: ${item.size}` : ''}</div>
                              </div>
                            </div>
                            <div className="font-semibold text-[var(--ink)] text-[13px] table-num">₹{(item.totalPrice || (item.price * item.quantity))?.toLocaleString('en-IN')}</div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center mt-6 pt-4 border-t border-[var(--border)]">
                        <span className="font-semibold text-[var(--text-secondary)] text-[11px] uppercase tracking-wider">Total Amount</span>
                        <span className="text-[16px] font-bold text-[var(--ink)] table-num">₹{order.totalAmount?.toLocaleString('en-IN') || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
