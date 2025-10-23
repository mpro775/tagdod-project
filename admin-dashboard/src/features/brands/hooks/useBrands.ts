import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandsApi } from '../api/brandsApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type { ListBrandsParams, CreateBrandDto, UpdateBrandDto } from '../types/brand.types';

const BRANDS_KEY = 'brands';

// Hook لجلب قائمة العلامات التجارية مع الفلترة والبحث
export const useBrands = (params: ListBrandsParams = {}) => {
  return useQuery({
    queryKey: [BRANDS_KEY, 'list', params],
    queryFn: () => brandsApi.list(params),
    staleTime: 5 * 60 * 1000, // 5 دقائق
    retry: 2,
  });
};

// Hook لجلب علامة تجارية محددة
export const useBrand = (id: string) => {
  return useQuery({
    queryKey: [BRANDS_KEY, 'single', id],
    queryFn: () => brandsApi.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 دقائق
    retry: 2,
  });
};

// Hook للبحث في العلامات التجارية
export const useBrandSearch = (query: string, limit: number = 10) => {
  return useQuery({
    queryKey: [BRANDS_KEY, 'search', query, limit],
    queryFn: () => brandsApi.search(query, limit),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 دقيقة
  });
};

// Hook لإحصائيات العلامات التجارية
export const useBrandStats = () => {
  return useQuery({
    queryKey: [BRANDS_KEY, 'stats'],
    queryFn: () => brandsApi.getStats(),
    staleTime: 10 * 60 * 1000, // 10 دقائق
    retry: 2,
  });
};

// Hook لإنشاء علامة تجارية جديدة
export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBrandDto) => brandsApi.create(data),
    onSuccess: (data) => {
      toast.success('تم إنشاء العلامة التجارية بنجاح');
      // إعادة تحميل جميع الاستعلامات المتعلقة بالعلامات التجارية
      queryClient.invalidateQueries({ queryKey: [BRANDS_KEY] });
      // إضافة العلامة الجديدة إلى الكاش
      queryClient.setQueryData([BRANDS_KEY, 'single', data._id], data);
    },
    onError: (error) => {
      ErrorHandler.showError(error);
      toast.error('فشل في إنشاء العلامة التجارية');
    },
  });
};

// Hook لتحديث علامة تجارية
export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBrandDto }) => 
      brandsApi.update(id, data),
    onSuccess: (data) => {
      toast.success('تم تحديث العلامة التجارية بنجاح');
      // إعادة تحميل جميع الاستعلامات
      queryClient.invalidateQueries({ queryKey: [BRANDS_KEY] });
      // تحديث البيانات في الكاش
      queryClient.setQueryData([BRANDS_KEY, 'single', data._id], data);
    },
    onError: (error) => {
      ErrorHandler.showError(error);
      toast.error('فشل في تحديث العلامة التجارية');
    },
  });
};

// Hook لحذف علامة تجارية
export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandsApi.delete(id),
    onSuccess: (_, id) => {
      toast.success('تم حذف العلامة التجارية بنجاح');
      // إعادة تحميل جميع الاستعلامات
      queryClient.invalidateQueries({ queryKey: [BRANDS_KEY] });
      // إزالة البيانات من الكاش
      queryClient.removeQueries({ queryKey: [BRANDS_KEY, 'single', id] });
    },
    onError: (error) => {
      ErrorHandler.showError(error);
      toast.error('فشل في حذف العلامة التجارية');
    },
  });
};

// Hook لتبديل حالة العلامة التجارية
export const useToggleBrandStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandsApi.toggleStatus(id),
    onSuccess: (data) => {
      const status = data.isActive ? 'تفعيل' : 'إيقاف';
      toast.success(`تم ${status} العلامة التجارية بنجاح`);
      // إعادة تحميل جميع الاستعلامات
      queryClient.invalidateQueries({ queryKey: [BRANDS_KEY] });
      // تحديث البيانات في الكاش
      queryClient.setQueryData([BRANDS_KEY, 'single', data._id], data);
    },
    onError: (error) => {
      ErrorHandler.showError(error);
      toast.error('فشل في تحديث حالة العلامة التجارية');
    },
  });
};
