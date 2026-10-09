import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/categoryService';
import { categoryKeys } from './queryKeys';
import { toast } from 'react-hot-toast';

export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: categoryService.getCategories,
  });
};

export const useCreateCategory = (onSuccessCallback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success('Category created successfully');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      toast.error(`❌ ${error?.response?.data?.message || 'Failed to create category'}`);
    }
  });
};

export const useDeleteCategory = (onSuccessCallback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast.success('Category deleted successfully');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      console.error('Failed to delete category:', error);
      toast.error('❌ Failed to delete category');
    }
  });
};
