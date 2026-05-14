import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articlesApi } from '../api/articlesApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type { ListArticlesParams, CreateArticleDto, UpdateArticleDto } from '../types/article.types';

const ARTICLES_KEY = 'articles';

export const useArticles = (params: ListArticlesParams = {}) => {
  return useQuery({ queryKey: [ARTICLES_KEY, 'list', params], queryFn: () => articlesApi.list(params), staleTime: 5 * 60 * 1000, retry: 2 });
};
export const useArticle = (id: string) => {
  return useQuery({ queryKey: [ARTICLES_KEY, 'single', id], queryFn: () => articlesApi.getById(id), enabled: !!id, staleTime: 10 * 60 * 1000 });
};
export const useCreateArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (data: CreateArticleDto) => articlesApi.create(data), onSuccess: () => { toast.success('تم إنشاء المقال بنجاح'); queryClient.invalidateQueries({ queryKey: [ARTICLES_KEY] }); }, onError: (error) => { ErrorHandler.showError(error); toast.error('فشل في إنشاء المقال'); } });
};
export const useUpdateArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: UpdateArticleDto }) => articlesApi.update(id, data), onSuccess: () => { toast.success('تم تحديث المقال بنجاح'); queryClient.invalidateQueries({ queryKey: [ARTICLES_KEY] }); }, onError: (error) => { ErrorHandler.showError(error); toast.error('فشل في تحديث المقال'); } });
};
export const useDeleteArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: string) => articlesApi.delete(id), onSuccess: () => { toast.success('تم حذف المقال بنجاح'); queryClient.invalidateQueries({ queryKey: [ARTICLES_KEY] }); }, onError: (error) => { ErrorHandler.showError(error); toast.error('فشل في حذف المقال'); } });
};
export const usePublishArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: string) => articlesApi.publish(id), onSuccess: () => { toast.success('تم نشر المقال'); queryClient.invalidateQueries({ queryKey: [ARTICLES_KEY] }); }, onError: (error) => { ErrorHandler.showError(error); } });
};
export const useArchiveArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: string) => articlesApi.archive(id), onSuccess: () => { toast.success('تم أرشفة المقال'); queryClient.invalidateQueries({ queryKey: [ARTICLES_KEY] }); }, onError: (error) => { ErrorHandler.showError(error); } });
};
export const useToggleArticleLanding = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: string) => articlesApi.toggleLanding(id), onSuccess: () => { toast.success('تم تحديث العرض في الصفحة'); queryClient.invalidateQueries({ queryKey: [ARTICLES_KEY] }); }, onError: (error) => { ErrorHandler.showError(error); } });
};
export const useToggleArticleFeatured = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: string) => articlesApi.toggleFeatured(id), onSuccess: () => { toast.success('تم تحديث التميز'); queryClient.invalidateQueries({ queryKey: [ARTICLES_KEY] }); }, onError: (error) => { ErrorHandler.showError(error); } });
};
