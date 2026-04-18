import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { installationGuidesApi } from '../api/installationGuidesApi';
import type {
  CreateInstallationGuideDto,
  ListInstallationGuidesParams,
  ToggleInstallationGuideDto,
  UpdateInstallationGuideDto,
} from '../types/installationGuide.types';

const INSTALLATION_GUIDES_QUERY_KEYS = {
  all: ['installation-guides'] as const,
  lists: () => [...INSTALLATION_GUIDES_QUERY_KEYS.all, 'list'] as const,
  list: (params: ListInstallationGuidesParams) =>
    [...INSTALLATION_GUIDES_QUERY_KEYS.lists(), params] as const,
  details: () => [...INSTALLATION_GUIDES_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) =>
    [...INSTALLATION_GUIDES_QUERY_KEYS.details(), id] as const,
};

export const useInstallationGuides = (params: ListInstallationGuidesParams) => {
  return useQuery({
    queryKey: INSTALLATION_GUIDES_QUERY_KEYS.list(params),
    queryFn: () => installationGuidesApi.getAll(params),
  });
};

export const useInstallationGuide = (
  id: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: INSTALLATION_GUIDES_QUERY_KEYS.detail(id),
    queryFn: () => installationGuidesApi.getById(id),
    enabled: !!id && options?.enabled !== false,
  });
};

export const useCreateInstallationGuide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateInstallationGuideDto) =>
      installationGuidesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: INSTALLATION_GUIDES_QUERY_KEYS.lists(),
      });
      toast.success('تمت إضافة دليل التركيب بنجاح');
    },
  });
};

export const useUpdateInstallationGuide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateInstallationGuideDto;
    }) => installationGuidesApi.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: INSTALLATION_GUIDES_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: INSTALLATION_GUIDES_QUERY_KEYS.detail(variables.id),
      });
      toast.success('تم تحديث دليل التركيب بنجاح');
    },
  });
};

export const useToggleInstallationGuide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ToggleInstallationGuideDto;
    }) => installationGuidesApi.toggle(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: INSTALLATION_GUIDES_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: INSTALLATION_GUIDES_QUERY_KEYS.detail(variables.id),
      });
      toast.success('تم تحديث حالة دليل التركيب');
    },
  });
};

export const useDeleteInstallationGuide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => installationGuidesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: INSTALLATION_GUIDES_QUERY_KEYS.lists(),
      });
      toast.success('تم حذف دليل التركيب');
    },
  });
};

