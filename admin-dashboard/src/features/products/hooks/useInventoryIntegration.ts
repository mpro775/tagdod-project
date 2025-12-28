/**
 * Inventory Integration Hooks
 * React Query hooks for Onyx inventory integration
 */

import { useQuery } from '@tanstack/react-query';
import { inventoryIntegrationApi } from '../api/inventoryIntegrationApi';

const INTEGRATION_KEY = 'inventory-integration';

/**
 * Hook for fetching integration dashboard statistics
 * إحصائيات لوحة الربط
 */
export const useIntegrationStats = () => {
    return useQuery({
        queryKey: [INTEGRATION_KEY, 'stats'],
        queryFn: () => inventoryIntegrationApi.getDashboardStats(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
export const useLinkedProducts = (limit = 50, page = 1) => {
    return useQuery({
        queryKey: ['inventory-integration', 'linked', limit, page],
        queryFn: () => inventoryIntegrationApi.getLinkedProducts(limit, page),
    });
};
/**
 * Hook for fetching unlinked items
 * المنتجات غير المربوطة
 */
export const useUnlinkedItems = (limit = 50) => {
    return useQuery({
        queryKey: [INTEGRATION_KEY, 'unlinked', limit],
        queryFn: () => inventoryIntegrationApi.getUnlinkedItems(limit),
    });
};

/**
 * Hook for checking SKU availability in Onyx
 * فحص الـ SKU (يستخدم مع debounce في المكون)
 */
export const useCheckSku = (sku: string, enabled: boolean) => {
    return useQuery({
        queryKey: [INTEGRATION_KEY, 'check-sku', sku],
        queryFn: () => inventoryIntegrationApi.checkSku(sku),
        enabled: enabled && sku.length > 0,
        staleTime: 30 * 1000, // 30 seconds
    });
};
