import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import { orderKeys } from './queryKeys';
import { toast } from 'react-hot-toast';

export const useOrders = (status, paymentStatus) => {
  return useQuery({
    queryKey: orderKeys.list({ status, paymentStatus }),
    queryFn: () => orderService.getOrders(status, paymentStatus),
  });
};

export const useUpdateOrderStatus = (currentStatus, currentPaymentStatus) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, status }) => orderService.updateOrderStatus(orderId, status),
    onMutate: async ({ orderId, status }) => {
      // Setup optimistic update
      const queryKey = orderKeys.list({ status: currentStatus, paymentStatus: currentPaymentStatus });
      await queryClient.cancelQueries({ queryKey });
      const previousOrders = queryClient.getQueryData(queryKey);
      
      if (previousOrders) {
        queryClient.setQueryData(queryKey, old => 
          old.map(order => order._id === orderId ? { ...order, orderStatus: status } : order)
        );
      }
      return { previousOrders, queryKey };
    },
    onError: (err, variables, context) => {
      console.error('Failed to update status', err);
      toast.error('Error updating order status');
      if (context?.previousOrders) {
        queryClient.setQueryData(context.queryKey, context.previousOrders);
      }
    },
    onSuccess: (data, variables) => {
      toast.success(`Order status updated to ${variables.status}`);
      // Invalidate to make sure server data aligns if there are other side effects
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    }
  });
};
