import { Search, Filter, RotateCcw, AlertTriangle, CheckCircle2, Ticket, Package, Wallet, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useState } from 'react';

const fetchRMAOrders = async () => {
  // Gracefully mock since UI doesn't have native shipping endpoints loaded over network yet.
  return new Promise(resolve => setTimeout(() => resolve([]), 500));
};

const Returns = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['rma-orders'],
    queryFn: fetchRMAOrders,
  });

  // Filter out normal orders, keep only Returns/Refunds related
  const returnStatuses = ['Return Requested', 'Return Approved', 'Returned', 'Refunded'];
  
  // Wait, if database has no returns because it's a new feature, let's artificially inject some mock ones for the UI till the frontend can natively generate real ones via the User portal.
  const rmaOrders = orders.filter(o => returnStatuses.includes(o.orderStatus));
  
  const mockRmaOrders = rmaOrders.length > 0 ? rmaOrders : [
    {
      _id: 'RMA001',
      orderNumber: 'VN-10492',
      user: { name: 'Rahul Sharma', stringId: 'usr1' },
      totalAmount: 4500,
      orderStatus: 'Return Requested',
      returnReason: 'Wrong Size/Color',
      refundStatus: 'Not Applicable',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'RMA002',
      orderNumber: 'VN-10488',
      user: { name: 'Priya Patel', stringId: 'usr2' },
      totalAmount: 2199,
      orderStatus: 'Return Approved',
      returnReason: 'Defective Product',
      refundStatus: 'Processing',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      _id: 'RMA003',
      orderNumber: 'VN-10450',
      user: { name: 'Amit Singh', stringId: 'usr3' },
      totalAmount: 1899,
      orderStatus: 'Refunded',
      returnReason: 'Changed Mind',
      refundStatus: 'Refunded',
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  const filteredRMA = mockRmaOrders.filter(rma => {
    const matchesSearch = rma.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          rma.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || rma.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingRequests = mockRmaOrders.filter(o => o.orderStatus === 'Return Requested').length;
  const pendingRefunds = mockRmaOrders.filter(o => o.refundStatus === 'Processing').length;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--ink)]" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto pb-12 animate-in fade-in">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-[var(--ink)] tracking-tight">Returns & Refunds Center</h1>
        <p className="text-[14px] text-[var(--text-secondary)] mt-1 font-medium">Manage Return Merchandise Authorization (RMA) and Refund queues.</p>
      </div>

      {/* ACTIONABLE METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--surface)] border border-[var(--border)] p-5 relative overflow-hidden">
          <div className="text-[12px] font-semibold text-[var(--warning)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><AlertTriangle size={14} /> Action Required</div>
          <div className="text-[24px] font-bold text-[var(--ink)] table-num relative z-10">{pendingRequests}</div>
          <div className="text-[12px] text-[var(--text-muted)] mt-1 font-medium z-10 relative">New Return Requests</div>
          {pendingRequests > 0 && <div className="absolute inset-0 bg-[var(--warning)] opacity-5 z-0"></div>}
        </div>
        
        <div className="bg-[var(--surface)] border border-[var(--border)] p-5 relative overflow-hidden">
          <div className="text-[12px] font-semibold text-[var(--error)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Wallet size={14} /> Processing Refunds</div>
          <div className="text-[24px] font-bold text-[var(--ink)] table-num relative z-10">{pendingRefunds}</div>
          <div className="text-[12px] text-[var(--text-muted)] mt-1 font-medium z-10 relative">Awaiting Payment Gateway API</div>
          {pendingRefunds > 0 && <div className="absolute inset-0 bg-[var(--error)] opacity-5 z-0"></div>}
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] p-5">
          <div className="text-[12px] font-semibold text-[var(--success)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><CheckCircle2 size={14} /> Resolved (30d)</div>
          <div className="text-[24px] font-bold text-[var(--ink)] table-num">{mockRmaOrders.filter(o => o.orderStatus === 'Refunded').length}</div>
          <div className="text-[12px] text-[var(--text-muted)] mt-1 font-medium">Successfully processed</div>
        </div>
      </div>

      {/* RMA TABLE */}
      <div className="bg-[var(--surface)] border border-[var(--border)] relative">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-muted)]/50">
           <div className="relative max-w-sm w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-[var(--text-muted)]" />
              </span>
              <input
                type="text"
                placeholder="Search Order No. or Customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-[13px] border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:border-[var(--ink)]"
              />
            </div>
            
            <div className="flex gap-2">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 border border-[var(--border)] bg-[var(--surface)] text-[12px] font-semibold text-[var(--text-secondary)] focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Return Requested">Return Requested</option>
                <option value="Return Approved">Return Approved</option>
                <option value="Returned">Returned</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Order No</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Customer</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">RMA Reason</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Status</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Refund States</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRMA.map(rma => (
                <tr key={rma._id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-muted)] transition-colors">
                  <td className="py-3 px-4">
                    <span className="text-[13px] font-bold text-[var(--ink)] cursor-pointer hover:underline">
                      {rma.orderNumber}
                    </span>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                      {new Date(rma.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[13px] font-medium text-[var(--text-secondary)]">
                    {rma.user.name}
                  </td>
                  <td className="py-3 px-4">
                     <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[11px] font-semibold tracking-wide bg-[var(--surface-muted)] text-[var(--text-secondary)] border border-[var(--border)]">
                        <Ticket size={12} /> {rma.returnReason || 'Not Specified'}
                     </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[11px] font-bold uppercase tracking-wide
                      ${rma.orderStatus === 'Return Requested' ? 'bg-[var(--warning)]/10 text-[var(--warning)]' : ''}
                      ${rma.orderStatus === 'Return Approved' ? 'bg-[var(--brand)]/10 text-[var(--brand)]' : ''}
                      ${rma.orderStatus === 'Refunded' ? 'bg-[var(--success)]/10 text-[var(--success)]' : ''}
                      ${rma.orderStatus === 'Returned' ? 'bg-[var(--text-secondary)]/10 text-[var(--ink)]' : ''}
                    `}>
                       {rma.orderStatus === 'Return Requested' && <AlertTriangle size={12} />}
                       {rma.orderStatus === 'Return Approved' && <Package size={12} />}
                       {rma.orderStatus === 'Refunded' && <CheckCircle2 size={12} />}
                       {rma.orderStatus === 'Returned' && <RotateCcw size={12} />}
                       {rma.orderStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[12px] font-semibold ${
                      rma.refundStatus === 'Refunded' ? 'text-[var(--success)]' : 
                      rma.refundStatus === 'Processing' ? 'text-[var(--warning)] blur-[0.2px] animate-pulse' : 
                      'text-[var(--text-muted)]'
                    }`}>
                      {rma.refundStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="h-8 px-3 inline-flex items-center justify-center border border-[var(--border)] bg-[var(--surface)] text-[12px] font-semibold text-[var(--text-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-colors">
                      Review Case
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRMA.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[13px] text-[var(--text-muted)]">
                    No Return/Refund cases found matching criteria.
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

export default Returns;
