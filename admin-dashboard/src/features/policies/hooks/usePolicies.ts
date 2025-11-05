import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { policiesApi } from '../api/policiesApi';
import type { PolicyType, UpdatePolicyDto, TogglePolicyDto } from '../types/policy.types';
import { toast } from 'react-hot-toast';

const POLICIES_KEY = 'policies';

/**
 * Get all policies (Admin)
 */
export const usePolicies = () => {
  return useQuery({
    queryKey: [POLICIES_KEY, 'all'],
    queryFn: () => policiesApi.getAll(),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get policy by type (Admin)
 */
export const usePolicy = (type: PolicyType) => {
  return useQuery({
    queryKey: [POLICIES_KEY, type],
    queryFn: () => policiesApi.getByType(type),
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Update policy mutation
 */
export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, data }: { type: PolicyType; data: UpdatePolicyDto }) =>
      policiesApi.update(type, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POLICIES_KEY] });
      toast.success('تم تحديث السياسة بنجاح');
    },
    onError: () => {
      toast.error('فشل تحديث السياسة');
    },
  });
};

/**
 * Toggle policy mutation
 */
export const useTogglePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, data }: { type: PolicyType; data: TogglePolicyDto }) =>
      policiesApi.toggle(type, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [POLICIES_KEY] });
      toast.success(`تم ${data.isActive ? 'تفعيل' : 'تعطيل'} السياسة بنجاح`);
    },
    onError: () => {
      toast.error('فشل تغيير حالة السياسة');
    },
  });
};
