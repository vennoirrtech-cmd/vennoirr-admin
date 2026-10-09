import { Search, Star, MessageSquare, Check, X, ShieldAlert, Loader2, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

const fetchReviews = async () => {
  // Gracefully mock since UI doesn't have native endpoints loaded over network yet.
  return new Promise(resolve => setTimeout(() => resolve([]), 500));
};

const Reviews = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending');

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: fetchReviews,
  });

  const mockReviews = reviews.length > 0 ? reviews : [
    {
      _id: 'R101',
      product: { name: 'Oversized Heavyweight Tee' },
      user: { name: 'Aryan Rao' },
      rating: 5,
      comment: 'Absolutely love the fit and the fabric is incredibly thick. Best blank tee I own.',
      status: 'Pending',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'R102',
      product: { name: 'Premium Cargo Pant' },
      user: { name: 'Karan Mehra' },
      rating: 2,
      comment: 'Too tight around the waist even though I ordered my size, quite disappointed.',
      status: 'Pending',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      _id: 'R103',
      product: { name: 'Boxy Zip Hoodie' },
      user: { name: 'Priya Patel' },
      rating: 5,
      comment: 'Very cozy! Arrived quickly too.',
      status: 'Approved',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      _id: 'R104',
      product: { name: 'Classic Trouser' },
      user: { name: 'Ananya Singh' },
      rating: 1,
      comment: 'Don\'t buy this scam product, terrible delivery guy.',
      status: 'Rejected',
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  const filteredReviews = mockReviews.filter(r => {
    const matchesSearch = r.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = mockReviews.filter(r => r.status === 'Pending').length;
  const approvedCount = mockReviews.filter(r => r.status === 'Approved').length;
  const avgRating = mockReviews.reduce((acc, r) => acc + r.rating, 0) / mockReviews.length;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--ink)]" />
      </div>
    );
  }

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            size={12} 
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-[var(--surface-muted)] text-[var(--border)]'} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto pb-12 animate-in fade-in">
      
      {/* HEADER SECTION */}
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-[var(--ink)] tracking-tight">Review Moderation Manager</h1>
        <p className="text-[14px] text-[var(--text-secondary)] mt-1 font-medium">Approve, reject, and monitor user-generated reviews across the site.</p>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--surface)] border border-[var(--border)] p-5 relative overflow-hidden">
          <div className="text-[12px] font-semibold text-[var(--warning)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><ShieldAlert size={14} /> Pending Moderation</div>
          <div className="text-[24px] font-bold text-[var(--ink)] table-num relative z-10">{pendingCount}</div>
          {pendingCount > 0 && <div className="absolute inset-0 bg-[var(--warning)] opacity-5 z-0"></div>}
        </div>
        
        <div className="bg-[var(--surface)] border border-[var(--border)] p-5">
          <div className="text-[12px] font-semibold text-[var(--success)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Check size={14} /> Published Live</div>
          <div className="text-[24px] font-bold text-[var(--ink)] table-num">{approvedCount}</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] p-5">
          <div className="text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Star size={14} /> Site Avg Rating</div>
          <div className="text-[24px] font-bold text-[var(--ink)] table-num">{avgRating.toFixed(1)} / 5</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] p-5">
           <div className="text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><MessageSquare size={14} /> Total Analyzed</div>
           <div className="text-[24px] font-bold text-[var(--ink)] table-num">{mockReviews.length.toLocaleString()}</div>
        </div>
      </div>

      {/* MODERATION QUEUE */}
      <div className="bg-[var(--surface)] border border-[var(--border)] relative">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-muted)]/50">
           <div className="relative max-w-sm w-full flex gap-4">
              <div className="flex gap-1 bg-[var(--surface)] border border-[var(--border)] p-1 rounded-sm">
                 {['Pending', 'Approved', 'Rejected', 'All'].map(s => (
                   <button 
                     key={s}
                     onClick={() => setStatusFilter(s)}
                     className={`px-3 py-1.5 text-[12px] font-bold transition-colors rounded-sm ${statusFilter === s ? 'bg-[var(--ink)] text-[var(--surface)]' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]'}`}
                   >
                     {s} {s === 'Pending' && pendingCount > 0 && `(${pendingCount})`}
                   </button>
                 ))}
              </div>
            </div>
            
            <div className="relative w-[280px]">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-[var(--text-muted)]" />
              </span>
              <input
                type="text"
                placeholder="Search Product or Comment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-[13px] border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:border-[var(--ink)]"
              />
            </div>
        </div>

        <div>
          <ul className="divide-y divide-[var(--border)]">
            {filteredReviews.map(review => (
              <li key={review._id} className="p-5 hover:bg-[var(--surface-muted)] transition-colors flex gap-6">
                
                {/* User & Product Info */}
                <div className="w-[200px] shrink-0">
                  <div className="text-[13px] font-bold text-[var(--ink)] mb-0.5">{review.user?.name}</div>
                  <div className="text-[11px] font-semibold text-[var(--brand)] uppercase tracking-wide mb-3">Verified Buyer</div>
                  <div className="text-[12px] text-[var(--text-secondary)] hover:text-[var(--ink)] hover:underline cursor-pointer flex items-center gap-1">
                    {review.product?.name} <ArrowUpRight size={12} />
                  </div>
                </div>

                {/* Review Body */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {renderStars(review.rating)}
                    <span className="text-[11px] text-[var(--text-muted)] font-semibold">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed max-w-[80%]">
                    "{review.comment}"
                  </p>
                </div>

                {/* Moderation Actions */}
                <div className="w-[180px] shrink-0 flex flex-col justify-start items-end gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest
                    ${review.status === 'Approved' ? 'bg-[var(--success)]/10 text-[var(--success)]' : ''}
                    ${review.status === 'Rejected' ? 'bg-[var(--error)]/10 text-[var(--error)]' : ''}
                    ${review.status === 'Pending' ? 'bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/20' : ''}
                  `}>
                     {review.status}
                  </span>

                  {review.status === 'Pending' && (
                    <div className="flex gap-2 mt-4">
                      <button className="w-9 h-9 flex items-center justify-center rounded-sm border border-[var(--border)] bg-[var(--surface)] text-[var(--error)] hover:bg-[var(--error)] hover:text-white transition-colors" title="Reject">
                        <X size={16} />
                      </button>
                      <button className="h-9 px-4 flex items-center gap-2 rounded-sm bg-[var(--ink)] text-[var(--surface)] text-[12px] font-bold hover:shadow-md transition-all" title="Approve">
                        <Check size={14} /> Publish
                      </button>
                    </div>
                  )}
                  {review.status !== 'Pending' && (
                    <div className="mt-4">
                      <button className="text-[11px] font-semibold text-[#3395FF] hover:underline">
                        Change Status
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
            {filteredReviews.length === 0 && (
              <li className="p-12 text-center text-[13px] text-[var(--text-muted)]">
                No reviews found for this status.
              </li>
            )}
          </ul>
        </div>
      </div>

    </div>
  );
};

export default Reviews;
