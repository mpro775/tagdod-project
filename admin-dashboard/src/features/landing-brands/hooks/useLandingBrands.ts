import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { landingBrandsApi } from '../api/landingBrandsApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type { ListLandingBrandsParams, UpdateLandingBrandDto } from '../types/landing-brand.types';

const LANDING_BRANDS_KEY = 'landing-brands';

export const useLandingBrands = (params: ListLandingBrandsParams = {}) => {
  return useQuery({ queryKey: [LANDING_BRANDS_KEY, params], queryFn: () => landingBrandsApi.list(params), staleTime: 5 * 60 * 1000 });
};

export const useUpdateLandingBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: UpdateLandingBrandDto }) => landingBrandsApi.update(id, data), onSuccess: () => { toast.success('تم تحديث البراند بنجاح'); queryClient.invalidateQueries({ queryKey: [LANDING_BRANDS_KEY] }); }, onError: (error) => { ErrorHandler.showError(error); toast.error('فشل في تحديث البراند'); } });
};
