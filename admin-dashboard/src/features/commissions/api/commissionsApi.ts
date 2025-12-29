import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  CommissionsReport,
  CommissionsReportParams,
  AccountStatement,
  AccountStatementParams,
} from '../types/commissions.types';

/**
 * استخراج البيانات من الـ response المتداخل
 */
function extractResponseData<T>(response: { data?: any }): T {
  const outer = response?.data;

  if (outer === undefined || outer === null) {
    return outer as T;
  }

  // إذا كان الـ response يحتوي على success و data (API envelope)
  if (typeof outer === 'object' && 'success' in outer && 'data' in outer) {
    const innerData = outer.data;
    // إذا كان الـ inner data أيضاً يحتوي على success و data (double nesting)
    if (typeof innerData === 'object' && innerData !== null && 'success' in innerData && 'data' in innerData) {
      return innerData.data as T;
    }
    return innerData as T;
  }

  return outer as T;
}

export const commissionsApi = {
  /**
   * جلب تقرير العمولات الشامل
   */
  getCommissionsReport: async (
    params: CommissionsReportParams
  ): Promise<CommissionsReport> => {
    const response = await apiClient.get<ApiResponse<CommissionsReport>>(
      '/admin/commissions/reports',
      {
        params: {
          period: params.period,
          ...(params.dateFrom && { dateFrom: params.dateFrom }),
          ...(params.dateTo && { dateTo: params.dateTo }),
          ...(params.engineerId && { engineerId: params.engineerId }),
        },
      }
    );
    return extractResponseData<CommissionsReport>(response);
  },

  /**
   * جلب تقرير عمولات مهندس محدد
   */
  getEngineerCommissionsReport: async (
    engineerId: string,
    params: Omit<CommissionsReportParams, 'engineerId'>
  ): Promise<CommissionsReport> => {
    const response = await apiClient.get<ApiResponse<CommissionsReport>>(
      `/admin/commissions/reports/${engineerId}`,
      {
        params: {
          period: params.period,
          ...(params.dateFrom && { dateFrom: params.dateFrom }),
          ...(params.dateTo && { dateTo: params.dateTo }),
        },
      }
    );
    return extractResponseData<CommissionsReport>(response);
  },

  /**
   * جلب كشف حساب مهندس
   */
  getAccountStatement: async (
    engineerId: string,
    params: AccountStatementParams
  ): Promise<AccountStatement> => {
    const response = await apiClient.get<ApiResponse<AccountStatement>>(
      `/admin/commissions/statements/${engineerId}`,
      {
        params: {
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
        },
      }
    );
    return extractResponseData<AccountStatement>(response);
  },
};

