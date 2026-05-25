import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { smsCampaignsApi } from '../api/smsCampaignsApi';
import type {
  CreateSmsCampaignDto,
  ListSmsCampaignsParams,
  ListSmsRecipientsParams,
  PreviewSmsCampaignDto,
  SendTestSmsDto,
} from '../types/smsCampaign.types';

export const SMS_CAMPAIGNS_QUERY_KEYS = {
  all: ['sms-campaigns'] as const,
  list: (params: ListSmsCampaignsParams) => [...SMS_CAMPAIGNS_QUERY_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...SMS_CAMPAIGNS_QUERY_KEYS.all, 'detail', id] as const,
  recipients: (id: string, params: ListSmsRecipientsParams) =>
    [...SMS_CAMPAIGNS_QUERY_KEYS.detail(id), 'recipients', params] as const,
};

const getErrorMessage = (error: any) =>
  error?.response?.data?.message ||
  error?.response?.data?.error?.message ||
  error?.message ||
  'تعذر تنفيذ العملية';

export const useSmsCampaigns = (params: ListSmsCampaignsParams) =>
  useQuery({
    queryKey: SMS_CAMPAIGNS_QUERY_KEYS.list(params),
    queryFn: () => smsCampaignsApi.list(params),
    refetchInterval: 15000,
  });

export const useSmsCampaign = (id: string) =>
  useQuery({
    queryKey: SMS_CAMPAIGNS_QUERY_KEYS.detail(id),
    queryFn: () => smsCampaignsApi.get(id),
    enabled: Boolean(id),
    refetchInterval: 10000,
  });

export const useSmsCampaignRecipients = (id: string, params: ListSmsRecipientsParams) =>
  useQuery({
    queryKey: SMS_CAMPAIGNS_QUERY_KEYS.recipients(id, params),
    queryFn: () => smsCampaignsApi.recipients(id, params),
    enabled: Boolean(id),
    refetchInterval: 10000,
  });

export const usePreviewSmsCampaign = () =>
  useMutation({
    mutationFn: (data: PreviewSmsCampaignDto) => smsCampaignsApi.preview(data),
    onError: (error) => toast.error(getErrorMessage(error)),
  });

export const useSendTestSms = () =>
  useMutation({
    mutationFn: (data: SendTestSmsDto) => smsCampaignsApi.sendTest(data),
    onSuccess: () => toast.success('تم إرسال رسالة الاختبار'),
    onError: (error) => toast.error(getErrorMessage(error)),
  });

export const useCreateSmsCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSmsCampaignDto) => smsCampaignsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SMS_CAMPAIGNS_QUERY_KEYS.all });
      toast.success('تم إنشاء الحملة وإضافتها للطابور');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};

export const useSmsCampaignAction = (action: 'pause' | 'resume' | 'cancel' | 'retryFailed') => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => smsCampaignsApi[action](id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: SMS_CAMPAIGNS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SMS_CAMPAIGNS_QUERY_KEYS.detail(id) });
      toast.success('تم تحديث الحملة');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
};
