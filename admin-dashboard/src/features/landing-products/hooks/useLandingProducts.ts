import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { landingProductsApi } from '../api/landingProductsApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type { ListLandingProductsParams, UpdateLandingProductDto } from '../types/landing-product.types';

const LANDING_PRODUCTS_KEY = 'landing-products';

export const useLandingProducts = (params: ListLandingProductsParams = {}) => {
  return useQuery({ queryKey: [LANDING_PRODUCTS_KEY, params], queryFn: () => landingProductsApi.list(params), staleTime: 5 * 60 * 1000 });
};

export const useUpdateLandingProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: UpdateLandingProductDto }) => landingProductsApi.update(id, data), onSuccess: () => { toast.success('تم تحديث المنتج بنجاح'); queryClient.invalidateQueries({ queryKey: [LANDING_PRODUCTS_KEY] }); }, onError: (error) => { ErrorHandler.showError(error); toast.error('فشل في تحديث المنتج'); } });
};
