import { useQuery } from '@tanstack/react-query';
import { customerService } from '../services/customerService';
import { customerKeys } from './queryKeys';

export const useCustomers = () => {
  return useQuery({
    queryKey: customerKeys.lists(),
    queryFn: customerService.getCustomers,
  });
};
