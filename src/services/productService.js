import { api } from './api';

export const productService = {
  getProducts: async () => {
    const response = await api.get('/products');
    // Backend standard wraps true payload in 'data'
    return response.data?.data || response.data || [];
  },
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data?.data || response.data;
  },
  createProduct: async (productData) => {
    // using multipart/form-data for image uploads via product form normally,
    // so expect productData to be FormData sometimes
    const response = await api.post('/products', productData);
    return response.data?.data || response.data;
  },
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data?.data || response.data;
  },
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data?.data || response.data;
  }
};
