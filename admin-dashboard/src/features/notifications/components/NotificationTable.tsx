import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { useTranslation } from 'react-i18next';
import { Notification, ListNotificationsParams } from '../types/notification.types';
import { createNotificationColumns } from './NotificationTableColumns';

interface NotificationTableProps {
  notifications: Notification[];
  loading: boolean;
  filters: ListNotificationsParams;
  onPaginationChange: (page: number, pageSize: number) => void;
  onView: (notification: Notification) => void;
  onEdit: (notification: Notification) => void;
  onSend: (notification: Notification) => void;
  onDelete: (notification: Notification) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  isSending?: boolean;
  isDeleting?: boolean;
}

export const NotificationTable: React.FC<NotificationTableProps> = ({
  notifications,
  loading,
  filters,
  onPaginationChange,
  onView,
  onEdit,
  onSend,
  onDelete,
  onSelectionChange,
  isSending = false,
  isDeleting = false,
}) => {
  const theme = useTheme();
  const { isMobile } = useBreakpoint();
  const { t } = useTranslation('notifications');

  const columns = useMemo(
    () =>
      createNotificationColumns({
        onView,
        onEdit,
        onSend,
        onDelete,
        isSending,
        isDeleting,
      }),
    [onView, onEdit, onSend, onDelete, isSending, isDeleting]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: isMobile ? 400 : 600,
        height: isMobile ? 'auto' : 'calc(100vh - 520px)',
        maxHeight: isMobile ? 'none' : 'calc(100vh - 520px)',
        overflow: 'hidden',
      }}
    >
      <DataTable
        title={t('listTitle')}
        columns={columns}
        rows={notifications}
        loading={loading}
        paginationModel={{
          page: (filters.page || 1) - 1,
          pageSize: filters.limit || 20,
        }}
        onPaginationModelChange={(model) => {
          onPaginationChange(model.page + 1, model.pageSize);
        }}
        getRowId={(row) => (row as Notification)._id}
        selectable={!!onSelectionChange}
        onRowSelectionModelChange={onSelectionChange}
        height={isMobile ? 'auto' : 'calc(100vh - 520px)'}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
          '& .MuiPaper-root': {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      />
    </Box>
  );
};

