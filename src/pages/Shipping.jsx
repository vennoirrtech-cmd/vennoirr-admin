import { Search, Truck, Navigation, CheckCircle2, AlertOctagon, PackageCheck, Send, Loader2, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

const fetchShippingOrders = async () => {
  // Gracefully mock since UI doesn't have native shipping endpoints loaded over network yet.
  return new Promise(resolve => setTimeout(() => resolve([]), 500));
};

const Shipping = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-shipping'],
    queryFn: fetchShippingOrders,
  });

  const activeShippingStatuses = ['Confirmed', 'Packed', 'Ready For Dispatch', 'Out For Delivery', 'Delivered'];
  const shippingOrders = orders.filter(o => activeShippingStatuses.includes(o.orderStatus));

  const mockShippingOrders = shippingOrders.length > 0 ? shippingOrders : [
    {
      _id: 'SHIP1',
      orderNumber: 'VN-10510',
      user: { name: 'Karan Mehra' },
      address: { city: 'Mumbai', state: 'MH', pincode: '400050' },
      orderStatus: 'Ready For Dispatch',
      shippingData: { courierPartner: 'Shiprocket', awbNumber: 'SR-9382104932', weightGb: 0.8 },
      createdAt: new Date().toISOString()
    },
    {
      _id: 'SHIP2',
      orderNumber: 'VN-10508',
      user: { name: 'Ananya Singh' },
      address: { city: 'Bengaluru', state: 'KA', pincode: '560037' },
      orderStatus: 'Out For Delivery',
      shippingData: { courierPartner: 'Delhivery', awbNumber: 'DL-7489382910', weightGb: 1.2 },
      createdAt: new Date(Date.now() - 40000000).toISOString()
    },
    {
      _id: 'SHIP3',
      orderNumber: 'VN-10499',
      user: { name: 'Aryan Rao' },
      address: { city: 'Delhi', state: 'DL', pincode: '110021' },
      orderStatus: 'Packed',
      shippingData: { courierPartner: '', awbNumber: '', weightGb: 0.5 },
      createdAt: new Date(Date.now() - 60000000).toISOString()
    },
    {
      _id: 'SHIP4',
      orderNumber: 'VN-10495',
      user: { name: 'Ishaan Verma' },
      address: { city: 'Pune', state: 'MH', pincode: '411001' },
      orderStatus: 'Delivered',
      shippingData: { courierPartner: 'BlueDart', awbNumber: 'BD-839210384', weightGb: 0.6 },
      createdAt: new Date(Date.now() - 120000000).toISOString()
    }
  ];

  const filteredOrders = mockShippingOrders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.shippingData?.awbNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toDispatchCount = mockShippingOrders.filter(o => ['Packed', 'Ready For Dispatch'].includes(o.orderStatus)).length;
  const inTransitCount = mockShippingOrders.filter(o => o.orderStatus === 'Out For Delivery').length;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--ink)]" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto pb-12 animate-in fade-in">
      
      {/* HEADER DIV */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--ink)] tracking-tight">Shipping & Logistics</h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1 font-medium">Manage Couriers, AWB Generation, and real-time transit tracking.</p>
        </div>
        <div className="flex gap-2">
          <button className="h-10 px-4 flex items-center gap-2 bg-[var(--ink)] text-[var(--surface)] text-[13px] font-semibold hover:opacity-90 transition-opacity whitespace-nowrap shadow-sm">
            <PackageCheck size={16} /> Auto-Generate AWBs
          </button>
        </div>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--surface)] border border-[var(--border)] p-5 relative overflow-hidden">
          <div className="text-[12px] font-semibold text-[var(--warning)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Send size={14} /> To Be Dispatched</div>
          <div className="text-[24px] font-bold text-[var(--ink)] table-num relative z-10">{toDispatchCount}</div>
          <div className="text-[12px] text-[var(--text-muted)] mt-1 font-medium z-10 relative">Orders packed & awaiting pickup</div>
          {toDispatchCount > 0 && <div className="absolute inset-0 bg-[var(--warning)] opacity-5 z-0"></div>}
        </div>
        
        <div className="bg-[var(--surface)] border border-[var(--border)] p-5">
          <div className="text-[12px] font-semibold text-[#3395FF] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Navigation size={14} /> In Transit / OFD</div>
          <div className="text-[24px] font-bold text-[var(--ink)] table-num">{inTransitCount}</div>
          <div className="text-[12px] text-[var(--text-muted)] mt-1 font-medium z-10 relative">Currently moving with couriers</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] p-5">
          <div className="text-[12px] font-semibold text-[var(--error)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><AlertOctagon size={14} /> RTO / Exceptions</div>
          <div className="text-[24px] font-bold text-[var(--ink)] table-num">0</div>
          <div className="text-[12px] text-[var(--text-muted)] mt-1 font-medium z-10 relative">Failed deliveries returned to origin</div>
        </div>
      </div>

      {/* SHIPPING LIST */}
      <div className="bg-[var(--surface)] border border-[var(--border)] relative">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-muted)]/50">
           <div className="relative max-w-sm w-full flex items-center gap-4">
              <div className="relative w-full">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-[var(--text-muted)]" />
                </span>
                <input
                  type="text"
                  placeholder="Search AWB or Order Number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-[13px] border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 border border-[var(--border)] bg-[var(--surface)] text-[12px] font-semibold text-[var(--text-secondary)] focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Packed">Packed</option>
                <option value="Ready For Dispatch">Ready For Dispatch</option>
                <option value="Out For Delivery">Out For Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Order Details</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Courier & AWB</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Destination</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Logistics Status</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-muted)] transition-colors">
                  <td className="py-3 px-4">
                    <span className="text-[13px] font-bold text-[var(--ink)] cursor-pointer hover:underline">
                      {order.orderNumber}
                    </span>
                    <div className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">
                      {order.user?.name}
                    </div>
                  </td>
                  
                  <td className="py-3 px-4">
                    {order.shippingData?.awbNumber ? (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Truck size={12} className="text-[#3395FF]" />
                          <span className="text-[13px] font-mono text-[var(--ink)]">{order.shippingData?.awbNumber}</span>
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)] font-semibold uppercase tracking-wide mt-1">
                          {order.shippingData?.courierPartner} • {order.shippingData?.weightGb} kg
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-sm text-[11px] font-medium tracking-wide bg-[var(--surface-muted)] text-[var(--text-muted)] border border-[var(--border)]">
                        Unassigned
                      </span>
                    )}
                  </td>
                  
                  <td className="py-3 px-4">
                    <div className="flex gap-2 text-[13px] text-[var(--ink)] font-medium">
                      <MapPin size={14} className="text-[var(--text-muted)] mt-0.5 shrink-0" />
                      <div>
                        <div>{order.address?.city}, {order.address?.state}</div>
                        <div className="text-[11px] text-[var(--text-muted)] font-mono">{order.address?.pincode}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-sm text-[11px] font-bold uppercase tracking-wide
                      ${order.orderStatus === 'Packed' ? 'bg-[var(--surface-muted)] text-[var(--text-secondary)]' : ''}
                      ${order.orderStatus === 'Ready For Dispatch' ? 'bg-[var(--warning)]/10 text-[var(--warning)]' : ''}
                      ${order.orderStatus === 'Out For Delivery' ? 'bg-[#3395FF]/10 text-[#3395FF]' : ''}
                      ${order.orderStatus === 'Delivered' ? 'bg-[var(--success)]/10 text-[var(--success)]' : ''}
                    `}>
                       {order.orderStatus}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right space-x-2">
                    {!order.shippingData?.awbNumber ? (
                      <button className="h-8 px-3 inline-flex items-center justify-center bg-[var(--brand)] text-[var(--surface)] text-[12px] font-semibold hover:opacity-90 transition-opacity shadow-sm">
                        Assign AWB
                      </button>
                    ) : (
                      <>
                        <button className="h-8 px-3 inline-flex items-center justify-center border border-[var(--border)] bg-[var(--surface)] text-[12px] font-semibold text-[var(--text-secondary)] hover:text-[#3395FF] hover:bg-[#3395FF]/5 transition-colors">
                          Track
                        </button>
                        <button className="h-8 px-3 inline-flex items-center justify-center border border-[var(--border)] bg-[var(--surface)] text-[12px] font-semibold text-[var(--text-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-colors">
                          Label
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-[13px] text-[var(--text-muted)]">
                    No shipping queues found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Shipping;
