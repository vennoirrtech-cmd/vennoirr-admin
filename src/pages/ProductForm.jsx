import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, UploadCloud } from 'lucide-react';
import { api } from '../services/api';
import { uploadToCloudinary } from '../utils/cloudinary';
import { toast } from 'react-hot-toast';
import './ProductForm.css';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Split Image State
  const [frontImage, setFrontImage] = useState(null); // File object
  const [backImage, setBackImage] = useState(null); // File object

  const [frontPreview, setFrontPreview] = useState(null); // URL
  const [backPreview, setBackPreview] = useState(null); // URL

  const [existingImages, setExistingImages] = useState([]); // from backend

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    mrp: '',
    sku: '',
    stockQuantity: '',
    gender: 'Unisex',
    sizes: 'M,L,XL',
    colors: 'Black,White',
    isNewArrival: true,
    isBestSeller: false,
    isTrending: false,
  });

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.success) setCategories(res.data.data);
      } catch {
        console.error('Failed to load categories');
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/products/admin/${id}`);
          if (res.data?.success) {
            const prod = res.data.data;
            setFormData({
              name: prod.name || '',
              description: prod.description || '',
              category: prod.category?._id || prod.category || '',
              price: prod.price || '',
              mrp: prod.mrp || '',
              sku: prod.sku || '',
              stockQuantity: prod.stockQuantity || '',
              gender: prod.gender || 'Unisex',
              sizes: prod.sizes?.join(', ') || '',
              colors: prod.colors?.join(', ') || '',
              isNewArrival: prod.isNewArrival || false,
              isBestSeller: prod.isBestSeller || false,
              isTrending: prod.isTrending || false,
            });

            // Set images if they exist
            if (prod.images && prod.images.length > 0) {
              setExistingImages(prod.images);
              const front = prod.images.find(img => img.order === 0) || prod.images[0];
              const back = prod.images.find(img => img.order === 1) || prod.images[1];
              if (front) setFrontPreview(front.url);
              if (back) setBackPreview(back.url);
            }
          }
        } catch (err) {
          console.error("Failed to fetch product:", err);
          toast.error("Could not load product details.");
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit]);

  // ── Auto-generate SKU from name ──────────────────────────────────
  const autoSKU = (name) =>
    name.toUpperCase().replace(/[^A-Z0-9 ]/g, '').trim().replace(/\s+/g, '-').slice(0, 18)
    + '-' + Date.now().toString().slice(-4);

  // ── Image handlers ───────────────────────────────────────────────
  const handleFrontUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFrontImage(file);
      const reader = new FileReader();
      reader.onload = ev => setFrontPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleBackUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackImage(file);
      const reader = new FileReader();
      reader.onload = ev => setBackPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeFront = () => {
    setFrontImage(null);
    setFrontPreview(null);
    if (frontInputRef.current) frontInputRef.current.value = '';
  };

  const removeBack = () => {
    setBackImage(null);
    setBackPreview(null);
    if (backInputRef.current) backInputRef.current.value = '';
  };

  // ── Form handlers ────────────────────────────────────────────────
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'name' && !prev.sku && !isEdit) updated.sku = autoSKU(value);
      return updated;
    });
  };

  // ── Submit Logic ──────────────────────────────────────────────────
  const handleSubmit = async e => {
    e.preventDefault();
    if (!isEdit && !frontImage) {
      toast.error('Please upload a Front Image (Main Display).');
      return;
    }
    
    setLoading(true);
    try {
      // 1. Handle Cloudinary Uploads
      let finalImages = [];
      
      if (isEdit) {
        // Scrub _id to prevent MongoDB CastErrors when submitting existing images
        finalImages = existingImages.map(({ url, publicId, order }) => ({ url, publicId, order }));
      }

      if (frontImage) {
        const uploadedFront = await uploadToCloudinary(frontImage);
        const imgObj = { url: uploadedFront.url, publicId: uploadedFront.publicId, order: 0 };
        if (isEdit) {
          const idx = finalImages.findIndex(img => img.order === 0);
          if (idx !== -1) finalImages[idx] = imgObj;
          else finalImages.push(imgObj);
        } else {
          finalImages.push(imgObj);
        }
      }

      if (backImage) {
        const uploadedBack = await uploadToCloudinary(backImage);
        const imgObj = { url: uploadedBack.url, publicId: uploadedBack.publicId, order: 1 };
        if (isEdit) {
          const idx = finalImages.findIndex(img => img.order === 1);
          if (idx !== -1) finalImages[idx] = imgObj;
          else finalImages.push(imgObj);
        } else {
          finalImages.push(imgObj);
        }
      }

      const payload = {
        ...formData,
        price: Number(formData.price) || 0,
        mrp: Number(formData.mrp) || 0,
        stockQuantity: Number(formData.stock) || 0,
        sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()) : [],
        colors: formData.colors ? formData.colors.split(',').map(c => c.trim()) : [],
        images: finalImages,
      };

      // Clean up empty payload fields to prevent Joi validation lengths crashing (e.g. category length must be 24)
      if (!payload.category) delete payload.category;
      if (!payload.subCategory) delete payload.subCategory;
      if (!payload.gender) delete payload.gender;
      delete payload.stock;

      if (!isEdit) {
        const res = await api.post('/products', payload);
        if (!res.data?.success) throw new Error('Product creation failed');
      } else {
        await api.put(`/products/${id}`, payload);
      }

      toast.success(`Product ${isEdit ? 'updated' : 'added'} successfully!`);
      navigate('/products');
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err.message || 'Failed to save product';
      toast.error(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form-container p-6 w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button type="button" className="btn btn-outline back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
            <p className="text-muted">{isEdit ? 'Update details or replace images.' : 'Fill in details and upload product images.'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="product-form glass">
        <div className="form-grid">

          {/* ── Split Image Uploads ── */}
          <div className="form-group full-width">
            <label className="text-lg font-semibold block mb-2">Product Images <span className="req">*</span></label>
            <div className="grid grid-cols-2 gap-6 mt-2">
              
              {/* Front Image Dropzone */}
              <div className="image-split-zone">
                <p className="text-sm font-medium mb-2">1. Front Image (Main display) <span className="text-red-500">*</span></p>
                {!frontPreview ? (
                  <div
                    className="img-dropzone"
                    onClick={() => frontInputRef.current?.click()}
                  >
                    <UploadCloud size={24} strokeWidth={1.5} />
                    <p className="mt-2 text-sm text-center">Click to upload <strong>Front Image</strong></p>
                    <input
                      ref={frontInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleFrontUpload}
                    />
                  </div>
                ) : (
                  <div className="img-preview-single">
                    <img src={frontPreview} alt="Front preview" className="w-full h-48 object-cover rounded shadow" />
                    <button type="button" className="btn btn-outline text-red-500 text-sm mt-3 w-full" onClick={removeFront}>
                      Remove / Change Front Image
                    </button>
                    <input ref={frontInputRef} type="file" accept="image/*" hidden onChange={handleFrontUpload}/>
                  </div>
                )}
              </div>

              {/* Back Image Dropzone */}
              <div className="image-split-zone">
                <p className="text-sm font-medium mb-2">2. Back Image (Hover display)</p>
                {!backPreview ? (
                  <div
                    className="img-dropzone"
                    onClick={() => backInputRef.current?.click()}
                  >
                    <UploadCloud size={24} strokeWidth={1.5} />
                    <p className="mt-2 text-sm text-center">Click to upload <strong>Back Image</strong></p>
                    <input
                      ref={backInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleBackUpload}
                    />
                  </div>
                ) : (
                  <div className="img-preview-single">
                    <img src={backPreview} alt="Back preview" className="w-full h-48 object-cover rounded shadow" />
                    <button type="button" className="btn btn-outline text-red-500 text-sm mt-3 w-full" onClick={removeBack}>
                      Remove / Change Back Image
                    </button>
                    <input ref={backInputRef} type="file" accept="image/*" hidden onChange={handleBackUpload}/>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ── Basic Info ── */}
          <div className="form-group full-width">
            <label>Product Name <span className="req">*</span></label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Oversized Plain Tee" />
          </div>

          <div className="form-group full-width">
            <label>Description <span className="req">*</span></label>
            <textarea name="description" rows="3" required value={formData.description} onChange={handleChange} placeholder="Product description..." />
          </div>

          {/* ── Category & Gender ── */}
          <div className="form-group">
            <label>Category <span className="req">*</span></label>
            <select name="category" required value={formData.category} onChange={handleChange}>
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>

          {/* ── Pricing ── */}
          <div className="form-group">
            <label>Selling Price (₹) <span className="req">*</span></label>
            <input type="number" name="price" required min="0" value={formData.price} onChange={handleChange} placeholder="1499" />
          </div>

          <div className="form-group">
            <label>MRP (₹) <span className="req">*</span></label>
            <input type="number" name="mrp" required min="0" value={formData.mrp} onChange={handleChange} placeholder="2499" />
          </div>

          {/* ── SKU & Stock ── */}
          <div className="form-group">
            <label>SKU <span className="req">*</span></label>
            <input type="text" name="sku" required value={formData.sku} onChange={handleChange} placeholder="VN-BLK-01" />
          </div>

          <div className="form-group">
            <label>Stock Quantity <span className="req">*</span></label>
            <input type="number" name="stockQuantity" required min="0" value={formData.stockQuantity} onChange={handleChange} placeholder="100" />
          </div>

          {/* ── Sizes & Colors ── */}
          <div className="form-group">
            <label>Sizes <span className="field-hint">(comma-separated)</span></label>
            <input type="text" name="sizes" value={formData.sizes} onChange={handleChange} placeholder="M, L, XL" />
          </div>

          <div className="form-group">
            <label>Colors <span className="field-hint">(comma-separated)</span></label>
            <input type="text" name="colors" value={formData.colors} onChange={handleChange} placeholder="Black, White" />
          </div>

          {/* ── Flags ── */}
          <div className="form-group full-width flags-row">
            <label className="flag-check">
              <input type="checkbox" name="isNewArrival" checked={formData.isNewArrival} onChange={handleChange} />
              <span>New Arrival</span>
            </label>
            <label className="flag-check">
              <input type="checkbox" name="isBestSeller" checked={formData.isBestSeller} onChange={handleChange} />
              <span>Best Seller</span>
            </label>
            <label className="flag-check">
              <input type="checkbox" name="isTrending" checked={formData.isTrending} onChange={handleChange} />
              <span>Trending</span>
            </label>
          </div>

        </div>

        <div className="form-actions mt-8 pt-6">
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={18} />
            <span>{loading ? '⏳ Saving...' : (isEdit ? 'Update Product' : 'Save Product')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
