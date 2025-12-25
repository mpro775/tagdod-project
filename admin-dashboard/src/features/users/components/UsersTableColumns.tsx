import React from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Box, Chip, IconButton, Tooltip, Switch, useTheme } from '@mui/material';
import { Edit, Delete, Restore } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/shared/utils/formatters';
import type { User, UserStatus } from '../types/user.types';
import { getPrimaryRole } from '../types/user.types';

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
  const theme = useTheme();

  return React.useMemo(
    () => [
      {
        field: 'phone',
        headerName: t('users:list.columns.phone', 'رقم الهاتف'),
        minWidth: 120,
        flex: 0.9,
        renderCell: (params) => (
          <Box
            sx={{
              fontWeight: 'medium',
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
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
        minWidth: 130,
        flex: 1.2,
        renderCell: (params) => {
          const fullName = `${params.row.firstName || ''} ${params.row.lastName || ''}`.trim();
          return (
            <Box
              sx={{
                fontSize: { xs: '0.7rem', sm: '0.875rem' },
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
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
        minWidth: 90,
        flex: 0.8,
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
                fontSize: { xs: '0.6rem', sm: '0.75rem' },
                height: { xs: 20, sm: 24 },
                '& .MuiChip-label': {
                  px: { xs: 0.5, sm: 1 },
                },
              }}
            />
          );
        },
      },
      {
        field: 'status',
        headerName: t('users:list.columns.status', 'الحالة'),
        minWidth: 80,
        flex: 0.7,
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
                fontSize: { xs: '0.6rem', sm: '0.75rem' },
                height: { xs: 20, sm: 24 },
                '& .MuiChip-label': {
                  px: { xs: 0.5, sm: 1 },
                },
              }}
            />
          );
        },
      },
      {
        field: 'capabilities',
        headerName: t('users:list.columns.capabilities', 'القدرات'),
        minWidth: 100,
        flex: 1,
        renderCell: (params) => {
          const caps = params.row.capabilities;
          if (!caps) return '-';

          const badges = [];
          if (caps.engineer_capable) badges.push(t('users:capabilities.engineer', 'مهندس'));
          if (caps.merchant_capable) badges.push(t('users:capabilities.merchant', 'تاجر'));
          if (badges.length === 0) badges.push(t('users:capabilities.customer', 'عميل'));

          return (
            <Box
              sx={{
                display: 'flex',
                gap: 0.5,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              {badges.slice(0, 2).map((badge) => (
                <Chip
                  key={badge}
                  label={badge}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: { xs: '0.6rem', sm: '0.75rem' },
                    height: { xs: 18, sm: 22 },
                    '& .MuiChip-label': {
                      px: { xs: 0.5, sm: 0.75 },
                    },
                  }}
                />
              ))}
              {badges.length > 2 && (
                <Chip
                  label={`+${badges.length - 2}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: { xs: '0.6rem', sm: '0.75rem' },
                    height: { xs: 18, sm: 22 },
                  }}
                />
              )}
            </Box>
          );
        },
      },
      {
        field: 'createdAt',
        headerName: t('users:list.columns.createdAt', 'تاريخ الإنشاء'),
        minWidth: 110,
        flex: 0.8,
        valueFormatter: (value) => formatDate(value as Date),
        renderCell: (params) => (
          <Box
            sx={{
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
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
        minWidth: 100,
        flex: 0.8,
        sortable: false,
        renderCell: (params) => {
          const user = params.row as User;
          const isDeleted = !!user.deletedAt;

          if (isDeleted) {
            return (
              <Box display="flex" gap={0.5} flexWrap="wrap">
                <Tooltip title={t('users:actions.restore', 'استعادة')}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRestore(user);
                    }}
                    sx={{
                      p: { xs: 0.5, sm: 0.75 },
                      '&:hover': {
                        backgroundColor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(144, 202, 249, 0.16)'
                            : 'rgba(25, 118, 210, 0.08)',
                      },
                    }}
                  >
                    <Restore fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            );
          }

          return (
            <Box
              display="flex"
              gap={0.5}
              alignItems="center"
              flexWrap="wrap"
              sx={{
                '& > *': {
                  flexShrink: 0,
                },
              }}
            >
              <Tooltip title={t('users:actions.edit', 'تعديل')}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(user);
                  }}
                  sx={{
                    p: { xs: 0.5, sm: 0.75 },
                    '&:hover': {
                      backgroundColor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(144, 202, 249, 0.16)'
                          : 'rgba(25, 118, 210, 0.08)',
                    },
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip
                title={
                  user.status === 'active'
                    ? t('users:status.active', 'نشط')
                    : t('users:status.suspended', 'موقوف')
                }
              >
                <Box
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: { xs: 40, sm: 48 },
                  }}
                >
                  <Switch
                    checked={user.status === 'active'}
                    onChange={(e) => {
                      onStatusToggle(user, e.target.checked);
                    }}
                    size="small"
                    color={user.status === 'active' ? 'success' : 'default'}
                    sx={{
                      m: 0,
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: 'success.main',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: 'success.main',
                      },
                      '& .MuiSwitch-track': {
                        backgroundColor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.3)'
                            : 'rgba(0, 0, 0, 0.26)',
                      },
                    }}
                  />
                </Box>
              </Tooltip>

              <Tooltip title={t('users:actions.delete', 'حذف')}>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(user);
                  }}
                  sx={{
                    p: { xs: 0.5, sm: 0.75 },
                    '&:hover': {
                      backgroundColor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(211, 47, 47, 0.16)'
                          : 'rgba(211, 47, 47, 0.08)',
                    },
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ],
    [t, i18n.language, theme.palette.mode, onEdit, onDelete, onRestore, onStatusToggle]
  );
};
