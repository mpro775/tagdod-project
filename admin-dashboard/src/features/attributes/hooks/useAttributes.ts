import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attributesApi } from '../api/attributesApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type {
  ListAttributesParams,
  CreateAttributeDto,
  UpdateAttributeDto,
  CreateAttributeValueDto,
  UpdateAttributeValueDto,
  AttributeProductsParams,
} from '../types/attribute.types';

const ATTRIBUTES_KEY = 'attributes';

// Attributes
export const useAttributes = (params: ListAttributesParams = {}) => {
  return useQuery({
    queryKey: [ATTRIBUTES_KEY, params],
    queryFn: () => attributesApi.list(params),
  });
};

export const useAttribute = (id: string) => {
  return useQuery({
    queryKey: [ATTRIBUTES_KEY, id],
    queryFn: () => attributesApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAttributeDto) => attributesApi.create(data),
    onSuccess: () => {
      toast.success('تم إنشاء السمة بنجاح');
      queryClient.invalidateQueries({ queryKey: [ATTRIBUTES_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useUpdateAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAttributeDto }) =>
      attributesApi.update(id, data),
    onSuccess: () => {
      toast.success('تم تحديث السمة بنجاح');
      queryClient.invalidateQueries({ queryKey: [ATTRIBUTES_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useDeleteAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attributesApi.delete(id),
    onSuccess: () => {
      toast.success('تم حذف السمة بنجاح');
      queryClient.invalidateQueries({ queryKey: [ATTRIBUTES_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useRestoreAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attributesApi.restore(id),
    onSuccess: () => {
      toast.success('تم استعادة السمة بنجاح');
      queryClient.invalidateQueries({ queryKey: [ATTRIBUTES_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Attribute Values
export const useAttributeValues = (attributeId: string) => {
  return useQuery({
    queryKey: [ATTRIBUTES_KEY, attributeId, 'values'],
    queryFn: () => attributesApi.listValues(attributeId),
    enabled: !!attributeId,
  });
};

export const useCreateAttributeValue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attributeId, data }: { attributeId: string; data: CreateAttributeValueDto }) =>
      attributesApi.createValue(attributeId, data),
    onSuccess: (_, variables) => {
      toast.success('تم إضافة القيمة بنجاح');
      queryClient.invalidateQueries({
        queryKey: [ATTRIBUTES_KEY, variables.attributeId, 'values'],
      });
    },
    onError: ErrorHandler.showError,
  });
};

export const useUpdateAttributeValue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAttributeValueDto }) =>
      attributesApi.updateValue(id, data),
    onSuccess: () => {
      toast.success('تم تحديث القيمة بنجاح');
      queryClient.invalidateQueries({ queryKey: [ATTRIBUTES_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useDeleteAttributeValue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attributesApi.deleteValue(id),
    onSuccess: () => {
      toast.success('تم حذف القيمة بنجاح');
      queryClient.invalidateQueries({ queryKey: [ATTRIBUTES_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// ==================== Statistics ====================

export const useAttributeStats = () => {
  return useQuery({
    queryKey: [ATTRIBUTES_KEY, 'stats'],
    queryFn: () => attributesApi.getStats(),
  });
};

export const useAttributeProducts = (attributeId: string, params: AttributeProductsParams = {}) => {
  return useQuery({
    queryKey: [ATTRIBUTES_KEY, attributeId, 'products', params],
    queryFn: () => attributesApi.listProducts(attributeId, params),
    enabled: !!attributeId,
  });
};