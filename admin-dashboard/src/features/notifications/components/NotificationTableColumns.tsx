import { GridColDef } from '@mui/x-data-grid';
import { Box, Avatar, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { Notification } from '../types/notification.types';
import { formatDate } from '@/shared/utils/formatters';
import { getChannelIcon } from './notificationHelpers';
import { NotificationStatusChip } from './NotificationStatusChip';
import { NotificationChannelChip } from './NotificationChannelChip';
import { NotificationPriorityChip } from './NotificationPriorityChip';
import { NotificationCategoryChip } from './NotificationCategoryChip';
import { NotificationActions } from './NotificationActions';

interface CreateColumnsParams {
  onView: (notification: Notification) => void;
  onEdit: (notification: Notification) => void;
  onSend: (notification: Notification) => void;
  onDelete: (notification: Notification) => void;
  isSending?: boolean;
  isDeleting?: boolean;
}

export const createNotificationColumns = ({
  onView,
  onEdit,
  onSend,
  onDelete,
  isSending = false,
  isDeleting = false,
}: CreateColumnsParams): GridColDef[] => {
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();

  const baseColumns: GridColDef[] = [
    {
      field: 'title',
      headerName: t('columns.title'),
      width: isMobile ? 200 : 250,
      flex: 2,
      renderCell: (params: any) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            {getChannelIcon(params.row.channel)}
          </Avatar>
          <Box>
            <Typography variant="body2" noWrap title={params.value} sx={{ fontWeight: 'medium' }}>
              {params.value || t('placeholders.noTitle')}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.message?.substring(0, 50)}...
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'category',
      headerName: t('columns.type'),
      width: 150,
      flex: 1,
      renderCell: (params: any) => <NotificationCategoryChip category={params.row.category} />,
    },
    {
      field: 'channel',
      headerName: t('columns.channel'),
      width: 120,
      flex: 0.8,
      renderCell: (params: any) => <NotificationChannelChip channel={params.value} />,
    },
    {
      field: 'status',
      headerName: t('columns.status'),
      width: isMobile ? 100 : 140,
      flex: 1,
      renderCell: (params: any) => <NotificationStatusChip status={params.value} />,
    },
    {
      field: 'priority',
      headerName: t('columns.priority'),
      width: 100,
      flex: 0.8,
      renderCell: (params: any) => <NotificationPriorityChip priority={params.value} />,
    },
    {
      field: 'user',
      headerName: t('columns.user'),
      width: isMobile ? 120 : 180,
      flex: 1.2,
      renderCell: (params: any) => {
        const user = params.row.user;
        return user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 24, height: 24, bgcolor: 'secondary.main' }}>
              {user.name?.charAt(0) || user.email?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body2" noWrap>
                {user.name || user.email}
              </Typography>
              {user.email && user.name && (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {user.email}
                </Typography>
              )}
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t('placeholders.notSpecified')}
          </Typography>
        );
      },
    },
    {
      field: 'createdAt',
      headerName: t('columns.createdAt'),
      width: isMobile ? 100 : 140,
      flex: 1,
      valueFormatter: (value: any) => formatDate(value as Date),
    },
    {
      field: 'sentAt',
      headerName: t('columns.sentAt'),
      width: isMobile ? 100 : 140,
      flex: 1,
      valueFormatter: (value: any) => (value ? formatDate(value as Date) : '-'),
    },
    {
      field: 'actions',
      headerName: t('columns.actions'),
      width: isMobile ? 150 : 200,
      sortable: false,
      renderCell: (params) => {
        const notif = params.row as Notification;
        return (
          <NotificationActions
            notification={notif}
            onView={onView}
            onEdit={onEdit}
            onSend={onSend}
            onDelete={onDelete}
            isSending={isSending}
            isDeleting={isDeleting}
          />
        );
      },
    },
  ];

  // Return mobile or full columns based on screen size
  if (isMobile) {
    return [baseColumns[0], baseColumns[3], baseColumns[8]]; // title, status, actions
  }

  return baseColumns;
};
