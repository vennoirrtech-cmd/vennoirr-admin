import { api } from './api';

export const orderService = {
  getOrders: async (status, paymentStatus) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (paymentStatus) params.set('paymentStatus', paymentStatus);
    
    const response = await api.get(`/admin/orders?${params.toString()}`);
    return response.data?.data || response.data || [];
  },
  updateOrderStatus: async (id, status) => {
    const response = await api.patch(`/admin/orders/${id}/status`, { status });
    return response.data?.data || response.data;
  },
};
