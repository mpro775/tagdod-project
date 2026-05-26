import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useTranslation } from 'react-i18next';
import { Notification, ListNotificationsParams } from '../types/notification.types';
import { createNotificationBatchColumns } from './NotificationBatchTableColumns';

interface NotificationBatchTableProps {
  batches: Notification[];
  loading: boolean;
  filters: ListNotificationsParams;
  paginationMeta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
  onPaginationChange: (page: number, pageSize: number) => void;
  onView: (notification: Notification) => void;
  onSend: (notification: Notification) => void;
  onDelete: (notification: Notification) => void;
  isSending?: boolean;
  isDeleting?: boolean;
}

export const NotificationBatchTable: React.FC<NotificationBatchTableProps> = ({
  batches,
  loading,
  filters,
  paginationMeta,
  onPaginationChange,
  onView,
  onSend,
  onDelete,
  isSending = false,
  isDeleting = false,
}) => {
  const theme = useTheme();
  const { isMobile } = useBreakpoint();
  const { t } = useTranslation('notifications');

  const columns = useMemo(
    () =>
      createNotificationBatchColumns({
        onView,
        onSend,
        onDelete,
        isSending,
        isDeleting,
        isMobile,
        t,
      }),
    [onView, onSend, onDelete, isSending, isDeleting, isMobile, t]
  );

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <DataTable
        title={t('batches.tableTitle')}
        columns={columns}
        rows={batches}
        loading={loading}
        paginationMode="server"
        rowCount={paginationMeta?.total ?? 0}
        paginationModel={{
          page: Math.max(0, (filters.page || 1) - 1),
          pageSize: filters.limit || 20,
        }}
        onPaginationModelChange={(model) => {
          onPaginationChange(model.page + 1, model.pageSize);
        }}
        getRowId={(row) => (row as Notification).batchId || (row as Notification)._id}
        height={isMobile ? 560 : 680}
        rowHeight={84}
        sx={{
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
          '& .MuiDataGrid-cell': {
            display: 'flex',
            alignItems: 'center',
            py: 1,
          },
        }}
      />
    </Box>
  );
};
