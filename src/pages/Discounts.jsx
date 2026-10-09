import { Plus, Search, Tag, Percent, Truck, Loader2, Calendar, Users, Package } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

const fetchCoupons = async () => {
  const res = await api.get('/coupons');
  return res.data?.data || [];
};

const Discounts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-discounts'],
    queryFn: fetchCoupons,
  });

  // Mocking coupons for UI demonstration in case DB is empty currently
  const mockCoupons = coupons.length > 0 ? coupons : [
    {
      _id: 'D001',
      code: 'DIWALI25',
      type: 'percentage',
      discount: 25,
      maxDiscount: 1000,
      minCartValue: 2000,
      usedCount: 142,
      usageLimit: 500,
      isActive: true,
      expiryDate: new Date(Date.now() + 864000000).toISOString(),
    },
    {
      _id: 'D002',
      code: 'FREESHIP',
      type: 'free_shipping',
      discount: 0,
      minCartValue: 1500,
      usedCount: 890,
      usageLimit: null,
      isActive: true,
      expiryDate: new Date(Date.now() + 2592000000).toISOString(),
    },
    {
      _id: 'D003',
      code: 'FLAT500',
      type: 'flat',
      discount: 500,
      minCartValue: 3000,
      usedCount: 45,
      usageLimit: 100,
      isActive: false,
      expiryDate: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      _id: 'D004',
      code: 'BOGO-TEE',
      type: 'bogo',
      discount: 100,
      minOrderQuantity: 2,
      usedCount: 12,
      usageLimit: 50,
      isActive: true,
      expiryDate: new Date(Date.now() + 172800000).toISOString(),
    }
  ];

  const filteredCoupons = mockCoupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = mockCoupons.filter(c => c.isActive).length;
  const expiredCount = mockCoupons.filter(c => new Date(c.expiryDate) < new Date()).length;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--ink)]" />
      </div>
    );
  }

  const getTypeIcon = (type) => {
    switch(type) {
      case 'percentage': return <Percent size={18} />;
      case 'free_shipping': return <Truck size={18} />;
      case 'flat': return <Tag size={18} />;
      case 'bogo': return <Package size={18} />;
      default: return <Tag size={18} />;
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'percentage': return 'Percentage Off';
      case 'free_shipping': return 'Free Shipping';
      case 'flat': return 'Flat Amount';
      case 'bogo': return 'Buy X Get Y';
      default: return 'Discount';
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto pb-12 animate-in fade-in">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-bold text-[var(--ink)] tracking-tight">Discount Rules Engine</h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1 font-medium">Create complex promotional rules and coupon logic.</p>
        </div>
        <button className="h-10 px-4 flex items-center gap-2 bg-[var(--ink)] text-[var(--surface)] text-[13px] font-semibold hover:opacity-90 transition-opacity whitespace-nowrap shadow-sm">
          <Plus size={16} /> Create Rule
        </button>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[var(--surface)] border border-[var(--border)] p-5">
          <div className="text-[12px] font-semibold text-[var(--success)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Tag size={14} /> Active Rules</div>
          <div className="text-[24px] font-bold text-[var(--ink)] table-num">{activeCount}</div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] p-5">
          <div className="text-[12px] font-semibold text-[var(--error)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Calendar size={14} /> Expired</div>
          <div className="text-[24px] font-bold text-[var(--ink)] table-num">{expiredCount}</div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] p-5">
          <div className="text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Users size={14} /> Total Redemptions</div>
          <div className="text-[24px] font-bold text-[var(--ink)] table-num">
            {mockCoupons.reduce((acc, curr) => acc + curr.usedCount, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* RULES TABLE */}
      <div className="bg-[var(--surface)] border border-[var(--border)] relative">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-muted)]/50">
           <div className="relative max-w-sm w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-[var(--text-muted)]" />
              </span>
              <input
                type="text"
                placeholder="Search Coupon Code..."
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
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Code & Type</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Configuration</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] text-right">Usage</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Status / Ends</th>
                <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map(coupon => {
                const isExpired = new Date(coupon.expiryDate) < new Date();
                const isActive = coupon.isActive && !isExpired;

                return (
                  <tr key={coupon._id} className={`border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-muted)] transition-colors ${!isActive ? 'opacity-60' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[var(--ink)] shrink-0">
                          {getTypeIcon(coupon.type)}
                        </div>
                        <div>
                          <span className="text-[14px] font-bold text-[var(--ink)] tracking-wider">
                            {coupon.code}
                          </span>
                          <div className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mt-0.5">
                            {getTypeLabel(coupon.type)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[13px] text-[var(--text-secondary)] space-y-1">
                      {coupon.type === 'percentage' && <div><strong className="text-[var(--ink)] font-semibold">{coupon.discount}% off</strong> (Max: ₹{coupon.maxDiscount})</div>}
                      {coupon.type === 'flat' && <div><strong className="text-[var(--ink)] font-semibold">₹{coupon.discount} off</strong></div>}
                      {coupon.type === 'free_shipping' && <div><strong className="text-[var(--ink)] font-semibold">100% Shipping discount</strong></div>}
                      {coupon.type === 'bogo' && <div><strong className="text-[var(--ink)] font-semibold">Buy {coupon.minOrderQuantity || 1} Get Y</strong></div>}
                      
                      <div className="text-[12px] text-[var(--text-muted)] flex gap-2">
                        {coupon.minCartValue > 0 && <span>Min: ₹{coupon.minCartValue}</span>}
                        {coupon.minOrderQuantity > 0 && coupon.type !== 'bogo' && <span>Min Qty: {coupon.minOrderQuantity}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                       <span className="text-[14px] font-bold text-[var(--ink)] table-num">{coupon.usedCount}</span>
                       <span className="text-[12px] text-[var(--text-muted)]">
                         {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' / ∞'}
                       </span>
                       {coupon.usageLimit && (
                         <div className="w-full max-w-[80px] h-1.5 bg-[var(--border)] rounded-full ml-auto mt-1 overflow-hidden">
                           <div 
                             className="h-full bg-[var(--ink)]" 
                             style={{ width: `${(coupon.usedCount / coupon.usageLimit) * 100}%` }}
                           ></div>
                         </div>
                       )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[var(--success)]' : 'bg-[var(--error)]'}`}></div>
                        <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--ink)]">
                          {isActive ? 'Active' : (isExpired ? 'Expired' : 'Disabled')}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)]">
                        {new Date(coupon.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="h-8 px-3 inline-flex items-center justify-center border border-[var(--border)] bg-[var(--surface)] text-[12px] font-semibold text-[var(--text-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-colors">
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Discounts;
