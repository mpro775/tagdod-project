import React, { useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Grid,
  useTheme,
  useMediaQuery,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { PersonAdd, Download, CalendarMonth } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useUsers, useUserStats, useExportUsers, useExportMonthlyReport } from '../hooks/useUsers';
import { ExportFieldsDialog } from '@/shared/components/ExportFieldsDialog';
import type { User, UserStatus } from '../types/user.types';
import { UserStatsCards } from '../components/UserStatsCards';
import { UsersFilter } from '../components/UsersFilter';
import { UserCard } from '../components/UserCard';
import { useUsersTableColumns } from '../components/UsersTableColumns';
import { DeleteUserDialog } from '../components/DeleteUserDialog';
import { useUsersTableActions } from '../hooks/useUsersTableActions';
import { useTranslation } from 'react-i18next';
import {
  EmptyState,
  LoadingState,
  PageHeader,
  PageShell,
  usePageTitle,
} from '@/shared/design-system';
import '../styles/responsive-users.css';

export const UsersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['users', 'common']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const pageTitle = t('users:list.title', 'إدارة المستخدمين');

  usePageTitle(pageTitle);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: isMobile ? 10 : 20,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'createdAt', sort: 'desc' }]);
  const [filters, setFilters] = useState({
    search: '',
    status: undefined as UserStatus | undefined,
    role: undefined as any,
    verificationStatus: undefined as
      | 'all'
      | 'verified'
      | 'unverified'
      | 'pending'
      | 'rejected'
      | undefined,
    includeDeleted: false,
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({
    open: false,
    user: null,
  });
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [monthlyReportDialog, setMonthlyReportDialog] = useState(false);
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());

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
  const exportUsersMutation = useExportUsers();
  const exportMonthlyReportMutation = useExportMonthlyReport();

  const {
    handleStatusToggle,
    handleRestore,
    handleDelete: deleteUser,
    isDeleting,
  } = useUsersTableActions({
    onRefetch: refetch,
  });

  const handleDelete = (user: User) => {
    setDeleteDialog({ open: true, user });
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

  const getExportParams = () => ({
    search: filters.search,
    status: filters.status,
    role: filters.role,
    verificationStatus: verificationStatusForApi,
    includeDeleted: filters.includeDeleted,
    sortBy: sortModel[0]?.field || 'createdAt',
    sortOrder: sortModel[0]?.sort || 'desc',
  });

  const handleExportUsers = (fields: string[]) => {
    exportUsersMutation.mutate({
      params: getExportParams(),
      fields,
    });
  };

  const handleExportMonthlyReport = () => {
    exportMonthlyReportMutation.mutate(
      { month: reportMonth, year: reportYear },
      {
        onSuccess: () => setMonthlyReportDialog(false),
      },
    );
  };

  const columns = useUsersTableColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onRestore: handleRestore,
    onStatusToggle: handleStatusToggle,
  });

  const tableHeight = React.useMemo(() => {
    if (isSmallScreen) return 'calc(100vh - 400px)';
    if (isMobile) return 'calc(100vh - 360px)';
    return 'calc(100vh - 320px)';
  }, [isMobile, isSmallScreen]);

  const toolbarActions = (
    <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
      <Button
        variant="outlined"
        size="small"
        startIcon={<CalendarMonth />}
        onClick={() => setMonthlyReportDialog(true)}
        disabled={exportMonthlyReportMutation.isPending}
      >
        {exportMonthlyReportMutation.isPending
          ? t('users:actions.exportingReport', 'جاري التصدير...')
          : t('users:actions.monthlyReport', 'تقرير شهري')}
      </Button>
      <Button
        variant="outlined"
        size="small"
        startIcon={<Download />}
        onClick={() => setExportDialogOpen(true)}
        disabled={exportUsersMutation.isPending}
      >
        {exportUsersMutation.isPending
          ? t('users:actions.exportingNames', 'جاري التصدير...')
          : t('users:actions.exportNames', 'تصدير الأسماء')}
      </Button>
    </Stack>
  );

  const mobileToolbarActions = (
    <Stack direction="column" spacing={1} sx={{ width: '100%' }}>
      <Button
        variant="outlined"
        size="small"
        startIcon={<CalendarMonth />}
        onClick={() => setMonthlyReportDialog(true)}
        fullWidth
        disabled={exportMonthlyReportMutation.isPending}
      >
        {exportMonthlyReportMutation.isPending
          ? t('users:actions.exportingReport', 'جاري التصدير...')
          : t('users:actions.monthlyReport', 'تقرير شهري')}
      </Button>
      <Button
        variant="outlined"
        size="small"
        startIcon={<Download />}
        onClick={() => setExportDialogOpen(true)}
        fullWidth
        disabled={exportUsersMutation.isPending}
      >
        {exportUsersMutation.isPending
          ? t('users:actions.exportingNames', 'جاري التصدير...')
          : t('users:actions.exportNames', 'تصدير الأسماء')}
      </Button>
    </Stack>
  );

  return (
    <PageShell spacing="compact" fullHeight>
      <PageHeader
        title={pageTitle}
        description={t('users:list.description', 'إدارة المستخدمين، الفلاتر، والتصدير')}
        variant="compact"
        breadcrumbs={[
          { label: t('common:navigation.dashboard', 'لوحة التحكم'), to: '/dashboard' },
          { label: pageTitle },
        ]}
        actions={[
          {
            label: t('users:actions.addUser', 'إضافة مستخدم / أدمن'),
            icon: <PersonAdd />,
            onClick: () => navigate('/users/new'),
            variant: 'primary',
          },
        ]}
      />

      {stats && <UserStatsCards stats={stats} loading={statsLoading} compact />}

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
        actions={isMobile ? undefined : toolbarActions}
      />

      {isMobile && <Box sx={{ mt: 0 }}>{mobileToolbarActions}</Box>}

      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          width: '100%',
          overflowX: 'auto',
          minWidth: 0,
        }}
      >
        <DataTable
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

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {isLoading ? (
          <LoadingState variant="skeleton" rows={4} />
        ) : (data?.data || []).length === 0 ? (
          <EmptyState title={t('users:list.noUsers', 'لا يوجد مستخدمين')} />
        ) : (
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {(data?.data || []).map((user: User) => (
              <Grid component="div" size={{ xs: 6, sm: 6, md: 4 }} key={user._id} sx={{ minWidth: 0 }}>
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

      <DeleteUserDialog
        open={deleteDialog.open}
        user={deleteDialog.user}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
      <ExportFieldsDialog
        open={exportDialogOpen}
        title="تصدير المستخدمين"
        loading={exportUsersMutation.isPending}
        onClose={() => setExportDialogOpen(false)}
        onExport={handleExportUsers}
        activeFilters={[
          { label: 'بحث', value: filters.search },
          { label: 'الحالة', value: filters.status },
          { label: 'الدور', value: filters.role },
          { label: 'التحقق', value: verificationStatusForApi },
          { label: 'المحذوفين', value: filters.includeDeleted ? 'نعم' : undefined },
        ]}
        fields={[
          { key: 'firstName', label: 'الاسم الأول', default: true },
          { key: 'lastName', label: 'الاسم الأخير', default: true },
          { key: 'phone', label: 'رقم الهاتف', default: true },
          { key: 'roles', label: 'الدور', default: true },
          { key: 'status', label: 'الحالة', default: true },
          { key: 'city', label: 'المدينة', default: true },
          { key: 'createdAt', label: 'تاريخ الإنشاء', default: true },
          { key: 'lastActivityAt', label: 'آخر نشاط' },
          { key: 'verificationStatus', label: 'حالة التحقق' },
          { key: 'deletedAt', label: 'تاريخ الحذف' },
          { key: 'storeName', label: 'اسم المتجر' },
          { key: 'jobTitle', label: 'المهنة' },
        ]}
      />

      <Dialog
        open={monthlyReportDialog}
        onClose={() => setMonthlyReportDialog(false)}
        maxWidth="xs"
        fullWidth
        fullScreen={isSmallScreen}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {t('users:actions.monthlyReport', 'تقرير شهري')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              select
              label={t('users:report.month', 'الشهر')}
              value={reportMonth}
              onChange={(e) => setReportMonth(Number(e.target.value))}
              fullWidth
            >
              <MenuItem value={1}>يناير</MenuItem>
              <MenuItem value={2}>فبراير</MenuItem>
              <MenuItem value={3}>مارس</MenuItem>
              <MenuItem value={4}>أبريل</MenuItem>
              <MenuItem value={5}>مايو</MenuItem>
              <MenuItem value={6}>يونيو</MenuItem>
              <MenuItem value={7}>يوليو</MenuItem>
              <MenuItem value={8}>أغسطس</MenuItem>
              <MenuItem value={9}>سبتمبر</MenuItem>
              <MenuItem value={10}>أكتوبر</MenuItem>
              <MenuItem value={11}>نوفمبر</MenuItem>
              <MenuItem value={12}>ديسمبر</MenuItem>
            </TextField>
            <TextField
              label={t('users:report.year', 'السنة')}
              type="number"
              value={reportYear}
              onChange={(e) => setReportYear(Number(e.target.value))}
              fullWidth
              slotProps={{ htmlInput: { min: 2020, max: 2100 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setMonthlyReportDialog(false)}>
            {t('common:actions.cancel', 'إلغاء')}
          </Button>
          <Button
            variant="contained"
            onClick={handleExportMonthlyReport}
            disabled={exportMonthlyReportMutation.isPending}
            startIcon={<Download />}
          >
            {exportMonthlyReportMutation.isPending
              ? t('users:actions.exporting', 'جاري التصدير...')
              : t('common:actions.export', 'تصدير')}
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
};