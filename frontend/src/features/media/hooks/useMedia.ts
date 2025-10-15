import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaApi } from '../api/mediaApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type { ListMediaParams, UploadMediaDto, UpdateMediaDto } from '../types/media.types';

const MEDIA_KEY = 'media';

// List media
export const useMedia = (params: ListMediaParams) => {
  return useQuery({
    queryKey: [MEDIA_KEY, params],
    queryFn: () => mediaApi.list(params),
    placeholderData: (previousData) => previousData,
  });
};

// Get single media
export const useMediaItem = (id: string) => {
  return useQuery({
    queryKey: [MEDIA_KEY, id],
    queryFn: () => mediaApi.getById(id),
    enabled: !!id,
  });
};

// Upload media
export const useUploadMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, data }: { file: File; data: UploadMediaDto }) =>
      mediaApi.upload(file, data),
    onSuccess: (response) => {
      if (response.meta.isDuplicate) {
        toast.success('الصورة موجودة مسبقاً');
      } else {
        toast.success('تم رفع الملف بنجاح');
      }
      queryClient.invalidateQueries({ queryKey: [MEDIA_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Update media
export const useUpdateMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMediaDto }) => mediaApi.update(id, data),
    onSuccess: () => {
      toast.success('تم تحديث الملف بنجاح');
      queryClient.invalidateQueries({ queryKey: [MEDIA_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Delete media
export const useDeleteMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mediaApi.delete(id),
    onSuccess: () => {
      toast.success('تم حذف الملف بنجاح');
      queryClient.invalidateQueries({ queryKey: [MEDIA_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Restore media
export const useRestoreMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mediaApi.restore(id),
    onSuccess: () => {
      toast.success('تم استعادة الملف بنجاح');
      queryClient.invalidateQueries({ queryKey: [MEDIA_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Permanent delete
export const usePermanentDeleteMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mediaApi.permanentDelete(id),
    onSuccess: () => {
      toast.success('تم حذف الملف نهائياً');
      queryClient.invalidateQueries({ queryKey: [MEDIA_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Get stats
export const useMediaStats = () => {
  return useQuery({
    queryKey: [MEDIA_KEY, 'stats'],
    queryFn: () => mediaApi.getStats(),
  });
};
