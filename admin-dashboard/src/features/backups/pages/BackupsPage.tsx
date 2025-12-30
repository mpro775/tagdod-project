import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  CircularProgress,
  Tooltip,
  Skeleton,
} from '@mui/material';
import {
  Backup as BackupIcon,
  Download,
  Delete,
  Refresh,
  Restore,
  Add,
  CheckCircle,
  Error as ErrorIcon,
  Schedule,
  CloudUpload,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backupsApi, Backup } from '../api/backupsApi';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { GridColDef } from '@mui/x-data-grid';
import { formatNumber } from '@/shared/utils/formatters';

export const BackupsPage: React.FC = () => {
  const { t } = useTranslation(['backups', 'common']);
  const queryClient = useQueryClient();
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [page, setPage] = useState(0);
  const [limit] = useState(20);

  // جلب الإحصائيات
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['backups', 'stats'],
    queryFn: () => backupsApi.getStats(),
    refetchInterval: 30000, // تحديث كل 30 ثانية
  });

  // جلب النسخ الاحتياطية
  const { data: backupsData, isLoading: backupsLoading } = useQuery({
    queryKey: ['backups', 'list', page],
    queryFn: () => backupsApi.getAllBackups(limit, page * limit),
  });

  // إنشاء نسخة احتياطية
  const createBackupMutation = useMutation({
    mutationFn: () => backupsApi.createBackup(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
  });

  // حذف نسخة احتياطية
  const deleteBackupMutation = useMutation({
    mutationFn: (id: string) => backupsApi.deleteBackup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
      setDeleteDialogOpen(false);
      setSelectedBackup(null);
    },
  });

  // استعادة قاعدة البيانات
  const restoreBackupMutation = useMutation({
    mutationFn: (id: string) => backupsApi.restoreBackup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
      setRestoreDialogOpen(false);
      setSelectedBackup(null);
    },
  });

  // تنسيق حجم الملف
  const formatSize = (bytes: number | undefined | null): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string): string => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ar,
      });
    } catch {
      return dateString;
    }
  };

  // الحصول على لون الحالة
  const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'info' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'in_progress':
        return 'info';
      default:
        return 'warning';
    }
  };

  // الحصول على نص الحالة
  const getStatusText = (status: string): string => {
    return t(`backups:status.${status}`, status);
  };

  // تعريف الأعمدة للجدول
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'name',
        headerName: t('backups:table.name', 'الاسم'),
        minWidth: 200,
        flex: 1,
      },
      {
        field: 'createdAt',
        headerName: t('backups:table.createdAt', 'تاريخ الإنشاء'),
        minWidth: 150,
        flex: 0.8,
        renderCell: (params) => (
          <Typography variant="body2">{formatDate(params.row.createdAt)}</Typography>
        ),
      },
      {
        field: 'size',
        headerName: t('backups:table.size', 'الحجم'),
        minWidth: 120,
        flex: 0.6,
        renderCell: (params) => (
          <Typography variant="body2">{formatSize(params.row.size)}</Typography>
        ),
      },
      {
        field: 'status',
        headerName: t('backups:table.status', 'الحالة'),
        minWidth: 120,
        flex: 0.6,
        renderCell: (params) => (
          <Chip
            label={getStatusText(params.row.status)}
            color={getStatusColor(params.row.status)}
            size="small"
          />
        ),
      },
      {
        field: 'isAutomatic',
        headerName: t('backups:table.type', 'النوع'),
        minWidth: 100,
        flex: 0.5,
        renderCell: (params) => (
          <Chip
            icon={params.row.isAutomatic ? <Schedule /> : <Add />}
            label={
              params.row.isAutomatic
                ? t('backups:type.automatic', 'تلقائي')
                : t('backups:type.manual', 'يدوي')
            }
            size="small"
            variant="outlined"
          />
        ),
      },
      {
        field: 'actions',
        headerName: t('common:actions.actions', 'الإجراءات'),
        minWidth: 200,
        flex: 1,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => (
          <Box display="flex" gap={1}>
            {params.row.status === 'completed' && (
              <>
                <Tooltip title={t('backups:actions.download', 'تحميل')}>
                  <IconButton
                    size="small"
                    onClick={() => backupsApi.downloadBackup(params.row._id, params.row.filename)}
                    color="primary"
                  >
                    <Download />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('backups:actions.restore', 'استعادة')}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedBackup(params.row);
                      setRestoreDialogOpen(true);
                    }}
                    color="warning"
                  >
                    <Restore />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <Tooltip title={t('backups:actions.delete', 'حذف')}>
              <IconButton
                size="small"
                onClick={() => {
                  setSelectedBackup(params.row);
                  setDeleteDialogOpen(true);
                }}
                color="error"
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [t]
  );

  // تحويل البيانات إلى صيغة DataTable
  const rows = useMemo(() => {
    if (!backupsData?.backups) return [];
    return backupsData.backups.map((backup) => ({
      id: backup._id,
      ...backup,
    }));
  }, [backupsData?.backups]);

  const handleCreateBackup = () => {
    createBackupMutation.mutate();
  };

  const handleRestore = () => {
    if (selectedBackup) {
      restoreBackupMutation.mutate(selectedBackup._id);
    }
  };

  const handleDelete = () => {
    if (selectedBackup) {
      deleteBackupMutation.mutate(selectedBackup._id);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          {t('backups:title', 'النسخ الاحتياطي')}
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => queryClient.invalidateQueries({ queryKey: ['backups'] })}
            disabled={backupsLoading}
          >
            {t('common:actions.refresh', 'تحديث')}
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateBackup}
            disabled={createBackupMutation.isPending}
          >
            {createBackupMutation.isPending ? (
              <CircularProgress size={20} />
            ) : (
              t('backups:actions.create', 'إنشاء نسخة احتياطية')
            )}
          </Button>
        </Box>
      </Box>

      {/* إحصائيات */}
      {statsLoading ? (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        stats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <BackupIcon color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      {t('backups:stats.total', 'إجمالي النسخ')}
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {formatNumber(stats?.total ?? 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <CheckCircle color="success" />
                    <Typography variant="body2" color="text.secondary">
                      {t('backups:stats.completed', 'مكتمل')}
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {formatNumber(stats?.completed ?? 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <ErrorIcon color="error" />
                    <Typography variant="body2" color="text.secondary">
                      {t('backups:stats.failed', 'فاشل')}
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {formatNumber(stats?.failed ?? 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <CloudUpload color="info" />
                    <Typography variant="body2" color="text.secondary">
                      {t('backups:stats.totalSize', 'الحجم الإجمالي')}
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {formatSize(stats?.totalSize ?? 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )
      )}

      {/* جدول النسخ الاحتياطية */}
      <Card>
        <CardContent>
          <DataTable
            title={t('backups:table.title', 'قائمة النسخ الاحتياطية')}
            columns={columns}
            rows={rows}
            loading={backupsLoading}
            paginationMode="server"
            paginationModel={{ page, pageSize: limit }}
            onPaginationModelChange={(model) => setPage(model.page)}
            rowCount={backupsData?.pagination.total || 0}
            height={600}
          />
        </CardContent>
      </Card>

      {/* Dialog للاستعادة */}
      <Dialog open={restoreDialogOpen} onClose={() => setRestoreDialogOpen(false)}>
        <DialogTitle>{t('backups:restore.title', 'استعادة قاعدة البيانات')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              'backups:restore.message',
              'هل أنت متأكد من استعادة قاعدة البيانات من هذه النسخة؟ سيتم حذف جميع البيانات الحالية.'
            )}
          </DialogContentText>
          {selectedBackup && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                {t('backups:restore.backupName', 'النسخة:')} {selectedBackup.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('backups:restore.size', 'الحجم:')} {formatSize(selectedBackup.size)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>
            {t('common:actions.cancel', 'إلغاء')}
          </Button>
          <Button
            onClick={handleRestore}
            color="warning"
            variant="contained"
            disabled={restoreBackupMutation.isPending}
          >
            {restoreBackupMutation.isPending
              ? t('common:actions.loading', 'جاري...')
              : t('backups:restore.confirm', 'تأكيد الاستعادة')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog للحذف */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('backups:delete.title', 'حذف نسخة احتياطية')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              'backups:delete.message',
              'هل أنت متأكد من حذف هذه النسخة الاحتياطية؟ لا يمكن التراجع عن هذا الإجراء.'
            )}
          </DialogContentText>
          {selectedBackup && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                {t('backups:delete.backupName', 'النسخة:')} {selectedBackup.name}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('common:actions.cancel', 'إلغاء')}
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleteBackupMutation.isPending}
          >
            {deleteBackupMutation.isPending
              ? t('common:actions.loading', 'جاري...')
              : t('backups:delete.confirm', 'تأكيد الحذف')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
