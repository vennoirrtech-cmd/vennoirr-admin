import { api } from './api';

export const categoryService = {
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data?.data || response.data || [];
  },
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data?.data || response.data;
  },
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data?.data || response.data;
  }
};
