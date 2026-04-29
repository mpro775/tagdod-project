import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/usersApi';
import { verificationApi } from '../api/verificationApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type {
  ListUsersParams,
  CreateUserDto,
  UpdateUserDto,
  SuspendUserDto,
  ListDeletedUsersParams,
  ApproveVerificationDto,
  UploadVerificationFileDto,
} from '../types/user.types';

// Query Keys
const USERS_KEY = 'users';
const VERIFICATION_KEY = 'verification';

// List users
export const useUsers = (params: ListUsersParams) => {
  return useQuery({
    queryKey: [USERS_KEY, params],
    queryFn: () => usersApi.list(params),
    placeholderData: (previousData) => previousData,
  });
};

// Get single user
export const useUser = (id: string) => {
  return useQuery({
    queryKey: [USERS_KEY, id],
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  });
};

// Create user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) => usersApi.create(data),
    onSuccess: () => {
      // eslint-disable-next-line no-console
      console.log('✅ User created successfully - showing toast');
      const message = 'تم إنشاء المستخدم بنجاح';
      // eslint-disable-next-line no-console
      console.log('Message to show:', message);
      toast.success(message, {
        style: {
          background: '#4caf50',
          color: '#ffffff',
          fontSize: '16px',
          padding: '16px 24px',
        },
      });
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error('❌ Error creating user:', error);
      ErrorHandler.showError(error);
    },
  });
};

// Update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) => usersApi.update(id, data),
    onSuccess: (_, variables) => {
      // eslint-disable-next-line no-console
      console.log('✅ User updated successfully - showing toast');
      const message = 'تم تحديث المستخدم بنجاح';
      // eslint-disable-next-line no-console
      console.log('Message to show:', message);
      toast.success(message, {
        style: {
          background: '#4caf50',
          color: '#ffffff',
          fontSize: '16px',
          padding: '16px 24px',
        },
      });
      queryClient.invalidateQueries({ queryKey: [USERS_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error('❌ Error updating user:', error);
      ErrorHandler.showError(error);
    },
  });
};

// Delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      toast.success('تم حذف المستخدم بنجاح');
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Suspend user
export const useSuspendUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: SuspendUserDto }) => usersApi.suspend(id, data),
    onSuccess: () => {
      toast.success('تم إيقاف المستخدم بنجاح');
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Activate user
export const useActivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.activate(id),
    onSuccess: () => {
      toast.success('تم تفعيل المستخدم بنجاح');
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Restore user
export const useRestoreUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.restore(id),
    onSuccess: () => {
      toast.success('تم استعادة المستخدم بنجاح');
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Permanently delete user
export const usePermanentDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.permanentDelete(id),
    onSuccess: () => {
      toast.success('تم حذف المستخدم نهائياً');
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Get user stats
export const useUserStats = () => {
  return useQuery({
    queryKey: [USERS_KEY, 'stats'],
    queryFn: () => usersApi.getStats(),
  });
};

// Get deleted users
export const useDeletedUsers = (params: ListDeletedUsersParams) => {
  return useQuery({
    queryKey: [USERS_KEY, 'deleted', params],
    queryFn: () => usersApi.getDeletedUsers(params),
    placeholderData: (previousData) => previousData,
  });
};

// Export users names CSV
export const useExportUserNames = () => {
  return useMutation({
    mutationFn: (params: ListUsersParams) => usersApi.exportNamesCsv(params),
    onSuccess: ({ blob, fileName }) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('تم تصدير أسماء المستخدمين بنجاح');
    },
    onError: ErrorHandler.showError,
  });
};

export const useExportUsers = () => {
  return useMutation({
    mutationFn: ({ params, fields }: { params: ListUsersParams; fields: string[] }) =>
      usersApi.exportUsers(params, fields, 'xlsx'),
    onSuccess: (result) => {
      const fileUrl = result?.data?.fileUrl;
      if (!result?.success || !fileUrl) {
        toast.error(result?.data?.error || 'فشل تصدير المستخدمين');
        return;
      }
      window.open(fileUrl, '_blank');
      toast.success(`تم تصدير المستخدمين بنجاح (${result.data.recordCount || 0} سجل)`);
    },
    onError: ErrorHandler.showError,
  });
};

// ==================== Verification Requests Hooks ====================

// Get pending verification requests
export const usePendingVerifications = () => {
  return useQuery({
    queryKey: [VERIFICATION_KEY, 'pending'],
    queryFn: () => verificationApi.getPendingRequests(),
  });
};

// Get verification details
export const useVerificationDetails = (userId: string) => {
  return useQuery({
    queryKey: [VERIFICATION_KEY, 'details', userId],
    queryFn: () => verificationApi.getVerificationDetails(userId),
    enabled: !!userId,
  });
};

// Approve verification
export const useApproveVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => verificationApi.approveVerification(userId),
    onSuccess: () => {
      toast.success('تمت الموافقة على التحقق بنجاح');
      queryClient.invalidateQueries({ queryKey: [VERIFICATION_KEY] });
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Reject verification
export const useRejectVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data?: ApproveVerificationDto }) =>
      verificationApi.rejectVerification(userId, data),
    onSuccess: () => {
      toast.success('تم رفض التحقق بنجاح');
      queryClient.invalidateQueries({ queryKey: [VERIFICATION_KEY] });
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// Upload verification file (admin, no direct approval)
export const useUploadVerificationFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UploadVerificationFileDto }) =>
      verificationApi.uploadVerificationFile(userId, data),
    onSuccess: (_data, variables) => {
      toast.success('تم رفع الملف وتحويل الحالة إلى قيد المراجعة');
      queryClient.invalidateQueries({ queryKey: [VERIFICATION_KEY] });
      queryClient.invalidateQueries({ queryKey: [USERS_KEY, variables.userId] });
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};
