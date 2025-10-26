import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning,
  Info,
  Cancel,
  Download,
  Delete,
  CheckCircle,
  Search,
  FilterList,
  TrendingUp,
  TrendingDown,
  Remove,
} from '@mui/icons-material';
import { errorLogsApi } from '../api/errorLogsApi';
import type { ErrorLog, ErrorStatistics, ErrorTrend } from '../api/errorLogsApi';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { toast } from 'react-hot-toast';
import { formatRelativeTime } from '@/shared/utils/format';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

export function ErrorLogsPage() {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [statistics, setStatistics] = useState<ErrorStatistics | null>(null);
  const [trends, setTrends] = useState<ErrorTrend | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  
  // Filters
  const [level, setLevel] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsData, statsData, trendsData] = await Promise.all([
        errorLogsApi.getErrorLogs({ 
          level, 
          category, 
          search, 
          page: paginationModel.page + 1, 
          limit: paginationModel.pageSize 
        }),
        errorLogsApi.getStatistics(),
        errorLogsApi.getTrends(7),
      ]);

      setErrors(logsData.data);
      setStatistics(statsData);
      setTrends(trendsData);
    } catch {
      toast.error('فشل في تحميل سجلات الأخطاء');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, category, search, paginationModel.page, paginationModel.pageSize]);

  const handleResolveError = async (id: string) => {
    try {
      await errorLogsApi.resolveError(id);
      toast.success('تم حل الخطأ بنجاح');
      fetchData();
    } catch {
      toast.error('فشل في حل الخطأ');
    }
  };

  const handleDeleteError = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الخطأ؟')) return;

    try {
      await errorLogsApi.deleteError(id);
      toast.success('تم حذف الخطأ بنجاح');
      fetchData();
    } catch {
      toast.error('فشل في حذف الخطأ');
    }
  };

  const handleExport = async (format: 'json' | 'csv' | 'txt') => {
    try {
      const result = await errorLogsApi.exportLogs({ format });
      window.open(result.fileUrl, '_blank');
      toast.success('تم تصدير السجلات بنجاح');
    } catch {
      toast.error('فشل في تصدير السجلات');
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'fatal':
        return <Cancel sx={{ fontSize: 16, color: 'error.dark' }} />;
      case 'error':
        return <ErrorIcon sx={{ fontSize: 16, color: 'error.main' }} />;
      case 'warn':
        return <Warning sx={{ fontSize: 16, color: 'warning.main' }} />;
      case 'debug':
        return <Info sx={{ fontSize: 16, color: 'info.main' }} />;
      default:
        return <Info sx={{ fontSize: 16 }} />;
    }
  };

  const getLevelColor = (level: string): 'error' | 'warning' | 'info' | 'default' => {
    switch (level) {
      case 'fatal':
      case 'error':
        return 'error';
      case 'warn':
        return 'warning';
      case 'debug':
        return 'info';
      default:
        return 'default';
    }
  };

  const getLevelBadge = (level: string) => {
    return (
      <Chip
        icon={getLevelIcon(level)}
        label={level}
        color={getLevelColor(level)}
        size="small"
      />
    );
  };

  const getTrendIcon = () => {
    if (!trends) return null;
    
    switch (trends.trend) {
      case 'increasing':
        return <TrendingUp color="error" />;
      case 'decreasing':
        return <TrendingDown color="success" />;
      case 'stable':
        return <Remove color="action" />;
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'level',
      headerName: 'المستوى',
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => getLevelBadge(params.row.level),
    },
    {
      field: 'category',
      headerName: 'الفئة',
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => (
        <Chip label={params.row.category} variant="outlined" size="small" />
      ),
    },
    {
      field: 'message',
      headerName: 'الرسالة',
      minWidth: 300,
      flex: 2,
      renderCell: (params) => (
        <Box
          sx={{
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={params.row.message}
        >
          {params.row.message}
        </Box>
      ),
    },
    {
      field: 'endpoint',
      headerName: 'نقطة النهاية',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <Box
          component="code"
          sx={{
            fontSize: '0.75rem',
            bgcolor: 'action.hover',
            px: 1,
            py: 0.5,
            borderRadius: 1,
          }}
        >
          {params.row.endpoint || '-'}
        </Box>
      ),
    },
    {
      field: 'occurrences',
      headerName: 'التكرارات',
      minWidth: 100,
      flex: 0.6,
      renderCell: (params) => (
        <Chip label={params.row.occurrences} size="small" color="default" />
      ),
    },
    {
      field: 'lastOccurrence',
      headerName: 'آخر ظهور',
      minWidth: 150,
      flex: 1,
      valueFormatter: (value) => formatRelativeTime(value),
    },
    {
      field: 'resolved',
      headerName: 'محلول؟',
      minWidth: 80,
      flex: 0.5,
      renderCell: (params) => (
        params.row.resolved ? (
          <CheckCircle color="success" />
        ) : (
          <Cancel color="error" />
        )
      ),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      minWidth: 200,
      flex: 1.2,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="text"
            onClick={() => {
              setSelectedError(params.row);
              setShowDetailsDialog(true);
            }}
          >
            عرض
          </Button>
          {!params.row.resolved && (
            <Button
              size="small"
              variant="text"
              color="success"
              onClick={() => handleResolveError(params.row.id)}
            >
              حل
            </Button>
          )}
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteError(params.row.id)}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            إدارة الأخطاء والسجلات
          </Typography>
          <Typography variant="body1" color="text.secondary">
            تتبع وإدارة أخطاء النظام
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleExport('csv')}
            startIcon={<Download />}
          >
            تصدير CSV
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleExport('json')}
            startIcon={<Download />}
          >
            تصدير JSON
          </Button>
        </Box>
      </Box>

      {/* Statistics */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="medium">
                      إجمالي الأخطاء
                    </Typography>
                    <ErrorIcon color="action" />
                  </Box>
                }
              />
              <CardContent>
                <Typography variant="h4" fontWeight="bold">
                  {statistics.totalErrors.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="medium">
                      آخر 24 ساعة
                    </Typography>
                    <TrendingUp color="action" />
                  </Box>
                }
              />
              <CardContent>
                <Typography variant="h4" fontWeight="bold">
                  {statistics.last24Hours.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="medium">
                      معدل الأخطاء
                    </Typography>
                    {getTrendIcon()}
                  </Box>
                }
              />
              <CardContent>
                <Typography variant="h4" fontWeight="bold">
                  {statistics.errorRate.toFixed(2)}%
                </Typography>
                {trends && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {trends.trend === 'increasing' ? 'في ازدياد' : trends.trend === 'decreasing' ? 'في انخفاض' : 'مستقر'}
                    {' '}({trends.changePercentage > 0 ? '+' : ''}{trends.changePercentage.toFixed(1)}%)
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid component="div" size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="medium">
                      آخر 7 أيام
                    </Typography>
                    <Warning color="action" />
                  </Box>
                }
              />
              <CardContent>
                <Typography variant="h4" fontWeight="bold">
                  {statistics.last7Days.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title={
            <Typography variant="h6" fontWeight="bold">
              تصفية السجلات
            </Typography>
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid component="div" size={{ xs: 12, md: 3 }}>
              <TextField
                label="البحث"
                placeholder="ابحث في الرسائل..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid component="div" size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>المستوى</InputLabel>
                <Select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  label="المستوى"
                >
                  <MenuItem value="">جميع المستويات</MenuItem>
                  <MenuItem value="fatal">Fatal</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="warn">Warning</MenuItem>
                  <MenuItem value="debug">Debug</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid component="div" size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>الفئة</InputLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  label="الفئة"
                >
                  <MenuItem value="">جميع الفئات</MenuItem>
                  <MenuItem value="database">قاعدة البيانات</MenuItem>
                  <MenuItem value="api">API</MenuItem>
                  <MenuItem value="authentication">المصادقة</MenuItem>
                  <MenuItem value="validation">التحقق</MenuItem>
                  <MenuItem value="business_logic">منطق الأعمال</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid component="div" size={{ xs: 12, md: 3 }} sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setLevel('');
                  setCategory('');
                  setSearch('');
                }}
                fullWidth
                startIcon={<FilterList />}
              >
                إعادة تعيين
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader
          title={
            <Typography variant="h6" fontWeight="bold">
              سجلات الأخطاء
            </Typography>
          }
          subheader={
            <Typography variant="body2" color="text.secondary">
              عرض {errors.length} من إجمالي السجلات
            </Typography>
          }
        />
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <DataTable
              columns={columns}
              rows={errors}
              getRowId={(row: any) => row.id}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
            />
          )}
        </CardContent>
      </Card>

      {/* Error Details Dialog */}
      <Dialog 
        open={showDetailsDialog} 
        onClose={() => setShowDetailsDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>تفاصيل الخطأ</DialogTitle>
        <DialogContent>
          {selectedError && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
              <Grid container spacing={3}>
                <Grid component="div" size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    المستوى
                  </Typography>
                  <Box sx={{ mt: 1 }}>{getLevelBadge(selectedError.level)}</Box>
                </Grid>
                <Grid component="div" size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    الفئة
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip label={selectedError.category} variant="outlined" size="small" />
                  </Box>
                </Grid>
                <Grid component="div" size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    التكرارات
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                    {selectedError.occurrences}
                  </Typography>
                </Grid>
                <Grid component="div" size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    آخر ظهور
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {new Date(selectedError.lastOccurrence).toLocaleString('ar-YE')}
                  </Typography>
                </Grid>
              </Grid>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  الرسالة
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mt: 1, 
                    p: 2, 
                    bgcolor: 'action.hover', 
                    borderRadius: 1 
                  }}
                >
                  {selectedError.message}
                </Typography>
              </Box>

              {selectedError.endpoint && (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    نقطة النهاية
                  </Typography>
                  <Box
                    component="code"
                    sx={{
                      display: 'block',
                      mt: 1,
                      p: 2,
                      bgcolor: 'action.hover',
                      borderRadius: 1,
                      fontSize: '0.875rem',
                    }}
                  >
                    {selectedError.method} {selectedError.endpoint}
                  </Box>
                </Box>
              )}

              {selectedError.stack && (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Stack Trace
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      mt: 1,
                      p: 2,
                      bgcolor: 'action.hover',
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      overflow: 'auto',
                      maxHeight: 300,
                    }}
                  >
                    {selectedError.stack}
                  </Box>
                </Box>
              )}

              {selectedError.metadata && Object.keys(selectedError.metadata).length > 0 && (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    معلومات إضافية
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      mt: 1,
                      p: 2,
                      bgcolor: 'action.hover',
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      overflow: 'auto',
                      maxHeight: 200,
                    }}
                  >
                    {JSON.stringify(selectedError.metadata, null, 2)}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedError && !selectedError.resolved && (
            <Button 
              variant="contained"
              color="success"
              onClick={() => {
                handleResolveError(selectedError.id);
                setShowDetailsDialog(false);
              }}
              startIcon={<CheckCircle />}
            >
              حل الخطأ
            </Button>
          )}
          {selectedError && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                handleDeleteError(selectedError.id);
                setShowDetailsDialog(false);
              }}
              startIcon={<Delete />}
            >
              حذف
            </Button>
          )}
          <Button variant="outlined" onClick={() => setShowDetailsDialog(false)}>
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

