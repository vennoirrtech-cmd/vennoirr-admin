import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Filter, Loader2, X, Image as ImageIcon, AlertTriangle, AlignJustify, AlignCenter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts, useDeleteProduct } from '../hooks/useProducts';
const Products = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [density, setDensity] = useState('comfortable'); // 'comfortable' or 'compact'

  const { data: products = [], isLoading, isError, refetch } = useProducts();
  const deleteMutation = useDeleteProduct();

  // Custom wrapper to close modal upon delete start/success
  const handleDeleteWrapper = async (id) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setProductToDelete(null);
      },
      onError: () => {
        setDeleteModalOpen(false);
      }
    });
  };

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

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
              placeholder="Search products by name or SKU..."
              className="w-full pl-8 pr-4 h-[32px] bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--ink)] focus:outline-none transition-colors text-[13px] text-[var(--ink)] placeholder:text-[var(--text-muted)] rounded-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className="h-[32px] px-3 bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--ink)] hover:bg-[var(--surface-muted)] transition-colors text-[13px] text-[var(--text-secondary)] hover:text-[var(--ink)] rounded-none flex items-center gap-1.5">
            <Filter size={14} />
            <span>Filter</span>
          </button>
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
            className="h-[32px] px-3 text-[13px] font-semibold text-[var(--surface)] bg-[var(--ink)] hover:bg-[var(--text-secondary)] transition-colors rounded-none flex items-center gap-1.5"
            onClick={() => navigate('/products/add')}
          >
            <Plus size={14} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] flex-1 overflow-hidden flex flex-col relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-[var(--text-secondary)] z-20 bg-[var(--surface)]/80 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--ink)]" />
            <span className="text-[14px]">Loading products...</span>
          </div>
        ) : isError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-[var(--error)] bg-[var(--surface)] z-20">
            <span className="text-[14px] font-medium">Failed to load products. Please refresh.</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-[var(--text-muted)] bg-[var(--surface)] z-20 text-[14px]">
            No products found.
          </div>
        ) : null}

        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[var(--surface)] sticky top-0 z-10 before:content-[''] before:absolute before:left-0 before:right-0 before:bottom-0 before:border-b before:border-[var(--border)]">
              <tr>
                <th className="px-4 py-2.5 font-semibold uppercase tracking-[0.04em] text-[12px] text-[var(--text-muted)] whitespace-nowrap">Product Info</th>
                <th className="px-4 py-2.5 font-semibold uppercase tracking-[0.04em] text-[12px] text-[var(--text-muted)] whitespace-nowrap">SKU</th>
                <th className="px-4 py-2.5 font-semibold uppercase tracking-[0.04em] text-[12px] text-[var(--text-muted)] whitespace-nowrap">Category</th>
                <th className="px-4 py-2.5 font-semibold uppercase tracking-[0.04em] text-[12px] text-[var(--text-muted)] text-right whitespace-nowrap">Price</th>
                <th className="px-4 py-2.5 font-semibold uppercase tracking-[0.04em] text-[12px] text-[var(--text-muted)] whitespace-nowrap">Stock</th>
                <th className="px-4 py-2.5 font-semibold uppercase tracking-[0.04em] text-[12px] text-[var(--text-muted)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product._id} className="border-b border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors group">
                  <td className={`px-4 ${tdClass} max-w-[300px]`}>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 bg-[var(--surface-muted)] border border-[var(--border)] overflow-hidden flex items-center justify-center text-[var(--text-muted)]">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon size={16} />
                        )}
                      </div>
                      <span className="text-[13px] font-medium text-[var(--ink)] truncate block w-full">{product.name}</span>
                    </div>
                  </td>
                  <td className={`px-4 ${tdClass} text-[13px] text-[var(--text-secondary)] font-mono whitespace-nowrap`}>
                    {product.sku || '—'}
                  </td>
                  <td className={`px-4 ${tdClass}`}>
                    <span className="inline-flex items-center text-[13px] text-[var(--ink)]">
                      {product.category?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className={`px-4 ${tdClass} font-semibold text-[13px] text-[var(--ink)] table-num text-right`}>
                    ₹{product.price?.toLocaleString('en-IN') || 0}
                  </td>
                  <td className={`px-4 ${tdClass} whitespace-nowrap`}>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[11px] font-semibold uppercase tracking-wide border border-transparent ${product.stockQuantity > 20
                        ? 'bg-[var(--success)]/10 text-[var(--success)]'
                        : product.stockQuantity > 0
                          ? 'bg-[var(--warning)]/10 text-[var(--warning)]'
                          : 'bg-[var(--error)]/10 text-[var(--error)]'
                      }`}>
                      {product.stockQuantity} in stock
                    </span>
                  </td>
                  <td className={`px-4 ${tdClass} text-right`}>
                    <div className="flex justify-end gap-1 items-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-1.5 text-[var(--ink)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] transition-colors border border-transparent"
                        onClick={() => navigate(`/products/edit/${product._id}`)}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="p-1.5 text-[var(--error)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors border border-transparent"
                        onClick={() => confirmDelete(product)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal - Calm Density Update */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-[var(--surface)] border border-[var(--border)] w-full max-w-sm flex flex-col shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center justify-center h-10 w-10 bg-[var(--error)]/10 border border-[var(--error)]/20 shrink-0">
                    <AlertTriangle className="h-5 w-5 text-[var(--error)]" aria-hidden="true" />
                  </div>
                  <button onClick={() => setDeleteModalOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--ink)] transition-colors p-1">
                    <X size={16} />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--ink)]">Delete Product</h3>
                  <div className="mt-2 text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    Are you sure you want to delete <span className="font-semibold text-[var(--ink)]">{productToDelete?.name}</span>? This action cannot be undone.
                  </div>
                </div>
              </div>
              <div className="bg-[var(--surface-muted)] px-6 py-4 flex flex-row-reverse gap-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  className="h-[32px] px-4 text-[13px] font-semibold text-[var(--surface)] bg-[var(--error)] hover:bg-red-700 transition-colors rounded-none w-full sm:w-auto flex items-center justify-center"
                  onClick={() => handleDeleteWrapper(productToDelete?._id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  className="h-[32px] px-4 text-[13px] font-semibold text-[var(--text-secondary)] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)] transition-colors rounded-none w-full sm:w-auto flex items-center justify-center"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
