import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { Restore, DeleteForever, Info, Refresh, PersonOff, TimerOff } from '@mui/icons-material';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { PageShell } from '@/shared/design-system/components/PageShell';
import { PageHeader } from '@/shared/design-system/components/PageHeader';
import { PageSummaryGrid, StatCard } from '@/shared/design-system';
import { DataToolbar } from '@/shared/design-system/components/DataToolbar';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { ConfirmDialog } from '@/shared/design-system';
import { EmptyState } from '@/shared/design-system/components/EmptyState';
import { RowActionsMenu, type RowAction } from '@/shared/design-system/components/RowActionsMenu';
import { useDeletedUsers, useRestoreUser, usePermanentDeleteUser } from '../hooks/useUsers';
import type { DeletedUser } from '../types/user.types';
import { formatDate } from '@/shared/utils/formatters';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';

export const DeletedUsersPage: React.FC = () => {
  const { t } = useTranslation(['users', 'common']);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'deletedAt', sort: 'desc' }]);
  const [searchQuery, setSearchQuery] = useState('');

  const [confirmRestore, setConfirmRestore] = useState<{ open: boolean; user: DeletedUser | null }>({
    open: false,
    user: null,
  });
  const [permanentDeleteDialog, setPermanentDeleteDialog] = useState<{
    open: boolean;
    user: DeletedUser | null;
    confirmPhone: string;
  }>({
    open: false,
    user: null,
    confirmPhone: '',
  });

  const { data, isLoading, refetch } = useDeletedUsers({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: searchQuery || undefined,
    sortBy: sortModel[0]?.field || 'deletedAt',
    sortOrder: sortModel[0]?.sort || 'desc',
  });

  const { user: currentUser, hasPermission } = useAuthStore();
  const restoreUserMutation = useRestoreUser();
  const permanentDeleteMutation = usePermanentDeleteUser();

  const canPermanentDelete =
    currentUser?.roles?.includes('super_admin') === true &&
    hasPermission('users.delete') &&
    hasPermission('super_admin.access');

  const handleRestore = (user: DeletedUser) => {
    setConfirmRestore({ open: true, user });
  };

  const handleRestoreConfirm = () => {
    if (confirmRestore.user) {
      restoreUserMutation.mutate(confirmRestore.user.id, {
        onSuccess: () => {
          setConfirmRestore({ open: false, user: null });
          refetch();
        },
      });
    }
  };

  const openPermanentDeleteDialog = (user: DeletedUser) => {
    setPermanentDeleteDialog({ open: true, user, confirmPhone: '' });
  };

  const closePermanentDeleteDialog = () => {
    if (permanentDeleteMutation.isPending) return;
    setPermanentDeleteDialog({ open: false, user: null, confirmPhone: '' });
  };

  const handlePermanentDelete = () => {
    if (!permanentDeleteDialog.user) return;
    permanentDeleteMutation.mutate(permanentDeleteDialog.user.id, {
      onSuccess: () => {
        closePermanentDeleteDialog();
        refetch();
      },
    });
  };

  const isPermanentDeleteConfirmationValid =
    !!permanentDeleteDialog.user &&
    permanentDeleteDialog.confirmPhone.trim() === permanentDeleteDialog.user.phone;

  const recentCount = data?.data?.filter(
    (u: DeletedUser) => new Date(u.deletedAt).getTime() > Date.now() - 7 * 86400000
  ).length ?? 0;

  const kpiCards = [
    {
      title: t('users:deleted.kpi.total', 'إجمالي المحذوفة'),
      value: data?.meta?.total?.toLocaleString('en-US') ?? '0',
      icon: <PersonOff fontSize="small" />,
      tone: 'error' as const,
    },
    {
      title: t('users:deleted.kpi.recentlyDeleted', 'محذوفة هذا الأسبوع'),
      value: recentCount.toLocaleString('en-US'),
      icon: <TimerOff fontSize="small" />,
      tone: 'warning' as const,
    },
    {
      title: t('users:deleted.kpi.restorable', 'قابلة للاستعادة'),
      value: data?.meta?.total?.toLocaleString('en-US') ?? '0',
      icon: <Restore fontSize="small" />,
      tone: 'success' as const,
    },
  ];

  const columns = useMemo(
    () => [
      {
        field: 'name',
        headerName: t('users:list.columns.name', 'المستخدم'),
        minWidth: 180,
        flex: 1.2,
        renderCell: (params: any) => {
          const fullName = `${params.row.firstName || ''} ${params.row.lastName || ''}`.trim();
          return (
            <Box sx={{ py: 0.5 }}>
              <Typography variant="body2" fontWeight="medium" noWrap>
                {fullName || t('common:notProvided', 'غير متوفر')}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {params.row.phone}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: 'deletionReason',
        headerName: t('users:deleted.deletionReason', 'سبب الحذف'),
        minWidth: 200,
        flex: 1.5,
        renderCell: (params: any) => (
          <Tooltip title={params.row.deletionReason || ''} arrow>
            <Typography variant="body2" color="text.secondary" noWrap sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Info sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0 }} />
              {params.row.deletionReason || t('common:notProvided', 'غير متوفر')}
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: 'deletedAt',
        headerName: t('users:deleted.deletedAt', 'تاريخ الحذف'),
        minWidth: 140,
        flex: 0.8,
        renderCell: (params: any) => (
          <Typography variant="body2" color="text.secondary">
            {formatDate(params.row.deletedAt)}
          </Typography>
        ),
      },
      {
        field: 'createdAt',
        headerName: t('users:list.columns.createdAt', 'تاريخ الإنشاء'),
        minWidth: 140,
        flex: 0.8,
        renderCell: (params: any) => (
          <Typography variant="body2" color="text.secondary">
            {formatDate(params.row.createdAt)}
          </Typography>
        ),
      },
      {
        field: 'actions',
        headerName: t('common:actions.title', 'الإجراءات'),
        minWidth: 80,
        flex: 0.5,
        sortable: false,
        renderCell: (params: any) => {
          const actions: RowAction[] = [
            {
              label: t('users:deleted.restore', 'استعادة الحساب'),
              icon: <Restore fontSize="small" />,
              onClick: () => handleRestore(params.row),
              disabled: restoreUserMutation.isPending,
            },
          ];
          if (canPermanentDelete) {
            actions.push({
              label: t('users:deleted.permanentDelete', 'حذف نهائي'),
              icon: <DeleteForever fontSize="small" />,
              onClick: () => openPermanentDeleteDialog(params.row),
              disabled: permanentDeleteMutation.isPending,
              danger: true,
            });
          }
          return <RowActionsMenu actions={actions} menuId={`deleted-user-actions-${params.row.id}`} />;
        },
      },
    ],
    [t, canPermanentDelete, restoreUserMutation.isPending, permanentDeleteMutation.isPending]
  );

  return (
    <PageShell spacing="compact">
      <PageHeader
        variant="compact"
        title={t('users:deleted.title', 'الحسابات المحذوفة')}
        description={t('users:deleted.description', 'استعادة الحسابات المحذوفة أو حذفها نهائياً حسب الصلاحيات')}
        actions={[
          {
            label: t('common:actions.refresh', 'تحديث'),
            icon: <Refresh fontSize="small" />,
            onClick: () => refetch(),
            variant: 'secondary',
          },
        ]}
      />

      <PageSummaryGrid columns={4} compact>
        {kpiCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            tone={card.tone}
            compact
            loading={isLoading}
          />
        ))}
      </PageSummaryGrid>

      <DataToolbar
        searchValue={searchQuery}
        searchPlaceholder={t('users:deleted.searchPlaceholder', 'بحث بالاسم أو الهاتف أو سبب الحذف...')}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setPaginationModel((prev) => ({ ...prev, page: 0 }));
        }}
        compact
      />

      {data?.data && data.data.length > 0 ? (
        <DataTable
          columns={columns}
          rows={data.data}
          loading={isLoading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={data?.meta?.total}
          paginationMode="server"
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          getRowId={(row: any) => row.id}
          height="calc(100vh - 380px)"
          density="compact"
        />
      ) : !isLoading ? (
        <EmptyState
          title={t('users:deleted.noResults', 'لا توجد حسابات محذوفة')}
          description={t('users:deleted.noResultsDescription', 'كل الحسابات الحالية نشطة أو غير محذوفة')}
          icon={<PersonOff sx={{ fontSize: 48 }} />}
        />
      ) : null}

      <ConfirmDialog
        open={confirmRestore.open}
        title={t('users:deleted.confirmRestoreTitle', 'استعادة الحساب')}
        message={t('users:deleted.confirmRestoreMessage', 'هل تريد استعادة هذا الحساب؟ سيتمكن المستخدم من استخدام الحساب مرة أخرى.')}
        type="question"
        confirmText={t('users:deleted.restore', 'استعادة')}
        cancelText={t('common:actions.cancel', 'إلغاء')}
        onConfirm={handleRestoreConfirm}
        onCancel={() => setConfirmRestore({ open: false, user: null })}
        loading={restoreUserMutation.isPending}
        confirmColor="primary"
      />

      <Dialog
        open={permanentDeleteDialog.open}
        onClose={closePermanentDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main', fontWeight: 700 }}>
          {t('users:deleted.confirmPermanentDeleteTitle', 'حذف نهائي')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.primary', mb: 2 }}>
            {t('users:deleted.confirmPermanentDeleteMessage', {
              phone: permanentDeleteDialog.user?.phone || '-',
            })}
          </DialogContentText>
          <DialogContentText sx={{ color: 'error.main', mb: 2, fontWeight: 600 }}>
            {t('users:deleted.confirmPermanentDeleteWarning', 'هذا الإجراء لا يمكن التراجع عنه!')}
          </DialogContentText>
          <DialogContentText sx={{ color: 'text.secondary', mb: 1 }}>
            {t('users:deleted.confirmPermanentDeleteHint', 'يرجى كتابة رقم الهاتف للتأكيد:')}
          </DialogContentText>
          <TextField
            fullWidth
            value={permanentDeleteDialog.confirmPhone}
            onChange={(e) =>
              setPermanentDeleteDialog((prev) => ({
                ...prev,
                confirmPhone: e.target.value,
              }))
            }
            label={t('users:deleted.confirmPermanentDeleteInputLabel', 'رقم الهاتف')}
            placeholder={t('users:deleted.confirmPermanentDeleteInputPlaceholder', {
              phone: permanentDeleteDialog.user?.phone || '',
            })}
            disabled={permanentDeleteMutation.isPending}
            autoFocus
            size="small"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closePermanentDeleteDialog} disabled={permanentDeleteMutation.isPending}>
            {t('common:actions.cancel', 'إلغاء')}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handlePermanentDelete}
            disabled={!isPermanentDeleteConfirmationValid || permanentDeleteMutation.isPending}
          >
            {permanentDeleteMutation.isPending
              ? t('common:loading', 'جاري التحميل...')
              : t('users:deleted.permanentDelete', 'حذف نهائي')}
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
};