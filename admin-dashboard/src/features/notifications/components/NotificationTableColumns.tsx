import { GridColDef } from '@mui/x-data-grid';
import { Box, Avatar, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
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
  isMobile: boolean;
  t: (key: string, options?: any) => string;
}

export const createNotificationColumns = ({
  onView,
  onEdit,
  onSend,
  onDelete,
  isSending = false,
  isDeleting = false,
  isMobile,
  t,
}: CreateColumnsParams): GridColDef[] => {

  const baseColumns: GridColDef[] = [
    {
      field: 'title',
      headerName: t('columns.title'),
      minWidth: isMobile ? 200 : 250,
      flex: 2,
      renderCell: (params: any) => (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: 1.5, 
            width: '100%', 
            height: '100%',
            py: 1,
            overflow: 'hidden' 
          }}
        >
          <Avatar 
            sx={{ 
              width: 32, 
              height: 32, 
              bgcolor: 'primary.main', 
              flexShrink: 0,
              mt: 0.5
            }}
          >
            {getChannelIcon(params.row.channel)}
          </Avatar>
          <Box 
            sx={{ 
              minWidth: 0, 
              flex: 1, 
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              justifyContent: 'center'
            }}
          >
            <Typography 
              variant="body2" 
              noWrap 
              title={params.value} 
              sx={{ 
                fontWeight: 'medium',
                lineHeight: 1.4,
                fontSize: '0.875rem'
              }}
            >
              {params.value || t('placeholders.noTitle')}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              noWrap
              sx={{
                lineHeight: 1.3,
                fontSize: '0.75rem'
              }}
            >
              {params.row.message?.substring(0, 50)}...
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'category',
      headerName: t('columns.type'),
      minWidth: 120,
      flex: 1,
      renderCell: (params: any) => <NotificationCategoryChip category={params.row.category} />,
    },
    {
      field: 'channel',
      headerName: t('columns.channel'),
      minWidth: 100,
      flex: 0.8,
      renderCell: (params: any) => <NotificationChannelChip channel={params.value} />,
    },
    {
      field: 'status',
      headerName: t('columns.status'),
      minWidth: isMobile ? 100 : 120,
      flex: 1,
      renderCell: (params: any) => <NotificationStatusChip status={params.value} />,
    },
    {
      field: 'priority',
      headerName: t('columns.priority'),
      minWidth: 90,
      flex: 0.8,
      renderCell: (params: any) => <NotificationPriorityChip priority={params.value} />,
    },
    {
      field: 'user',
      headerName: t('columns.user'),
      minWidth: isMobile ? 120 : 150,
      flex: 1.2,
      renderCell: (params: any) => {
        const user = params.row.user;
        return user ? (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: 1, 
              width: '100%', 
              height: '100%',
              py: 1,
              overflow: 'hidden' 
            }}
          >
            <Avatar 
              sx={{ 
                width: 24, 
                height: 24, 
                bgcolor: 'secondary.main', 
                flexShrink: 0,
                mt: 0.5
              }}
            >
              {user.name?.charAt(0) || user.email?.charAt(0)}
            </Avatar>
            <Box 
              sx={{ 
                minWidth: 0, 
                flex: 1, 
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.25,
                justifyContent: 'center'
              }}
            >
              <Typography 
                variant="body2" 
                noWrap
                sx={{
                  lineHeight: 1.4,
                  fontSize: '0.875rem'
                }}
              >
                {user.name || user.email}
              </Typography>
              {user.email && user.name && (
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  noWrap
                  sx={{
                    lineHeight: 1.3,
                    fontSize: '0.75rem'
                  }}
                >
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
      minWidth: isMobile ? 100 : 130,
      flex: 1,
      valueFormatter: (value: any) => formatDate(value as Date),
    },
    {
      field: 'sentAt',
      headerName: t('columns.sentAt'),
      minWidth: isMobile ? 100 : 130,
      flex: 1,
      valueFormatter: (value: any) => (value ? formatDate(value as Date) : '-'),
    },
    {
      field: 'actions',
      headerName: t('columns.actions'),
      minWidth: isMobile ? 150 : 180,
      maxWidth: isMobile ? 200 : 220,
      flex: 0,
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
