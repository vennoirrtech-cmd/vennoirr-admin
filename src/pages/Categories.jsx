import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      if (response.data?.success) {
        setCategories(response.data.data);
      } else {
        // sometimes data might be directly the array?
        setCategories(response.data?.data || response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await api.delete(`/categories/${id}`);
        if (response.data?.success || response.status === 200 || response.status === 204) {
          setCategories(categories.filter(c => c._id !== id));
          toast.success('Category deleted successfully');
        } else {
          throw new Error('Failed to delete category');
        }
      } catch (error) {
        console.error('Failed to delete category:', error);
        toast.error(`❌ ${error?.response?.data?.message || 'Failed to delete category'}`);
      }
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Category name is required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await api.post('/categories', formData);
      if (response.data?.success || response.status === 201 || response.status === 200) {
        toast.success('Category created successfully');
        setShowModal(false);
        setFormData({ name: '', description: '' });
        fetchCategories();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="categories-container p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted">Organize your products into categories.</p>
        </div>
        <button className="btn btn-primary add-btn" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          <span>Add Category</span>
        </button>
      </div>

      <div className="table-container glass">
        {loading ? (
          <div className="p-8 text-center text-muted">Loading categories...</div>
        ) : (
          <table className="categories-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat._id}>
                  <td className="font-medium text-main">{cat.name}</td>
                  <td className="text-muted">{cat.description}</td>
                  <td>
                    <span className={`status-badge ${cat.isActive ? 'status-success' : 'status-danger'}`}>
                      {cat.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="text-right">
                    <button 
                      className="action-btn text-red-500 hover:bg-red-500/10"
                      onClick={() => handleDelete(cat._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center p-8 text-muted">No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '400px', width: '100%', padding: '24px', borderRadius: '12px' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Category</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-muted hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCategory}>
              <div className="form-group mb-4">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="form-input w-full p-2 rounded bg-black border border-gray-700 text-white"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Shirts"
                />
              </div>
              <div className="form-group mb-6">
                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                <textarea
                  className="form-input w-full p-2 rounded bg-black border border-gray-700 text-white"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Category description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="btn btn-secondary px-4 py-2 rounded border border-gray-600"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-4 py-2 rounded bg-white text-black font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
