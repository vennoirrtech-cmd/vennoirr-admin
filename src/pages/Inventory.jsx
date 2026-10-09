import { Search, Filter, ArrowUpRight, ArrowDownRight, PackageX, Activity, AlertCircle, TrendingDown, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useState } from 'react';

const fetchProducts = async () => {
  const res = await api.get('/products/admin');
  return res.data?.data || [];
};

const fetchInventoryLogs = async () => {
  // Since we haven't wired up logs entirely in UI, we mock some history logic or fetch real if configured.
  // For now, we will just simulate chronological events of inventory changes for the "History" view that the user requested.
  return [
    { _id: '1', product: 'Oversized Heavyweight Tee', variant: 'BLA-M', change: 20, reason: 'Stock Added', date: new Date().toISOString() },
    { _id: '2', product: 'Premium Cargo Pant', variant: 'OLI-32', change: -1, reason: 'Order #VN1023', date: new Date(Date.now() - 3600000).toISOString() },
    { _id: '3', product: 'Boxy Zip Hoodie', variant: 'GRY-L', change: -1, reason: 'Order #VN1025', date: new Date(Date.now() - 7200000).toISOString() },
    { _id: '4', product: 'Classic Trouser', variant: 'NAV-34', change: 1, reason: 'Return #RT204', date: new Date(Date.now() - 86400000).toISOString() },
    { _id: '5', product: 'Winter Jacket', variant: 'BLK-XL', change: -2, reason: 'Damaged', date: new Date(Date.now() - (86400000 * 2)).toISOString() },
  ];
};

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['admin-products'],
    queryFn: fetchProducts,
  });

  const { data: logs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ['inventory-logs'],
    queryFn: fetchInventoryLogs,
  });

  // Calculate Aggregates
  let totalUnits = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  const flattenedInventory = [];

  products.forEach(p => {
    if (p.variants && p.variants.length > 0) {
      p.variants.forEach(v => {
        const stock = v.stock || 0;
        totalUnits += stock;
        if (stock === 0) outOfStockCount++;
        else if (stock <= 10) lowStockCount++;
        flattenedInventory.push({
          id: `${p._id}-${v.sku}`,
          name: p.name,
          variant: `${v.color} - ${v.size}`,
          sku: v.sku,
          stock: stock,
          status: stock === 0 ? 'Out' : (stock <= 10 ? 'Low' : 'Good')
        });
      });
    } else {
      const stock = p.stockQuantity || 0;
      totalUnits += stock;
      if (stock === 0) outOfStockCount++;
      else if (stock <= 10) lowStockCount++;
      flattenedInventory.push({
        id: p._id,
        name: p.name,
        variant: 'Base Level',
        sku: p.sku || 'N/A',
        stock: stock,
        status: stock === 0 ? 'Out' : (stock <= 10 ? 'Low' : 'Good')
      });
    }
  });

  const filteredInventory = flattenedInventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoadingProducts || isLoadingLogs) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--ink)]" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto pb-12 animate-in fade-in">
      
      {/* HEADER SECTION */}
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-[var(--ink)] tracking-tight">Inventory Center</h1>
        <p className="text-[14px] text-[var(--text-secondary)] mt-1 font-medium">Manage stock levels, variants, and track fulfillment history.</p>
      </div>

      {/* MACRO STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--surface)] border border-[var(--border)] p-5">
          <div className="text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Total Products</div>
          <div className="text-[24px] font-bold text-[var(--ink)] table-num">{products.length.toLocaleString()}</div>
        </div>
        
        <div className="bg-[var(--surface)] border border-[var(--border)] p-5">
          <div className="text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Total Units</div>
          <div className="text-[24px] font-bold text-[var(--ink)] table-num">{totalUnits.toLocaleString()}</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] p-5 relative overflow-hidden">
          <div className="text-[12px] font-semibold text-[var(--warning)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><AlertCircle size={14} /> Low Stock</div>
          <div className="text-[24px] font-bold text-[var(--ink)] table-num relative z-10">{lowStockCount}</div>
          {lowStockCount > 0 && <div className="absolute inset-0 bg-[var(--warning)] opacity-5 z-0"></div>}
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] p-5 relative overflow-hidden">
          <div className="text-[12px] font-semibold text-[var(--error)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><PackageX size={14} /> Out of Stock</div>
          <div className="text-[24px] font-bold text-[var(--ink)] table-num relative z-10">{outOfStockCount}</div>
          {outOfStockCount > 0 && <div className="absolute inset-0 bg-[var(--error)] opacity-5 z-0"></div>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* MAIN INVENTORY LIST (Col span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--surface)] border border-[var(--border)] relative">
            
            {/* Toolbar */}
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-muted)]/50">
               <div className="relative max-w-sm w-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-[var(--text-muted)]" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search SKU or Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 text-[13px] border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:border-[var(--ink)]"
                  />
                </div>
                <button className="h-9 px-3 flex items-center gap-2 border border-[var(--border)] bg-[var(--surface)] text-[12px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]">
                  <Filter size={14} /> Filters
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                    <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Product</th>
                    <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">SKU</th>
                    <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] text-right">Stock</th>
                    <th className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map(item => (
                    <tr key={item.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-muted)] transition-colors">
                      <td className="py-3 px-4">
                        <div className="text-[13px] font-medium text-[var(--ink)]">{item.name}</div>
                        <div className="text-[12px] text-[var(--text-muted)] mt-0.5">{item.variant}</div>
                      </td>
                      <td className="py-3 px-4 text-[12px] font-mono text-[var(--text-secondary)]">
                        {item.sku}
                      </td>
                      <td className="py-3 px-4 text-[13px] font-semibold table-num text-right">
                        {item.stock}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[11px] font-bold uppercase tracking-wide
                          ${item.status === 'Good' ? 'bg-[var(--success)]/10 text-[var(--success)]' : ''}
                          ${item.status === 'Low' ? 'bg-[var(--warning)]/10 text-[var(--warning)]' : ''}
                          ${item.status === 'Out' ? 'bg-[var(--error)]/10 text-[var(--error)]' : ''}
                        `}>
                           {item.status === 'Out' && '🔴'}
                           {item.status === 'Low' && '🔴'}
                           {item.status === 'Good' && '🟢'}
                           {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredInventory.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-[13px] text-[var(--text-muted)]">
                        No inventory matches found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* SIDE BAR (History) */}
        <div className="lg:col-span-1 border-l-0 lg:border-l border-[var(--border)] lg:pl-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
             <h2 className="text-[14px] font-bold text-[var(--ink)] uppercase tracking-[0.04em] flex items-center gap-2">
               <Activity size={16} /> Inventory History
             </h2>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-4 bottom-4 w-px bg-[var(--border)]"></div>
            
            <div className="space-y-6">
              {logs.map((log) => {
                const isAddition = log.change > 0;
                return (
                  <div key={log._id} className="relative z-10 pl-6 flex items-start gap-4">
                    <div className={`absolute left-0 top-1 w-3.5 h-3.5 rounded-full border-2 border-[var(--surface)] ${isAddition ? 'bg-[var(--success)]' : 'bg-[var(--error)]'}`}></div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                           <span className={`text-[12px] font-bold table-num ${isAddition ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                             {isAddition ? '+' : ''}{log.change}
                           </span>
                           <span className="text-[13px] font-semibold text-[var(--ink)]">{log.reason}</span>
                        </div>
                      </div>
                      
                      <div className="text-[12px] text-[var(--text-secondary)]">
                        {log.product} <span className="text-[var(--text-muted)]">({log.variant})</span>
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-1.5 font-semibold">
                        {new Date(log.date).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
          </div>
          
          <button className="w-full py-2 border border-[var(--border)] text-[12px] font-semibold text-[var(--text-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-colors">
            Load More History
          </button>
        </div>

      </div>
    </div>
  );
};

export default Inventory;
