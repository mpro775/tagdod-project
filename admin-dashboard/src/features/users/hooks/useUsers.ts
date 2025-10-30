import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/usersApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type {
  ListUsersParams,
  CreateUserDto,
  UpdateUserDto,
  SuspendUserDto,
} from '../types/user.types';

// Query Keys
const USERS_KEY = 'users';

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

// Get user stats
export const useUserStats = () => {
  return useQuery({
    queryKey: [USERS_KEY, 'stats'],
    queryFn: () => usersApi.getStats(),
  });
};
