import { useQuery } from '@tanstack/react-query';
import { inventoryIntegrationApi } from '../api/inventoryIntegrationApi';
import type { LinkedProductsParams, UnlinkedProductsParams } from '../types/inventory-integration.types';

const INTEGRATION_KEY = 'inventory-integration';

export const useIntegrationStats = () => {
    return useQuery({
        queryKey: [INTEGRATION_KEY, 'stats'],
        queryFn: () => inventoryIntegrationApi.getDashboardStats(),
        staleTime: 5 * 60 * 1000,
    });
};

export const useLinkedProducts = (params: LinkedProductsParams = {}) => {
    return useQuery({
        queryKey: [INTEGRATION_KEY, 'linked', params],
        queryFn: () => inventoryIntegrationApi.getLinkedProducts(params),
    });
};

export const useUnlinkedItems = (params: UnlinkedProductsParams = {}) => {
    return useQuery({
        queryKey: [INTEGRATION_KEY, 'unlinked', params],
        queryFn: () => inventoryIntegrationApi.getUnlinkedItems(params),
    });
};

export const useCheckSku = (sku: string, enabled: boolean) => {
    return useQuery({
        queryKey: [INTEGRATION_KEY, 'check-sku', sku],
        queryFn: () => inventoryIntegrationApi.checkSku(sku),
        enabled: enabled && sku.length > 0,
        staleTime: 30 * 1000,
    });
};