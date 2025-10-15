import React from 'react';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { Send, Delete } from '@mui/icons-material';
import { GridColDef } from '@mui/x-data-grid';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import {
  useNotifications,
  useSendNotification,
  useDeleteNotification,
} from '../hooks/useNotifications';
import { formatDate } from '@/shared/utils/formatters';
import type { Notification } from '../types/notification.types';

export const NotificationsListPage: React.FC = () => {
  const { data: notifications = [], isLoading, refetch } = useNotifications({});
  const { mutate: sendNotification } = useSendNotification();
  const { mutate: deleteNotification } = useDeleteNotification();

  const columns: GridColDef[] = [
    { field: 'title', headerName: 'العنوان', width: 250 },
    { field: 'type', headerName: 'النوع', width: 120 },
    { field: 'priority', headerName: 'الأولوية', width: 120 },
    {
      field: 'isSent',
      headerName: 'الحالة',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.isSent ? 'مرسل' : 'قيد الانتظار'}
          color={params.row.isSent ? 'success' : 'warning'}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'تاريخ الإنشاء',
      width: 140,
      valueFormatter: (value) => formatDate(value as Date),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const notif = params.row as Notification;
        return (
          <Box display="flex" gap={0.5}>
            {!notif.isSent && (
              <Tooltip title="إرسال">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    sendNotification(notif._id, { onSuccess: () => refetch() });
                  }}
                >
                  <Send fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="حذف">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('هل تريد حذف التنبيه؟'))
                    deleteNotification(notif._id, { onSuccess: () => refetch() });
                }}
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
        title="إدارة التنبيهات"
        columns={columns}
        rows={notifications}
        loading={isLoading}
        paginationModel={{ page: 0, pageSize: 20 }}
        onPaginationModelChange={() => {}}
        rowCount={notifications.length}
        addButtonText="إضافة تنبيه"
        height="calc(100vh - 200px)"
      />
    </Box>
  );
};
