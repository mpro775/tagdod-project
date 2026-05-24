import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Box, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/shared/utils/formatters';
import type { User, UserStatus } from '../types/user.types';
import { getPrimaryRole, CapabilityStatus } from '../types/user.types';
import { UserRowActions } from './UserRowActions';

interface UsersTableColumnsProps {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onRestore: (user: User) => void;
  onStatusToggle: (user: User, checked: boolean) => void;
}

export const useUsersTableColumns = ({
  onEdit,
  onDelete,
  onRestore,
  onStatusToggle,
}: UsersTableColumnsProps): GridColDef[] => {
  const { t, i18n } = useTranslation(['users', 'common']);

  return React.useMemo(
    () => [
      {
        field: 'phone',
        headerName: t('users:list.columns.phone', 'رقم الهاتف'),
        minWidth: 110,
        flex: 0.8,
        renderCell: (params) => (
          <Box
            sx={{
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: 'text.primary',
            }}
          >
            {params.row.phone}
          </Box>
        ),
      },
      {
        field: 'name',
        headerName: t('users:list.columns.name', 'الاسم'),
        minWidth: 120,
        flex: 1,
        renderCell: (params) => {
          const fullName = `${params.row.firstName || ''} ${params.row.lastName || ''}`.trim();
          return (
            <Box
              sx={{
                fontSize: '0.8125rem',
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {fullName || '-'}
            </Box>
          );
        },
      },
      {
        field: 'roles',
        headerName: t('users:list.columns.role', 'الدور'),
        minWidth: 80,
        flex: 0.6,
        renderCell: (params) => {
          const primaryRole = getPrimaryRole(params.row.roles);
          const role = primaryRole;
          const colorMap: Record<string, 'error' | 'warning' | 'info' | 'success' | 'default'> = {
            super_admin: 'error',
            admin: 'warning',
            merchant: 'info',
            engineer: 'success',
            user: 'default',
          };
          const labelMap: Record<string, string> = {
            super_admin: t('users:roles.super_admin', 'مدير عام'),
            admin: t('users:roles.admin', 'مدير'),
            merchant: t('users:roles.merchant', 'تاجر'),
            engineer: t('users:roles.engineer', 'مهندس'),
            user: t('users:roles.user', 'مستخدم'),
          };
          return (
            <Chip
              label={labelMap[role] || role}
              color={colorMap[role]}
              size="small"
              sx={{
                fontSize: '0.7rem',
                height: 22,
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
          );
        },
      },
      {
        field: 'verificationStatus',
        headerName: t('users:list.columns.verification', 'التوثيق'),
        minWidth: 90,
        flex: 0.7,
        renderCell: (params) => {
          const caps = params.row.capabilities;
          const roles = params.row.roles || [];
          const isEngineer = roles.includes('engineer');
          const isMerchant = roles.includes('merchant');

          if (!isEngineer && !isMerchant) {
            return <Box sx={{ color: 'text.disabled', fontSize: '0.8125rem' }}>—</Box>;
          }

          let status: CapabilityStatus = CapabilityStatus.NONE;
          let label = '';
          let color: 'success' | 'warning' | 'error' | 'info' | 'default' = 'default';

          if (isEngineer) {
            status = params.row.engineer_status || caps?.engineer_status || CapabilityStatus.NONE;
          } else if (isMerchant) {
            status = params.row.merchant_status || caps?.merchant_status || CapabilityStatus.NONE;
          }

          switch (status) {
            case CapabilityStatus.APPROVED:
              label = t('users:status.verified', 'موثق');
              color = 'success';
              break;
            case CapabilityStatus.PENDING:
              label = t('users:status.pending', 'قيد المراجعة');
              color = 'warning';
              break;
            case CapabilityStatus.UNVERIFIED:
              label = t('users:status.unverified', 'غير موثق');
              color = 'info';
              break;
            case CapabilityStatus.REJECTED:
              label = t('users:status.rejected', 'مرفوض');
              color = 'error';
              break;
            default:
              label = t('users:status.none', 'غير مفعل');
              color = 'default';
          }

          return (
            <Chip
              label={label}
              color={color}
              size="small"
              sx={{
                fontSize: '0.7rem',
                height: 22,
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
          );
        },
      },
      {
        field: 'status',
        headerName: t('users:list.columns.status', 'الحالة'),
        minWidth: 75,
        flex: 0.6,
        renderCell: (params) => {
          const statusMap: Record<
            UserStatus,
            { label: string; color: 'success' | 'error' | 'warning' | 'default' }
          > = {
            active: { label: t('users:status.active', 'نشط'), color: 'success' },
            suspended: { label: t('users:status.suspended', 'معلق'), color: 'error' },
            pending: { label: t('users:status.pending', 'قيد الانتظار'), color: 'warning' },
            deleted: { label: t('users:status.deleted', 'محذوف'), color: 'default' },
          };
          const status = statusMap[params.row.status as UserStatus];
          return (
            <Chip
              label={status.label}
              color={status.color}
              size="small"
              sx={{
                fontSize: '0.7rem',
                height: 22,
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
          );
        },
      },
      {
        field: 'createdAt',
        headerName: t('users:list.columns.createdAt', 'تاريخ الإنشاء'),
        minWidth: 95,
        flex: 0.7,
        valueFormatter: (value) => formatDate(value as Date),
        renderCell: (params) => (
          <Box
            sx={{
              fontSize: '0.8125rem',
              color: 'text.secondary',
            }}
          >
            {formatDate(params.value as Date)}
          </Box>
        ),
      },
      {
        field: 'actions',
        headerName: t('users:list.columns.actions', 'الإجراءات'),
        minWidth: 80,
        flex: 0.5,
        sortable: false,
        renderCell: (params) => {
          const user = params.row as User;
          return (
            <UserRowActions
              user={user}
              onEdit={onEdit}
              onDelete={onDelete}
              onRestore={onRestore}
              onStatusToggle={onStatusToggle}
            />
          );
        },
      },
    ],
    [t, i18n.language, onEdit, onDelete, onRestore, onStatusToggle]
  );
};