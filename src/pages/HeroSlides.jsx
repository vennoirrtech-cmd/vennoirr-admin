import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, Loader2, ImagePlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';

const fetchSlides = async () => {
  const { data } = await api.get('/hero-slides/admin');
  return data.data;
};

const createSlide = async (formData) => {
  const { data } = await api.post('/hero-slides/admin', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

const updateSlide = async ({ id, formData }) => {
  const { data } = await api.put(`/hero-slides/admin/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

const deleteSlide = async (id) => {
  const { data } = await api.delete(`/hero-slides/admin/${id}`);
  return data;
};

const HeroSlides = () => {
  const queryClient = useQueryClient();
  const { data: slides, isLoading } = useQuery({
    queryKey: ['heroSlides'],
    queryFn: fetchSlides
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    button: 'SHOP NOW',
    isActive: true,
    displayOrder: 0
  });
  const [imageFile, setImageFile] = useState(null);

  const createMutation = useMutation({
    mutationFn: createSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroSlides'] });
      toast.success('Slide created successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create slide');
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroSlides'] });
      toast.success('Slide updated successfully');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update slide');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heroSlides'] });
      toast.success('Slide deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete slide');
    }
  });

  const openModal = (slide = null) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({
        title: slide.title,
        tagline: slide.tagline || '',
        button: slide.button || '',
        isActive: slide.isActive,
        displayOrder: slide.displayOrder
      });
    } else {
      setEditingSlide(null);
      setFormData({
        title: '',
        tagline: '',
        button: 'SHOP NOW',
        isActive: true,
        displayOrder: 0
      });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSlide(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!editingSlide && !imageFile) {
        toast.error('Please upload an image.');
        return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('tagline', formData.tagline);
    data.append('button', formData.button);
    data.append('isActive', formData.isActive);
    data.append('displayOrder', formData.displayOrder);
    
    if (imageFile) {
      data.append('image', imageFile);
    }

    if (editingSlide) {
      updateMutation.mutate({ id: editingSlide._id, formData: data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[18px] font-bold text-[var(--ink)] tracking-tight">Storefront Slides</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">Manage landing page hero slides.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="h-[32px] inline-flex items-center gap-1.5 px-4 text-[13px] font-semibold text-[var(--surface)] bg-[var(--ink)] hover:bg-[var(--text-secondary)] transition-colors rounded-none"
        >
          <Plus size={14} />
          <span>Add Slide</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
            <Loader2 className="animate-spin text-[var(--text-muted)]" size={24} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            <strong>Recommended image dimensions:</strong> 2100 x 750 pixels (or similar panoramic ratio) for optimal display on the storefront landing page.
                        </p>
                    </div>
                </div>
            </div>

            {slides?.length === 0 ? (
                <div className="bg-[var(--surface)] border border-[var(--border)] p-8 text-center text-[var(--text-secondary)] text-[13px]">
                    No slides found. Click "Add Slide" to create one.
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {slides?.map(slide => (
                    <div key={slide._id} className="bg-[var(--surface)] border border-[var(--border)] group flex flex-col h-full">
                         <div className="relative w-full h-[180px] bg-gray-100 border-b border-[var(--border)]">
                             <img src={slide.image.url} alt={slide.title} className="w-full h-full object-cover" />
                             {!slide.isActive && (
                                <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-[10px] px-2 py-1 font-bold uppercase rounded">
                                    Inactive
                                </div>
                             )}
                         </div>
                         <div className="p-4 flex flex-col flex-grow">
                             <div className="mb-2">
                                <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">{slide.tagline}</span>
                                <h3 className="text-[15px] font-bold text-[var(--ink)]">{slide.title}</h3>
                             </div>
                             <div className="mt-auto pt-4 flex justify-between items-center border-t border-[var(--border)]">
                                 <span className="text-[12px] font-medium text-[var(--text-muted)]">Order: {slide.displayOrder}</span>
                                 <div className="flex items-center gap-2">
                                     <button 
                                        onClick={() => openModal(slide)}
                                        className="p-1.5 text-[var(--text-secondary)] hover:text-blue-600 transition-colors"
                                     >
                                         <Edit2 size={16} />
                                     </button>
                                     <button 
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this slide?')) {
                                                deleteMutation.mutate(slide._id);
                                            }
                                        }}
                                        className="p-1.5 text-[var(--text-secondary)] hover:text-red-600 transition-colors"
                                        disabled={deleteMutation.isPending}
                                     >
                                         <Trash2 size={16} />
                                     </button>
                                 </div>
                             </div>
                         </div>
                    </div>
                ))}
            </div>
            )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-[var(--surface)] border border-[var(--border)] w-full max-w-lg max-h-[90vh] overflow-y-auto w-full p-6 relative flex flex-col custom-scrollbar">
                <h2 className="text-[16px] font-bold tracking-tight mb-4">{editingSlide ? 'Edit Slide' : 'Add Slide'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase">Title *</label>
                        <input 
                            type="text" 
                            required
                            value={formData.title} 
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="w-full px-3 h-[36px] bg-[var(--bg)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px]"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase">Tagline</label>
                        <input 
                            type="text" 
                            value={formData.tagline} 
                            onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                            className="w-full px-3 h-[36px] bg-[var(--bg)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px]"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase">Button Text</label>
                        <input 
                            type="text" 
                            value={formData.button} 
                            onChange={(e) => setFormData({...formData, button: e.target.value})}
                            className="w-full px-3 h-[36px] bg-[var(--bg)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px]"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase">Display Order</label>
                            <input 
                                type="number" 
                                value={formData.displayOrder} 
                                onChange={(e) => setFormData({...formData, displayOrder: e.target.value})}
                                className="w-full px-3 h-[36px] bg-[var(--bg)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px]"
                            />
                        </div>
                        <div className="space-y-1.5 flex flex-col justify-end pb-1.5">
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
                    <div className="space-y-1.5 pt-2">
                        <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase">Image {editingSlide ? '(Leave empty to keep existing)' : '*'}</label>
                        <div className="border border-dashed border-[var(--border)] p-4 flex flex-col items-center justify-center bg-[var(--bg)]">
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files[0])}
                                className="hidden"
                                id="slide-image-upload"
                            />
                            <label htmlFor="slide-image-upload" className="cursor-pointer flex flex-col items-center">
                                <ImagePlus size={24} className="text-[var(--text-muted)] mb-2" />
                                <span className="text-[12px] text-[var(--text-secondary)] hover:text-[var(--ink)] transition-colors">
                                    {imageFile ? imageFile.name : (editingSlide ? 'Upload new image (optional)' : 'Click to select image')}
                                </span>
                            </label>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] mt-1">Recommended: 2100 x 750 pixels</p>
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
  );
};

export default HeroSlides;
