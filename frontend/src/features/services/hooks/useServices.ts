import { useQuery } from '@tanstack/react-query';
import { servicesApi } from '../api/servicesApi';
import type { ListServicesParams } from '../types/service.types';

const SERVICES_KEY = 'services';

export const useServices = (params: ListServicesParams = {}) => {
  return useQuery({
    queryKey: [SERVICES_KEY, params],
    queryFn: () => servicesApi.list(params),
  });
};

export const useService = (id: string) => {
  return useQuery({
    queryKey: [SERVICES_KEY, id],
    queryFn: () => servicesApi.getById(id),
    enabled: !!id,
  });
};

