import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, UploadCloud, Loader2, Image as ImageIcon, Trash2, Plus, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { uploadToCloudinary } from '../utils/cloudinary';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const fetchCategories = async () => {
  const res = await api.get('/categories');
  return res.data?.data || [];
};

const fetchProduct = async (id) => {
  const res = await api.get(`/products/admin/${id}`);
  return res.data?.data || null;
};

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const queryClient = useQueryClient();

  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [existingImages, setExistingImages] = useState([]);

  const [variants, setVariants] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    mrp: '',
    sku: '',
    stockQuantity: '', // Kept for legacy/base level support
    gender: 'Unisex',
    sizes: 'M,L,XL',
    colors: 'Black,White',
    isNewArrival: true,
    isBestSeller: false,
    isTrending: false,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  const { data: initialProduct, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name || '',
        description: initialProduct.description || '',
        category: initialProduct.category?._id || initialProduct.category || '',
        price: initialProduct.price || '',
        mrp: initialProduct.mrp || '',
        sku: initialProduct.sku || '',
        stockQuantity: initialProduct.stockQuantity || '',
        gender: initialProduct.gender || 'Unisex',
        sizes: initialProduct.sizes?.join(', ') || '',
        colors: initialProduct.colors?.join(', ') || '',
        isNewArrival: initialProduct.isNewArrival || false,
        isBestSeller: initialProduct.isBestSeller || false,
        isTrending: initialProduct.isTrending || false,
      });

      if (initialProduct.variants && initialProduct.variants.length > 0) {
        setVariants(initialProduct.variants);
      }

      if (initialProduct.images && initialProduct.images.length > 0) {
        setExistingImages(initialProduct.images);
        const front = initialProduct.images.find(img => img.order === 0) || initialProduct.images[0];
        const back = initialProduct.images.find(img => img.order === 1) || initialProduct.images[1];
        if (front) setFrontPreview(front.url);
        if (back) setBackPreview(back.url);
      }
    }
  }, [initialProduct]);

  const autoSKU = (name) =>
    name.toUpperCase().replace(/[^A-Z0-9 ]/g, '').trim().replace(/\s+/g, '-').slice(0, 18) + '-' + Date.now().toString().slice(-4);

  const generateVariants = () => {
    if (!formData.sizes || !formData.colors) {
      toast.error("Please provide both Sizes and Colors to generate variants.");
      return;
    }
    const sizesArr = formData.sizes.split(',').map(s => s.trim()).filter(Boolean);
    const colorsArr = formData.colors.split(',').map(c => c.trim()).filter(Boolean);
    
    if (sizesArr.length === 0 || colorsArr.length === 0) {
      toast.error("Must have at least one size and one color.");
      return;
    }

    const baseSku = formData.sku || autoSKU(formData.name || 'PRD');
    
    const newVariants = [];
    colorsArr.forEach(color => {
      sizesArr.forEach(size => {
        // Check if exists
        const existing = variants.find(v => v.color.toLowerCase() === color.toLowerCase() && v.size.toLowerCase() === size.toLowerCase());
        if (existing) {
          newVariants.push(existing);
        } else {
          newVariants.push({
            color,
            size,
            sku: `${baseSku}-${color.substring(0,3).toUpperCase()}-${size.toUpperCase()}`,
            stock: 0,
            price: '', // Inherits base price if empty
            mrp: '',
          });
        }
      });
    });

    setVariants(newVariants);
    toast.success("Variant matrix generated!");
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

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

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'name' && !prev.sku && !isEdit) updated.sku = autoSKU(value);
      return updated;
    });
  };

  const mutation = useMutation({
    mutationFn: async (payload) => {
      if (isEdit) {
        return await api.put(`/products/${id}`, payload);
      } else {
        const res = await api.post('/products', payload);
        if (!res.data?.success) throw new Error('Product creation failed');
        return res;
      }
    },
    onSuccess: () => {
      toast.success(`Product ${isEdit ? 'updated' : 'added'} successfully!`, {
        style: {
          background: 'var(--ink)',
          color: 'var(--surface)',
          borderRadius: '0',
          fontSize: '13px'
        }
      });
      queryClient.invalidateQueries(['products']);
      navigate('/products');
    },
    onError: (err) => {
      console.error(err);
      toast.error(`❌ ${err?.response?.data?.message || err.message || 'Failed to save product'}`);
    }
  });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isEdit && !frontImage) {
      toast.error('Please upload a Front Image (Main Display).');
      return;
    }

    // Validate Variants
    for (const v of variants) {
      if (!v.sku || v.stock === undefined || v.stock === '') {
        toast.error(`Variant ${v.color}-${v.size} missing SKU or Stock.`);
        return;
      }
    }

    const loadingToast = toast.loading('Uploading images and saving product...', {
      style: {
        background: 'var(--ink)',
        color: 'var(--surface)',
        borderRadius: '0',
        fontSize: '13px'
      }
    });

    try {
      let finalImages = [];
      if (isEdit) {
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

      // Convert variants
      const formattedVariants = variants.map(v => ({
        color: v.color,
        size: v.size,
        sku: v.sku,
        stock: Number(v.stock),
        price: v.price ? Number(v.price) : undefined,
        mrp: v.mrp ? Number(v.mrp) : undefined,
      }));

      // Auto-calculate base stock if variants exist
      let totalStock = Number(formData.stockQuantity) || 0;
      if (formattedVariants.length > 0) {
        totalStock = formattedVariants.reduce((sum, v) => sum + v.stock, 0);
      }

      const payload = {
        ...formData,
        price: Number(formData.price) || 0,
        mrp: Number(formData.mrp) || 0,
        stockQuantity: totalStock, // Force aggregated stock
        sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
        colors: formData.colors ? formData.colors.split(',').map(c => c.trim()).filter(Boolean) : [],
        images: finalImages,
        variants: formattedVariants
      };

      if (!payload.category) delete payload.category;
      if (!payload.subCategory) delete payload.subCategory;
      if (!payload.gender) delete payload.gender;
      delete payload.stock;

      await mutation.mutateAsync(payload);
      toast.dismiss(loadingToast);
    } catch (error) {
      toast.dismiss(loadingToast);
    }
  };

  if (isEdit && isLoadingProduct) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-12 text-[var(--text-secondary)] min-h-[500px]">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--ink)] mb-4" />
        <p className="font-medium text-[13px]">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto w-full">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          className="p-1.5 border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--ink)] bg-[var(--surface)] hover:bg-[var(--surface-muted)] transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-[18px] font-bold text-[var(--ink)] tracking-tight">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">{isEdit ? 'Update product details or replace images.' : 'Fill in the details below to add a new product to your catalog.'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--surface)] border border-[var(--border)] p-6 sm:p-8">
        <div className="space-y-8">

          {/* Details Section */}
          <div className="border-b border-[var(--border)] pb-8">
            <h2 className="text-[14px] font-bold text-[var(--ink)] uppercase tracking-[0.04em] mb-6">1. Product Identity</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Product Name <span className="text-[var(--error)]">*</span></label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 h-[36px] bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px] text-[var(--ink)] rounded-none"
                  placeholder="e.g. Oversized Heavyweight Tee"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Description <span className="text-[var(--error)]">*</span></label>
                <textarea
                  name="description"
                  rows="3"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px] text-[var(--ink)] rounded-none"
                  placeholder="Detailed product description..."
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Category <span className="text-[var(--error)]">*</span></label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 h-[36px] bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px] text-[var(--ink)] rounded-none appearance-none"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 h-[36px] bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px] text-[var(--ink)] rounded-none appearance-none"
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing & Base Setup */}
          <div className="border-b border-[var(--border)] pb-8">
            <h2 className="text-[14px] font-bold text-[var(--ink)] uppercase tracking-[0.04em] mb-6">2. Base Pricing & Setup</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Selling Price <span className="text-[var(--error)]">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-[13px] text-[var(--text-muted)]">₹</span>
                  </div>
                  <input
                    type="number"
                    name="price"
                    required min="0"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full pl-7 pr-3 h-[36px] bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px] text-[var(--ink)] rounded-none"
                    placeholder="1499"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">MRP <span className="text-[var(--error)]">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-[13px] text-[var(--text-muted)]">₹</span>
                  </div>
                  <input
                    type="number"
                    name="mrp"
                    required min="0"
                    value={formData.mrp}
                    onChange={handleChange}
                    className="w-full pl-7 pr-3 h-[36px] bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px] text-[var(--ink)] rounded-none"
                    placeholder="2499"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Base SKU <span className="text-[var(--error)]">*</span></label>
                <input
                  type="text"
                  name="sku"
                  required
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full px-3 h-[36px] bg-[var(--bg)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px] text-[var(--ink)] rounded-none font-mono uppercase"
                  placeholder="e.g. VNR-TEE"
                />
              </div>
            </div>
          </div>

          {/* Variants & Display Matrix Section */}
          <div className="border-b border-[var(--border)] pb-8 bg-[var(--bg)] p-6 -mx-8 sm:-mx-8">
            <h2 className="text-[14px] font-bold text-[var(--ink)] uppercase tracking-[0.04em] mb-1 px-2">3. Product Variants Matrix</h2>
            <p className="text-[12px] text-[var(--text-secondary)] mb-6 px-2">Define sizes and colors to generate individual SKUs and stock tracking.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 px-2">
              <div>
                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Sizes <span className="text-[var(--error)]">*</span></label>
                <input
                  type="text"
                  name="sizes"
                  value={formData.sizes}
                  onChange={handleChange}
                  className="w-full px-3 h-[36px] bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px] text-[var(--ink)] rounded-none"
                  placeholder="comma separated: S, M, L, XL"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Colors <span className="text-[var(--error)]">*</span></label>
                <input
                  type="text"
                  name="colors"
                  value={formData.colors}
                  onChange={handleChange}
                  className="w-full px-3 h-[36px] bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px] text-[var(--ink)] rounded-none"
                  placeholder="comma separated: Black, White"
                />
              </div>
            </div>

            <div className="mb-6 px-2">
              <button 
                type="button" 
                onClick={generateVariants}
                className="inline-flex items-center gap-2 px-4 h-[36px] bg-[var(--surface)] border border-[var(--ink)] text-[13px] font-semibold text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-colors"
                >
                <RefreshCw size={14} /> Generate Variant Matrix
              </button>
            </div>

            {variants.length > 0 && (
              <div className="overflow-x-auto bg-[var(--surface)] border border-[var(--border)] mx-2">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
                      <th className="font-semibold text-[11px] text-[var(--text-secondary)] uppercase tracking-wider py-3 px-4 w-[80px]">Color</th>
                      <th className="font-semibold text-[11px] text-[var(--text-secondary)] uppercase tracking-wider py-3 px-4 w-[70px]">Size</th>
                      <th className="font-semibold text-[11px] text-[var(--text-secondary)] uppercase tracking-wider py-3 px-4 w-[200px]">SKU</th>
                      <th className="font-semibold text-[11px] text-[var(--text-secondary)] uppercase tracking-wider py-3 px-4 w-[120px]">Stock</th>
                      <th className="font-semibold text-[11px] text-[var(--text-secondary)] uppercase tracking-wider py-3 px-4">Price (Override)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((variant, index) => (
                      <tr key={`${variant.color}-${variant.size}-${index}`} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg)] transition-colors">
                        <td className="py-2 px-4 text-[13px] font-medium text-[var(--ink)]">
                           {variant.color}
                        </td>
                        <td className="py-2 px-4 text-[13px] font-medium text-[var(--ink)]">
                           {variant.size}
                        </td>
                        <td className="py-2 px-4">
                           <input
                              type="text"
                              value={variant.sku}
                              onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                              className="w-full px-2 py-1 bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] text-[12px] font-mono text-[var(--ink)] uppercase"
                            />
                        </td>
                        <td className="py-2 px-4">
                           <input
                              type="number" min="0" required
                              value={variant.stock}
                              onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                              className="w-full px-2 py-1 bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] text-[13px] text-[var(--ink)] table-num"
                            />
                        </td>
                        <td className="py-2 px-4">
                           <div className="relative">
                            <span className="absolute inset-y-0 left-2 flex items-center text-[12px] text-[var(--text-muted)]">₹</span>
                            <input
                                type="number" min="0"
                                placeholder={formData.price || "Base"}
                                value={variant.price || ''}
                                onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                className="w-full pl-6 pr-2 py-1 bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] text-[13px] text-[var(--ink)] table-num"
                              />
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Fallback Single Stock for products with no variants */}
            {variants.length === 0 && (
               <div className="px-2">
                 <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 mt-4">Total Stock (No Variants) <span className="text-[var(--error)]">*</span></label>
                  <input
                    type="number"
                    name="stockQuantity"
                    required min="0"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    className="w-full max-w-[200px] px-3 h-[36px] bg-[var(--surface)] border border-[var(--border)] focus:outline-none focus:border-[var(--ink)] transition-colors text-[13px] text-[var(--ink)] rounded-none"
                    placeholder="100"
                  />
               </div>
            )}
          </div>


          {/* Images Section */}
          <div className="border-b border-[var(--border)] pb-8">
            <h2 className="text-[14px] font-bold text-[var(--ink)] uppercase tracking-[0.04em] mb-1">4. Images</h2>
            <p className="text-[12px] text-[var(--text-secondary)] mb-6">Upload clear, high-resolution front and back images.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Front Image Dropzone */}
              <div>
                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Front Image (Main display) <span className="text-[var(--error)]">*</span>
                </label>
                {!frontPreview ? (
                  <div
                    className="mt-1 flex justify-center border border-dashed border-[var(--border)] px-6 py-10 hover:bg-[var(--surface-muted)] hover:border-[var(--ink)] transition-colors cursor-pointer bg-[var(--bg)]"
                    onClick={() => frontInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <UploadCloud className="mx-auto h-8 w-8 text-[var(--text-secondary)] mb-3" />
                      <div className="text-[13px] text-[var(--text-muted)]">
                        <span className="font-semibold text-[var(--ink)] hover:underline">Click to upload</span> Front Image
                      </div>
                      <p className="text-[12px] text-[var(--text-muted)] mt-1">PNG, JPG up to 5MB</p>
                    </div>
                    <input ref={frontInputRef} type="file" accept="image/*" hidden onChange={handleFrontUpload} />
                  </div>
                ) : (
                  <div className="relative group overflow-hidden border border-[var(--border)] bg-[var(--surface-muted)] p-2">
                    <img src={frontPreview} alt="Front preview" className="w-full h-56 object-cover" />
                    <div className="absolute inset-0 bg-[var(--ink)]/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <button type="button" className="inline-flex items-center gap-1.5 px-3 h-[28px] bg-[var(--surface)] border border-[var(--border)] text-[12px] font-medium text-[var(--ink)] hover:bg-[var(--surface-muted)]" onClick={() => frontInputRef.current?.click()}>
                        <ImageIcon size={14} /> Change
                      </button>
                      <button type="button" className="inline-flex items-center gap-1.5 px-3 h-[28px] bg-[var(--surface)] border border-[var(--border)] text-[12px] font-medium text-[var(--error)] hover:bg-[var(--surface-muted)]" onClick={removeFront}>
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                    <input ref={frontInputRef} type="file" accept="image/*" hidden onChange={handleFrontUpload} />
                  </div>
                )}
              </div>

              {/* Back Image Dropzone */}
              <div>
                <label className="block text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Back Image (Hover display)</label>
                {!backPreview ? (
                  <div
                    className="mt-1 flex justify-center border border-dashed border-[var(--border)] px-6 py-10 hover:bg-[var(--surface-muted)] hover:border-[var(--ink)] transition-colors cursor-pointer bg-[var(--bg)]"
                    onClick={() => backInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <UploadCloud className="mx-auto h-8 w-8 text-[var(--text-secondary)] mb-3" />
                      <div className="text-[13px] text-[var(--text-muted)]">
                        <span className="font-semibold text-[var(--ink)] hover:underline">Click to upload</span> Back Image
                      </div>
                      <p className="text-[12px] text-[var(--text-muted)] mt-1">PNG, JPG up to 5MB</p>
                    </div>
                    <input ref={backInputRef} type="file" accept="image/*" hidden onChange={handleBackUpload} />
                  </div>
                ) : (
                  <div className="relative group overflow-hidden border border-[var(--border)] bg-[var(--surface-muted)] p-2">
                    <img src={backPreview} alt="Back preview" className="w-full h-56 object-cover" />
                    <div className="absolute inset-0 bg-[var(--ink)]/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <button type="button" className="inline-flex items-center gap-1.5 px-3 h-[28px] bg-[var(--surface)] border border-[var(--border)] text-[12px] font-medium text-[var(--ink)] hover:bg-[var(--surface-muted)]" onClick={() => backInputRef.current?.click()}>
                        <ImageIcon size={14} /> Change
                      </button>
                      <button type="button" className="inline-flex items-center gap-1.5 px-3 h-[28px] bg-[var(--surface)] border border-[var(--border)] text-[12px] font-medium text-[var(--error)] hover:bg-[var(--surface-muted)]" onClick={removeBack}>
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                    <input ref={backInputRef} type="file" accept="image/*" hidden onChange={handleBackUpload} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[var(--surface-muted)] p-5 border border-[var(--border)] flex flex-wrap gap-8 items-center">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="isNewArrival"
                  checked={formData.isNewArrival}
                  onChange={handleChange}
                  className="h-4 w-4 bg-[var(--surface)] border border-[var(--border)] checked:bg-[var(--ink)] checked:border-[var(--ink)] appearance-none cursor-pointer transition-colors relative before:content-['✓'] before:absolute before:text-white before:text-[10px] before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:opacity-0 checked:before:opacity-100"
                />
                <span className="text-[13px] font-medium text-[var(--text-secondary)] group-hover:text-[var(--ink)] transition-colors">New Arrival</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="isBestSeller"
                  checked={formData.isBestSeller}
                  onChange={handleChange}
                  className="h-4 w-4 bg-[var(--surface)] border border-[var(--border)] checked:bg-[var(--ink)] checked:border-[var(--ink)] appearance-none cursor-pointer transition-colors relative before:content-['✓'] before:absolute before:text-white before:text-[10px] before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:opacity-0 checked:before:opacity-100"
                />
                <span className="text-[13px] font-medium text-[var(--text-secondary)] group-hover:text-[var(--ink)] transition-colors">Best Seller</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="isTrending"
                  checked={formData.isTrending}
                  onChange={handleChange}
                  className="h-4 w-4 bg-[var(--surface)] border border-[var(--border)] checked:bg-[var(--ink)] checked:border-[var(--ink)] appearance-none cursor-pointer transition-colors relative before:content-['✓'] before:absolute before:text-white before:text-[10px] before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:opacity-0 checked:before:opacity-100"
                />
                <span className="text-[13px] font-medium text-[var(--text-secondary)] group-hover:text-[var(--ink)] transition-colors">Trending</span>
              </label>
            </div>

        </div>

        <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col-reverse sm:flex-row justify-end gap-3">
          <button
            type="button"
            className="w-full sm:w-auto px-4 h-[36px] border border-[var(--border)] text-[13px] font-semibold text-[var(--text-secondary)] bg-[var(--surface)] hover:text-[var(--ink)] hover:bg-[var(--surface-muted)] transition-colors rounded-none"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 h-[36px] bg-[var(--ink)] text-[var(--surface)] text-[13px] font-semibold hover:bg-[var(--text-secondary)] transition-colors rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={14} />}
            <span>{mutation.isPending ? 'Saving...' : (isEdit ? 'Update Product' : 'Save Product')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
