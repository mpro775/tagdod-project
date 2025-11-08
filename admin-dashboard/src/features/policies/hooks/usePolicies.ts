import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { policiesApi } from '../api/policiesApi';
import type { Policy, PolicyType, UpdatePolicyDto, TogglePolicyDto, CreatePolicyDto } from '../types/policy.types';
import { toast } from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

const POLICIES_KEY = 'policies';

/**
 * Map backend validation error messages to translation keys
 */
const mapValidationError = (message: string): string | null => {
  const errorMap: Record<string, string> = {
    'titleAr should not be empty': 'errors.validation.titleArEmpty',
    'titleEn should not be empty': 'errors.validation.titleEnEmpty',
    'contentAr should not be empty': 'errors.validation.contentArEmpty',
    'contentEn should not be empty': 'errors.validation.contentEnEmpty',
    'titleAr must be a string': 'errors.validation.titleArRequired',
    'titleEn must be a string': 'errors.validation.titleEnRequired',
    'contentAr must be a string': 'errors.validation.contentArRequired',
    'contentEn must be a string': 'errors.validation.contentEnRequired',
  };
  
  return errorMap[message] || null;
};

/**
 * Get all policies (Admin)
 */
export const usePolicies = () => {
  return useQuery<Policy[]>({
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
  return useQuery<Policy | null>({
    queryKey: [POLICIES_KEY, type],
    queryFn: () => policiesApi.getByType(type),
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Create policy mutation
 */
export const useCreatePolicy = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('policies');

  return useMutation({
    mutationFn: (data: CreatePolicyDto) => policiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POLICIES_KEY] });
      toast.success(t('actions.save') + ' ✓');
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.data?.error?.message) {
        const errorMessage = error.response.data.error.message;
        if (Array.isArray(errorMessage)) {
          errorMessage.forEach((msg: string) => {
            const translationKey = mapValidationError(msg);
            toast.error(translationKey ? t(translationKey) : msg);
          });
        } else {
          const translationKey = mapValidationError(errorMessage);
          toast.error(translationKey ? t(translationKey) : errorMessage);
        }
      } else {
        toast.error(t('errors.createFailed'));
      }
    },
  });
};

/**
 * Update policy mutation
 */
export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('policies');

  return useMutation({
    mutationFn: ({ type, data }: { type: PolicyType; data: UpdatePolicyDto }) =>
      policiesApi.update(type, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POLICIES_KEY] });
      toast.success(t('actions.save') + ' ✓');
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.data?.error?.message) {
        const errorMessage = error.response.data.error.message;
        if (Array.isArray(errorMessage)) {
          errorMessage.forEach((msg: string) => {
            const translationKey = mapValidationError(msg);
            toast.error(translationKey ? t(translationKey) : msg);
          });
        } else {
          const translationKey = mapValidationError(errorMessage);
          toast.error(translationKey ? t(translationKey) : errorMessage);
        }
      } else {
        toast.error(t('errors.updateFailed'));
      }
    },
  });
};

/**
 * Toggle policy mutation
 */
export const useTogglePolicy = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('policies');

  return useMutation({
    mutationFn: ({ type, data }: { type: PolicyType; data: TogglePolicyDto }) =>
      policiesApi.toggle(type, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [POLICIES_KEY] });
      const statusKey = data.isActive ? 'status.active' : 'status.inactive';
      toast.success(`${t(statusKey)} ✓`);
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.data?.error?.message) {
        const errorMessage = error.response.data.error.message;
        if (Array.isArray(errorMessage)) {
          errorMessage.forEach((msg: string) => {
            const translationKey = mapValidationError(msg);
            toast.error(translationKey ? t(translationKey) : msg);
          });
        } else {
          const translationKey = mapValidationError(errorMessage);
          toast.error(translationKey ? t(translationKey) : errorMessage);
        }
      } else {
        toast.error(t('errors.toggleFailed'));
      }
    },
  });
};
