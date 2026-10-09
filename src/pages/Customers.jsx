import { useState, useMemo } from 'react';
import { Search, Eye, Users, Loader2, AlignJustify, AlignCenter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCustomers } from '../hooks/useCustomers';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [density, setDensity] = useState('comfortable'); // 'comfortable' or 'compact'
  const navigate = useNavigate();

  const { data: customers = [], isLoading, isError, refetch } = useCustomers();

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer._id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  const tdClass = density === 'comfortable' ? 'py-3' : 'py-1.5';

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header & Filters Bar (slim 40px) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">

        <div className="flex flex-1 items-center gap-3 w-full">
          {/* Search */}
          <div className="relative w-full max-w-[280px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search Name, Phone, Email..."
              className="w-full pl-8 pr-4 h-[32px] bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--ink)] focus:outline-none transition-colors text-[13px] text-[var(--ink)] placeholder:text-[var(--text-muted)] rounded-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
            disabled={isLoading}
          >
            <Loader2 size={14} className={isLoading ? "animate-spin text-[var(--ink)]" : "hidden"} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] flex-1 overflow-hidden flex flex-col relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-[var(--text-secondary)] z-20 bg-[var(--surface)]/80 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--ink)]" />
            <span className="text-[14px]">Loading customers...</span>
          </div>
        ) : isError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-[var(--error)] bg-[var(--surface)] z-20">
            <span className="text-[14px] font-medium">Failed to load customers. Please refresh.</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-[var(--text-muted)] bg-[var(--surface)] z-20 gap-4">
            <Users className="h-10 w-10 text-[var(--border)]" />
            <p className="text-[14px]">No customers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-[var(--surface)] sticky top-0 z-10 before:content-[''] before:absolute before:left-0 before:right-0 before:bottom-0 before:border-b before:border-[var(--border)]">
                <tr>
                  <th className="px-4 py-2.5 font-semibold uppercase tracking-[0.04em] text-[12px] text-[var(--text-muted)] whitespace-nowrap">Phone Number</th>
                  <th className="px-4 py-2.5 font-semibold uppercase tracking-[0.04em] text-[12px] text-[var(--text-muted)] whitespace-nowrap">Customer Name</th>
                  <th className="px-4 py-2.5 font-semibold uppercase tracking-[0.04em] text-[12px] text-[var(--text-muted)] whitespace-nowrap">Total Orders</th>
                  <th className="px-4 py-2.5 font-semibold uppercase tracking-[0.04em] text-[12px] text-[var(--text-muted)] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr key={customer._id} className="border-b border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors group">
                    <td className={`px-4 ${tdClass} whitespace-nowrap`}>
                      <span className="font-medium text-[var(--ink)] text-[13px] table-num">
                        {customer.phone || 'N/A'}
                      </span>
                    </td>
                    <td className={`px-4 ${tdClass}`}>
                      <div className="flex flex-col truncate">
                        <span className="text-[13px] font-medium text-[var(--ink)]">{customer.name || 'N/A'}</span>
                        {density === 'comfortable' && customer.email && (
                          <span className="text-[12px] text-[var(--text-muted)] mt-0.5">{customer.email}</span>
                        )}
                      </div>
                    </td>
                    <td className={`px-4 ${tdClass}`}>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-[var(--surface-muted)] text-[12px] font-semibold text-[var(--text-secondary)] border border-[var(--border)]">
                        {customer.totalOrders || 0} orders
                      </span>
                    </td>
                    <td className={`px-4 ${tdClass} text-right`}>
                      <div className="flex justify-end gap-1 items-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1.5 text-[var(--ink)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] transition-colors border border-transparent"
                          title="View Details"
                          onClick={() => navigate(`/customers/${customer._id}`)}
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
