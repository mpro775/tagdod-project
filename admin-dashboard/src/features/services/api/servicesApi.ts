import { apiClient } from '@/core/api/client';
import { sanitizePaginationParams } from '@/shared/utils/formatters';
import type {
  ServiceRequest,
  EngineerOffer,
  ListServicesParams,
  ListEngineersParams,
  ListOffersParams,
  OffersStatistics,
  EngineersOverviewStatistics,
  OverviewStatistics,
  RequestsStatisticsParams,
  RequestsStatisticsItem,
  EngineersStatisticsParams,
  EngineerStatistics,
  ServiceTypesStatisticsParams,
  ServiceTypeStatistics,
  RevenueStatisticsParams,
  RevenueStatisticsItem,
  EngineerDetails,
  EngineerStatisticsDetails,
} from '../types/service.types';

// === Response Types ===
interface ApiResponse<T> {
  success: boolean;
  data: {
    data: T;
    meta?: any;
  };
  error?: {
    message: string;
    code?: string;
  };
}

export const servicesApi = {
  // === إدارة الطلبات ===
  list: async (params: ListServicesParams = {}): Promise<{ data: ServiceRequest[]; meta: any }> => {
    try {
      const response = await apiClient.get<ApiResponse<{ data: ServiceRequest[]; meta: any }>>('/services/admin/requests', {
        params: sanitizePaginationParams(params),
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error?.message || 'فشل في جلب البيانات');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message || 'فشل في جلب البيانات');
    }
  },

  getById: async (id: string): Promise<ServiceRequest> => {
    try {
      const response = await apiClient.get<ApiResponse<ServiceRequest>>(
        `/services/admin/requests/${id}`
      );
      
      if (response.data.success) {
        return response.data.data.data;
      } else {
        throw new Error(response.data.error?.message || 'فشل في جلب البيانات');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message || 'فشل في جلب البيانات');
    }
  },

  getOffers: async (id: string): Promise<EngineerOffer[]> => {
    try {
      const response = await apiClient.get<ApiResponse<EngineerOffer[]>>(
        `/services/admin/requests/${id}/offers`
      );
      
      if (response.data.success) {
        return response.data.data.data;
      } else {
        throw new Error(response.data.error?.message || 'فشل في جلب العروض');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message || 'فشل في جلب العروض');
    }
  },

  updateStatus: async (id: string, status: string, note?: string) => {
    try {
      const response = await apiClient.patch<ApiResponse<any>>(
        `/services/admin/requests/${id}/status`,
        { status, note }
      );
      
      if (response.data.success) {
        return response.data.data.data;
      } else {
        throw new Error(response.data.error?.message || 'فشل في تحديث الحالة');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message || 'فشل في تحديث الحالة');
    }
  },

  cancel: async (id: string, reason?: string) => {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        `/services/admin/requests/${id}/cancel`,
        { reason }
      );
      
      if (response.data.success) {
        return response.data.data.data;
      } else {
        throw new Error(response.data.error?.message || 'فشل في إلغاء الطلب');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message || 'فشل في إلغاء الطلب');
    }
  },

  assignEngineer: async (id: string, engineerId: string, note?: string) => {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        `/services/admin/requests/${id}/assign-engineer`,
        { engineerId, note }
      );
      
      if (response.data.success) {
        return response.data.data.data;
      } else {
        throw new Error(response.data.error?.message || 'فشل في تعيين المهندس');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message || 'فشل في تعيين المهندس');
    }
  },

  // === إحصائيات شاملة ===
  getOverviewStatistics: async (): Promise<OverviewStatistics> => {
    try {
      const response = await apiClient.get<ApiResponse<OverviewStatistics>>(
        '/services/admin/statistics/overview'
      );
      
      if (response.data.success) {
        return response.data.data.data;
      } else {
        throw new Error(response.data.error?.message || 'فشل في جلب الإحصائيات');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message || 'فشل في جلب الإحصائيات');
    }
  },

  getRequestsStatistics: async (
    params: RequestsStatisticsParams
  ): Promise<RequestsStatisticsItem[]> => {
    try {
      const response = await apiClient.get<ApiResponse<RequestsStatisticsItem[]>>(
        '/services/admin/statistics/requests',
        { params }
      );
      
      if (response.data.success) {
        return response.data.data.data;
      } else {
        throw new Error(response.data.error?.message || 'فشل في جلب إحصائيات الطلبات');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message || 'فشل في جلب إحصائيات الطلبات');
    }
  },

  getEngineersStatistics: async (
    params: EngineersStatisticsParams
  ): Promise<EngineerStatistics[]> => {
    try {
      const response = await apiClient.get<ApiResponse<EngineerStatistics[]>>(
        '/services/admin/statistics/engineers',
        { params }
      );
      
      if (response.data.success) {
        return response.data.data.data;
      } else {
        throw new Error(response.data.error?.message || 'فشل في جلب إحصائيات المهندسين');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message || 'فشل في جلب إحصائيات المهندسين');
    }
  },

  getServiceTypesStatistics: async (
    params: ServiceTypesStatisticsParams
  ): Promise<ServiceTypeStatistics[]> => {
    try {
      const response = await apiClient.get<ApiResponse<ServiceTypeStatistics[]>>(
        '/services/admin/statistics/services-types',
        { params }
      );
      
      if (response.data.success) {
        return response.data.data.data;
      } else {
        throw new Error(response.data.error?.message || 'فشل في جلب إحصائيات أنواع الخدمات');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message || 'فشل في جلب إحصائيات أنواع الخدمات');
    }
  },

  getRevenueStatistics: async (
    params: RevenueStatisticsParams
  ): Promise<RevenueStatisticsItem[]> => {
    try {
      const response = await apiClient.get<ApiResponse<RevenueStatisticsItem[]>>(
        '/services/admin/statistics/revenue',
        { params }
      );
      
      if (response.data.success) {
        return response.data.data.data;
      } else {
        throw new Error(response.data.error?.message || 'فشل في جلب إحصائيات الإيرادات');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message || 'فشل في جلب إحصائيات الإيرادات');
    }
  },

  // === إدارة المهندسين ===
  getEngineersOverviewStatistics: async (): Promise<EngineersOverviewStatistics> => {
    try {
      const response = await apiClient.get<ApiResponse<EngineersOverviewStatistics>>('/services/admin/engineers/statistics/overview');
      
      if (response.data.success) {
        return response.data.data.data;
      } else {
        throw new Error(response.data.error?.message || 'فشل في جلب إحصائيات المهندسين');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message || 'فشل في جلب إحصائيات المهندسين');
    }
  },

  getEngineersList: async (params: ListEngineersParams = {}): Promise<{ data: EngineerDetails[]; meta: any }> => {
    try {
      const response = await apiClient.get<ApiResponse<{ data: EngineerDetails[]; meta: any }>>('/services/admin/engineers', {
        params,
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error?.message || 'فشل في جلب قائمة المهندسين');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message || 'فشل في جلب قائمة المهندسين');
    }
  },

  getEngineerStatistics: async (id: string): Promise<EngineerStatisticsDetails> => {
    try {
      const response = await apiClient.get<ApiResponse<EngineerStatisticsDetails>>(
        `/services/admin/engineers/${id}/statistics`
      );
      
      if (response.data.success) {
        return response.data.data.data;
      } else {
        throw new Error(response.data.error?.message || 'فشل في جلب إحصائيات المهندس');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message || 'فشل في جلب إحصائيات المهندس');
    }
  },

  getEngineerOffers: async (
    id: string,
    params: { status?: string; page?: number; limit?: number } = {}
  ): Promise<{ data: EngineerOffer[]; meta: any }> => {
    try {
      const response = await apiClient.get<ApiResponse<{ data: EngineerOffer[]; meta: any }>>(
        `/services/admin/engineers/${id}/offers`,
        { params }
      );
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error?.message || 'فشل في جلب عروض المهندس');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message || 'فشل في جلب عروض المهندس');
    }
  },

  // === إدارة العروض ===
  getOffersStatistics: async (params?: { dateFrom?: string; dateTo?: string }): Promise<OffersStatistics> => {
    try {
      const response = await apiClient.get<ApiResponse<OffersStatistics>>('/services/admin/offers/statistics', {
        params,
      });
      
      if (response.data.success) {
        return response.data.data.data;
      } else {
        throw new Error(response.data.error?.message || 'فشل في جلب إحصائيات العروض');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message || 'فشل في جلب إحصائيات العروض');
    }
  },

  getOffersList: async (params: ListOffersParams = {}): Promise<{ data: EngineerOffer[]; meta: any }> => {
    try {
      const response = await apiClient.get<ApiResponse<{ data: EngineerOffer[]; meta: any }>>('/services/admin/offers', {
        params,
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error?.message || 'فشل في جلب قائمة العروض');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message || 'فشل في جلب قائمة العروض');
    }
  },
};
