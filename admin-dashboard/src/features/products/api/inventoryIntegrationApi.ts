import { apiClient } from '@/core/api/client';
import type {
    IntegrationStats,
    PaginatedResponse,
    SkuCheckResult,
    UnlinkedItem,
    LinkedPaginatedResponse,
    LinkedProductsParams,
    UnlinkedProductsParams,
} from '../types/inventory-integration.types';

export const inventoryIntegrationApi = {
    getDashboardStats: async (): Promise<IntegrationStats> => {
        const response = await apiClient.get('/inventory/integration/dashboard');
        return response.data?.data ?? response.data;
    },

    getLinkedProducts: async (params: LinkedProductsParams = {}): Promise<LinkedPaginatedResponse> => {
        const {
            limit = 50,
            page = 1,
            search = '',
            status = 'all',
            sort = 'sku',
            sortOrder = 'asc',
        } = params;
        const response = await apiClient.get('/inventory/integration/linked', {
            params: {
                limit,
                page,
                search: search.trim() || undefined,
                status: status !== 'all' ? status : undefined,
                sort,
                sortOrder,
            },
        });
        const result = response.data?.data ?? response.data;
        return {
            data: Array.isArray(result?.data) ? result.data : [],
            total: result?.total ?? 0,
            matchedTotal: result?.matchedTotal ?? undefined,
            mismatchedTotal: result?.mismatchedTotal ?? undefined,
            page: result?.page ?? undefined,
            limit: result?.limit ?? undefined,
        };
    },

    getUnlinkedItems: async (params: UnlinkedProductsParams = {}): Promise<PaginatedResponse<UnlinkedItem>> => {
        const {
            limit = 50,
            page = 1,
            search = '',
            sort = 'quantity',
            sortOrder = 'desc',
        } = params;
        const response = await apiClient.get('/inventory/integration/unlinked', {
            params: {
                limit,
                page,
                search: search.trim() || undefined,
                sort,
                sortOrder,
            },
        });
        const result = response.data?.data ?? response.data;
        return {
            data: Array.isArray(result?.data) ? result.data : [],
            total: result?.total ?? 0,
        };
    },

    checkSku: async (sku: string): Promise<SkuCheckResult> => {
        const response = await apiClient.get(`/inventory/integration/check-sku/${encodeURIComponent(sku)}`);
        return response.data?.data ?? response.data;
    },
};