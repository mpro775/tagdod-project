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
  Stack
} from '@mui/material';
import { 
  Send, 
  Delete, 
  Edit, 
  Visibility, 
  Add, 
  Search,
  Analytics,
  Schedule
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
} from '../hooks/useNotifications';
import { formatDate } from '@/shared/utils/formatters';
import type { 
  Notification, 
  NotificationChannel, 
  NotificationStatus,
  CreateNotificationDto,
  UpdateNotificationDto
} from '../types/notification.types';

export const NotificationsListPage: React.FC = () => {
  const [filters, setFilters] = useState({
    search: '',
    channel: '',
    status: '',
    page: 0,
    pageSize: 20,
  });
  
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: notificationsResponse, isLoading, refetch } = useNotifications(filters);
  const { data: stats } = useNotificationStats();
  const { data: templates } = useNotificationTemplates();
  
  const { mutate: sendNotification } = useSendNotification();
  const { mutate: deleteNotification } = useDeleteNotification();
  const { mutate: updateNotification } = useUpdateNotification();
  const { mutate: createNotification } = useCreateNotification();

  const notifications = notificationsResponse?.data || [];
  const meta = notificationsResponse?.meta;

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 0 }));
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
      { onSuccess: () => refetch() }
    );
  };

  const handleDelete = (notification: Notification) => {
    if (window.confirm('هل تريد حذف التنبيه؟')) {
      deleteNotification(notification._id, { onSuccess: () => refetch() });
    }
  };

  const handleUpdate = (data: UpdateNotificationDto) => {
    if (selectedNotification) {
      updateNotification(
        { id: selectedNotification._id, data },
        { onSuccess: () => {
          setEditDialogOpen(false);
          setSelectedNotification(null);
          refetch();
        }}
      );
    }
  };

  const handleCreate = (data: CreateNotificationDto) => {
    createNotification(data, {
      onSuccess: () => {
        setCreateDialogOpen(false);
        refetch();
      }
    });
  };

  const getStatusColor = (status: NotificationStatus) => {
    switch (status) {
      case 'sent': return 'success';
      case 'failed': return 'error';
      case 'queued': return 'warning';
      case 'read': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: NotificationStatus) => {
    switch (status) {
      case 'sent': return 'مرسل';
      case 'failed': return 'فشل';
      case 'queued': return 'قيد الانتظار';
      case 'read': return 'مقروء';
      default: return status;
    }
  };

  const getChannelLabel = (channel: NotificationChannel) => {
    switch (channel) {
      case 'inapp': return 'داخل التطبيق';
      case 'push': return 'إشعار دفع';
      case 'sms': return 'رسالة نصية';
      case 'email': return 'بريد إلكتروني';
      default: return channel;
    }
  };

  const columns: GridColDef[] = [
    { 
      field: 'title', 
      headerName: 'العنوان', 
      width: 200,
      renderCell: (params) => (
        <Typography variant="body2" noWrap title={params.value}>
          {params.value || 'بدون عنوان'}
        </Typography>
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
        />
      ),
    },
    { 
      field: 'status', 
      headerName: 'الحالة',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value)}
          color={getStatusColor(params.value) as any}
          size="small"
        />
      ),
    },
    {
      field: 'user',
      headerName: 'المستخدم',
      width: 150,
      renderCell: (params) => {
        const user = params.row.user;
        return user ? (
          <Typography variant="body2">
            {user.name || user.email}
          </Typography>
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
      field: 'actions',
      headerName: 'الإجراءات',
      width: 180,
      sortable: false,
      renderCell: (params) => {
        const notif = params.row as Notification;
        return (
          <Box display="flex" gap={0.5}>
            <Tooltip title="عرض">
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

            {notif.status === 'queued' && (
              <Tooltip title="إرسال">
                <IconButton
                  size="small"
                  color="success"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSend(notif);
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
                  handleDelete(notif);
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
      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Typography variant="h6">{stats.total}</Typography>
                <Typography variant="body2" color="text.secondary">
                  إجمالي التنبيهات
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">{stats.sent}</Typography>
                <Typography variant="body2" color="text.secondary">
                  مرسل
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main">{stats.queued}</Typography>
                <Typography variant="body2" color="text.secondary">
                  قيد الانتظار
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="error.main">{stats.failed}</Typography>
                <Typography variant="body2" color="text.secondary">
                  فشل
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="info.main">{stats.read}</Typography>
                <Typography variant="body2" color="text.secondary">
                  مقروء
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Typography variant="h6">{stats.recent24h}</Typography>
                <Typography variant="body2" color="text.secondary">
                  آخر 24 ساعة
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="البحث..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ minWidth: 200 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>القناة</InputLabel>
          <Select
            value={filters.channel}
            onChange={(e) => handleFilterChange('channel', e.target.value)}
            label="القناة"
          >
            <MenuItem value="">الكل</MenuItem>
            <MenuItem value="inapp">داخل التطبيق</MenuItem>
            <MenuItem value="push">إشعار دفع</MenuItem>
            <MenuItem value="sms">رسالة نصية</MenuItem>
            <MenuItem value="email">بريد إلكتروني</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>الحالة</InputLabel>
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            label="الحالة"
          >
            <MenuItem value="">الكل</MenuItem>
            <MenuItem value="sent">مرسل</MenuItem>
            <MenuItem value="queued">قيد الانتظار</MenuItem>
            <MenuItem value="failed">فشل</MenuItem>
            <MenuItem value="read">مقروء</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          إضافة تنبيه
        </Button>
      </Box>

      {/* Data Table */}
      <DataTable
        title="إدارة التنبيهات"
        columns={columns}
        rows={notifications}
        loading={isLoading}
        paginationModel={{ page: filters.page, pageSize: filters.pageSize }}
        onPaginationModelChange={(model) => {
          setFilters(prev => ({ 
            ...prev, 
            page: model.page, 
            pageSize: model.pageSize 
          }));
        }}
        rowCount={meta?.total || 0}
        height="calc(100vh - 400px)"
      />

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>تفاصيل التنبيه</DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">العنوان:</Typography>
                <Typography variant="body1">{selectedNotification.title}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">المحتوى:</Typography>
                <Typography variant="body1">{selectedNotification.body}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">القناة:</Typography>
                <Chip label={getChannelLabel(selectedNotification.channel)} size="small" />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">الحالة:</Typography>
                <Chip 
                  label={getStatusLabel(selectedNotification.status)} 
                  color={getStatusColor(selectedNotification.status) as any}
                  size="small" 
                />
              </Box>
              {selectedNotification.user && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">المستخدم:</Typography>
                  <Typography variant="body1">
                    {selectedNotification.user.name || selectedNotification.user.email}
                  </Typography>
                </Box>
              )}
              {selectedNotification.link && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">الرابط:</Typography>
                  <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                    {selectedNotification.link}
                  </Typography>
                </Box>
              )}
              {selectedNotification.error && (
                <Alert severity="error">
                  <Typography variant="subtitle2">خطأ:</Typography>
                  <Typography variant="body2">{selectedNotification.error}</Typography>
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>إغلاق</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>تعديل التنبيه</DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <NotificationEditForm
              notification={selectedNotification}
              onSave={handleUpdate}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>إضافة تنبيه جديد</DialogTitle>
        <DialogContent>
          <NotificationCreateForm
            templates={templates || []}
            onSave={handleCreate}
            onCancel={() => setCreateDialogOpen(false)}
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
}> = ({ notification, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: notification.title || '',
    body: notification.body || '',
    link: notification.link || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Stack spacing={2}>
        <TextField
          fullWidth
          label="العنوان"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
        <TextField
          fullWidth
          label="المحتوى"
          value={formData.body}
          onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
          multiline
          rows={4}
          required
        />
        <TextField
          fullWidth
          label="الرابط (اختياري)"
          value={formData.link}
          onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
        />
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>إلغاء</Button>
          <Button type="submit" variant="contained">حفظ</Button>
        </Box>
      </Stack>
    </Box>
  );
};

// Create Form Component
const NotificationCreateForm: React.FC<{
  templates: any[];
  onSave: (data: CreateNotificationDto) => void;
  onCancel: () => void;
}> = ({ templates, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    channel: 'inapp' as NotificationChannel,
    templateKey: '',
    link: '',
    targetUsers: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Stack spacing={2}>
        <FormControl fullWidth required>
          <InputLabel>القناة</InputLabel>
          <Select
            value={formData.channel}
            onChange={(e) => setFormData(prev => ({ ...prev, channel: e.target.value as NotificationChannel }))}
            label="القناة"
          >
            <MenuItem value="inapp">داخل التطبيق</MenuItem>
            <MenuItem value="push">إشعار دفع</MenuItem>
            <MenuItem value="sms">رسالة نصية</MenuItem>
            <MenuItem value="email">بريد إلكتروني</MenuItem>
          </Select>
        </FormControl>

        {templates.length > 0 && (
          <FormControl fullWidth>
            <InputLabel>القالب</InputLabel>
            <Select
              value={formData.templateKey}
              onChange={(e) => {
                const template = templates.find(t => t.key === e.target.value);
                setFormData(prev => ({ 
                  ...prev, 
                  templateKey: e.target.value,
                  title: template?.title || prev.title,
                  body: template?.body || prev.body,
                }));
              }}
              label="القالب"
            >
              <MenuItem value="">بدون قالب</MenuItem>
              {templates.map(template => (
                <MenuItem key={template.key} value={template.key}>
                  {template.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <TextField
          fullWidth
          label="العنوان"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
        
        <TextField
          fullWidth
          label="المحتوى"
          value={formData.body}
          onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
          multiline
          rows={4}
          required
        />
        
        <TextField
          fullWidth
          label="الرابط (اختياري)"
          value={formData.link}
          onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
        />

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>إلغاء</Button>
          <Button type="submit" variant="contained">إنشاء</Button>
        </Box>
      </Stack>
    </Box>
  );
};
