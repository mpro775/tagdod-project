import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useDeleteUser,
  useSuspendUser,
  useActivateUser,
  useRestoreUser,
} from './useUsers';
import type { User } from '../types/user.types';

interface UseUsersTableActionsProps {
  onRefetch: () => void;
}

interface ConfirmDialogState {
  open: boolean;
  user: User | null;
  action: 'delete' | null;
}

export const useUsersTableActions = ({ onRefetch }: UseUsersTableActionsProps) => {
  const { t } = useTranslation(['users', 'common']);
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const { mutate: suspendUser } = useSuspendUser();
  const { mutate: activateUser } = useActivateUser();
  const { mutate: restoreUser } = useRestoreUser();

  const handleStatusToggle = useCallback(
    (user: User, checked: boolean) => {
      if (checked) {
        activateUser(user._id, {
          onSuccess: () => onRefetch(),
          onError: () => onRefetch(),
        });
      } else {
        suspendUser(
          {
            id: user._id,
            data: { reason: t('users:suspend.reason', 'تم الإيقاف من لوحة التحكم') },
          },
          {
            onSuccess: () => onRefetch(),
            onError: () => onRefetch(),
          }
        );
      }
    },
    [activateUser, suspendUser, onRefetch, t]
  );

  const handleRestore = useCallback(
    (user: User) => {
      restoreUser(user._id, {
        onSuccess: () => onRefetch(),
      });
    },
    [restoreUser, onRefetch]
  );

  const handleDelete = useCallback(
    (userId: string, onSuccess?: () => void) => {
      deleteUser(userId, {
        onSuccess: () => {
          onRefetch();
          onSuccess?.();
        },
      });
    },
    [deleteUser, onRefetch]
  );

  return {
    handleStatusToggle,
    handleRestore,
    handleDelete,
    isDeleting,
  };
};

