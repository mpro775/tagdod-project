import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { landingSettingsApi } from '../api/landingSettingsApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type { UpdateLandingSettingsDto } from '../types/landing-settings.types';

const LANDING_SETTINGS_KEY = 'landing-settings';

export const useLandingSettings = () => {
  return useQuery({
    queryKey: [LANDING_SETTINGS_KEY],
    queryFn: () => landingSettingsApi.get(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useUpdateLandingSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateLandingSettingsDto) => landingSettingsApi.update(data),
    onSuccess: () => {
      toast.success('تم حفظ الإعدادات بنجاح');
      queryClient.invalidateQueries({ queryKey: [LANDING_SETTINGS_KEY] });
    },
    onError: (error) => {
      ErrorHandler.showError(error);
      toast.error('فشل في حفظ الإعدادات');
    },
  });
};

export const useCreateLandingSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateLandingSettingsDto) => landingSettingsApi.create(data),
    onSuccess: () => {
      toast.success('تم إنشاء الإعدادات بنجاح');
      queryClient.invalidateQueries({ queryKey: [LANDING_SETTINGS_KEY] });
    },
    onError: (error) => {
      ErrorHandler.showError(error);
      toast.error('فشل في إنشاء الإعدادات');
    },
  });
};

export const useToggleLandingPublish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => landingSettingsApi.togglePublish(),
    onSuccess: () => {
      toast.success('تم تحديث حالة النشر');
      queryClient.invalidateQueries({ queryKey: [LANDING_SETTINGS_KEY] });
    },
    onError: (error) => {
      ErrorHandler.showError(error);
      toast.error('فشل في تحديث حالة النشر');
    },
  });
};
