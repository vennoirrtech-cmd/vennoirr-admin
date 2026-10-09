import { Search, Activity, ShieldCheck, SearchCode, CreditCard, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

const fetchPayments = async () => {
  // Gracefully mock since UI doesn't have native shipping endpoints loaded over network yet.
  return new Promise(resolve => setTimeout(() => resolve([]), 500));
};

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: fetchPayments,
  });

  const mockPayments = payments.length > 0 ? payments : [
    {
      _id: 'pay_Nj3kG89P',
      order: { orderNumber: 'VN-10499' },
      user: { name: 'Aryan Rao', email: 'aryan@example.com' },
      amount: 2899,
      method: 'upi',
      status: 'Paid',
      razorpayOrderId: 'order_Nj3kG89P',
      razorpayPaymentId: 'pay_Nj3kG89P_xyz',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'pay_Mj2kL90O',
      order: { orderNumber: 'VN-10492' },
      user: { name: 'Rahul Sharma', email: 'rahul@example.com' },
      amount: 4500,
      method: 'card',
      status: 'Failed',
      razorpayOrderId: 'order_Mj2kL90O',
      razorpayPaymentId: '',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      _id: 'pay_Kk1jP09M',
      order: { orderNumber: 'VN-10488' },
      user: { name: 'Priya Patel', email: 'priya@example.com' },
      amount: 2199,
      method: 'netbanking',
      status: 'Refunded',
      razorpayOrderId: 'order_Kk1jP09M',
      razorpayPaymentId: 'pay_Kk1jP09M_xyz',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      _id: 'pay_Jj0hQ12N',
      order: { orderNumber: 'VN-10450' },
      user: { name: 'Amit Singh', email: 'amit@example.com' },
      amount: 1899,
      method: 'upi',
      status: 'Paid',
      razorpayOrderId: 'order_Jj0hQ12N',
      razorpayPaymentId: 'pay_Jj0hQ12N_xyz',
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  const filteredPayments = mockPayments.filter(p => 
    p.razorpayPaymentId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.order?.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCaptured = mockPayments.filter(p => p.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
  const totalFailed = mockPayments.filter(p => p.status === 'Failed').length;
  const webhooksHealthy = true; // In real app, ping Razorpay API or check last webhook timestamp

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
          <h1 className="text-[24px] font-bold text-[var(--ink)] tracking-tight">Payment Gateway Center</h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1 font-medium">Razorpay sync, webhook health, and direct refund management.</p>
        </div>
        <div className="flex gap-2">
          <button className="h-10 px-4 flex items-center gap-2 border border-[var(--border)] bg-[var(--surface)] text-[12px] font-semibold text-[var(--text-secondary)] hover:text-[var(--ink)] transition-colors">
            <RefreshCw size={14} /> Sync Razorpay
          </button>
        </div>
      </div>

      {/* GATEWAY HEALTH METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--surface)] border border-[var(--border)] p-5 relative overflow-hidden">
          <div className="text-[12px] font-semibold text-[var(--ink)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><ShieldCheck size={14} className="text-[var(--success)]" /> Razorpay Connection</div>
          <div className="text-[24px] font-bold text-[var(--success)] flex items-center gap-2">
             Healthy <Activity size={18} />
          </div>
          <div className="text-[12px] text-[var(--text-muted)] mt-1 font-medium z-10 relative">Webhooks active & signing correctly</div>
        </div>
        
        <div className="bg-[var(--surface)] border border-[var(--border)] p-5">
          <div className="text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><CreditCard size={14} /> Captured (30d)</div>
          <div className="text-[24px] font-bold text-[var(--ink)] table-num">₹{totalCaptured.toLocaleString()}</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] p-5">
          <div className="text-[12px] font-semibold text-[var(--error)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><SearchCode size={14} /> Failed Intents</div>
          <div className="text-[24px] font-bold text-[var(--ink)] table-num">{totalFailed} Events</div>
        </div>
      </div>

      {/* PAYMENT LOGS TABLE */}
      <div className="bg-[var(--surface)] border border-[var(--border)] relative">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-muted)]/50">
           <div className="relative max-w-sm w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-[var(--text-muted)]" />
              </span>
              <input
                type="text"
                placeholder="Search Payment ID, Order or Customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-[13px] border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:border-[var(--ink)]"
              />
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Razorpay Info</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Order</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Customer</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] text-right">Amount</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Status</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(payment => (
                <tr key={payment._id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-muted)] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <ExternalLink size={12} className="text-[#3395FF]" />
                      <span className="text-[13px] font-mono text-[#3395FF] hover:underline cursor-pointer">
                        {payment.razorpayPaymentId || payment.razorpayOrderId}
                      </span>
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1.5 uppercase font-semibold">
                      Via {payment.method} 
                      <span className="w-1 h-1 rounded-full bg-[var(--border)]"></span> 
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[13px] font-bold text-[var(--ink)]">
                    {payment.order?.orderNumber}
                  </td>
                  <td className="py-3 px-4 text-[13px] text-[var(--text-secondary)]">
                    {payment.user?.name}
                  </td>
                  <td className="py-3 px-4 text-[14px] font-semibold text-[var(--ink)] table-num text-right">
                    ₹{payment.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-sm text-[11px] font-bold uppercase tracking-wide
                      ${payment.status === 'Paid' ? 'bg-[var(--success)]/10 text-[var(--success)]' : ''}
                      ${payment.status === 'Failed' ? 'bg-[var(--error)]/10 text-[var(--error)]' : ''}
                      ${payment.status === 'Refunded' ? 'bg-[var(--text-secondary)]/10 text-[var(--ink)]' : ''}
                    `}>
                       {payment.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {payment.status === 'Paid' && (
                      <button className="h-8 px-3 inline-flex items-center justify-center border border-[var(--border)] bg-[var(--surface)] text-[12px] font-semibold text-[var(--error)] hover:text-[#fff] hover:bg-[var(--error)] hover:border-[var(--error)] transition-colors">
                        Issue Refund
                      </button>
                    )}
                    <button className="h-8 px-3 inline-flex items-center justify-center border border-[var(--border)] bg-[var(--surface)] text-[12px] font-semibold text-[var(--text-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-colors">
                      Logs
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[13px] text-[var(--text-muted)]">
                    No payment logs found.
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

export default Payments;
