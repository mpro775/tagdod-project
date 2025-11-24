import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  EngineerProfileAdmin,
  UpdateEngineerProfileAdminDto,
  ManageWalletDto,
  SyncStatsDto,
  EngineerRating,
  CommissionTransaction,
  GetRatingsQueryDto,
} from '../types/user.types';

export const engineerProfileAdminApi = {
  /**
   * Get engineer profile (admin)
   */
  getProfile: async (userId: string): Promise<EngineerProfileAdmin> => {
    const { data } = await apiClient.get<ApiResponse<EngineerProfileAdmin>>(
      `/admin/users/${userId}/engineer-profile`,
    );
    return data.data;
  },

  /**
   * Update engineer profile (admin)
   */
  updateProfile: async (
    userId: string,
    dto: UpdateEngineerProfileAdminDto,
  ): Promise<EngineerProfileAdmin> => {
    const { data } = await apiClient.put<ApiResponse<EngineerProfileAdmin>>(
      `/admin/users/${userId}/engineer-profile`,
      dto,
    );
    return data.data;
  },

  /**
   * Get engineer ratings (admin)
   */
  getRatings: async (
    userId: string,
    query: GetRatingsQueryDto = {},
  ): Promise<{
    ratings: EngineerRating[];
    total: number;
    page: number;
    limit: number;
    averageRating: number;
    totalRatings: number;
  }> => {
    const { data } = await apiClient.get<ApiResponse<{
      ratings: EngineerRating[];
      total: number;
      page: number;
      limit: number;
      averageRating: number;
      totalRatings: number;
    }>>(`/admin/users/${userId}/engineer-profile/ratings`, {
      params: query,
    });
    return data.data;
  },

  /**
   * Delete engineer rating (admin)
   */
  deleteRating: async (userId: string, ratingId: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${userId}/engineer-profile/ratings/${ratingId}`);
  },

  /**
   * Manage engineer wallet (admin)
   */
  manageWallet: async (
    userId: string,
    dto: ManageWalletDto,
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      oldBalance: number;
      newBalance: number;
      amount: number;
      type: 'add' | 'deduct' | 'withdraw';
    };
  }> => {
    const { data } = await apiClient.patch<ApiResponse<{
      success: boolean;
      message: string;
      data: {
        oldBalance: number;
        newBalance: number;
        amount: number;
        type: 'add' | 'deduct' | 'withdraw';
      };
    }>>(`/admin/users/${userId}/engineer-profile/wallet`, dto);
    return data.data;
  },

  /**
   * Get engineer transactions (admin)
   */
  getTransactions: async (
    userId: string,
    page?: number,
    limit?: number,
  ): Promise<{
    transactions: CommissionTransaction[];
    total: number;
    page: number;
    limit: number;
    walletBalance: number;
  }> => {
    const { data } = await apiClient.get<ApiResponse<{
      transactions: CommissionTransaction[];
      total: number;
      page: number;
      limit: number;
      walletBalance: number;
    }>>(`/admin/users/${userId}/engineer-profile/transactions`, {
      params: { page, limit },
    });
    return data.data;
  },

  /**
   * Sync engineer stats (admin)
   */
  syncStats: async (
    userId: string,
    dto: SyncStatsDto = {},
  ): Promise<{
    success: boolean;
    message: string;
    data: EngineerProfileAdmin;
  }> => {
    const { data } = await apiClient.post<ApiResponse<{
      success: boolean;
      message: string;
      data: EngineerProfileAdmin;
    }>>(`/admin/users/${userId}/engineer-profile/sync-stats`, dto);
    return data.data;
  },
};

