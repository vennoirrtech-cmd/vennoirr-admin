import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export const useHomepageSections = () => {
  return useQuery({
    queryKey: ['homepageSections'],
    queryFn: async () => {
      const res = await api.get('/admin/sections');
      return res.data.data; // assuming API Response sends { success, message, data }
    },
  });
};

export const useCreateSection = (onSuccessCallback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post('/admin/sections', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepageSections'] });
      toast.success('Section created successfully', { style: { background: 'var(--ink)', color: 'var(--surface)', borderRadius: '0' }});
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      const errMsg = error.response?.data?.errors?.[0] || error.response?.data?.message || 'Failed to create section';
      toast.error(errMsg);
    }
  });
};

export const useUpdateSection = (onSuccessCallback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.patch(`/admin/sections/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepageSections'] });
      toast.success('Section updated successfully', { style: { background: 'var(--ink)', color: 'var(--surface)', borderRadius: '0' }});
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      const errMsg = error.response?.data?.errors?.[0] || error.response?.data?.message || 'Failed to update section';
      toast.error(errMsg);
    }
  });
};

export const useDeleteSection = (onSuccessCallback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/admin/sections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepageSections'] });
      toast.success('Section deleted successfully', { style: { background: 'var(--ink)', color: 'var(--surface)', borderRadius: '0' }});
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      const errMsg = error.response?.data?.errors?.[0] || error.response?.data?.message || 'Failed to delete section';
      toast.error(errMsg);
    }
  });
};

export const useReorderSections = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sections) => {
      const res = await api.patch('/admin/sections/reorder', { sections });
      return res.data;
    },
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: ['homepageSections'] });
      const previous = queryClient.getQueryData(['homepageSections']);
      
      // Optimistic update
      queryClient.setQueryData(['homepageSections'], (old) => {
        if (!old) return [];
        // create a map of display orders from newOrder array
        const orderMap = {};
        newOrder.forEach(item => {
          orderMap[item.id] = item.displayOrder;
        });
        
        return old.map(item => ({
          ...item,
          displayOrder: orderMap[item._id] !== undefined ? orderMap[item._id] : item.displayOrder
        })).sort((a,b) => a.displayOrder - b.displayOrder);
      });
      return { previous };
    },
    onError: (err, newOrder, context) => {
      toast.error('Failed to save new order. Rolling back.');
      if (context?.previous) {
        queryClient.setQueryData(['homepageSections'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['homepageSections'] });
    }
  });
};
