import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Chip, 
  IconButton, 
  Tooltip, 
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import { Edit, Delete, Restore } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { ResponsiveListWrapper } from '@/shared/components/ResponsiveList';
import { UserCard } from '@/shared/components/Cards';
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
  
  // Dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: User | null;
    action: 'delete' | null;
  }>({
    open: false,
    user: null,
    action: null,
  });

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
  const handleStatusToggle = (user: User, checked: boolean) => {
    // تنفيذ العملية فوراً
    if (checked) {
      // المستخدم يريد التفعيل (السويتش ON)
      activateUser(user._id, {
        onSuccess: () => refetch(),
        onError: () => {
          // في حالة الخطأ، نعيد السويتش للحالة السابقة
          refetch();
        }
      });
    } else {
      // المستخدم يريد الإيقاف (السويتش OFF)
      suspendUser(
        { 
          id: user._id, 
          data: { reason: 'تم الإيقاف من لوحة التحكم' }
        },
        { 
          onSuccess: () => refetch(),
          onError: () => {
            // في حالة الخطأ، نعيد السويتش للحالة السابقة
            refetch();
          }
        }
      );
    }
  };

  const handleConfirmAction = () => {
    if (!confirmDialog.user) return;

    if (confirmDialog.action === 'delete') {
      deleteUser(confirmDialog.user._id, {
        onSuccess: () => {
          refetch();
          handleCloseDialog();
        },
      });
    }
  };

  const handleCloseDialog = () => {
    setConfirmDialog({ open: false, user: null, action: null });
  };

  const handleDelete = (user: User) => {
    setConfirmDialog({
      open: true,
      user,
      action: 'delete',
    });
  };

  const handleRestore = (user: User) => {
    restoreUser(user._id, {
      onSuccess: () => refetch(),
    });
  };

  // Columns
  const columns: GridColDef[] = [
    {
      field: 'phone',
      headerName: 'رقم الهاتف',
      minWidth: 130,
      flex: 0.9,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 'medium', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
          {params.row.phone}
        </Box>
      ),
    },
    {
      field: 'name',
      headerName: 'الاسم',
      minWidth: 150,
      flex: 1.2,
      renderCell: (params) => {
        const fullName = `${params.row.firstName || ''} ${params.row.lastName || ''}`.trim();
        return (
          <Box sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            {fullName || '-'}
          </Box>
        );
      },
    },
    {
      field: 'roles',
      headerName: 'الدور',
      minWidth: 100,
      flex: 0.8,
      renderCell: (params) => {
        const role = params.row.roles?.[0] || 'user';
        const colorMap: Record<string, 'error' | 'warning' | 'info' | 'success' | 'default'> = {
          super_admin: 'error',
          admin: 'warning',
          merchant: 'info',
          engineer: 'success',
          user: 'default',
        };
        const labelMap: Record<string, string> = {
          super_admin: 'مدير عام',
          admin: 'مدير',
          merchant: 'تاجر',
          engineer: 'مهندس',
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
          <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
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

            <Tooltip title={user.status === 'active' ? 'نشط' : 'موقوف'}>
              <Box 
                onClick={(e) => e.stopPropagation()}
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <Switch
                  checked={user.status === 'active'}
                  onChange={(e) => {
                    handleStatusToggle(user, e.target.checked);
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
                  }}
                />
              </Box>
            </Tooltip>

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
      <Box sx={{ mb: 2 }}>
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
          getRowId={(row: any) => row._id}
          onRowClick={(params) => {
            const row = params.row as User;
            navigate(`/users/${row._id}`);
          }}
          height={screenSize < 600 ? "calc(100vh - 140px)" : "calc(100vh - 180px)"}
        />
      </Box>

      {/* Responsive List for Mobile */}
      <ResponsiveListWrapper
        data={data?.data || []}
        loading={isLoading}
        columns={columns}
        CardComponent={UserCard}
        getRowId={(user) => user._id}
        onEdit={(user) => navigate(`/users/${user._id}`)}
        onDelete={handleDelete}
        onView={(user) => navigate(`/users/${user._id}`)}
        showActions={true}
        cardBreakpoint="md"
        emptyMessage="لا يوجد مستخدمون"
        emptyDescription="لم يتم العثور على أي مستخدمين في النظام"
        errorMessage="حدث خطأ أثناء تحميل المستخدمين"
        cardContainerProps={{
          sx: { 
            display: { xs: 'block', md: 'none' },
            px: 2 
          }
        }}
        gridProps={{
          sx: { 
            display: { xs: 'none', md: 'block' },
            height: screenSize < 600 ? "calc(100vh - 140px)" : "calc(100vh - 180px)"
          }
        }}
      />

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, fontSize: '1.25rem', fontWeight: 'bold' }}>
          🗑️ حذف المستخدم
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText sx={{ mb: 2, fontSize: '0.95rem' }}>
            هل أنت متأكد من حذف المستخدم <strong>{confirmDialog.user?.firstName} {confirmDialog.user?.lastName}</strong>؟
            <br />
            يمكنك استعادة المستخدم لاحقاً من المستخدمين المحذوفين.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            color="inherit"
            variant="outlined"
          >
            إلغاء
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            variant="contained"
            color="error"
            // autoFocus
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
