import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { productKeys } from './queryKeys';
import { toast } from 'react-hot-toast';

export const useProducts = () => {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: productService.getProducts,
  });
};

export const useProduct = (id) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete product', error);
      toast.error(`❌ ${error?.response?.data?.message || 'Failed to delete product'}`);
    }
  });
};
