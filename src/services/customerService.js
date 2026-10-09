import { api } from './api';

export const customerService = {
  getCustomers: async () => {
    const response = await api.get('/search/customers');
    return response.data?.data || response.data || [];
  }
};
