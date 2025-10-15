import React, { useState, useEffect } from 'react';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { Edit, Delete, Block, CheckCircle, Restore } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import {
  useUsers,
  useDeleteUser,
  useSuspendUser,
  useActivateUser,
  useRestoreUser,
} from '../hooks/useUsers';
import { formatDate } from '@/shared/utils/formatters';
import type { User, UserStatus } from '../types/user.types';
import '../styles/responsive-users.css';

export const UsersListPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [search, setSearch] = useState('');
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'createdAt', sort: 'desc' }]);
  const [screenSize, setScreenSize] = useState(window.innerWidth);

  // Listen to window resize
  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // API
  const { data, isLoading, refetch } = useUsers({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search,
    sortBy: sortModel[0]?.field || 'createdAt',
    sortOrder: sortModel[0]?.sort || 'desc',
  });

  const { mutate: deleteUser } = useDeleteUser();
  const { mutate: suspendUser } = useSuspendUser();
  const { mutate: activateUser } = useActivateUser();
  const { mutate: restoreUser } = useRestoreUser();

  // Actions
  const handleDelete = (user: User) => {
    if (window.confirm(`هل أنت متأكد من حذف المستخدم ${user.firstName}؟`)) {
      deleteUser(user._id, {
        onSuccess: () => refetch(),
      });
    }
  };

  const handleSuspend = (user: User) => {
    const reason = prompt('سبب الإيقاف (اختياري):');
    suspendUser(
      { id: user._id, data: reason ? { reason } : undefined },
      { onSuccess: () => refetch() }
    );
  };

  const handleActivate = (user: User) => {
    activateUser(user._id, {
      onSuccess: () => refetch(),
    });
  };

  const handleRestore = (user: User) => {
    if (window.confirm(`هل تريد استعادة المستخدم ${user.firstName}؟`)) {
      restoreUser(user._id, {
        onSuccess: () => refetch(),
      });
    }
  };

  // Columns
  const columns: GridColDef[] = [
    {
      field: 'phone',
      headerName: 'رقم الهاتف',
      minWidth: 140,
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Box sx={{ fontWeight: 'medium', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            {params.row.phone}
          </Box>
          <Box sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, color: 'text.secondary' }}>
            {params.row.firstName} {params.row.lastName || ''}
          </Box>
        </Box>
      ),
    },
    {
      field: 'roles',
      headerName: 'الدور',
      minWidth: 100,
      flex: 0.8,
      renderCell: (params) => {
        const role = params.row.roles?.[0] || 'user';
        const colorMap: Record<string, 'error' | 'warning' | 'info' | 'default'> = {
          super_admin: 'error',
          admin: 'warning',
          moderator: 'info',
          user: 'default',
        };
        const labelMap: Record<string, string> = {
          super_admin: 'مدير عام',
          admin: 'مدير',
          moderator: 'مشرف',
          user: 'مستخدم',
        };
        return (
          <Chip 
            label={labelMap[role] || role} 
            color={colorMap[role]} 
            size="small"
            sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
          />
        );
      },
    },
    {
      field: 'status',
      headerName: 'الحالة',
      minWidth: 90,
      flex: 0.7,
      renderCell: (params) => {
        const statusMap: Record<
          UserStatus,
          { label: string; color: 'success' | 'error' | 'warning' | 'default' }
        > = {
          active: { label: 'نشط', color: 'success' },
          suspended: { label: 'معلق', color: 'error' },
          pending: { label: 'قيد الانتظار', color: 'warning' },
        };
        const status = statusMap[params.row.status as UserStatus];
        return (
          <Chip 
            label={status.label} 
            color={status.color} 
            size="small"
            sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
          />
        );
      },
    },
    {
      field: 'capabilities',
      headerName: 'القدرات',
      minWidth: 120,
      flex: 1,
      hide: screenSize < 768, // إخفاء في الشاشات الصغيرة
      renderCell: (params) => {
        const caps = params.row.capabilities;
        if (!caps) return '-';

        const badges = [];
        if (caps.engineer_capable) badges.push('مهندس');
        if (caps.wholesale_capable) badges.push('تاجر جملة');
        if (badges.length === 0) badges.push('عميل');

        return (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {badges.slice(0, 2).map((badge) => (
              <Chip 
                key={badge} 
                label={badge} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              />
            ))}
            {badges.length > 2 && (
              <Chip 
                label={`+${badges.length - 2}`} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              />
            )}
          </Box>
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'تاريخ الإنشاء',
      minWidth: 120,
      flex: 0.8,
      hide: screenSize < 1024, // إخفاء في الشاشات المتوسطة
      valueFormatter: (value) => formatDate(value as Date),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      minWidth: 120,
      flex: 0.8,
      sortable: false,
      renderCell: (params) => {
        const user = params.row as User;
        const isDeleted = !!user.deletedAt;

        if (isDeleted) {
          return (
            <Box display="flex" gap={0.5} flexWrap="wrap">
              <Tooltip title="استعادة">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRestore(user);
                  }}
                  sx={{ p: { xs: 0.5, sm: 1 } }}
                >
                  <Restore fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        }

        return (
          <Box display="flex" gap={0.5} flexWrap="wrap">
            <Tooltip title="تعديل">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/users/${user._id}`);
                }}
                sx={{ p: { xs: 0.5, sm: 1 } }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>

            {user.status === 'suspended' ? (
              <Tooltip title="تفعيل">
                <IconButton
                  size="small"
                  color="success"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActivate(user);
                  }}
                  sx={{ p: { xs: 0.5, sm: 1 } }}
                >
                  <CheckCircle fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="إيقاف">
                <IconButton
                  size="small"
                  color="warning"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSuspend(user);
                  }}
                  sx={{ p: { xs: 0.5, sm: 1 } }}
                >
                  <Block fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="حذف">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(user);
                }}
                sx={{ p: { xs: 0.5, sm: 1 } }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      <DataTable
        title="إدارة المستخدمين"
        columns={columns}
        rows={data?.data || []}
        loading={isLoading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        rowCount={data?.meta?.total || 0}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        searchPlaceholder="البحث في المستخدمين..."
        onSearch={setSearch}
        onAdd={() => navigate('/users/new')}
        addButtonText="إضافة مستخدم"
        getRowId={(row) => row._id}
        onRowClick={(params) => {
          const row = params.row as User;
          navigate(`/users/${row._id}`);
        }}
        height={screenSize < 600 ? "calc(100vh - 140px)" : "calc(100vh - 180px)"}
      />
    </Box>
  );
};
