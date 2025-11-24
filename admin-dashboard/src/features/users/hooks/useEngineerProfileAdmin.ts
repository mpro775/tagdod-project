import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { engineerProfileAdminApi } from '../api/engineerProfileAdminApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type {
  UpdateEngineerProfileAdminDto,
  ManageWalletDto,
  SyncStatsDto,
  GetRatingsQueryDto,
} from '../types/user.types';

// Query Keys
const ENGINEER_PROFILE_ADMIN_KEY = 'engineer-profile-admin';

/**
 * Get engineer profile (admin)
 */
export const useEngineerProfileAdmin = (userId: string) => {
  return useQuery({
    queryKey: [ENGINEER_PROFILE_ADMIN_KEY, userId],
    queryFn: () => engineerProfileAdminApi.getProfile(userId),
    enabled: !!userId,
  });
};

/**
 * Update engineer profile (admin)
 */
export const useUpdateEngineerProfileAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, dto }: { userId: string; dto: UpdateEngineerProfileAdminDto }) =>
      engineerProfileAdminApi.updateProfile(userId, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [ENGINEER_PROFILE_ADMIN_KEY, variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['engineers'] });
      toast.success('تم تحديث بروفايل المهندس بنجاح');
    },
    onError: (error) => {
      ErrorHandler.showError(error);
    },
  });
};

/**
 * Get engineer ratings (admin)
 */
export const useEngineerRatingsAdmin = (userId: string, query: GetRatingsQueryDto = {}) => {
  return useQuery({
    queryKey: [ENGINEER_PROFILE_ADMIN_KEY, userId, 'ratings', query],
    queryFn: () => engineerProfileAdminApi.getRatings(userId, query),
    enabled: !!userId,
  });
};

/**
 * Delete engineer rating (admin)
 */
export const useDeleteEngineerRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, ratingId }: { userId: string; ratingId: string }) =>
      engineerProfileAdminApi.deleteRating(userId, ratingId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ENGINEER_PROFILE_ADMIN_KEY, variables.userId, 'ratings'],
      });
      queryClient.invalidateQueries({ queryKey: [ENGINEER_PROFILE_ADMIN_KEY, variables.userId] });
      toast.success('تم حذف التقييم بنجاح');
    },
    onError: (error) => {
      ErrorHandler.showError(error);
    },
  });
};

/**
 * Manage engineer wallet (admin)
 */
export const useManageEngineerWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, dto }: { userId: string; dto: ManageWalletDto }) =>
      engineerProfileAdminApi.manageWallet(userId, dto),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [ENGINEER_PROFILE_ADMIN_KEY, variables.userId] });
      queryClient.invalidateQueries({
        queryKey: [ENGINEER_PROFILE_ADMIN_KEY, variables.userId, 'transactions'],
      });
      queryClient.invalidateQueries({ queryKey: ['engineers'] });
      toast.success(data.message);
    },
    onError: (error) => {
      ErrorHandler.showError(error);
    },
  });
};

/**
 * Get engineer transactions (admin)
 */
export const useEngineerTransactions = (userId: string, page?: number, limit?: number) => {
  return useQuery({
    queryKey: [ENGINEER_PROFILE_ADMIN_KEY, userId, 'transactions', page, limit],
    queryFn: () => engineerProfileAdminApi.getTransactions(userId, page, limit),
    enabled: !!userId,
  });
};

/**
 * Sync engineer stats (admin)
 */
export const useSyncEngineerStats = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, dto }: { userId: string; dto?: SyncStatsDto }) =>
      engineerProfileAdminApi.syncStats(userId, dto),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [ENGINEER_PROFILE_ADMIN_KEY, variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['engineers'] });
      toast.success(data.message);
    },
    onError: (error) => {
      ErrorHandler.showError(error);
    },
  });
};
