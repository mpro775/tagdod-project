import { GridColDef } from '@mui/x-data-grid';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { ContentCopy, Delete, Send, Visibility } from '@mui/icons-material';
import { Notification } from '../types/notification.types';
import { formatDate } from '@/shared/utils/formatters';
import { NotificationChannelChip } from './NotificationChannelChip';
import { NotificationStatusChip } from './NotificationStatusChip';

interface CreateBatchColumnsParams {
  onView: (notification: Notification) => void;
  onSend: (notification: Notification) => void;
  onDelete: (notification: Notification) => void;
  isSending?: boolean;
  isDeleting?: boolean;
  isMobile: boolean;
  t: (key: string, options?: any) => string;
}

const getShortBatchId = (batchId: string) => {
  if (batchId.length <= 22) return batchId;
  return `${batchId.slice(0, 12)}...${batchId.slice(-6)}`;
};

export const createNotificationBatchColumns = ({
  onView,
  onSend,
  onDelete,
  isSending = false,
  isDeleting = false,
  isMobile,
  t,
}: CreateBatchColumnsParams): GridColDef[] => {
  const columns: GridColDef[] = [
    {
      field: 'campaign',
      headerName: t('batches.campaign'),
      minWidth: 240,
      flex: 1.6,
      sortable: false,
      renderCell: (params) => {
        const row = params.row as Notification;
        const campaign = row.metadata?.campaign || t('batches.unnamedCampaign');
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap title={campaign}>
              {campaign}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap title={row.title}>
              {row.title || t('placeholders.noTitle')}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'batchId',
      headerName: t('batches.batchId'),
      minWidth: 230,
      flex: 1.2,
      sortable: false,
      renderCell: (params) => {
        const batchId = (params.row as Notification).batchId || '';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
            <Typography
              variant="body2"
              title={batchId}
              sx={{ fontFamily: 'monospace', minWidth: 0 }}
              noWrap
            >
              {batchId ? getShortBatchId(batchId) : '-'}
            </Typography>
            {batchId && (
              <Tooltip title={t('batches.copyBatchId')}>
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    navigator.clipboard?.writeText(batchId);
                  }}
                  aria-label={t('batches.copyBatchId')}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
    {
      field: 'channel',
      headerName: t('columns.channel'),
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => <NotificationChannelChip channel={params.row.channel} />,
    },
    {
      field: 'recipientCount',
      headerName: t('batches.recipients'),
      minWidth: 110,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (_value, row) => (row as Notification).recipientCount ?? 0,
    },
    {
      field: 'sentCount',
      headerName: t('batches.sent'),
      minWidth: 90,
      flex: 0.6,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (_value, row) => (row as Notification).sentCount ?? 0,
    },
    {
      field: 'failedCount',
      headerName: t('batches.failed'),
      minWidth: 90,
      flex: 0.6,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (_value, row) => (row as Notification).failedCount ?? 0,
    },
    {
      field: 'pendingCount',
      headerName: t('batches.pending'),
      minWidth: 130,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (_value, row) => (row as Notification).pendingCount ?? 0,
    },
    {
      field: 'status',
      headerName: t('columns.status'),
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => <NotificationStatusChip status={params.row.status} />,
    },
    {
      field: 'createdAt',
      headerName: t('columns.createdAt'),
      minWidth: 140,
      flex: 0.9,
      valueFormatter: (value) => (value ? formatDate(value as Date) : '-'),
    },
    {
      field: 'actions',
      headerName: t('columns.actions'),
      minWidth: 150,
      maxWidth: 180,
      flex: 0,
      sortable: false,
      renderCell: (params) => {
        const row = params.row as Notification;
        return (
          <Box display="flex" gap={0.5}>
            <Tooltip title={t('batches.viewDetails')}>
              <IconButton
                size="small"
                color="info"
                onClick={(event) => {
                  event.stopPropagation();
                  onView(row);
                }}
                aria-label={t('batches.viewDetails')}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('batches.resend')}>
              <IconButton
                size="small"
                color="success"
                onClick={(event) => {
                  event.stopPropagation();
                  onSend(row);
                }}
                disabled={isSending}
                aria-label={t('batches.resend')}
              >
                <Send fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('batches.delete')}>
              <IconButton
                size="small"
                color="error"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(row);
                }}
                disabled={isDeleting}
                aria-label={t('batches.delete')}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  if (isMobile) {
    return [columns[0], columns[7], columns[9]];
  }

  return columns;
};
