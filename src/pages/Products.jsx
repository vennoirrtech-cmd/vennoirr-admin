import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';
import './Products.css';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products');
      if (response.data?.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products from server');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await api.delete(`/products/${id}`);
        if (response.data?.success || response.status === 200 || response.status === 204) {
          setProducts(products.filter(p => p._id !== id));
          toast.success('Product deleted successfully');
        } else {
          throw new Error('Failed to delete product');
        }
      } catch (error) {
        console.error('Failed to delete', error);
        toast.error(`❌ ${error?.response?.data?.message || 'Failed to delete product'}`);
      }
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="products-container p-6 w-full">
      <div className="products-header flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted">Manage your catalog, pricing, and stock status.</p>
        </div>
        <button className="btn btn-primary add-btn" onClick={() => navigate('/products/add')}>
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      <div className="products-controls glass mb-6">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search products by name or SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-outline filter-btn">
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      <div className="table-container glass">
        {loading ? (
          <div className="p-8 text-center text-muted">Loading products...</div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Product Info</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product._id}>
                  <td className="product-info-cell">
                    <div className="product-avatar"></div>
                    <span className="product-name font-medium">{product.name}</span>
                  </td>
                  <td className="text-muted">{product.sku}</td>
                  <td>
                    <span className="category-badge">{product.category?.name || 'Uncategorized'}</span>
                  </td>
                  <td className="font-semibold">₹{product.price}</td>
                  <td>
                    <span className={`stock-badge ${product.stockQuantity > 20 ? 'in-stock' : 'low-stock'}`}>
                      {product.stockQuantity} in stock
                    </span>
                  </td>
                  <td className="actions-cell text-right">
                    <button 
                      className="action-btn text-blue-400 hover:bg-blue-400/10"
                      onClick={() => navigate(`/products/edit/${product._id}`)}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button className="action-btn text-red-500 hover:bg-red-500/10" onClick={() => handleDelete(product._id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center p-8 text-muted">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Products;
