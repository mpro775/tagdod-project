import React, { useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  Stack,
  Skeleton,
  Snackbar,
  Alert as MuiAlert,
  Divider,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Paper,
  useTheme,
  Checkbox,
  ListItemText,
  OutlinedInput,
  ListSubheader,
} from '@mui/material';
import {
  Send,
  Delete,
  Edit,
  Visibility,
  Add,
  Search,
  Refresh,
  Schedule,
  Error,
  CheckCircle,
  Pending,
  Cancel,
  Analytics,
  Notifications,
  Email,
  Sms,
  PhoneAndroid,
  Dashboard,
  TrendingUp,
  Info,
  ExpandMore,
} from '@mui/icons-material';
import { GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/components/DataTable/DataTable';
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
import { useUsers } from '@/features/users/hooks/useUsers';
import { UserRole, UserStatus } from '@/features/users/types/user.types';
import { formatDate } from '@/shared/utils/formatters';
import type {
  Notification,
  CreateNotificationDto,
  UpdateNotificationDto,
  ListNotificationsParams,
  BulkSendNotificationDto,
  NotificationTemplate,
} from '../types/notification.types';
import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
  NotificationPriority,
  NotificationCategory,
} from '../types/notification.types';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';

export const NotificationsListPage: React.FC = () => {
  const theme = useTheme();
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

  const getStatusColor = (status: NotificationStatus) => {
    switch (status) {
      case NotificationStatus.SENT:
        return 'success';
      case NotificationStatus.DELIVERED:
        return 'success';
      case NotificationStatus.READ:
        return 'info';
      case NotificationStatus.CLICKED:
        return 'primary';
      case NotificationStatus.FAILED:
        return 'error';
      case NotificationStatus.BOUNCED:
        return 'error';
      case NotificationStatus.REJECTED:
        return 'error';
      case NotificationStatus.CANCELLED:
        return 'default';
      case NotificationStatus.PENDING:
        return 'warning';
      case NotificationStatus.QUEUED:
        return 'warning';
      case NotificationStatus.SENDING:
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: NotificationStatus) => {
    switch (status) {
      case NotificationStatus.SENT:
        return t('statuses.sent');
      case NotificationStatus.DELIVERED:
        return t('statuses.delivered');
      case NotificationStatus.READ:
        return t('statuses.read');
      case NotificationStatus.CLICKED:
        return t('statuses.clicked');
      case NotificationStatus.FAILED:
        return t('statuses.failed');
      case NotificationStatus.BOUNCED:
        return t('statuses.bounced');
      case NotificationStatus.REJECTED:
        return t('statuses.rejected');
      case NotificationStatus.CANCELLED:
        return t('statuses.cancelled');
      case NotificationStatus.PENDING:
        return t('statuses.pending');
      case NotificationStatus.QUEUED:
        return t('statuses.queued');
      case NotificationStatus.SENDING:
        return t('statuses.sending');
      default:
        return status;
    }
  };

  const getStatusIcon = (status: NotificationStatus) => {
    switch (status) {
      case NotificationStatus.SENT:
      case NotificationStatus.DELIVERED:
        return <CheckCircle />;
      case NotificationStatus.READ:
      case NotificationStatus.CLICKED:
        return <CheckCircle />;
      case NotificationStatus.FAILED:
      case NotificationStatus.BOUNCED:
      case NotificationStatus.REJECTED:
        return <Error />;
      case NotificationStatus.CANCELLED:
        return <Cancel />;
      case NotificationStatus.PENDING:
      case NotificationStatus.QUEUED:
        return <Pending />;
      case NotificationStatus.SENDING:
        return <Schedule />;
      default:
        return <Info />;
    }
  };

  const getChannelLabel = (channel: NotificationChannel) => {
    switch (channel) {
      case NotificationChannel.IN_APP:
        return t('channels.IN_APP');
      case NotificationChannel.PUSH:
        return t('channels.PUSH');
      case NotificationChannel.SMS:
        return t('channels.SMS');
      case NotificationChannel.EMAIL:
        return t('channels.EMAIL');
      case NotificationChannel.DASHBOARD:
        return t('channels.DASHBOARD');
      default:
        return channel;
    }
  };

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case NotificationChannel.IN_APP:
        return <Notifications />;
      case NotificationChannel.PUSH:
        return <PhoneAndroid />;
      case NotificationChannel.SMS:
        return <Sms />;
      case NotificationChannel.EMAIL:
        return <Email />;
      case NotificationChannel.DASHBOARD:
        return <Dashboard />;
      default:
        return <Notifications />;
    }
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return 'error';
      case NotificationPriority.HIGH:
        return 'warning';
      case NotificationPriority.MEDIUM:
        return 'info';
      case NotificationPriority.LOW:
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityLabel = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.URGENT:
        return t('priorities.urgent');
      case NotificationPriority.HIGH:
        return t('priorities.high');
      case NotificationPriority.MEDIUM:
        return t('priorities.medium');
      case NotificationPriority.LOW:
        return t('priorities.low');
      default:
        return priority;
    }
  };

  const getCategoryLabel = (category: NotificationCategory) => {
    switch (category) {
      case NotificationCategory.ORDER:
        return t('categories.ORDER');
      case NotificationCategory.PRODUCT:
        return t('categories.PRODUCT');
      case NotificationCategory.SERVICE:
        return t('categories.SERVICE');
      case NotificationCategory.PROMOTION:
        return t('categories.PROMOTION');
      case NotificationCategory.ACCOUNT:
        return t('categories.ACCOUNT');
      case NotificationCategory.SYSTEM:
        return t('categories.SYSTEM');
      case NotificationCategory.SUPPORT:
        return t('categories.SUPPORT');
      case NotificationCategory.PAYMENT:
        return t('categories.PAYMENT');
      case NotificationCategory.MARKETING:
        return t('categories.MARKETING');
      default:
        return category;
    }
  };

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
      field: 'type',
      headerName: t('columns.type'),
      width: 150,
      flex: 1,
      renderCell: (params: any) => (
        <Chip
          label={getCategoryLabel(params.row.category)}
          size="small"
          variant="outlined"
          color="primary"
        />
      ),
    },
    {
      field: 'channel',
      headerName: t('columns.channel'),
      width: 120,
      flex: 0.8,
      renderCell: (params: any) => (
        <Chip
          label={getChannelLabel(params.value)}
          size="small"
          variant="outlined"
          icon={getChannelIcon(params.value)}
        />
      ),
    },
    {
      field: 'status',
      headerName: t('columns.status'),
      width: isMobile ? 100 : 140,
      flex: 1,
      renderCell: (params: any) => (
        <Chip
          label={getStatusLabel(params.value)}
          color={getStatusColor(params.value) as any}
          size="small"
          icon={getStatusIcon(params.value)}
        />
      ),
    },
    {
      field: 'priority',
      headerName: t('columns.priority'),
      width: 100,
      flex: 0.8,
      renderCell: (params: any) => (
        <Chip
          label={getPriorityLabel(params.value)}
          color={getPriorityColor(params.value) as any}
          size="small"
          variant="outlined"
        />
      ),
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
        const canSend =
          notif.status === NotificationStatus.QUEUED || notif.status === NotificationStatus.PENDING;
        const canEdit =
          notif.status === NotificationStatus.PENDING || notif.status === NotificationStatus.QUEUED;

        return (
          <Box display="flex" gap={0.5}>
            <Tooltip title={t('actions.viewDetails')}>
              <IconButton
                size="small"
                color="info"
                onClick={(e) => {
                  e.stopPropagation();
                  handleView(notif);
                }}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>

            {canEdit && (
              <Tooltip title={t('actions.edit')}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(notif);
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {canSend && (
              <Tooltip title={t('actions.send')}>
                <IconButton
                  size="small"
                  color="success"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSend(notif);
                  }}
                  disabled={isSending}
                >
                  <Send fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title={t('actions.delete')}>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(notif);
                }}
                disabled={isDeleting}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  const columns: GridColDef[] = React.useMemo(() => {
    if (isMobile) {
      return [baseColumns[0], baseColumns[3], baseColumns[8]];
    }
    return baseColumns;
  }, [isMobile, baseColumns]);

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
      {statsLoading ? (
        <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mb: isMobile ? 2 : 3 }}>
          {[...Array(6)].map((_, index) => (
            <Grid key={index} size={{ xs: 6, sm: 4, md: 2 }}>
              <Card
                sx={{
                  bgcolor:
                    theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
                }}
              >
                <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                  <Skeleton variant="text" height={isMobile ? 30 : 40} />
                  <Skeleton variant="text" height={isMobile ? 16 : 20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        stats && (
          <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mb: isMobile ? 2 : 3 }}>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Notifications
                      sx={{
                        mr: 1,
                        fontSize: isMobile ? '1.25rem' : '1.5rem',
                        color: theme.palette.primary.main,
                      }}
                    />
                    <Typography
                      variant={isMobile ? 'body1' : 'h6'}
                      sx={{ fontWeight: 600, fontSize: isMobile ? '1rem' : undefined }}
                    >
                      {stats.total || 0}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                  >
                    {t('stats.total')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircle
                      sx={{
                        mr: 1,
                        fontSize: isMobile ? '1.25rem' : '1.5rem',
                        color: theme.palette.success.main,
                      }}
                    />
                    <Typography
                      variant={isMobile ? 'body1' : 'h6'}
                      sx={{ fontWeight: 600, fontSize: isMobile ? '1rem' : undefined }}
                    >
                      {stats.byStatus?.sent || 0}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                  >
                    {t('stats.sent')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Pending
                      sx={{
                        mr: 1,
                        fontSize: isMobile ? '1.25rem' : '1.5rem',
                        color: theme.palette.warning.main,
                      }}
                    />
                    <Typography
                      variant={isMobile ? 'body1' : 'h6'}
                      sx={{ fontWeight: 600, fontSize: isMobile ? '1rem' : undefined }}
                    >
                      {stats.byStatus?.queued || 0}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                  >
                    {t('stats.queued')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Error
                      sx={{
                        mr: 1,
                        fontSize: isMobile ? '1.25rem' : '1.5rem',
                        color: theme.palette.error.main,
                      }}
                    />
                    <Typography
                      variant={isMobile ? 'body1' : 'h6'}
                      sx={{ fontWeight: 600, fontSize: isMobile ? '1rem' : undefined }}
                    >
                      {stats.byStatus?.failed || 0}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                  >
                    {t('stats.failed')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircle
                      sx={{
                        mr: 1,
                        fontSize: isMobile ? '1.25rem' : '1.5rem',
                        color: theme.palette.info.main,
                      }}
                    />
                    <Typography
                      variant={isMobile ? 'body1' : 'h6'}
                      sx={{ fontWeight: 600, fontSize: isMobile ? '1rem' : undefined }}
                    >
                      {stats.byStatus?.read || 0}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                  >
                    {t('stats.read')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUp
                      sx={{
                        mr: 1,
                        fontSize: isMobile ? '1.25rem' : '1.5rem',
                        color: theme.palette.secondary.main,
                      }}
                    />
                    <Typography
                      variant={isMobile ? 'body1' : 'h6'}
                      sx={{ fontWeight: 600, fontSize: isMobile ? '1rem' : undefined }}
                    >
                      {stats.unreadCount || 0}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                  >
                    {t('stats.unread')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )
      )}

      {/* Filters and Actions */}
      <Paper
        sx={{
          p: isMobile ? 1.5 : 2,
          mb: isMobile ? 1.5 : 2,
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: isMobile ? 1.5 : 2,
            flexWrap: 'wrap',
            alignItems: 'center',
            mb: isMobile ? 1.5 : 2,
          }}
        >
          <TextField
            size="small"
            placeholder={t('filters.search')}
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ minWidth: isMobile ? '100%' : 250, flex: isMobile ? '1 1 100%' : undefined }}
          />

          <FormControl
            size="small"
            sx={{ minWidth: isMobile ? '100%' : 150, flex: isMobile ? '1 1 100%' : undefined }}
          >
            <InputLabel>{t('filters.channel')}</InputLabel>
            <Select
              value={filters.channel || ''}
              onChange={(e) => handleFilterChange('channel', e.target.value || undefined)}
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

          <FormControl
            size="small"
            sx={{ minWidth: isMobile ? '100%' : 150, flex: isMobile ? '1 1 100%' : undefined }}
          >
            <InputLabel>{t('filters.status')}</InputLabel>
            <Select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              label={t('filters.status')}
            >
              <MenuItem value="">{t('filters.all')}</MenuItem>
              <MenuItem value={NotificationStatus.SENT}>{t('statuses.sent')}</MenuItem>
              <MenuItem value={NotificationStatus.DELIVERED}>{t('statuses.delivered')}</MenuItem>
              <MenuItem value={NotificationStatus.READ}>{t('statuses.read')}</MenuItem>
              <MenuItem value={NotificationStatus.CLICKED}>{t('statuses.clicked')}</MenuItem>
              <MenuItem value={NotificationStatus.FAILED}>{t('statuses.failed')}</MenuItem>
              <MenuItem value={NotificationStatus.QUEUED}>{t('statuses.queued')}</MenuItem>
              <MenuItem value={NotificationStatus.PENDING}>{t('statuses.pending')}</MenuItem>
              <MenuItem value={NotificationStatus.CANCELLED}>{t('statuses.cancelled')}</MenuItem>
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{ minWidth: isMobile ? '100%' : 150, flex: isMobile ? '1 1 100%' : undefined }}
          >
            <InputLabel>{t('filters.category')}</InputLabel>
            <Select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
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

          <FormControl
            size="small"
            sx={{ minWidth: isMobile ? '100%' : 150, flex: isMobile ? '1 1 100%' : undefined }}
          >
            <InputLabel>{t('filters.priority')}</InputLabel>
            <Select
              value={filters.priority || ''}
              onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
              label={t('filters.priority')}
            >
              <MenuItem value="">{t('filters.all')}</MenuItem>
              <MenuItem value={NotificationPriority.URGENT}>{t('priorities.urgent')}</MenuItem>
              <MenuItem value={NotificationPriority.HIGH}>{t('priorities.high')}</MenuItem>
              <MenuItem value={NotificationPriority.MEDIUM}>{t('priorities.medium')}</MenuItem>
              <MenuItem value={NotificationPriority.LOW}>{t('priorities.low')}</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
            disabled={isCreating}
            size={isMobile ? 'small' : 'medium'}
            fullWidth={isMobile}
          >
            {t('actions.add')}
          </Button>

          <Button
            variant="outlined"
            startIcon={<Send />}
            onClick={() => setBulkSendDialogOpen(true)}
            disabled={isBulkSending}
            size={isMobile ? 'small' : 'medium'}
            fullWidth={isMobile}
          >
            {t('actions.bulkSend')}
          </Button>

          <Button
            variant="outlined"
            startIcon={<Analytics />}
            onClick={() => setTestDialogOpen(true)}
            disabled={isTesting}
            size={isMobile ? 'small' : 'medium'}
            fullWidth={isMobile}
          >
            {t('actions.testTemplate')}
          </Button>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
            size={isMobile ? 'small' : 'medium'}
            fullWidth={isMobile}
          >
            {t('actions.refresh')}
          </Button>

          {selectedNotifications.length > 0 && (
            <>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ display: isMobile ? 'none' : 'block' }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.8rem' : undefined }}
              >
                {selectedNotifications.length} {t('actions.selected')}
              </Typography>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleBulkDelete}
                disabled={isDeleting}
                size={isMobile ? 'small' : 'medium'}
                fullWidth={isMobile}
              >
                {t('actions.bulkDelete')}
              </Button>
            </>
          )}
        </Box>
      </Paper>

      {/* Data Table */}
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
          loading={isLoading}
          paginationModel={{ page: (filters.page || 1) - 1, pageSize: filters.limit || 20 }}
          onPaginationModelChange={(model) => {
            setFilters((prev) => ({
              ...prev,
              page: model.page + 1,
              limit: model.pageSize,
            }));
          }}
          getRowId={(row) => (row as Notification)._id}
          selectable
          onRowSelectionModelChange={(newSelection) => {
            setSelectedNotifications(newSelection as string[]);
          }}
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
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
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
          <Visibility />
          {t('dialogs.viewTitle')}
        </DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Stack spacing={3}>
              {/* Header Info */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                  {getChannelIcon(selectedNotification.channel)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {selectedNotification.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip
                      label={getChannelLabel(selectedNotification.channel)}
                      size="small"
                      icon={getChannelIcon(selectedNotification.channel)}
                    />
                    <Chip
                      label={getStatusLabel(selectedNotification.status)}
                      color={getStatusColor(selectedNotification.status) as any}
                      size="small"
                      icon={getStatusIcon(selectedNotification.status)}
                    />
                    <Chip
                      label={getPriorityLabel(selectedNotification.priority)}
                      color={getPriorityColor(selectedNotification.priority) as any}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={getCategoryLabel(selectedNotification.category)}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </Box>
                </Box>
              </Box>

              <Divider />

              {/* Content */}
              <Box>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ fontWeight: 'medium', fontSize: isMobile ? '0.875rem' : undefined }}
                >
                  {t('dialogs.content')}
                </Typography>
                <Paper
                  sx={{
                    p: isMobile ? 1.5 : 2,
                    bgcolor:
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{ whiteSpace: 'pre-wrap', fontSize: isMobile ? '0.875rem' : undefined }}
                  >
                    {selectedNotification.message}
                  </Typography>
                </Paper>
              </Box>

              {/* User Info */}
              {selectedNotification.user && (
                <Box>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ fontWeight: 'medium', fontSize: isMobile ? '0.875rem' : undefined }}
                  >
                    {t('dialogs.user')}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? 1 : 2,
                      p: isMobile ? 1.5 : 2,
                      bgcolor:
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                      borderRadius: 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 'secondary.main',
                        width: isMobile ? 40 : 56,
                        height: isMobile ? 40 : 56,
                      }}
                    >
                      {selectedNotification.user.name?.charAt(0) ||
                        selectedNotification.user.email?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 'medium', fontSize: isMobile ? '0.875rem' : undefined }}
                      >
                        {selectedNotification.user.name || selectedNotification.user.email}
                      </Typography>
                      {selectedNotification.user.email && selectedNotification.user.name && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                        >
                          {selectedNotification.user.email}
                        </Typography>
                      )}
                      {selectedNotification.user.phone && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                        >
                          {selectedNotification.user.phone}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Timestamps */}
              <Box>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ fontWeight: 'medium', fontSize: isMobile ? '0.875rem' : undefined }}
                >
                  {t('dialogs.dates')}
                </Typography>
                <Grid container spacing={isMobile ? 1.5 : 2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box
                      sx={{
                        p: isMobile ? 1.5 : 2,
                        bgcolor:
                          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                      >
                        {t('dialogs.createdAt')}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontSize: isMobile ? '0.875rem' : undefined }}
                      >
                        {formatDate(selectedNotification.createdAt)}
                      </Typography>
                    </Box>
                  </Grid>
                  {selectedNotification.sentAt && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          p: isMobile ? 1.5 : 2,
                          bgcolor:
                            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                        >
                          {t('dialogs.sentAt')}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontSize: isMobile ? '0.875rem' : undefined }}
                        >
                          {formatDate(selectedNotification.sentAt)}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {selectedNotification.readAt && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          p: isMobile ? 1.5 : 2,
                          bgcolor:
                            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                        >
                          {t('dialogs.readAt')}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontSize: isMobile ? '0.875rem' : undefined }}
                        >
                          {formatDate(selectedNotification.readAt)}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>

              {/* Action URL */}
              {selectedNotification.actionUrl && (
                <Box>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ fontWeight: 'medium', fontSize: isMobile ? '0.875rem' : undefined }}
                  >
                    {t('dialogs.actionUrl')}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      wordBreak: 'break-all',
                      bgcolor:
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                      p: 1,
                      borderRadius: 1,
                      fontSize: isMobile ? '0.75rem' : undefined,
                    }}
                  >
                    {selectedNotification.actionUrl}
                  </Typography>
                </Box>
              )}

              {/* Error Information */}
              {selectedNotification.errorMessage && (
                <Alert severity="error" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('fields.errorMessage')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                    {selectedNotification.errorMessage}
                  </Typography>
                  {selectedNotification.errorCode && (
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ mt: 1, fontSize: isMobile ? '0.7rem' : undefined }}
                    >
                      {t('fields.errorCode')} {selectedNotification.errorCode}
                    </Typography>
                  )}
                </Alert>
              )}

              {/* Metadata */}
              {selectedNotification.metadata &&
                Object.keys(selectedNotification.metadata).length > 0 && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontSize: isMobile ? '0.875rem' : undefined }}
                      >
                        {t('dialogs.errorInfo')}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <pre
                        style={{
                          background:
                            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
                          padding: isMobile ? '8px' : '12px',
                          borderRadius: '4px',
                          overflow: 'auto',
                          fontSize: isMobile ? '10px' : '12px',
                          fontFamily: 'monospace',
                          color: theme.palette.text.primary,
                        }}
                      >
                        {JSON.stringify(selectedNotification.metadata, null, 2)}
                      </pre>
                    </AccordionDetails>
                  </Accordion>
                )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: isMobile ? 2 : 3, pb: isMobile ? 2 : 3 }}>
          <Button onClick={() => setViewDialogOpen(false)} size={isMobile ? 'small' : 'medium'}>
            {t('dialogs.close')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
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
              onCancel={() => setEditDialogOpen(false)}
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
            templates={templates || []}
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

// Edit Form Component
const NotificationEditForm: React.FC<{
  notification: Notification;
  onSave: (data: UpdateNotificationDto) => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ notification, onSave, onCancel, isLoading }) => {
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();
  const [formData, setFormData] = useState({
    title: notification.title || '',
    message: notification.message || '',
    messageEn: notification.messageEn || '',
    actionUrl: notification.actionUrl || '',
    priority: notification.priority || NotificationPriority.MEDIUM,
    status: notification.status,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Stack spacing={3}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('forms.title')}
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
              disabled={isLoading}
              size={isMobile ? 'small' : 'medium'}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>{t('forms.priority')}</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: e.target.value as NotificationPriority,
                  }))
                }
                label={t('forms.priority')}
                disabled={isLoading}
                size={isMobile ? 'small' : 'medium'}
              >
                <MenuItem value={NotificationPriority.LOW}>{t('priorities.low')}</MenuItem>
                <MenuItem value={NotificationPriority.MEDIUM}>{t('priorities.medium')}</MenuItem>
                <MenuItem value={NotificationPriority.HIGH}>{t('priorities.high')}</MenuItem>
                <MenuItem value={NotificationPriority.URGENT}>{t('priorities.urgent')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TextField
          fullWidth
          label={t('forms.message')}
          value={formData.message}
          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
          multiline
          rows={isMobile ? 3 : 4}
          required
          disabled={isLoading}
          size={isMobile ? 'small' : 'medium'}
        />

        <TextField
          fullWidth
          label={t('forms.messageEn')}
          value={formData.messageEn}
          onChange={(e) => setFormData((prev) => ({ ...prev, messageEn: e.target.value }))}
          multiline
          rows={isMobile ? 3 : 4}
          disabled={isLoading}
          size={isMobile ? 'small' : 'medium'}
        />

        <TextField
          fullWidth
          label={t('forms.actionUrl')}
          value={formData.actionUrl}
          onChange={(e) => setFormData((prev) => ({ ...prev, actionUrl: e.target.value }))}
          disabled={isLoading}
          size={isMobile ? 'small' : 'medium'}
        />

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            justifyContent: 'flex-end',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
          }}
        >
          <Button
            onClick={onCancel}
            disabled={isLoading}
            size={isMobile ? 'small' : 'medium'}
            fullWidth={isMobile}
          >
            {t('templates.actions.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            size={isMobile ? 'small' : 'medium'}
            fullWidth={isMobile}
          >
            {isLoading ? t('forms.saving') : t('forms.save')}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

// Create Form Component
const NotificationCreateForm: React.FC<{
  templates: NotificationTemplate[];
  onSave: (data: CreateNotificationDto) => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ templates, onSave, onCancel, isLoading }) => {
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();

  // State for user search
  const [userSearch, setUserSearch] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState<UserRole | ''>('');

  // Fetch users with search and role filter (max limit is 100)
  const { data: usersData, isLoading: usersLoading } = useUsers({
    search: userSearch || undefined,
    role: selectedRole || undefined,
    limit: 100, // Maximum allowed by API
    page: 1,
    status: UserStatus.ACTIVE, // Only active users
  });

  const allUsers = usersData?.data || [];
  const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>([]);

  // Group users by role for better display
  const usersByRole = React.useMemo(() => {
    const grouped: Record<string, typeof allUsers> = {
      [UserRole.USER]: [],
      [UserRole.MERCHANT]: [],
      [UserRole.ENGINEER]: [],
      [UserRole.ADMIN]: [],
      [UserRole.SUPER_ADMIN]: [],
    };

    allUsers.forEach((user) => {
      user.roles?.forEach((role) => {
        if (grouped[role]) {
          grouped[role].push(user);
        }
      });
      // If user has no roles, add to USER group
      if (!user.roles || user.roles.length === 0) {
        grouped[UserRole.USER].push(user);
      }
    });

    return grouped;
  }, [allUsers]);

  // Get role label
  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.USER:
        return t('forms.roleUser', 'مستخدم');
      case UserRole.MERCHANT:
        return t('forms.roleMerchant', 'تاجر');
      case UserRole.ENGINEER:
        return t('forms.roleEngineer', 'مهندس');
      case UserRole.ADMIN:
        return t('forms.roleAdmin', 'مدير');
      case UserRole.SUPER_ADMIN:
        return t('forms.roleSuperAdmin', 'مدير عام');
      default:
        return role;
    }
  };
  const getCategoryLabel = (category: NotificationCategory) => {
    switch (category) {
      case NotificationCategory.ORDER:
        return t('categories.ORDER');
      case NotificationCategory.PRODUCT:
        return t('categories.PRODUCT');
      case NotificationCategory.SERVICE:
        return t('categories.SERVICE');
      case NotificationCategory.PROMOTION:
        return t('categories.PROMOTION');
      case NotificationCategory.ACCOUNT:
        return t('categories.ACCOUNT');
      case NotificationCategory.SYSTEM:
        return t('categories.SYSTEM');
      case NotificationCategory.SUPPORT:
        return t('categories.SUPPORT');
      case NotificationCategory.PAYMENT:
        return t('categories.PAYMENT');
      case NotificationCategory.MARKETING:
        return t('categories.MARKETING');
      default:
        return category;
    }
  };
  const [formData, setFormData] = useState({
    type: NotificationType.ORDER_CONFIRMED,
    title: '',
    message: '',
    messageEn: '',
    channel: NotificationChannel.IN_APP,
    priority: NotificationPriority.MEDIUM,
    category: NotificationCategory.ORDER,
    templateKey: '',
    recipientId: '',
    recipientEmail: '',
    recipientPhone: '',
    actionUrl: '',
    data: {} as Record<string, unknown>,
  });

  // Handle user selection
  const handleUserChange = (event: any) => {
    const value = event.target.value;
    // If "all" is selected, select all users
    if (value.includes('all') && value.length === 1) {
      const allUserIds = allUsers.map((u) => u._id);
      setSelectedUserIds(allUserIds);
      setFormData((prev) => ({ ...prev, recipientId: allUserIds.join(',') }));
    } else {
      // Remove "all" from selection if other items are selected
      const filteredValue = value.filter((v: string) => v !== 'all');
      setSelectedUserIds(filteredValue);
      setFormData((prev) => ({ ...prev, recipientId: filteredValue.join(',') }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleTemplateChange = (templateKey: string) => {
    const template = templates.find((t) => t.key === templateKey);
    if (template) {
      setFormData((prev) => ({
        ...prev,
        templateKey,
        title: template.title,
        message: template.message,
        messageEn: template.messageEn,
        category: template.category,
      }));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Stack spacing={3}>
        {/* Template Selection */}
        {templates.length > 0 && (
          <FormControl fullWidth>
            <InputLabel>{t('forms.template')}</InputLabel>
            <Select
              value={formData.templateKey}
              onChange={(e) => handleTemplateChange(e.target.value)}
              label={t('forms.template')}
              disabled={isLoading}
              size={isMobile ? 'small' : 'medium'}
            >
              <MenuItem value="">{t('forms.noTemplate')}</MenuItem>
              {templates.map((template) => (
                <MenuItem key={template.key} value={template.key}>
                  {template.name} - {template.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>{t('forms.type')}</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value as NotificationType }))
                }
                label={t('forms.type')}
                disabled={isLoading}
                size={isMobile ? 'small' : 'medium'}
              >
                {Object.values(NotificationType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>{t('forms.channel')}</InputLabel>
              <Select
                value={formData.channel}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    channel: e.target.value as NotificationChannel,
                  }))
                }
                label={t('forms.channel')}
                disabled={isLoading}
                size={isMobile ? 'small' : 'medium'}
              >
                <MenuItem value={NotificationChannel.IN_APP}>{t('channels.IN_APP')}</MenuItem>
                <MenuItem value={NotificationChannel.PUSH}>{t('channels.PUSH')}</MenuItem>
                <MenuItem value={NotificationChannel.SMS}>{t('channels.SMS')}</MenuItem>
                <MenuItem value={NotificationChannel.EMAIL}>{t('channels.EMAIL')}</MenuItem>
                <MenuItem value={NotificationChannel.DASHBOARD}>{t('channels.DASHBOARD')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>{t('forms.category')}</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value as NotificationCategory,
                  }))
                }
                label={t('forms.category')}
                disabled={isLoading}
                size={isMobile ? 'small' : 'medium'}
              >
                {Object.values(NotificationCategory).map((category) => (
                  <MenuItem key={category} value={category}>
                    {getCategoryLabel(category)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>{t('forms.priority')}</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: e.target.value as NotificationPriority,
                  }))
                }
                label={t('forms.priority')}
                disabled={isLoading}
                size={isMobile ? 'small' : 'medium'}
              >
                <MenuItem value={NotificationPriority.LOW}>{t('priorities.low')}</MenuItem>
                <MenuItem value={NotificationPriority.MEDIUM}>{t('priorities.medium')}</MenuItem>
                <MenuItem value={NotificationPriority.HIGH}>{t('priorities.high')}</MenuItem>
                <MenuItem value={NotificationPriority.URGENT}>{t('priorities.urgent')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TextField
          fullWidth
          label={t('forms.title')}
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          required
          disabled={isLoading}
          size={isMobile ? 'small' : 'medium'}
        />

        <TextField
          fullWidth
          label={t('forms.message')}
          value={formData.message}
          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
          multiline
          rows={isMobile ? 3 : 4}
          required
          disabled={isLoading}
          size={isMobile ? 'small' : 'medium'}
        />

        <TextField
          fullWidth
          label={t('forms.messageEn')}
          value={formData.messageEn}
          onChange={(e) => setFormData((prev) => ({ ...prev, messageEn: e.target.value }))}
          multiline
          rows={isMobile ? 3 : 4}
          disabled={isLoading}
          size={isMobile ? 'small' : 'medium'}
        />

        <TextField
          fullWidth
          label={t('forms.actionUrl')}
          value={formData.actionUrl}
          onChange={(e) => setFormData((prev) => ({ ...prev, actionUrl: e.target.value }))}
          disabled={isLoading}
          size={isMobile ? 'small' : 'medium'}
        />

        {/* User Selection Section */}
        <Box>
          <Typography variant="subtitle2" gutterBottom sx={{ mb: 1.5, fontWeight: 'medium' }}>
            {t('forms.selectRecipients', 'اختر المستلمين')}
          </Typography>

          {/* Info Alert */}
          {usersData && usersData.meta.total > 100 && (
            <Alert severity="info" sx={{ mb: 2, fontSize: isMobile ? '0.875rem' : undefined }}>
              {t(
                'forms.usersLimitInfo',
                'يتم عرض أول 100 مستخدم. استخدم البحث والفلترة للعثور على المستخدمين المطلوبين.'
              )}
            </Alert>
          )}

          {/* Search and Filter */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                placeholder={t('forms.searchUsers', 'ابحث عن المستخدمين...')}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                disabled={isLoading || usersLoading}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small" disabled={isLoading || usersLoading}>
                <InputLabel>{t('forms.filterByRole', 'فلترة حسب الدور')}</InputLabel>
                <Select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole | '')}
                  label={t('forms.filterByRole', 'فلترة حسب الدور')}
                >
                  <MenuItem value="">{t('filters.all', 'الكل')}</MenuItem>
                  <MenuItem value={UserRole.USER}>{t('forms.roleUser', 'مستخدم')}</MenuItem>
                  <MenuItem value={UserRole.MERCHANT}>{t('forms.roleMerchant', 'تاجر')}</MenuItem>
                  <MenuItem value={UserRole.ENGINEER}>{t('forms.roleEngineer', 'مهندس')}</MenuItem>
                  <MenuItem value={UserRole.ADMIN}>{t('forms.roleAdmin', 'مدير')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* User Selection */}
          <FormControl
            fullWidth
            disabled={isLoading || usersLoading}
            size={isMobile ? 'small' : 'medium'}
          >
            <InputLabel>{t('forms.recipientId', 'المستلمون')}</InputLabel>
            <Select
              multiple
              value={selectedUserIds}
              onChange={handleUserChange}
              input={<OutlinedInput label={t('forms.recipientId', 'المستلمون')} />}
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return t('placeholders.selectUser', 'اختر المستخدمين');
                }
                if (selected.length === allUsers.length && allUsers.length > 0) {
                  return t('forms.allUsers', 'جميع المستخدمين');
                }
                return `${selected.length} ${t('forms.selected', 'محدد')}`;
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 400,
                  },
                },
              }}
            >
              {allUsers.length > 0 && (
                <MenuItem value="all">
                  <Checkbox
                    checked={selectedUserIds.length === allUsers.length && allUsers.length > 0}
                  />
                  <ListItemText
                    primary={t('forms.selectAll', 'تحديد الكل')}
                    secondary={`${allUsers.length} ${t('forms.users', 'مستخدم')}`}
                  />
                </MenuItem>
              )}

              {/* Group users by role */}
              {Object.entries(usersByRole)
                .filter(([, users]) => users.length > 0)
                .flatMap(([role, users]) => [
                  <ListSubheader
                    key={`header-${role}`}
                    sx={{
                      bgcolor: 'grey.100',
                      fontWeight: 'medium',
                      fontSize: '0.875rem',
                      lineHeight: '2.5',
                    }}
                  >
                    {getRoleLabel(role as UserRole)} ({users.length})
                  </ListSubheader>,
                  ...users.map((user) => {
                    const userName =
                      user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.phone || user._id;
                    return (
                      <MenuItem key={user._id} value={user._id} sx={{ pl: 4 }}>
                        <Checkbox checked={selectedUserIds.indexOf(user._id) > -1} />
                        <ListItemText primary={userName} secondary={user.phone} />
                      </MenuItem>
                    );
                  }),
                ])}

              {allUsers.length === 0 && !usersLoading && (
                <MenuItem disabled>
                  <ListItemText primary={t('forms.noUsersFound', 'لا يوجد مستخدمون')} />
                </MenuItem>
              )}
            </Select>
          </FormControl>

          {selectedUserIds.length > 0 && (
            <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label={`${selectedUserIds.length} ${t('forms.selected', 'محدد')}`}
                size="small"
                color="primary"
                onDelete={() => {
                  setSelectedUserIds([]);
                  setFormData((prev) => ({ ...prev, recipientId: '' }));
                }}
              />
            </Box>
          )}
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('forms.recipientEmail')}
              value={formData.recipientEmail}
              onChange={(e) => setFormData((prev) => ({ ...prev, recipientEmail: e.target.value }))}
              type="email"
              disabled={isLoading}
              size={isMobile ? 'small' : 'medium'}
              helperText={t('forms.recipientEmailHelper', 'اختياري - للبريد الإلكتروني')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('forms.recipientPhone')}
              value={formData.recipientPhone}
              onChange={(e) => setFormData((prev) => ({ ...prev, recipientPhone: e.target.value }))}
              disabled={isLoading}
              size={isMobile ? 'small' : 'medium'}
              helperText={t('forms.recipientPhoneHelper', 'اختياري - للرسائل النصية')}
            />
          </Grid>
        </Grid>

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            justifyContent: 'flex-end',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
          }}
        >
          <Button
            onClick={onCancel}
            disabled={isLoading}
            size={isMobile ? 'small' : 'medium'}
            fullWidth={isMobile}
          >
            {t('templates.actions.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            size={isMobile ? 'small' : 'medium'}
            fullWidth={isMobile}
          >
            {isLoading ? t('forms.creating') : t('forms.create')}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

// Bulk Send Form Component
const BulkSendForm: React.FC<{
  templates: NotificationTemplate[];
  onSave: (data: BulkSendNotificationDto) => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ onSave, onCancel, isLoading }) => {
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();
  const [formData, setFormData] = useState({
    type: NotificationType.ORDER_CONFIRMED,
    title: '',
    message: '',
    messageEn: '',
    channel: NotificationChannel.IN_APP,
    priority: NotificationPriority.MEDIUM,
    category: NotificationCategory.ORDER,
    templateKey: '',
    targetUserIds: [] as string[],
    actionUrl: '',
    data: {} as Record<string, unknown>,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Stack spacing={3}>
        <Alert severity="info" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
          {t('forms.bulkSendInfo')}
        </Alert>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>{t('forms.type')}</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value as NotificationType }))
                }
                label={t('forms.type')}
                disabled={isLoading}
                size={isMobile ? 'small' : 'medium'}
              >
                {Object.values(NotificationType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>{t('forms.channel')}</InputLabel>
              <Select
                value={formData.channel}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    channel: e.target.value as NotificationChannel,
                  }))
                }
                label={t('forms.channel')}
                disabled={isLoading}
                size={isMobile ? 'small' : 'medium'}
              >
                <MenuItem value={NotificationChannel.IN_APP}>{t('channels.IN_APP')}</MenuItem>
                <MenuItem value={NotificationChannel.PUSH}>{t('channels.PUSH')}</MenuItem>
                <MenuItem value={NotificationChannel.SMS}>{t('channels.SMS')}</MenuItem>
                <MenuItem value={NotificationChannel.EMAIL}>{t('channels.EMAIL')}</MenuItem>
                <MenuItem value={NotificationChannel.DASHBOARD}>{t('channels.DASHBOARD')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TextField
          fullWidth
          label={t('forms.title')}
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          required
          disabled={isLoading}
          size={isMobile ? 'small' : 'medium'}
        />

        <TextField
          fullWidth
          label={t('forms.message')}
          value={formData.message}
          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
          multiline
          rows={isMobile ? 3 : 4}
          required
          disabled={isLoading}
          size={isMobile ? 'small' : 'medium'}
        />

        <TextField
          fullWidth
          label={t('forms.messageEn')}
          value={formData.messageEn}
          onChange={(e) => setFormData((prev) => ({ ...prev, messageEn: e.target.value }))}
          multiline
          rows={isMobile ? 3 : 4}
          disabled={isLoading}
          size={isMobile ? 'small' : 'medium'}
        />

        <TextField
          fullWidth
          label={t('forms.targetUserIds')}
          value={formData.targetUserIds.join(', ')}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              targetUserIds: e.target.value
                .split(',')
                .map((id) => id.trim())
                .filter((id) => id),
            }))
          }
          placeholder={t('placeholders.userIds')}
          required
          disabled={isLoading}
          helperText={t('forms.targetUserIdsHelper')}
          size={isMobile ? 'small' : 'medium'}
        />

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            justifyContent: 'flex-end',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
          }}
        >
          <Button
            onClick={onCancel}
            disabled={isLoading}
            size={isMobile ? 'small' : 'medium'}
            fullWidth={isMobile}
          >
            {t('templates.actions.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            size={isMobile ? 'small' : 'medium'}
            fullWidth={isMobile}
          >
            {isLoading ? t('forms.sending') : t('forms.sendBulk')}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

// Test Notification Form Component
const TestNotificationForm: React.FC<{
  templates: NotificationTemplate[];
  onTest: (userId: string, templateKey: string, payload: Record<string, unknown>) => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ templates, onTest, onCancel, isLoading }) => {
  const { t } = useTranslation('notifications');
  const { isMobile } = useBreakpoint();
  const [formData, setFormData] = useState({
    userId: '',
    templateKey: '',
    payload: {} as Record<string, unknown>,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTest(formData.userId, formData.templateKey, formData.payload);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Stack spacing={3}>
        <Alert severity="warning" sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
          {t('forms.testWarning')}
        </Alert>

        <TextField
          fullWidth
          label={t('forms.userId')}
          value={formData.userId}
          onChange={(e) => setFormData((prev) => ({ ...prev, userId: e.target.value }))}
          required
          disabled={isLoading}
          size={isMobile ? 'small' : 'medium'}
        />

        <FormControl fullWidth required>
          <InputLabel>{t('forms.template')}</InputLabel>
          <Select
            value={formData.templateKey}
            onChange={(e) => setFormData((prev) => ({ ...prev, templateKey: e.target.value }))}
            label={t('forms.template')}
            disabled={isLoading}
            size={isMobile ? 'small' : 'medium'}
          >
            {templates.map((template) => (
              <MenuItem key={template.key} value={template.key}>
                {template.name} - {template.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label={t('forms.testData')}
          value={JSON.stringify(formData.payload, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              setFormData((prev) => ({ ...prev, payload: parsed }));
            } catch {
              // Invalid JSON, keep the text but don't update payload
            }
          }}
          multiline
          rows={isMobile ? 4 : 6}
          disabled={isLoading}
          helperText={t('forms.testDataHelper')}
          size={isMobile ? 'small' : 'medium'}
        />

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            justifyContent: 'flex-end',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
          }}
        >
          <Button
            onClick={onCancel}
            disabled={isLoading}
            size={isMobile ? 'small' : 'medium'}
            fullWidth={isMobile}
          >
            {t('templates.actions.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            size={isMobile ? 'small' : 'medium'}
            fullWidth={isMobile}
          >
            {isLoading ? t('forms.sending') : t('templates.actions.sendTest')}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};
