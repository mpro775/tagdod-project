import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  VerificationRequest,
  VerificationDetails,
  ApproveVerificationDto,
} from '../types/user.types';

export const verificationApi = {
  /**
   * الحصول على قائمة طلبات التحقق قيد المراجعة
   */
  getPendingRequests: async (): Promise<VerificationRequest[]> => {
    const { data } = await apiClient.get<ApiResponse<{
      data: VerificationRequest[];
      total: number;
    }>>('/admin/users/verification/pending');
    return data.data.data;
  },

  /**
   * الحصول على تفاصيل طلب التحقق
   */
  getVerificationDetails: async (userId: string): Promise<VerificationDetails> => {
    const { data } = await apiClient.get<ApiResponse<{
      data: VerificationDetails;
    }>>(`/admin/users/verification/${userId}`);
    return data.data.data;
  },

  /**
   * الموافقة على طلب التحقق
   */
  approveVerification: async (userId: string): Promise<{
    success: boolean;
    message: string;
    data: {
      userId: string;
      verificationType: 'engineer' | 'merchant';
      status: 'approved';
    };
  }> => {
    const { data } = await apiClient.post<ApiResponse<{
      success: boolean;
      message: string;
      data: {
        userId: string;
        verificationType: 'engineer' | 'merchant';
        status: 'approved';
      };
    }>>(`/admin/users/verification/${userId}/approve`);
    return data.data;
  },

  /**
   * رفض طلب التحقق
   */
  rejectVerification: async (
    userId: string,
    rejectData?: ApproveVerificationDto
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      userId: string;
      verificationType: 'engineer' | 'merchant';
      status: 'rejected';
      reason?: string;
    };
  }> => {
    const { data } = await apiClient.post<ApiResponse<{
      success: boolean;
      message: string;
      data: {
        userId: string;
        verificationType: 'engineer' | 'merchant';
        status: 'rejected';
        reason?: string;
      };
    }>>(`/admin/users/verification/${userId}/reject`, rejectData);
    return data.data;
  },
};

