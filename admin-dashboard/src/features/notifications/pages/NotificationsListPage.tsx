import React, { useState } from 'react';
import {
  Box,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  Snackbar,
  Alert as MuiAlert,
} from '@mui/material';
import { Add, Edit, Send, Analytics } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import {
  useNotifications,
  useSendNotification,
  useDeleteNotification,
  useUpdateNotification,
  useCreateNotification,
  useNotificationStats,
  useNotificationTemplates,
  useBulkSendNotification,
  useTestNotification,
} from '../hooks/useNotifications';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import type {
  Notification,
  CreateNotificationDto,
  UpdateNotificationDto,
  ListNotificationsParams,
  BulkSendNotificationDto,
} from '../types/notification.types';
import { NotificationStatsCards } from '../components/NotificationStatsCards';
import { NotificationFilters } from '../components/NotificationFilters';
import { NotificationTable } from '../components/NotificationTable';
import { NotificationViewDialog } from '../components/NotificationViewDialog';
import { NotificationEditForm } from '../components/NotificationEditForm';
import { NotificationCreateForm } from '../components/NotificationCreateForm';
import { BulkSendForm } from '../components/BulkSendForm';
import { TestNotificationForm } from '../components/TestNotificationForm';

export const NotificationsListPage: React.FC = () => {
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();
  const { confirmDialog } = useConfirmDialog();

  const [filters, setFilters] = useState<ListNotificationsParams>({
    search: '',
    channel: undefined,
    status: undefined,
    type: undefined,
    category: undefined,
    priority: undefined,
    page: 1,
    limit: 20,
    startDate: undefined,
    endDate: undefined,
    includeDeleted: false,
  });

  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [bulkSendDialogOpen, setBulkSendDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const { data: notificationsResponse, isLoading, error, refetch } = useNotifications(filters);
  const { data: stats, isLoading: statsLoading } = useNotificationStats();
  const { data: templates } = useNotificationTemplates();

  const { mutate: sendNotification, isPending: isSending } = useSendNotification();
  const { mutate: deleteNotification, isPending: isDeleting } = useDeleteNotification();
  const { mutate: updateNotification, isPending: isUpdating } = useUpdateNotification();
  const { mutate: createNotification, isPending: isCreating } = useCreateNotification();
  const { mutate: bulkSendNotification, isPending: isBulkSending } = useBulkSendNotification();
  const { mutate: testNotification, isPending: isTesting } = useTestNotification();

  const notifications = notificationsResponse?.data || [];

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleFilterChange = (field: keyof ListNotificationsParams, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleEdit = (notification: Notification) => {
    setSelectedNotification(notification);
    setEditDialogOpen(true);
  };

  const handleView = (notification: Notification) => {
    setSelectedNotification(notification);
    setViewDialogOpen(true);
  };

  const handleSend = (notification: Notification) => {
    sendNotification(
      { id: notification._id, data: {} },
      {
        onSuccess: () => {
          showSnackbar(t('messages.sendSuccess'), 'success');
          refetch();
        },
        onError: () => showSnackbar(t('messages.sendError'), 'error'),
      }
    );
  };

  const handleDelete = async (notification: Notification) => {
    const confirmed = await confirmDialog({
      title: t('messages.deleteTitle', 'تأكيد الحذف'),
      message: t('messages.deleteConfirm'),
      type: 'warning',
      confirmColor: 'error',
    });
    if (confirmed) {
      deleteNotification(notification._id, {
        onSuccess: () => {
          showSnackbar(t('messages.deleteSuccess'), 'success');
          refetch();
        },
        onError: () => showSnackbar(t('messages.deleteError'), 'error'),
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) {
      showSnackbar(t('messages.bulkDeleteWarning'), 'warning');
      return;
    }

    const confirmed = await confirmDialog({
      title: t('messages.bulkDeleteTitle', 'تأكيد الحذف الجماعي'),
      message: t('messages.bulkDeleteConfirm', { count: selectedNotifications.length }),
      type: 'warning',
      confirmColor: 'error',
    });
    if (confirmed) {
      // Implement bulk delete logic
      showSnackbar(t('messages.bulkDeleteSuccess'), 'success');
      setSelectedNotifications([]);
      refetch();
    }
  };

  const handleUpdate = (data: UpdateNotificationDto) => {
    if (selectedNotification) {
      updateNotification(
        { id: selectedNotification._id, data },
        {
          onSuccess: () => {
            setEditDialogOpen(false);
            setSelectedNotification(null);
            showSnackbar(t('messages.updateSuccess'), 'success');
            refetch();
          },
          onError: () => showSnackbar(t('messages.updateError'), 'error'),
        }
      );
    }
  };

  const handleCreate = (data: CreateNotificationDto) => {
    createNotification(data, {
      onSuccess: () => {
        setCreateDialogOpen(false);
        showSnackbar(t('messages.createSuccess'), 'success');
        refetch();
      },
      onError: () => showSnackbar(t('messages.createError'), 'error'),
    });
  };

  const handleBulkSend = (data: BulkSendNotificationDto) => {
    bulkSendNotification(data, {
      onSuccess: () => {
        setBulkSendDialogOpen(false);
        showSnackbar(t('messages.bulkSendSuccess'), 'success');
        refetch();
      },
      onError: () => showSnackbar(t('messages.bulkSendError'), 'error'),
    });
  };

  const handleTest = (userId: string, templateKey: string, payload: Record<string, unknown>) => {
    testNotification(
      { userId, templateKey, payload },
      {
        onSuccess: () => {
          setTestDialogOpen(false);
          showSnackbar(t('messages.testSuccess'), 'success');
        },
        onError: () => showSnackbar(t('messages.testError'), 'error'),
      }
    );
  };

  const handleRefresh = () => {
    refetch();
    showSnackbar(t('messages.refreshSuccess'), 'info');
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
      limit: pageSize,
    }));
  };

  return (
    <Box>
      {/* Loading State */}
      {isLoading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: isMobile ? 2 : 3 }}>
          {t('messages.loadingErrorWithDetails', {
            error: error.message || t('messages.loadingError'),
          })}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Box sx={{ mb: isMobile ? 2 : 3 }}>
        <NotificationStatsCards stats={stats} isLoading={statsLoading} />
      </Box>

      {/* Filters and Actions */}
      <NotificationFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onCreateClick={() => setCreateDialogOpen(true)}
        onBulkSendClick={() => setBulkSendDialogOpen(true)}
        onTestClick={() => setTestDialogOpen(true)}
        onRefresh={handleRefresh}
        selectedCount={selectedNotifications.length}
        onBulkDelete={handleBulkDelete}
        isCreating={isCreating}
        isBulkSending={isBulkSending}
        isTesting={isTesting}
        isLoading={isLoading}
        isDeleting={isDeleting}
      />

      {/* Data Table */}
      <NotificationTable
        notifications={notifications}
        loading={isLoading}
        filters={filters}
        onPaginationChange={handlePaginationChange}
        onView={handleView}
        onEdit={handleEdit}
        onSend={handleSend}
        onDelete={handleDelete}
        onSelectionChange={setSelectedNotifications}
        isSending={isSending}
        isDeleting={isDeleting}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>

      {/* View Dialog */}
      <NotificationViewDialog
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setSelectedNotification(null);
        }}
        notification={selectedNotification}
      />

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedNotification(null);
        }}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: isMobile ? '1.125rem' : undefined,
          }}
        >
          <Edit />
          {t('dialogs.editTitle')}
        </DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <NotificationEditForm
              notification={selectedNotification}
              onSave={handleUpdate}
              onCancel={() => {
                setEditDialogOpen(false);
                setSelectedNotification(null);
              }}
              isLoading={isUpdating}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: isMobile ? '1.125rem' : undefined,
          }}
        >
          <Add />
          {t('dialogs.createTitle')}
        </DialogTitle>
        <DialogContent>
          <NotificationCreateForm
            templates={templates || []}
            onSave={handleCreate}
            onCancel={() => setCreateDialogOpen(false)}
            isLoading={isCreating}
          />
        </DialogContent>
      </Dialog>

      {/* Bulk Send Dialog */}
      <Dialog
        open={bulkSendDialogOpen}
        onClose={() => setBulkSendDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: isMobile ? '1.125rem' : undefined,
          }}
        >
          <Send />
          {t('dialogs.bulkSendTitle')}
        </DialogTitle>
        <DialogContent>
          <BulkSendForm
            onSave={handleBulkSend}
            onCancel={() => setBulkSendDialogOpen(false)}
            isLoading={isBulkSending}
          />
        </DialogContent>
      </Dialog>

      {/* Test Dialog */}
      <Dialog
        open={testDialogOpen}
        onClose={() => setTestDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: isMobile ? '1.125rem' : undefined,
          }}
        >
          <Analytics />
          {t('dialogs.testTitle')}
        </DialogTitle>
        <DialogContent>
          <TestNotificationForm
            templates={templates || []}
            onTest={handleTest}
            onCancel={() => setTestDialogOpen(false)}
            isLoading={isTesting}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};
