import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Alert as MuiAlert,
  TextField,
  Typography,
} from '@mui/material';
import { Refresh, Search } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { ConfirmDialog } from '@/shared/components';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import {
  useDeleteBatchNotification,
  useNotifications,
  useSendBatchNotification,
} from '../hooks/useNotifications';
import {
  ListNotificationsParams,
  Notification,
  NotificationCategory,
  NotificationChannel,
  NotificationStatus,
} from '../types/notification.types';
import { NotificationBatchTable } from '../components/NotificationBatchTable';
import { NotificationViewDialog } from '../components/NotificationViewDialog';

export const NotificationBatchesPage: React.FC = () => {
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();
  const { confirmDialog, dialogProps } = useConfirmDialog();
  const [searchParams] = useSearchParams();
  const initialBatchId = searchParams.get('batchId') || '';

  const [filters, setFilters] = useState<ListNotificationsParams>({
    page: 1,
    limit: 20,
    search: initialBatchId,
    channel: undefined,
    status: undefined,
    category: undefined,
    startDate: undefined,
    endDate: undefined,
    campaign: undefined,
    groupByBatch: true,
  });
  const [selectedBatch, setSelectedBatch] = useState<Notification | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
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
  const { mutate: sendBatchNotification, isPending: isSendingBatch } = useSendBatchNotification();
  const { mutate: deleteBatchNotification, isPending: isDeletingBatch } =
    useDeleteBatchNotification();

  const paginationMeta = notificationsResponse?.meta;
  const batchRows = useMemo(
    () => (notificationsResponse?.data || []).filter((notification) => Boolean(notification.batchId)),
    [notificationsResponse?.data]
  );
  const hasActiveBatch = batchRows.some((row) =>
    ['pending', 'queued', 'sending'].includes(row.status)
  );

  useEffect(() => {
    if (!hasActiveBatch) return;

    const timer = window.setInterval(() => {
      refetch();
    }, 5000);

    return () => window.clearInterval(timer);
  }, [hasActiveBatch, refetch]);

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleFilterChange = (field: keyof ListNotificationsParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value || undefined,
      page: 1,
      groupByBatch: true,
    }));
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
      limit: pageSize,
      groupByBatch: true,
    }));
  };

  const handleView = (batch: Notification) => {
    setSelectedBatch(batch);
    setViewDialogOpen(true);
  };

  const handleSend = async (batch: Notification) => {
    if (!batch.batchId) return;

    const confirmed = await confirmDialog({
      title: t('batches.resendConfirmTitle'),
      message: t('batches.resendConfirmMessageWithCount', {
        count: batch.recipientCount ?? 0,
      }),
      type: 'warning',
      confirmColor: 'primary',
    });

    if (!confirmed) return;

    sendBatchNotification(batch.batchId, {
      onSuccess: () => {
        showSnackbar(t('messages.sendSuccess'), 'success');
        refetch();
      },
      onError: () => showSnackbar(t('messages.sendError'), 'error'),
    });
  };

  const handleDelete = async (batch: Notification) => {
    if (!batch.batchId) return;

    const confirmed = await confirmDialog({
      title: t('batches.deleteConfirmTitle'),
      message: t('batches.deleteConfirmMessageWithCount', {
        count: batch.recipientCount ?? 0,
      }),
      type: 'warning',
      confirmColor: 'error',
    });

    if (!confirmed) return;

    deleteBatchNotification(batch.batchId, {
      onSuccess: () => {
        showSnackbar(t('messages.deleteSuccess'), 'success');
        refetch();
      },
      onError: () => showSnackbar(t('messages.deleteError'), 'error'),
    });
  };

  const handleRefresh = () => {
    refetch();
    showSnackbar(t('messages.refreshSuccess'), 'info');
  };

  return (
    <Box>
      {isLoading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: isMobile ? 2 : 3 }}>
          {t('messages.loadingErrorWithDetails', {
            error: error.message || t('messages.loadingError'),
          })}
        </Alert>
      )}

      <Box sx={{ mb: isMobile ? 2 : 3 }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={800} gutterBottom>
          {t('batches.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('batches.subtitle')}
        </Typography>
      </Box>

      <Paper
        sx={{
          p: isMobile ? 1.5 : 2,
          mb: isMobile ? 1.5 : 2,
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder={t('filters.search')}
            value={filters.search || ''}
            onChange={(event) => handleFilterChange('search', event.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ minWidth: isMobile ? '100%' : 260 }}
            aria-label={t('filters.search')}
          />

          <FormControl size="small" sx={{ minWidth: isMobile ? '100%' : 150 }}>
            <InputLabel>{t('filters.channel')}</InputLabel>
            <Select
              value={filters.channel || ''}
              onChange={(event) => handleFilterChange('channel', event.target.value)}
              label={t('filters.channel')}
            >
              <MenuItem value="">{t('filters.all')}</MenuItem>
              <MenuItem value={NotificationChannel.IN_APP}>{t('channels.IN_APP')}</MenuItem>
              <MenuItem value={NotificationChannel.PUSH}>{t('channels.PUSH')}</MenuItem>
              <MenuItem value={NotificationChannel.SMS}>{t('channels.SMS')}</MenuItem>
              <MenuItem value={NotificationChannel.EMAIL}>{t('channels.EMAIL')}</MenuItem>
              <MenuItem value={NotificationChannel.DASHBOARD}>{t('channels.DASHBOARD')}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: isMobile ? '100%' : 150 }}>
            <InputLabel>{t('filters.status')}</InputLabel>
            <Select
              value={filters.status || ''}
              onChange={(event) => handleFilterChange('status', event.target.value)}
              label={t('filters.status')}
            >
              <MenuItem value="">{t('filters.all')}</MenuItem>
              <MenuItem value={NotificationStatus.PENDING}>{t('statuses.pending')}</MenuItem>
              <MenuItem value={NotificationStatus.QUEUED}>{t('statuses.queued')}</MenuItem>
              <MenuItem value={NotificationStatus.SENDING}>{t('statuses.sending')}</MenuItem>
              <MenuItem value={NotificationStatus.SENT}>{t('statuses.sent')}</MenuItem>
              <MenuItem value={NotificationStatus.FAILED}>{t('statuses.failed')}</MenuItem>
              <MenuItem value={NotificationStatus.CANCELLED}>{t('statuses.cancelled')}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: isMobile ? '100%' : 150 }}>
            <InputLabel>{t('filters.category')}</InputLabel>
            <Select
              value={filters.category || ''}
              onChange={(event) => handleFilterChange('category', event.target.value)}
              label={t('filters.category')}
            >
              <MenuItem value="">{t('filters.all')}</MenuItem>
              <MenuItem value={NotificationCategory.ORDER}>{t('categories.ORDER')}</MenuItem>
              <MenuItem value={NotificationCategory.PRODUCT}>{t('categories.PRODUCT')}</MenuItem>
              <MenuItem value={NotificationCategory.SERVICE}>{t('categories.SERVICE')}</MenuItem>
              <MenuItem value={NotificationCategory.PROMOTION}>
                {t('categories.PROMOTION')}
              </MenuItem>
              <MenuItem value={NotificationCategory.ACCOUNT}>{t('categories.ACCOUNT')}</MenuItem>
              <MenuItem value={NotificationCategory.SYSTEM}>{t('categories.SYSTEM')}</MenuItem>
              <MenuItem value={NotificationCategory.SUPPORT}>{t('categories.SUPPORT')}</MenuItem>
              <MenuItem value={NotificationCategory.PAYMENT}>{t('categories.PAYMENT')}</MenuItem>
              <MenuItem value={NotificationCategory.MARKETING}>
                {t('categories.MARKETING')}
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label={t('filters.campaign')}
            placeholder={t('filters.campaignPlaceholder')}
            value={filters.campaign || ''}
            onChange={(event) => handleFilterChange('campaign', event.target.value)}
            sx={{ minWidth: isMobile ? '100%' : 170 }}
          />

          <TextField
            size="small"
            type="date"
            label={t('filters.startDate')}
            value={filters.startDate || ''}
            onChange={(event) => handleFilterChange('startDate', event.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: isMobile ? '100%' : 150 }}
          />

          <TextField
            size="small"
            type="date"
            label={t('filters.endDate')}
            value={filters.endDate || ''}
            onChange={(event) => handleFilterChange('endDate', event.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: isMobile ? '100%' : 150 }}
          />

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
            fullWidth={isMobile}
          >
            {t('batches.refresh')}
          </Button>
        </Box>
      </Paper>

      <NotificationBatchTable
        batches={batchRows}
        loading={isLoading}
        filters={filters}
        paginationMeta={paginationMeta}
        onPaginationChange={handlePaginationChange}
        onView={handleView}
        onSend={handleSend}
        onDelete={handleDelete}
        isSending={isSendingBatch}
        isDeleting={isDeletingBatch}
      />

      <NotificationViewDialog
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setSelectedBatch(null);
        }}
        notification={selectedBatch}
      />

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

      <ConfirmDialog {...dialogProps} />
    </Box>
  );
};
