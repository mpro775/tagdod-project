import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projectsApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type { ListProjectsParams, CreateProjectDto, UpdateProjectDto } from '../types/project.types';

const PROJECTS_KEY = 'projects';

export const useProjects = (params: ListProjectsParams = {}) => {
  return useQuery({
    queryKey: [PROJECTS_KEY, 'list', params],
    queryFn: () => projectsApi.list(params),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: [PROJECTS_KEY, 'single', id],
    queryFn: () => projectsApi.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

export const useProjectStats = () => {
  return useQuery({
    queryKey: [PROJECTS_KEY, 'stats'],
    queryFn: () => projectsApi.getStats(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectDto) => projectsApi.create(data),
    onSuccess: () => {
      toast.success('تم إنشاء المشروع بنجاح');
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
    onError: (error) => {
      ErrorHandler.showError(error);
      toast.error('فشل في إنشاء المشروع');
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectDto }) => projectsApi.update(id, data),
    onSuccess: () => {
      toast.success('تم تحديث المشروع بنجاح');
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
    onError: (error) => {
      ErrorHandler.showError(error);
      toast.error('فشل في تحديث المشروع');
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      toast.success('تم حذف المشروع بنجاح');
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
    onError: (error) => {
      ErrorHandler.showError(error);
      toast.error('فشل في حذف المشروع');
    },
  });
};

export const useToggleProjectPublish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.togglePublish(id),
    onSuccess: () => {
      toast.success('تم تحديث حالة النشر');
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
    onError: (error) => {
      ErrorHandler.showError(error);
    },
  });
};

export const useToggleProjectLanding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.toggleLanding(id),
    onSuccess: () => {
      toast.success('تم تحديث العرض في صفحة الهبوط');
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
    onError: (error) => {
      ErrorHandler.showError(error);
    },
  });
};

export const useToggleProjectFeatured = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.toggleFeatured(id),
    onSuccess: () => {
      toast.success('تم تحديث التميز');
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY] });
    },
    onError: (error) => {
      ErrorHandler.showError(error);
    },
  });
};
