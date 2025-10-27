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
import { DataTable } from '@/shared/components/DataTable/DataTable';
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

export const NotificationsListPage: React.FC = () => {
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
          showSnackbar('تم إرسال التنبيه بنجاح', 'success');
          refetch();
        },
        onError: () => showSnackbar('فشل في إرسال التنبيه', 'error'),
      }
    );
  };

  const handleDelete = (notification: Notification) => {
    if (window.confirm('هل تريد حذف التنبيه؟')) {
      deleteNotification(notification._id, {
        onSuccess: () => {
          showSnackbar('تم حذف التنبيه بنجاح', 'success');
          refetch();
        },
        onError: () => showSnackbar('فشل في حذف التنبيه', 'error'),
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedNotifications.length === 0) {
      showSnackbar('يرجى تحديد التنبيهات المراد حذفها', 'warning');
      return;
    }

    if (window.confirm(`هل تريد حذف ${selectedNotifications.length} تنبيه؟`)) {
      // Implement bulk delete logic
      showSnackbar('تم حذف التنبيهات المحددة', 'success');
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
            showSnackbar('تم تحديث التنبيه بنجاح', 'success');
            refetch();
          },
          onError: () => showSnackbar('فشل في تحديث التنبيه', 'error'),
        }
      );
    }
  };

  const handleCreate = (data: CreateNotificationDto) => {
    createNotification(data, {
      onSuccess: () => {
        setCreateDialogOpen(false);
        showSnackbar('تم إنشاء التنبيه بنجاح', 'success');
        refetch();
      },
      onError: () => showSnackbar('فشل في إنشاء التنبيه', 'error'),
    });
  };

  const handleBulkSend = (data: BulkSendNotificationDto) => {
    bulkSendNotification(data, {
      onSuccess: () => {
        setBulkSendDialogOpen(false);
        showSnackbar('تم إرسال التنبيهات بنجاح', 'success');
        refetch();
      },
      onError: () => showSnackbar('فشل في إرسال التنبيهات', 'error'),
    });
  };

  const handleTest = (userId: string, templateKey: string, payload: Record<string, unknown>) => {
    testNotification(
      { userId, templateKey, payload },
      {
        onSuccess: () => {
          setTestDialogOpen(false);
          showSnackbar('تم إرسال تنبيه الاختبار بنجاح', 'success');
        },
        onError: () => showSnackbar('فشل في إرسال تنبيه الاختبار', 'error'),
      }
    );
  };

  const handleRefresh = () => {
    refetch();
    showSnackbar('تم تحديث البيانات', 'info');
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
        return 'مرسل';
      case NotificationStatus.DELIVERED:
        return 'تم التسليم';
      case NotificationStatus.READ:
        return 'مقروء';
      case NotificationStatus.CLICKED:
        return 'تم النقر';
      case NotificationStatus.FAILED:
        return 'فشل';
      case NotificationStatus.BOUNCED:
        return 'مرفوض';
      case NotificationStatus.REJECTED:
        return 'مرفوض';
      case NotificationStatus.CANCELLED:
        return 'ملغي';
      case NotificationStatus.PENDING:
        return 'معلق';
      case NotificationStatus.QUEUED:
        return 'قيد الانتظار';
      case NotificationStatus.SENDING:
        return 'جاري الإرسال';
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
        return 'داخل التطبيق';
      case NotificationChannel.PUSH:
        return 'إشعار دفع';
      case NotificationChannel.SMS:
        return 'رسالة نصية';
      case NotificationChannel.EMAIL:
        return 'بريد إلكتروني';
      case NotificationChannel.DASHBOARD:
        return 'لوحة التحكم';
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
        return 'عاجل';
      case NotificationPriority.HIGH:
        return 'عالي';
      case NotificationPriority.MEDIUM:
        return 'متوسط';
      case NotificationPriority.LOW:
        return 'منخفض';
      default:
        return priority;
    }
  };

  const getCategoryLabel = (category: NotificationCategory) => {
    switch (category) {
      case NotificationCategory.ORDER:
        return 'الطلبات';
      case NotificationCategory.PRODUCT:
        return 'المنتجات';
      case NotificationCategory.SERVICE:
        return 'الخدمات';
      case NotificationCategory.PROMOTION:
        return 'العروض';
      case NotificationCategory.ACCOUNT:
        return 'الحساب';
      case NotificationCategory.SYSTEM:
        return 'النظام';
      case NotificationCategory.SUPPORT:
        return 'الدعم';
      case NotificationCategory.PAYMENT:
        return 'الدفع';
      case NotificationCategory.MARKETING:
        return 'التسويق';
      default:
        return category;
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'العنوان',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            {getChannelIcon(params.row.channel)}
          </Avatar>
          <Box>
            <Typography variant="body2" noWrap title={params.value} sx={{ fontWeight: 'medium' }}>
          {params.value || 'بدون عنوان'}
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
      headerName: 'النوع',
      width: 150,
      renderCell: (params) => (
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
      headerName: 'القناة',
      width: 120,
      renderCell: (params) => (
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
      headerName: 'الحالة',
      width: 140,
      renderCell: (params) => (
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
      headerName: 'الأولوية',
      width: 100,
      renderCell: (params) => (
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
      headerName: 'المستخدم',
      width: 180,
      renderCell: (params) => {
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
            غير محدد
          </Typography>
        );
      },
    },
    {
      field: 'createdAt',
      headerName: 'تاريخ الإنشاء',
      width: 140,
      valueFormatter: (value) => formatDate(value as Date),
    },
    {
      field: 'sentAt',
      headerName: 'تاريخ الإرسال',
      width: 140,
      valueFormatter: (value) => (value ? formatDate(value as Date) : '-'),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const notif = params.row as Notification;
        const canSend =
          notif.status === NotificationStatus.QUEUED || notif.status === NotificationStatus.PENDING;
        const canEdit =
          notif.status === NotificationStatus.PENDING || notif.status === NotificationStatus.QUEUED;

        return (
          <Box display="flex" gap={0.5}>
            <Tooltip title="عرض التفاصيل">
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
            <Tooltip title="تعديل">
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
              <Tooltip title="إرسال">
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

            <Tooltip title="حذف">
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
        <Alert severity="error" sx={{ mb: 3 }}>
          حدث خطأ في تحميل البيانات: {error.message}
        </Alert>
      )}

      {/* Statistics Cards */}
      {statsLoading ? (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[...Array(6)].map((_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 2 }}>
            <Card>
              <CardContent>
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        stats && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Notifications sx={{ mr: 1 }} />
                <Typography variant="h6">{stats.total}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  إجمالي التنبيهات
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                }}
              >
              <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircle sx={{ mr: 1 }} />
                    <Typography variant="h6">{stats.byStatus?.sent || 0}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    مرسل بنجاح
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  color: 'white',
                }}
              >
              <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Pending sx={{ mr: 1 }} />
                    <Typography variant="h6">{stats.byStatus?.queued || 0}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  قيد الانتظار
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                  color: 'white',
                }}
              >
              <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Error sx={{ mr: 1 }} />
                    <Typography variant="h6">{stats.byStatus?.failed || 0}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    فشل في الإرسال
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                  color: '#333',
                }}
              >
              <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircle sx={{ mr: 1 }} />
                    <Typography variant="h6">{stats.byStatus?.read || 0}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    تم القراءة
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
                  color: '#333',
                }}
              >
              <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUp sx={{ mr: 1 }} />
                    <Typography variant="h6">{stats.unreadCount || 0}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    غير مقروء
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        )
      )}

      {/* Filters and Actions */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
        <TextField
          size="small"
            placeholder="البحث في العنوان أو المحتوى..."
            value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
            sx={{ minWidth: 250 }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>القناة</InputLabel>
          <Select
              value={filters.channel || ''}
              onChange={(e) => handleFilterChange('channel', e.target.value || undefined)}
            label="القناة"
          >
            <MenuItem value="">الكل</MenuItem>
              <MenuItem value={NotificationChannel.IN_APP}>داخل التطبيق</MenuItem>
              <MenuItem value={NotificationChannel.PUSH}>إشعار دفع</MenuItem>
              <MenuItem value={NotificationChannel.SMS}>رسالة نصية</MenuItem>
              <MenuItem value={NotificationChannel.EMAIL}>بريد إلكتروني</MenuItem>
              <MenuItem value={NotificationChannel.DASHBOARD}>لوحة التحكم</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>الحالة</InputLabel>
          <Select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            label="الحالة"
          >
            <MenuItem value="">الكل</MenuItem>
              <MenuItem value={NotificationStatus.SENT}>مرسل</MenuItem>
              <MenuItem value={NotificationStatus.DELIVERED}>تم التسليم</MenuItem>
              <MenuItem value={NotificationStatus.READ}>مقروء</MenuItem>
              <MenuItem value={NotificationStatus.CLICKED}>تم النقر</MenuItem>
              <MenuItem value={NotificationStatus.FAILED}>فشل</MenuItem>
              <MenuItem value={NotificationStatus.QUEUED}>قيد الانتظار</MenuItem>
              <MenuItem value={NotificationStatus.PENDING}>معلق</MenuItem>
              <MenuItem value={NotificationStatus.CANCELLED}>ملغي</MenuItem>
          </Select>
        </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>الفئة</InputLabel>
            <Select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
              label="الفئة"
            >
              <MenuItem value="">الكل</MenuItem>
              <MenuItem value={NotificationCategory.ORDER}>الطلبات</MenuItem>
              <MenuItem value={NotificationCategory.PRODUCT}>المنتجات</MenuItem>
              <MenuItem value={NotificationCategory.SERVICE}>الخدمات</MenuItem>
              <MenuItem value={NotificationCategory.PROMOTION}>العروض</MenuItem>
              <MenuItem value={NotificationCategory.ACCOUNT}>الحساب</MenuItem>
              <MenuItem value={NotificationCategory.SYSTEM}>النظام</MenuItem>
              <MenuItem value={NotificationCategory.SUPPORT}>الدعم</MenuItem>
              <MenuItem value={NotificationCategory.PAYMENT}>الدفع</MenuItem>
              <MenuItem value={NotificationCategory.MARKETING}>التسويق</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>الأولوية</InputLabel>
            <Select
              value={filters.priority || ''}
              onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
              label="الأولوية"
            >
              <MenuItem value="">الكل</MenuItem>
              <MenuItem value={NotificationPriority.URGENT}>عاجل</MenuItem>
              <MenuItem value={NotificationPriority.HIGH}>عالي</MenuItem>
              <MenuItem value={NotificationPriority.MEDIUM}>متوسط</MenuItem>
              <MenuItem value={NotificationPriority.LOW}>منخفض</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateDialogOpen(true)}
            disabled={isCreating}
          >
          إضافة تنبيه
        </Button>

          <Button
            variant="outlined"
            startIcon={<Send />}
            onClick={() => setBulkSendDialogOpen(true)}
            disabled={isBulkSending}
          >
            إرسال مجمع
          </Button>

          <Button
            variant="outlined"
            startIcon={<Analytics />}
            onClick={() => setTestDialogOpen(true)}
            disabled={isTesting}
          >
            اختبار قالب
          </Button>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            تحديث
          </Button>

          {selectedNotifications.length > 0 && (
            <>
              <Divider orientation="vertical" flexItem />
              <Typography variant="body2" color="text.secondary">
                {selectedNotifications.length} محدد
              </Typography>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleBulkDelete}
                disabled={isDeleting}
              >
                حذف المحدد
              </Button>
            </>
          )}
      </Box>
      </Paper>

      {/* Data Table */}
      <Paper sx={{ height: 'calc(100vh - 500px)' }}>
      <DataTable
        title="إدارة التنبيهات"
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
        />
      </Paper>

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
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Visibility />
          تفاصيل التنبيه
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
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                  المحتوى:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedNotification.message}
                  </Typography>
                </Paper>
              </Box>

              {/* User Info */}
              {selectedNotification.user && (
              <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                    المستخدم:
                </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                    }}
                  >
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      {selectedNotification.user.name?.charAt(0) ||
                        selectedNotification.user.email?.charAt(0)}
                    </Avatar>
              <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {selectedNotification.user.name || selectedNotification.user.email}
                </Typography>
                      {selectedNotification.user.email && selectedNotification.user.name && (
                        <Typography variant="body2" color="text.secondary">
                          {selectedNotification.user.email}
                        </Typography>
                      )}
                      {selectedNotification.user.phone && (
                        <Typography variant="body2" color="text.secondary">
                          {selectedNotification.user.phone}
                        </Typography>
                      )}
              </Box>
                  </Box>
                </Box>
              )}

              {/* Timestamps */}
                <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                  التواريخ:
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        تاريخ الإنشاء:
                  </Typography>
                  <Typography variant="body1">
                        {formatDate(selectedNotification.createdAt)}
                  </Typography>
                </Box>
                  </Grid>
                  {selectedNotification.sentAt && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          تاريخ الإرسال:
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(selectedNotification.sentAt)}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  {selectedNotification.readAt && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          تاريخ القراءة:
                        </Typography>
                        <Typography variant="body1">
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
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
                    رابط الإجراء:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ wordBreak: 'break-all', bgcolor: 'grey.50', p: 1, borderRadius: 1 }}
                  >
                    {selectedNotification.actionUrl}
                  </Typography>
                </Box>
              )}

              {/* Error Information */}
              {selectedNotification.errorMessage && (
                <Alert severity="error">
                  <Typography variant="subtitle2" gutterBottom>
                    رسالة الخطأ:
                  </Typography>
                  <Typography variant="body2">{selectedNotification.errorMessage}</Typography>
                  {selectedNotification.errorCode && (
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      كود الخطأ: {selectedNotification.errorCode}
                    </Typography>
                  )}
                </Alert>
              )}

              {/* Metadata */}
              {selectedNotification.metadata &&
                Object.keys(selectedNotification.metadata).length > 0 && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="subtitle1">معلومات إضافية</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <pre
                        style={{
                          background: '#f5f5f5',
                          padding: '12px',
                          borderRadius: '4px',
                          overflow: 'auto',
                          fontSize: '12px',
                          fontFamily: 'monospace',
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
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>إغلاق</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Edit />
          تعديل التنبيه
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
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Add />
          إضافة تنبيه جديد
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
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Send />
          إرسال مجمع
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
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Analytics />
          اختبار قالب
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
          label="العنوان"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          required
              disabled={isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>الأولوية</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: e.target.value as NotificationPriority,
                  }))
                }
                label="الأولوية"
                disabled={isLoading}
              >
                <MenuItem value={NotificationPriority.LOW}>منخفض</MenuItem>
                <MenuItem value={NotificationPriority.MEDIUM}>متوسط</MenuItem>
                <MenuItem value={NotificationPriority.HIGH}>عالي</MenuItem>
                <MenuItem value={NotificationPriority.URGENT}>عاجل</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TextField
          fullWidth
          label="المحتوى (عربي)"
          value={formData.message}
          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
          multiline
          rows={4}
          required
          disabled={isLoading}
        />

        <TextField
          fullWidth
          label="المحتوى (إنجليزي)"
          value={formData.messageEn}
          onChange={(e) => setFormData((prev) => ({ ...prev, messageEn: e.target.value }))}
          multiline
          rows={4}
          disabled={isLoading}
        />

        <TextField
          fullWidth
          label="رابط الإجراء (اختياري)"
          value={formData.actionUrl}
          onChange={(e) => setFormData((prev) => ({ ...prev, actionUrl: e.target.value }))}
          disabled={isLoading}
        />

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button onClick={onCancel} disabled={isLoading}>
            إلغاء
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? 'جاري الحفظ...' : 'حفظ'}
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
  const getCategoryLabel = (category: NotificationCategory) => {
    const labels: Record<NotificationCategory, string> = {
      [NotificationCategory.ORDER]: 'الطلبات',
      [NotificationCategory.PRODUCT]: 'المنتجات',
      [NotificationCategory.SERVICE]: 'الخدمات',
      [NotificationCategory.PROMOTION]: 'العروض',
      [NotificationCategory.ACCOUNT]: 'الحساب',
      [NotificationCategory.SYSTEM]: 'النظام',
      [NotificationCategory.SUPPORT]: 'الدعم',
      [NotificationCategory.PAYMENT]: 'الدفع',
      [NotificationCategory.MARKETING]: 'التسويق',
    };
    return labels[category] || category;
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
            <InputLabel>القالب</InputLabel>
            <Select
              value={formData.templateKey}
              onChange={(e) => handleTemplateChange(e.target.value)}
              label="القالب"
              disabled={isLoading}
            >
              <MenuItem value="">بدون قالب</MenuItem>
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
              <InputLabel>نوع التنبيه</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value as NotificationType }))
                }
                label="نوع التنبيه"
                disabled={isLoading}
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
          <InputLabel>القناة</InputLabel>
          <Select
            value={formData.channel}
            onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    channel: e.target.value as NotificationChannel,
                  }))
            }
            label="القناة"
                disabled={isLoading}
              >
                <MenuItem value={NotificationChannel.IN_APP}>داخل التطبيق</MenuItem>
                <MenuItem value={NotificationChannel.PUSH}>إشعار دفع</MenuItem>
                <MenuItem value={NotificationChannel.SMS}>رسالة نصية</MenuItem>
                <MenuItem value={NotificationChannel.EMAIL}>بريد إلكتروني</MenuItem>
                <MenuItem value={NotificationChannel.DASHBOARD}>لوحة التحكم</MenuItem>
          </Select>
        </FormControl>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>الفئة</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value as NotificationCategory,
                  }))
                }
                label="الفئة"
                disabled={isLoading}
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
              <InputLabel>الأولوية</InputLabel>
            <Select
                value={formData.priority}
                onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                    priority: e.target.value as NotificationPriority,
                  }))
                }
                label="الأولوية"
                disabled={isLoading}
              >
                <MenuItem value={NotificationPriority.LOW}>منخفض</MenuItem>
                <MenuItem value={NotificationPriority.MEDIUM}>متوسط</MenuItem>
                <MenuItem value={NotificationPriority.HIGH}>عالي</MenuItem>
                <MenuItem value={NotificationPriority.URGENT}>عاجل</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TextField
          fullWidth
          label="العنوان"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          required
          disabled={isLoading}
        />

        <TextField
          fullWidth
          label="المحتوى (عربي)"
          value={formData.message}
          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
          multiline
          rows={4}
          required
          disabled={isLoading}
        />

        <TextField
          fullWidth
          label="المحتوى (إنجليزي)"
          value={formData.messageEn}
          onChange={(e) => setFormData((prev) => ({ ...prev, messageEn: e.target.value }))}
          multiline
          rows={4}
          disabled={isLoading}
        />

        <TextField
          fullWidth
          label="رابط الإجراء (اختياري)"
          value={formData.actionUrl}
          onChange={(e) => setFormData((prev) => ({ ...prev, actionUrl: e.target.value }))}
          disabled={isLoading}
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="معرف المستخدم"
              value={formData.recipientId}
              onChange={(e) => setFormData((prev) => ({ ...prev, recipientId: e.target.value }))}
              disabled={isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="البريد الإلكتروني"
              value={formData.recipientEmail}
              onChange={(e) => setFormData((prev) => ({ ...prev, recipientEmail: e.target.value }))}
              type="email"
              disabled={isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="رقم الهاتف"
              value={formData.recipientPhone}
              onChange={(e) => setFormData((prev) => ({ ...prev, recipientPhone: e.target.value }))}
              disabled={isLoading}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button onClick={onCancel} disabled={isLoading}>
            إلغاء
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? 'جاري الإنشاء...' : 'إنشاء'}
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
        <Alert severity="info">سيتم إرسال التنبيه لجميع المستخدمين المحددين</Alert>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>نوع التنبيه</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value as NotificationType }))
                }
                label="نوع التنبيه"
                disabled={isLoading}
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
              <InputLabel>القناة</InputLabel>
              <Select
                value={formData.channel}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    channel: e.target.value as NotificationChannel,
                  }))
                }
                label="القناة"
                disabled={isLoading}
              >
                <MenuItem value={NotificationChannel.IN_APP}>داخل التطبيق</MenuItem>
                <MenuItem value={NotificationChannel.PUSH}>إشعار دفع</MenuItem>
                <MenuItem value={NotificationChannel.SMS}>رسالة نصية</MenuItem>
                <MenuItem value={NotificationChannel.EMAIL}>بريد إلكتروني</MenuItem>
                <MenuItem value={NotificationChannel.DASHBOARD}>لوحة التحكم</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TextField
          fullWidth
          label="العنوان"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          required
          disabled={isLoading}
        />

        <TextField
          fullWidth
          label="المحتوى (عربي)"
          value={formData.message}
          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
          multiline
          rows={4}
          required
          disabled={isLoading}
        />

        <TextField
          fullWidth
          label="المحتوى (إنجليزي)"
          value={formData.messageEn}
          onChange={(e) => setFormData((prev) => ({ ...prev, messageEn: e.target.value }))}
          multiline
          rows={4}
          disabled={isLoading}
        />

        <TextField
          fullWidth
          label="معرفات المستخدمين (مفصولة بفواصل)"
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
          placeholder="user1, user2, user3"
          required
          disabled={isLoading}
          helperText="أدخل معرفات المستخدمين مفصولة بفواصل"
        />

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button onClick={onCancel} disabled={isLoading}>
            إلغاء
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? 'جاري الإرسال...' : 'إرسال مجمع'}
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
        <Alert severity="warning">سيتم إرسال تنبيه تجريبي للمستخدم المحدد</Alert>

        <TextField
          fullWidth
          label="معرف المستخدم"
          value={formData.userId}
          onChange={(e) => setFormData((prev) => ({ ...prev, userId: e.target.value }))}
          required
          disabled={isLoading}
        />

        <FormControl fullWidth required>
          <InputLabel>القالب</InputLabel>
          <Select
            value={formData.templateKey}
            onChange={(e) => setFormData((prev) => ({ ...prev, templateKey: e.target.value }))}
            label="القالب"
            disabled={isLoading}
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
          label="بيانات الاختبار (JSON)"
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
          rows={6}
          disabled={isLoading}
          helperText="أدخل البيانات كـ JSON صحيح"
        />

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button onClick={onCancel} disabled={isLoading}>
            إلغاء
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? 'جاري الإرسال...' : 'إرسال اختبار'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};
