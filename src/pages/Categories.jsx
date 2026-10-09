import { useState, useMemo } from 'react';
import { Plus, Trash2, X, Loader2, FolderOpen, Search, AlignJustify, AlignCenter, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCategories, useCreateCategory, useDeleteCategory } from '../hooks/useCategories';
import { motion, AnimatePresence } from 'framer-motion';

const Categories = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [density, setDensity] = useState('comfortable');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const { data: categories = [], isLoading, isError, refetch } = useCategories();

  const deleteCategoryMutation = useDeleteCategory(() => {
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
  });

  const confirmDelete = (category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const addCategoryMutation = useCreateCategory(() => {
    setShowModal(false);
    setFormData({ name: '', description: '' });
  });

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Category name is required');
      return;
    }

    addCategoryMutation.mutate(formData);
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [categories, searchTerm]);

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
              placeholder="Search categories..."
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
            className="h-[32px] px-3 text-[13px] font-semibold text-[var(--surface)] bg-[var(--ink)] hover:bg-[var(--text-secondary)] transition-colors rounded-none flex items-center gap-1.5"
            onClick={() => setShowModal(true)}
          >
            <Plus size={14} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[var(--surface)] border border-[var(--border)] flex-1 overflow-hidden flex flex-col relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-3 text-[var(--text-secondary)] z-20 bg-[var(--surface)]/80 backdrop-blur-sm">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--ink)]" />
            <span className="text-[14px]">Loading categories...</span>
          </div>
        ) : isError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-[var(--error)] bg-[var(--surface)] z-20">
            <span className="text-[14px] font-medium">Failed to load categories. Please refresh.</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-[var(--text-muted)] bg-[var(--surface)] z-20 text-[14px]">
            No categories found.
          </div>
        ) : null}

        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-[var(--surface)] sticky top-0 z-10 before:content-[''] before:absolute before:left-0 before:right-0 before:bottom-0 before:border-b before:border-[var(--border)]">
              <tr>
                <th className="px-4 py-2.5 font-semibold uppercase tracking-[0.04em] text-[12px] text-[var(--text-muted)] whitespace-nowrap">Name</th>
                <th className="px-4 py-2.5 font-semibold uppercase tracking-[0.04em] text-[12px] text-[var(--text-muted)] whitespace-nowrap">Description</th>
                <th className="px-4 py-2.5 font-semibold uppercase tracking-[0.04em] text-[12px] text-[var(--text-muted)] whitespace-nowrap">Status</th>
                <th className="px-4 py-2.5 font-semibold uppercase tracking-[0.04em] text-[12px] text-[var(--text-muted)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map(cat => {
                const isDeleting = deleteCategoryMutation.isPending && deleteCategoryMutation.variables === cat._id;
                return (
                  <tr key={cat._id} className={`border-b border-[var(--border)] hover:bg-[var(--surface-muted)] transition-colors group ${isDeleting ? 'opacity-50' : ''}`}>
                    <td className={`px-4 ${tdClass} font-semibold text-[13px] text-[var(--ink)]`}>{cat.name}</td>
                    <td className={`px-4 ${tdClass} text-[13px] text-[var(--text-secondary)] max-w-sm truncate`}>{cat.description || '—'}</td>
                    <td className={`px-4 ${tdClass}`}>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[11px] font-semibold uppercase tracking-wide border border-transparent ${cat.isActive !== false ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-[var(--surface-muted)] text-[var(--text-secondary)]'}`}>
                        {cat.isActive !== false ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className={`px-4 ${tdClass} text-right`}>
                      <div className="flex justify-end gap-1 items-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1.5 text-[var(--error)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors border border-transparent"
                          onClick={() => confirmDelete(cat)}
                          title="Delete"
                          disabled={isDeleting}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Category Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-[var(--surface)] border border-[var(--border)] w-full max-w-md flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--border)]">
                <h2 className="text-[14px] font-semibold text-[var(--ink)]">Add New Category</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-[var(--text-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)] p-1 transition-colors disabled:opacity-50"
                  disabled={addCategoryMutation.isPending}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddCategory} className="flex flex-col">
                <div className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.04em]">Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--ink)] transition-colors text-[13px] text-[var(--ink)] rounded-none outline-none"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Shirts"
                      disabled={addCategoryMutation.isPending}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-[0.04em]">Description (Optional)</label>
                    <textarea
                      className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--ink)] transition-colors text-[13px] text-[var(--ink)] rounded-none outline-none resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief category description..."
                      rows={3}
                      disabled={addCategoryMutation.isPending}
                    />
                  </div>
                </div>

                <div className="bg-[var(--surface-muted)] px-6 py-4 flex flex-row-reverse gap-3 border-t border-[var(--border)]">
                  <button
                    type="submit"
                    className="h-[32px] px-4 text-[13px] font-semibold text-[var(--surface)] bg-[var(--ink)] hover:bg-[var(--text-secondary)] transition-colors rounded-none flex items-center justify-center gap-2"
                    disabled={addCategoryMutation.isPending}
                  >
                    {addCategoryMutation.isPending ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Adding...</span>
                      </>
                    ) : (
                      'Add Category'
                    )}
                  </button>
                  <button
                    type="button"
                    className="h-[32px] px-4 text-[13px] font-semibold text-[var(--text-secondary)] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)] transition-colors rounded-none flex items-center justify-center"
                    onClick={() => setShowModal(false)}
                    disabled={addCategoryMutation.isPending}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
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
                  <h3 className="text-lg font-semibold text-[var(--ink)]">Delete Category</h3>
                  <div className="mt-2 text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    Are you sure you want to delete <span className="font-semibold text-[var(--ink)]">{categoryToDelete?.name}</span>? This action cannot be undone.
                  </div>
                </div>
              </div>
              <div className="bg-[var(--surface-muted)] px-6 py-4 flex flex-row-reverse gap-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  className="h-[32px] px-4 text-[13px] font-semibold text-[var(--surface)] bg-[var(--error)] hover:bg-red-700 transition-colors rounded-none w-full sm:w-auto flex items-center justify-center"
                  onClick={() => deleteCategoryMutation.mutate(categoryToDelete?._id)}
                  disabled={deleteCategoryMutation.isPending}
                >
                  {deleteCategoryMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  className="h-[32px] px-4 text-[13px] font-semibold text-[var(--text-secondary)] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)] transition-colors rounded-none w-full sm:w-auto flex items-center justify-center"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deleteCategoryMutation.isPending}
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

export default Categories;
