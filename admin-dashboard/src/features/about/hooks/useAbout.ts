import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aboutApi } from '../api/aboutApi';
import type { About, CreateAboutDto, UpdateAboutDto, ToggleAboutDto } from '../types/about.types';
import { toast } from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

const ABOUT_KEY = 'about';

/**
 * Get about page data (Admin)
 */
export const useAbout = () => {
  return useQuery<About | null>({
    queryKey: [ABOUT_KEY],
    queryFn: () => aboutApi.get(),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Create about page mutation
 */
export const useCreateAbout = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('about');

  return useMutation({
    mutationFn: (data: CreateAboutDto) => aboutApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ABOUT_KEY] });
      toast.success(t('messages.createSuccess'));
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.data?.error?.message) {
        const errorMessage = error.response.data.error.message;
        if (Array.isArray(errorMessage)) {
          errorMessage.forEach((msg: string) => {
            toast.error(msg);
          });
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error(t('messages.createError'));
      }
    },
  });
};

/**
 * Update about page mutation
 */
export const useUpdateAbout = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('about');

  return useMutation({
    mutationFn: (data: UpdateAboutDto) => aboutApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ABOUT_KEY] });
      toast.success(t('messages.updateSuccess'));
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.data?.error?.message) {
        const errorMessage = error.response.data.error.message;
        if (Array.isArray(errorMessage)) {
          errorMessage.forEach((msg: string) => {
            toast.error(msg);
          });
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error(t('messages.updateError'));
      }
    },
  });
};

/**
 * Toggle about page status mutation
 */
export const useToggleAbout = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('about');

  return useMutation({
    mutationFn: (data: ToggleAboutDto) => aboutApi.toggle(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [ABOUT_KEY] });
      const statusKey = data.isActive ? 'messages.activated' : 'messages.deactivated';
      toast.success(t(statusKey));
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.data?.error?.message) {
        const errorMessage = error.response.data.error.message;
        toast.error(errorMessage);
      } else {
        toast.error(t('messages.toggleError'));
      }
    },
  });
};

