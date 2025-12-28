/**
 * Inventory Integration API
 * API client functions for Onyx inventory integration endpoints
 */

import { apiClient } from '@/core/api/client';
import type { IntegrationStats, LinkedItem, PaginatedResponse, SkuCheckResult, UnlinkedItem } from '../types/inventory-integration.types';

export const inventoryIntegrationApi = {
    /**
     * Get dashboard statistics
     * جلب إحصائيات لوحة الربط
     */
    getDashboardStats: async (): Promise<IntegrationStats> => {
        const response = await apiClient.get('/inventory/integration/dashboard');
        // Handle both wrapped and unwrapped responses
        return response.data?.data ?? response.data;
    },

    /**
     * جلب المنتجات المربوطة
     */
    getLinkedProducts: async (limit = 50, page = 1): Promise<PaginatedResponse<LinkedItem>> => {
        const response = await apiClient.get('/inventory/integration/linked', {
            params: { limit, page }
        });
        // التعامل مع الرد الجديد { data: [], total: number }
        const result = response.data?.data ?? response.data;
        return {
            data: Array.isArray(result?.data) ? result.data : [],
            total: result?.total ?? 0
        };
    },

    /**
     * Get unlinked items (opportunities)
     * جلب المنتجات غير المربوطة
     */
    getUnlinkedItems: async (limit = 50, page = 1): Promise<PaginatedResponse<UnlinkedItem>> => {
        const response = await apiClient.get('/inventory/integration/unlinked', {
            params: { limit, page }
        });
        // التعامل مع الرد الجديد { data: [], total: number }
        const result = response.data?.data ?? response.data;
        return {
            data: Array.isArray(result?.data) ? result.data : [],
            total: result?.total ?? 0
        };
    },

    /**
     * Check SKU availability in Onyx
     * فحص توفر الـ SKU في أونكس
     */
    checkSku: async (sku: string): Promise<SkuCheckResult> => {
        const response = await apiClient.get(`/inventory/integration/check-sku/${encodeURIComponent(sku)}`);
        // Handle both wrapped and unwrapped responses
        return response.data?.data ?? response.data;
    },
};
