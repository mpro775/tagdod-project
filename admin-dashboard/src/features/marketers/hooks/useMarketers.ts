import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import { marketersApi } from '../api/marketersApi';
import type { CreateMarketerDto } from '../types/marketer.types';

const MARKETERS_QUERY_KEY = 'marketers';

export const useMarketers = (params: { page?: number; limit?: number; search?: string }) =>
  useQuery({
    queryKey: [MARKETERS_QUERY_KEY, 'list', params],
    queryFn: () => marketersApi.list(params),
    placeholderData: (previousData) => previousData,
  });

export const useMarketersSummary = () =>
  useQuery({
    queryKey: [MARKETERS_QUERY_KEY, 'summary'],
    queryFn: () => marketersApi.statsSummary(),
  });

export const useMarketersAnalyticsOverview = (params?: { from?: string; to?: string }) =>
  useQuery({
    queryKey: [MARKETERS_QUERY_KEY, 'analytics-overview', params],
    queryFn: () => marketersApi.analyticsOverview(params),
  });

export const useMarketersAnalyticsRanking = (params?: { from?: string; to?: string; limit?: number }) =>
  useQuery({
    queryKey: [MARKETERS_QUERY_KEY, 'analytics-ranking', params],
    queryFn: () => marketersApi.analyticsRanking(params),
  });

export const useMarketerAnalyticsDetails = (
  marketerId?: string,
  params?: { from?: string; to?: string },
) =>
  useQuery({
    queryKey: [MARKETERS_QUERY_KEY, 'analytics-details', marketerId, params],
    queryFn: () => marketersApi.marketerAnalyticsDetails(marketerId!, params),
    enabled: !!marketerId,
  });

export const useCreateMarketer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMarketerDto) => marketersApi.create(payload),
    onSuccess: () => {
      toast.success('تم إنشاء حساب المسوق بنجاح');
      queryClient.invalidateQueries({ queryKey: [MARKETERS_QUERY_KEY] });
    },
    onError: (error) => {
      ErrorHandler.showError(error);
    },
  });
};
