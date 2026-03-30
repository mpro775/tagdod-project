import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import { marketerPortalApi } from '../api/marketerPortalApi';
import type { CreateEngineerLeadPayload, CreateMerchantLeadPayload } from '../types/marketer-portal.types';

const MARKETER_PORTAL_KEY = 'marketer-portal';

export const useMarketerPortalUsers = (params: {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'all' | 'engineer' | 'merchant';
}) =>
  useQuery({
    queryKey: [MARKETER_PORTAL_KEY, 'users', params],
    queryFn: () => marketerPortalApi.myUsers(params),
    placeholderData: (previousData) => previousData,
  });

export const useMarketerPortalStats = () =>
  useQuery({
    queryKey: [MARKETER_PORTAL_KEY, 'stats'],
    queryFn: () => marketerPortalApi.myUsersStats(),
  });

export const useCreateEngineerLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEngineerLeadPayload) => marketerPortalApi.createEngineer(payload),
    onSuccess: () => {
      toast.success('تم إنشاء المهندس واعتماد توثيقه بنجاح');
      queryClient.invalidateQueries({ queryKey: [MARKETER_PORTAL_KEY] });
    },
    onError: (error) => ErrorHandler.showError(error),
  });
};

export const useCreateMerchantLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMerchantLeadPayload) => marketerPortalApi.createMerchant(payload),
    onSuccess: () => {
      toast.success('تم إنشاء التاجر واعتماد توثيقه بنجاح');
      queryClient.invalidateQueries({ queryKey: [MARKETER_PORTAL_KEY] });
    },
    onError: (error) => ErrorHandler.showError(error),
  });
};
