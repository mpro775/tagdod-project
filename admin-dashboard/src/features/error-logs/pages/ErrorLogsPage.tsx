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
import { useTranslation } from 'react-i18next';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

export function ErrorLogsPage() {
  const { t } = useTranslation('errorLogs');
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
      toast.error(t('messages.loadError'));
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
      toast.success(t('messages.resolveSuccess'));
      fetchData();
    } catch {
      toast.error(t('messages.resolveError'));
    }
  };

  const handleDeleteError = async (id: string) => {
    if (!confirm(t('messages.deleteConfirm'))) return;

    try {
      await errorLogsApi.deleteError(id);
      toast.success(t('messages.deleteSuccess'));
      fetchData();
    } catch {
      toast.error(t('messages.deleteError'));
    }
  };

  const handleExport = async (format: 'json' | 'csv' | 'txt') => {
    try {
      const result = await errorLogsApi.exportLogs({ format });
      window.open(result.fileUrl, '_blank');
      toast.success(t('messages.exportSuccess'));
    } catch {
      toast.error(t('messages.exportError'));
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
      headerName: t('table.level'),
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => getLevelBadge(params.row.level),
    },
    {
      field: 'category',
      headerName: t('table.category'),
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => (
        <Chip label={params.row.category} variant="outlined" size="small" />
      ),
    },
    {
      field: 'message',
      headerName: t('table.message'),
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
      headerName: t('table.endpoint'),
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
      headerName: t('table.occurrences'),
      minWidth: 100,
      flex: 0.6,
      renderCell: (params) => (
        <Chip label={params.row.occurrences} size="small" color="default" />
      ),
    },
    {
      field: 'lastOccurrence',
      headerName: t('table.lastOccurrence'),
      minWidth: 150,
      flex: 1,
      valueFormatter: (value) => formatRelativeTime(value),
    },
    {
      field: 'resolved',
      headerName: t('table.resolved'),
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
      headerName: t('table.actions'),
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
            {t('actions.view')}
          </Button>
          {!params.row.resolved && (
            <Button
              size="small"
              variant="text"
              color="success"
              onClick={() => handleResolveError(params.row.id)}
            >
              {t('actions.resolve')}
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
            {t('pageTitle')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('pageSubtitle')}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleExport('csv')}
            startIcon={<Download />}
          >
            {t('exportCsv')}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleExport('json')}
            startIcon={<Download />}
          >
            {t('exportJson')}
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
                      {t('statistics.totalErrors')}
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
                      {t('statistics.last24Hours')}
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
                      {t('statistics.errorRate')}
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
                    {trends.trend === 'increasing' ? t('statistics.increasing') : trends.trend === 'decreasing' ? t('statistics.decreasing') : t('statistics.stable')}
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
                      {t('statistics.last7Days')}
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
              {t('filters.title')}
            </Typography>
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid component="div" size={{ xs: 12, md: 3 }}>
              <TextField
                label={t('filters.search')}
                placeholder={t('filters.searchPlaceholder')}
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
                <InputLabel>{t('filters.level')}</InputLabel>
                <Select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  label={t('filters.level')}
                >
                  <MenuItem value="">{t('filters.allLevels')}</MenuItem>
                  <MenuItem value="fatal">{t('levels.fatal')}</MenuItem>
                  <MenuItem value="error">{t('levels.error')}</MenuItem>
                  <MenuItem value="warn">{t('levels.warn')}</MenuItem>
                  <MenuItem value="debug">{t('levels.debug')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid component="div" size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>{t('filters.category')}</InputLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  label={t('filters.category')}
                >
                  <MenuItem value="">{t('filters.allCategories')}</MenuItem>
                  <MenuItem value="database">{t('categories.database')}</MenuItem>
                  <MenuItem value="api">{t('categories.api')}</MenuItem>
                  <MenuItem value="authentication">{t('categories.authentication')}</MenuItem>
                  <MenuItem value="validation">{t('categories.validation')}</MenuItem>
                  <MenuItem value="business_logic">{t('categories.business_logic')}</MenuItem>
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
                {t('filters.reset')}
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
              {t('table.title')}
            </Typography>
          }
          subheader={
            <Typography variant="body2" color="text.secondary">
              {t('table.showing', { count: errors.length })}
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
        <DialogTitle>{t('details.title')}</DialogTitle>
        <DialogContent>
          {selectedError && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
              <Grid container spacing={3}>
                <Grid component="div" size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('details.level')}
                  </Typography>
                  <Box sx={{ mt: 1 }}>{getLevelBadge(selectedError.level)}</Box>
                </Grid>
                <Grid component="div" size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('details.category')}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip label={selectedError.category} variant="outlined" size="small" />
                  </Box>
                </Grid>
                <Grid component="div" size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('details.occurrences')}
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                    {selectedError.occurrences}
                  </Typography>
                </Grid>
                <Grid component="div" size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('details.lastOccurrence')}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {new Date(selectedError.lastOccurrence).toLocaleString('ar-YE')}
                  </Typography>
                </Grid>
              </Grid>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('details.message')}
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
                    {t('details.endpoint')}
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
                    {t('details.stackTrace')}
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
                    {t('details.additionalInfo')}
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
              {t('actions.resolveError')}
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
              {t('actions.delete')}
            </Button>
          )}
          <Button variant="outlined" onClick={() => setShowDetailsDialog(false)}>
            {t('actions.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

