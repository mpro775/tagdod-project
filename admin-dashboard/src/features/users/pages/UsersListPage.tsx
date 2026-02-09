import React, { useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Paper as MuiPaper,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useUsers, useUserStats } from '../hooks/useUsers';
import type { User, UserStatus } from '../types/user.types';
import { UserStatsCards } from '../components/UserStatsCards';
import { UsersFilter } from '../components/UsersFilter';
import { UserCard } from '../components/UserCard';
import { useUsersTableColumns } from '../components/UsersTableColumns';
import { DeleteUserDialog } from '../components/DeleteUserDialog';
import { useUsersTableActions } from '../hooks/useUsersTableActions';
import { useTranslation } from 'react-i18next';
import '../styles/responsive-users.css';

export const UsersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['users', 'common']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // State
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: isMobile ? 10 : 20,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'createdAt', sort: 'desc' }]);
  const [filters, setFilters] = useState({
    search: '',
    status: undefined as UserStatus | undefined,
    role: undefined as any,
    verificationStatus: undefined as 'all' | 'verified' | 'unverified' | undefined,
    includeDeleted: false,
  });

  // Dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({
    open: false,
    user: null,
  });

  // API
  const verificationStatusForApi =
    (filters.role === 'merchant' || filters.role === 'engineer') &&
    filters.verificationStatus &&
    filters.verificationStatus !== 'all'
      ? filters.verificationStatus
      : undefined;

  const { data, isLoading, refetch } = useUsers({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: filters.search,
    status: filters.status,
    role: filters.role,
    verificationStatus: verificationStatusForApi,
    includeDeleted: filters.includeDeleted,
    sortBy: sortModel[0]?.field || 'createdAt',
    sortOrder: sortModel[0]?.sort || 'desc',
  });

  const { data: stats, isLoading: statsLoading } = useUserStats();

  // Table Actions Hook
  const {
    handleStatusToggle,
    handleRestore,
    handleDelete: deleteUser,
    isDeleting,
  } = useUsersTableActions({
    onRefetch: refetch,
  });

  // Action Handlers
  const handleDelete = (user: User) => {
    setDeleteDialog({
      open: true,
      user,
    });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, user: null });
  };

  const handleConfirmDelete = () => {
    if (!deleteDialog.user) return;
    deleteUser(deleteDialog.user._id, () => {
      handleCloseDeleteDialog();
    });
  };

  const handleEdit = (user: User) => {
    navigate(`/users/${user._id}`);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: undefined,
      role: undefined,
      verificationStatus: undefined,
      includeDeleted: false,
    });
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  // Table Columns
  const columns = useUsersTableColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onRestore: handleRestore,
    onStatusToggle: handleStatusToggle,
  });

  // Calculate table height responsively
  const tableHeight = React.useMemo(() => {
    if (isSmallScreen) return 'calc(100vh - 320px)';
    if (isMobile) return 'calc(100vh - 300px)';
    return 'calc(100vh - 280px)';
  }, [isMobile, isSmallScreen]);

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: 'background.default',
        minHeight: '100vh',
        pb: { xs: 2, sm: 3 },
      }}
    >
      {/* إحصائيات المستخدمين */}
      {stats && <UserStatsCards stats={stats} loading={statsLoading} />}

      {/* فلاتر البحث */}
      <Box sx={{ px: { xs: 1, sm: 0 }, mb: { xs: 2, sm: 3 } }}>
        <UsersFilter
          filters={{
            search: filters.search,
            status: filters.status,
            role: filters.role,
            verificationStatus: filters.verificationStatus,
            includeDeleted: filters.includeDeleted,
          }}
          onFiltersChange={(newFilters) => {
            setFilters({
              search: newFilters.search,
              status: newFilters.status,
              role: newFilters.role,
              verificationStatus: newFilters.verificationStatus,
              includeDeleted: newFilters.includeDeleted || false,
            });
            setPaginationModel((prev) => ({ ...prev, page: 0 }));
          }}
          onClearFilters={handleClearFilters}
        />
      </Box>

      {/* Action Buttons - Desktop */}
      <Box sx={{ mb: 2, display: { xs: 'none', md: 'block' }, px: { xs: 1, sm: 0 } }}>
        <MuiPaper
          sx={{
            p: 2,
            mb: 2,
            bgcolor: 'background.paper',
            backgroundImage: 'none',
          }}
        >
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => navigate('/users/new')}
              size="medium"
              color="primary"
            >
              {t('users:actions.addUser', 'إضافة مستخدم / أدمن')}
            </Button>
          </Stack>
        </MuiPaper>
      </Box>

      {/* Desktop View - Table */}
      <Box
        sx={{
          mb: 2,
          display: { xs: 'none', md: 'block' },
          px: { xs: 1, sm: 0 },
        }}
      >
        <DataTable
          title={t('users:list.title', 'إدارة المستخدمين')}
          columns={columns}
          rows={data?.data || []}
          loading={isLoading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={data?.meta?.total ?? 0}
          paginationMode="server"
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          getRowId={(row: any) => row._id}
          onRowClick={(params) => {
            const row = params.row as User;
            navigate(`/users/${row._id}`);
          }}
          height={tableHeight}
        />
      </Box>

      {/* Mobile Action Buttons */}
      <Box
        sx={{
          mb: 2,
          display: { xs: 'block', md: 'none' },
          px: { xs: 1, sm: 2 },
        }}
      >
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => navigate('/users/new')}
          fullWidth
          color="primary"
          size="large"
          sx={{
            py: 1.5,
            fontSize: '1rem',
          }}
        >
          {t('users:actions.addUser', 'إضافة مستخدم / أدمن')}
        </Button>
      </Box>

      {/* Mobile View - Cards */}
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          px: { xs: 1, sm: 2 },
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              color: 'text.secondary',
            }}
          >
            {t('common:loading', 'جاري التحميل...')}
          </Box>
        ) : (data?.data || []).length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              color: 'text.secondary',
            }}
          >
            {t('users:list.noUsers', 'لا يوجد مستخدمين')}
          </Box>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 2 }}>
            {(data?.data || []).map((user: User) => (
              <Grid component="div" size={{ xs: 6, sm: 6, md: 4 }} key={user._id}>
                <UserCard
                  user={user}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onRestore={handleRestore}
                  onStatusToggle={handleStatusToggle}
                  showActions={true}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <DeleteUserDialog
        open={deleteDialog.open}
        user={deleteDialog.user}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </Box>
  );
};
