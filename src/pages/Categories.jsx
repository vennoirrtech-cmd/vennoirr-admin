import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      if (response.data?.success) {
        setCategories(response.data.data);
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

  return (
    <div className="categories-container p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted">Organize your products into categories.</p>
        </div>
        <button className="btn btn-primary add-btn">
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
                <th>Items Count</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat._id}>
                  <td className="font-medium text-main">{cat.name}</td>
                  <td className="text-muted">{cat.description}</td>
                  <td>{cat.items}</td>
                  <td>
                    <span className={`status-badge ${cat.isActive ? 'status-success' : 'status-danger'}`}>
                      {cat.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="action-btn text-blue-400 hover:bg-blue-400/10">
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className="action-btn text-red-500 hover:bg-red-500/10"
                      onClick={() => handleDelete(cat._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Categories;
