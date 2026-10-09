import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, Loader2, GripVertical } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';

const fetchSections = async () => {
  const { data } = await api.get('/admin/sections');
  return data.data;
};

const fetchCategories = async () => {
    const { data } = await api.get('/categories');
    return data.data;
};

const createSection = async (formData) => {
  const { data } = await api.post('/admin/sections', formData);
  return data;
};

const updateSection = async ({ id, formData }) => {
  const { data } = await api.put(`/admin/sections/${id}`, formData);
  return data;
};

const deleteSection = async (id) => {
  const { data } = await api.delete(`/admin/sections/${id}`);
  return data;
};

const HomepageSections = () => {
  const queryClient = useQueryClient();
  const { data: sections, isLoading } = useQuery({
    queryKey: ['homepageSections'],
    queryFn: fetchSections
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    sectionType: 'category_reference',
    layoutStyle: 'horizontal_scroll',
    categoryId: '',
    displayOrder: 0,
    isActive: true,
    ctaLabel: ''
  });

  const createMutation = useMutation({
    mutationFn: createSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepageSections'] });
      toast.success('Section created successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create section');
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepageSections'] });
      toast.success('Section updated successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update section');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepageSections'] });
      toast.success('Section deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete section');
    }
  });

  const openModal = (section = null) => {
    if (section) {
      setEditingSection(section);
      setFormData({
        title: section.title,
        subtitle: section.subtitle || '',
        sectionType: section.sectionType,
        layoutStyle: section.layoutStyle,
        categoryId: section.categoryId || '',
        displayOrder: section.displayOrder,
        isActive: section.isActive,
        ctaLabel: section.ctaLabel || ''
      });
    } else {
      setEditingSection(null);
      
      const newDisplayOrder = sections && sections.length > 0 
        ? Math.max(...sections.map(s => s.displayOrder)) + 1 
        : 1;

      setFormData({
        title: '',
        subtitle: '',
        sectionType: 'category_reference',
        layoutStyle: 'horizontal_scroll',
        categoryId: '',
        displayOrder: newDisplayOrder,
        isActive: true,
        ctaLabel: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSection(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // For now, we only support category_reference to keep it simple and stable
    if (formData.sectionType === 'category_reference' && !formData.categoryId) {
        toast.error('Category is required');
        return;
    }

    const payload = { ...formData };
    
    // Clean up empty fields
    if (payload.sectionType === 'category_reference') {
        payload.productIds = [];
        delete payload.collectionId;
    }

    if (editingSection) {
      // Must pass updatedAt for optimistic concurrency check if it's there
      payload.updatedAt = editingSection.updatedAt;
      updateMutation.mutate({ id: editingSection._id, formData: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8 text-[var(--text-muted)]"><Loader2 className="animate-spin" size={24} /></div>;
  }

  return (
    <div className="w-full flex justify-center">
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-bold text-[var(--ink)]">Homepage Sections</h2>
            <button 
                onClick={() => openModal()}
                className="h-[32px] inline-flex items-center gap-1.5 px-4 text-[13px] font-semibold text-[var(--surface)] bg-[var(--ink)] hover:bg-[var(--text-secondary)] transition-colors rounded-none"
            >
                <Plus size={14} />
                <span>Add Section</span>
            </button>
        </div>

        {sections?.length === 0 ? (
            <div className="bg-[var(--surface)] border border-[var(--border)] p-8 text-center text-[var(--text-secondary)] text-[13px]">
                No homepage sections found. Add one to display on the storefront landing page.
            </div>
        ) : (
            <div className="bg-[var(--surface)] border border-[var(--border)]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--bg)] text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                            <th className="px-4 py-3 w-[60px]">Order</th>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Layout</th>
                            <th className="px-4 py-3 w-[100px] text-right">Status</th>
                            <th className="px-4 py-3 w-[100px] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sections?.map(section => (
                            <tr key={section._id} className="border-b border-[var(--border)] hover:bg-[var(--bg)] transition-colors">
                                <td className="px-4 py-3 text-[13px] font-medium text-[var(--ink)]">
                                    <div className="flex items-center gap-2">
                                        <GripVertical size={14} className="text-[var(--text-muted)] cursor-grab" />
                                        {section.displayOrder}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <p className="text-[13px] font-semibold text-[var(--ink)]">{section.title}</p>
                                    {section.subtitle && <p className="text-[11px] text-[var(--text-secondary)]">{section.subtitle}</p>}
                                </td>
                                <td className="px-4 py-3 text-[13px] text-[var(--text-secondary)] capitalize">
                                    {section.sectionType.replace('_', ' ')}
                                </td>
                                <td className="px-4 py-3 text-[13px] text-[var(--text-secondary)] capitalize">
                                    {section.layoutStyle.replace('_', ' ')}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${section.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {section.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => openModal(section)}
                                            className="p-1.5 text-[var(--text-secondary)] hover:text-blue-600 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to delete this section?')) {
                                                    deleteMutation.mutate(section._id);
                                                }
                                            }}
                                            className="p-1.5 text-[var(--text-secondary)] hover:text-red-600 transition-colors"
                                            disabled={deleteMutation.isPending}
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
        )}

        {/* Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                <div className="bg-[var(--surface)] border border-[var(--border)] w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 relative flex flex-col custom-scrollbar">
                    <h2 className="text-[16px] font-bold tracking-tight mb-4">{editingSection ? 'Edit Section' : 'Add Section'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5 min-w-0 md:col-span-2">
                                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase">Title *</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.title} 
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full px-3 h-[36px] bg-[var(--bg)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px]"
                                />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase">Subtitle</label>
                                <input 
                                    type="text" 
                                    value={formData.subtitle} 
                                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                                    className="w-full px-3 h-[36px] bg-[var(--bg)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase">Section Type</label>
                                <select 
                                    value={formData.sectionType} 
                                    onChange={(e) => setFormData({...formData, sectionType: e.target.value})}
                                    className="w-full px-3 h-[36px] bg-[var(--bg)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px]"
                                    disabled
                                >
                                    <option value="category_reference">Category Reference</option>
                                    <option value="manual_products" disabled>Manual Products (Coming Soon)</option>
                                </select>
                                <p className="text-[10px] text-[var(--text-muted)]">Currently displaying products dynamically by category.</p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase">Layout Style *</label>
                                <select 
                                    value={formData.layoutStyle} 
                                    onChange={(e) => setFormData({...formData, layoutStyle: e.target.value})}
                                    className="w-full px-3 h-[36px] bg-[var(--bg)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px]"
                                >
                                    <option value="horizontal_scroll">Horizontal Scroll (Slider)</option>
                                    <option value="grid_4col">4-Column Grid</option>
                                </select>
                            </div>
                        </div>

                        {formData.sectionType === 'category_reference' && (
                            <div className="space-y-1.5">
                                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase">Select Category *</label>
                                <select 
                                    value={formData.categoryId} 
                                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                                    className="w-full px-3 h-[36px] bg-[var(--bg)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px]"
                                    required
                                >
                                    <option value="" disabled>Select a category...</option>
                                    {categories?.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase">Display Order</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    value={formData.displayOrder} 
                                    onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})}
                                    className="w-full px-3 h-[36px] bg-[var(--bg)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px]"
                                />
                            </div>
                            <div className="space-y-1.5 pt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                        className="cursor-pointer"
                                    />
                                    <span className="text-[13px] font-medium text-[var(--ink)]">Active Status</span>
                                </label>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3 border-t border-[var(--border)] mt-6">
                            <button 
                                type="button" 
                                onClick={closeModal}
                                className="px-4 h-[32px] text-[13px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] transition-colors border border-transparent"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="px-4 h-[32px] text-[13px] font-semibold text-[var(--surface)] bg-[var(--ink)] hover:bg-black transition-colors min-w-[80px] flex items-center justify-center"
                            >
                                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 size={14} className="animate-spin" /> : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default HomepageSections;
