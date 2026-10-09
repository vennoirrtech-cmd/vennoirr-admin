import { useState, useMemo } from 'react';
import { Search, Eye, X, MapPin, CreditCard, Package, User, Phone, ChevronDown, Loader2, AlignJustify, AlignCenter } from 'lucide-react';
import { useOrders, useUpdateOrderStatus } from '../hooks/useOrders';
import { motion, AnimatePresence } from 'framer-motion';

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Packed', 'Ready For Dispatch', 'Out For Delivery', 'Delivered', 'Cancelled'];

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [density, setDensity] = useState('comfortable'); // 'comfortable' or 'compact'

  const { data: orders = [], isLoading, isError, refetch } = useOrders(filterStatus, filterPayment);
  const updateStatusMutation = useUpdateOrderStatus(filterStatus, filterPayment);

  const handleStatusChange = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const getOrderStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'bg-[var(--success)]/10 text-[var(--success)]';
      case 'PENDING':
      case 'PROCESSING':
        return 'bg-[var(--warning)]/10 text-[var(--warning)]';
      case 'CANCELLED':
        return 'bg-[var(--error)]/10 text-[var(--error)]';
      default:
        return 'bg-[var(--info)]/10 text-[var(--info)]';
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return 'bg-[var(--success)]/10 text-[var(--success)] text-[var(--success)]';
      case 'FAILED':
        return 'bg-[var(--error)]/10 text-[var(--error)]';
      case 'REFUNDED':
        return 'bg-[var(--info)]/10 text-[var(--info)]';
      default:
        return 'bg-[var(--warning)]/10 text-[var(--warning)]';
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const term = searchTerm.toLowerCase();
      return (
        order.orderNumber?.toLowerCase().includes(term) ||
        order._id?.toLowerCase().includes(term) ||
        order.user?.name?.toLowerCase().includes(term) ||
        order.user?.phone?.toLowerCase().includes(term)
      );
    });
  }, [orders, searchTerm]);

  const tdClass = density === 'comfortable' ? 'py-3' : 'py-1.5';

  return (
    <div className="w-full h-full flex flex-col">
      {/* Filters Bar (slim 40px) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex flex-1 items-center gap-3 w-full">
          {/* Search */}
          <div className="relative w-full max-w-[280px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-8 pr-4 h-[32px] bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--ink)] focus:outline-none transition-colors text-[13px] text-[var(--ink)] placeholder:text-[var(--text-muted)] rounded-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="hidden sm:block h-[32px] px-2 bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--ink)] focus:outline-none transition-colors text-[13px] text-[var(--ink)] rounded-none"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Payment Filter */}
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="hidden lg:block h-[32px] px-2 bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--ink)] focus:outline-none transition-colors text-[13px] text-[var(--ink)] rounded-none"
          >
            <option value="">All Payments</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center border border-[var(--border)] bg-[var(--surface)]">
            <button
              onClick={() => setDensity('comfortable')}
              className={`p-1.5 ${density === 'comfortable' ? 'bg-[var(--surface-muted)] text-[var(--ink)]' : 'text-[var(--text-muted)] hover:text-[var(--ink)]'}`}
              title="Comfortable Density"
            >
              <AlignJustify size={14} />
            </button>
            <div className="w-px h-[20px] bg-[var(--border)]"></div>
            <button
              onClick={() => setDensity('compact')}
              className={`p-1.5 ${density === 'compact' ? 'bg-[var(--surface-muted)] text-[var(--ink)]' : 'text-[var(--text-muted)] hover:text-[var(--ink)]'}`}
              title="Compact Density"
            >
              <AlignCenter size={14} />
            </button>
          </div>
          <button
            className="h-[32px] px-3 text-[13px] font-semibold text-[var(--text-secondary)] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)] transition-colors rounded-none flex items-center gap-1.5"
            onClick={() => refetch()}
            disabled={isLoading || updateStatusMutation.isPending}
          >
            <Loader2 size={14} className={isLoading ? "animate-spin text-[var(--ink)]" : "hidden"} />
            Refresh
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[var(--surface)] border border-[var(--border)] flex-1 overflow-hidden flex flex-col relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-[var(--text-secondary)] z-20 bg-[var(--surface)]/80 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--ink)]" />
            <span className="text-[14px]">Loading orders...</span>
          </div>
        ) : isError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-[var(--error)] bg-[var(--surface)] z-20">
            <span className="text-[14px] font-medium">Failed to load orders. Please refresh.</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-[var(--text-muted)] bg-[var(--surface)] z-20 text-[14px]">
            No orders found.
          </div>
        ) : null}

        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[var(--surface)] sticky top-0 z-10 before:content-[''] before:absolute before:left-0 before:right-0 before:bottom-0 before:border-b before:border-[var(--border)]">
              <tr>
                <th className="px-4 py-2.5 font-semibold uppercase tracking-[0.04em] text-[12px] text-[var(--text-muted)] whitespace-nowrap">Order No</th>
                <th className="px-4 py-2.5 font-semibold uppercase tracking-[0.04em] text-[12px] text-[var(--text-muted)] whitespace-nowrap">Date</th>
                <th className="px-4 py-2.5 font-semibold uppercase tracking-[0.04em] text-[12px] text-[var(--text-muted)]">Customer</th>
                <th className="px-4 py-2.5 font-semibold uppercase tracking-[0.04em] text-[12px] text-[var(--text-muted)] text-right">Amount</th>
                <th className="px-4 py-2.5 font-semibold uppercase tracking-[0.04em] text-[12px] text-[var(--text-muted)] whitespace-nowrap">Payment</th>
                <th className="px-4 py-2.5 font-semibold uppercase tracking-[0.04em] text-[12px] text-[var(--text-muted)] whitespace-nowrap">Status</th>
                <th className="px-4 py-2.5 font-semibold uppercase tracking-[0.04em] text-[12px] text-[var(--text-muted)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const isUpdating = updateStatusMutation.isPending && updateStatusMutation.variables?.orderId === order._id;

                return (
                  <tr key={order._id} className={`border-b border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors group ${isUpdating ? 'opacity-50' : ''}`}>
                    <td className={`px-4 ${tdClass} font-semibold text-[13px] text-[var(--ink)] whitespace-nowrap`}>
                      #{order.orderNumber || order._id?.substring(0, 8)}
                    </td>
                    <td className={`px-4 ${tdClass} text-[13px] text-[var(--text-secondary)] whitespace-nowrap table-num`}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      }) : 'N/A'}
                    </td>
                    <td className={`px-4 ${tdClass} max-w-[200px]`}>
                      <div className="flex flex-col truncate">
                        <span className="text-[13px] text-[var(--ink)] truncate">{order.user?.name || 'Guest'}</span>
                        {density === 'comfortable' && (
                          <span className="text-[12px] text-[var(--text-muted)] truncate mt-0.5">{order.user?.phone || order.user?.email}</span>
                        )}
                      </div>
                    </td>
                    <td className={`px-4 ${tdClass} font-semibold text-[13px] text-[var(--ink)] table-num text-right`}>
                      ₹{order.totalAmount?.toLocaleString('en-IN') || 0}
                    </td>
                    <td className={`px-4 ${tdClass} whitespace-nowrap`}>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[11px] font-semibold uppercase tracking-wide border border-transparent ${getPaymentStatusClass(order.paymentStatus)}`}>
                        {order.paymentStatus || 'Pending'}
                      </span>
                    </td>
                    <td className={`px-4 ${tdClass} whitespace-nowrap`}>
                      <div className="relative inline-block w-fit">
                        <select
                          className={`appearance-none pl-2 pr-6 py-1 rounded-sm text-[11px] font-semibold uppercase tracking-wide outline-none cursor-pointer border border-transparent ${getOrderStatusClass(order.orderStatus)}`}
                          value={order.orderStatus || 'Pending'}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={updateStatusMutation.isPending}
                        >
                          {ORDER_STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                      </div>
                    </td>
                    <td className={`px-4 ${tdClass} text-right`}>
                      <button
                        className="p-1.5 text-[var(--ink)] hover:text-[var(--text-secondary)] transition-colors inline-flex opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                        title="View Details"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal - Updated for Calm Density */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-[var(--surface)] border border-[var(--border)] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)] shrink-0">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold text-lg text-[var(--ink)] leading-none">Order Details</h2>
                  <span className="text-[13px] font-semibold text-[var(--text-secondary)] bg-[var(--surface-muted)] px-2 py-0.5 border border-[var(--border)]">
                    #{selectedOrder.orderNumber}
                  </span>
                </div>
                <button
                  className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-colors border border-transparent"
                  onClick={() => setSelectedOrder(null)}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Left Column: Customer, Address, Status */}
                  <div className="lg:col-span-1 space-y-6">

                    {/* Statuses */}
                    <div className="border border-[var(--border)] p-4 bg-[var(--surface)]">
                      <h3 className="text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.04em] mb-3">Status Overview</h3>
                      <div className="space-y-3">
                        <div>
                          <span className="text-[12px] text-[var(--text-secondary)] block mb-1">Payment Status</span>
                          <span className={`inline-flex px-2 py-1 text-[12px] font-semibold uppercase tracking-wide rounded-sm ${getPaymentStatusClass(selectedOrder.paymentStatus)}`}>
                            {selectedOrder.paymentStatus || 'Pending'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[12px] text-[var(--text-secondary)] block mb-1">Fulfillment Status</span>
                          <span className={`inline-flex px-2 py-1 text-[12px] font-semibold uppercase tracking-wide rounded-sm ${getOrderStatusClass(selectedOrder.orderStatus)}`}>
                            {selectedOrder.orderStatus || 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Customer */}
                    <div className="border border-[var(--border)] p-4 bg-[var(--surface)]">
                      <h3 className="text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.04em] mb-3 flex items-center gap-2">
                        <User size={14} /> Customer
                      </h3>
                      <div className="space-y-2 text-[13px]">
                        <p className="font-medium text-[var(--ink)]">{selectedOrder.user?.name || 'Guest'}</p>
                        <p className="text-[var(--text-secondary)]">{selectedOrder.user?.email || 'N/A'}</p>
                        <p className="text-[var(--text-secondary)]">{selectedOrder.user?.phone || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="border border-[var(--border)] p-4 bg-[var(--surface)]">
                      <h3 className="text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.04em] mb-3 flex items-center gap-2">
                        <MapPin size={14} /> Delivery Address
                      </h3>
                      {selectedOrder.address ? (
                        <div className="text-[13px] text-[var(--ink)] leading-relaxed">
                          <p className="font-semibold mb-1">{selectedOrder.address.name}</p>
                          <p>{selectedOrder.address.houseNo && `${selectedOrder.address.houseNo}, `}{selectedOrder.address.area}</p>
                          <p>{selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.pincode}</p>
                          {selectedOrder.address.mobile && <p className="mt-2 text-[var(--text-secondary)] flex items-center gap-1.5"><Phone size={12} /> {selectedOrder.address.mobile}</p>}
                        </div>
                      ) : (
                        <p className="text-[13px] text-[var(--text-secondary)]">No address provided.</p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Items & Total */}
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="border border-[var(--border)] bg-[var(--surface)] flex flex-col flex-1">
                      <h3 className="text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.04em] p-4 border-b border-[var(--border)] flex items-center gap-2">
                        <Package size={14} /> Ordered Items
                      </h3>
                      <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]/30">
                              <th className="px-4 py-2 font-medium text-[12px] text-[var(--text-muted)]">Product</th>
                              <th className="px-4 py-2 font-medium text-[12px] text-[var(--text-muted)] text-right">Price</th>
                              <th className="px-4 py-2 font-medium text-[12px] text-[var(--text-muted)] text-center">Qty</th>
                              <th className="px-4 py-2 font-medium text-[12px] text-[var(--text-muted)] text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(selectedOrder.items || []).map((item, idx) => (
                              <tr key={item._id || idx} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-muted)] transition-colors">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-[var(--surface-muted)] border border-[var(--border)] shrink-0 flex items-center justify-center overflow-hidden">
                                      {item.image ? (
                                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                      ) : (
                                        <Package size={16} className="text-[var(--text-muted)]" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-[13px] font-medium text-[var(--ink)] truncate max-w-[200px] sm:max-w-[300px]">{item.name}</p>
                                      <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
                                        {item.size && `Size ${item.size}`}{item.color && `, Color ${item.color}`}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-[13px] text-[var(--ink)] table-num text-right">
                                  ₹{item.price?.toLocaleString('en-IN')}
                                </td>
                                <td className="px-4 py-3 text-[13px] text-[var(--text-secondary)] table-num text-center">
                                  {item.quantity}
                                </td>
                                <td className="px-4 py-3 text-[13px] font-semibold text-[var(--ink)] table-num text-right">
                                  ₹{(item.totalPrice || (item.price * item.quantity))?.toLocaleString('en-IN')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Summary box inside the items container at the bottom */}
                      <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-muted)]/30">
                        <div className="space-y-2 text-[13px] max-w-xs ml-auto">
                          <div className="flex justify-between text-[var(--text-secondary)] text-[13px]">
                            <span>Subtotal</span>
                            <span className="table-num font-medium text-[var(--ink)]">₹{selectedOrder.subtotal?.toLocaleString('en-IN') || 0}</span>
                          </div>
                          {selectedOrder.discount > 0 && (
                            <div className="flex justify-between text-[var(--success)] text-[13px]">
                              <span>Discount</span>
                              <span className="table-num font-medium">-₹{selectedOrder.discount?.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          {selectedOrder.deliveryCharges > 0 && (
                            <div className="flex justify-between text-[var(--text-secondary)] text-[13px]">
                              <span>Shipping</span>
                              <span className="table-num font-medium text-[var(--ink)]">₹{selectedOrder.deliveryCharges}</span>
                            </div>
                          )}
                          <div className="pt-3 mt-3 border-t border-[var(--border)] flex justify-between items-center text-[15px] font-semibold text-[var(--ink)]">
                            <span>Total</span>
                            <span className="table-num">₹{selectedOrder.totalAmount?.toLocaleString('en-IN') || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;
