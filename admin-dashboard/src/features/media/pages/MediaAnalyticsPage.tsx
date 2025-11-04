import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Tab,
  Tabs,
  Paper,
  Button,
  Alert,
  Chip,
  LinearProgress,
  useTheme,
  Grid,
} from '@mui/material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import {
  CloudUpload,
  Storage,
  Image,
  VideoLibrary,
  Description,
  TrendingUp,
  Refresh,
  Assessment,
  Timeline,
  Folder,
} from '@mui/icons-material';
import { apiClient } from '@/core/api/client';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/components';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import {  Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface MediaOverview {
  totalFiles: number;
  totalSize: number;
  totalSizeFormatted: string;
  filesThisMonth: number;
  filesThisWeek: number;
  filesToday: number;
  averageFileSize: number;
  averageFileSizeFormatted: string;
  filesByType: {
    images: number;
    videos: number;
    documents: number;
    other: number;
  };
  sizeByType: {
    images: number;
    videos: number;
    documents: number;
    other: number;
  };
  storageUsagePercent: number;
}

interface StorageStats {
  total: number;
  totalFormatted: string;
  used: number;
  usedFormatted: string;
  available: number;
  availableFormatted: string;
  usagePercent: number;
  breakdown: {
    images: number;
    videos: number;
    documents: number;
    other: number;
  };
  breakdownFormatted: {
    images: string;
    videos: string;
    documents: string;
    other: string;
  };
}

interface FileInfo {
  _id: string;
  filename: string;
  size: number;
  url: string;
  mimeType: string;
  createdAt: string;
}

export const MediaAnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation('media');
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);

  const [overview, setOverview] = useState<MediaOverview | null>(null);
  const [storage, setStorage] = useState<StorageStats | null>(null);
  const [largestFiles, setLargestFiles] = useState<FileInfo[]>([]);
  const [recentFiles, setRecentFiles] = useState<FileInfo[]>([]);
  
  // Pagination state for DataTables
  const [largestFilesPagination, setLargestFilesPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [recentFilesPagination, setRecentFilesPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/media-analytics/overview');
      console.log('Overview Full Response:', response);
      console.log('Overview response.data:', response.data);
      console.log('Overview response.data.data:', response.data.data);
      // Handle nested data structure: response.data.data.data
      const data = response.data.data?.data || response.data.data;
      console.log('Overview Final Data:', data);
      setOverview(data);
    } catch (error) {
      console.error('Overview Error:', error);
      toast.error(t('messages.overviewError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchStorage = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/media-analytics/storage');
      console.log('Storage Full Response:', response);
      console.log('Storage response.data:', response.data);
      console.log('Storage response.data.data:', response.data.data);
      // Handle nested data structure: response.data.data.data
      const data = response.data.data?.data || response.data.data;
      console.log('Storage Final Data:', data);
      setStorage(data);
    } catch (error) {
      console.error('Storage Error:', error);
      toast.error(t('messages.storageError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchLargestFiles = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/media-analytics/largest-files', {
        params: { limit: 10 },
      });
      // Handle nested data structure: response.data.data.data
      const data = response.data.data?.data || response.data.data;
      setLargestFiles(data || []);
    } catch  {
      toast.error(t('messages.largestFilesError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentFiles = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/media-analytics/recent-uploads', {
        params: { limit: 10 },
      });
      // Handle nested data structure: response.data.data.data
      const data = response.data.data?.data || response.data.data;
      setRecentFiles(data || []);
    } catch  {
      toast.error(t('messages.recentFilesError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchStorage();
  }, []);

  useEffect(() => {
    if (selectedTab === 0) {
      fetchLargestFiles();
    } else if (selectedTab === 1) {
      fetchRecentFiles();
    }
  }, [selectedTab]);

  const handleRefresh = () => {
    fetchOverview();
    fetchStorage();
    if (selectedTab === 0) fetchLargestFiles();
    if (selectedTab === 1) fetchRecentFiles();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getTypeColor = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'primary';
    if (mimeType.startsWith('video/')) return 'secondary';
    if (mimeType.includes('pdf') || mimeType.includes('document')) return 'warning';
    return 'default';
  };

  const getTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image sx={{ fontSize: { xs: 18, sm: 24 } }} />;
    if (mimeType.startsWith('video/')) return <VideoLibrary sx={{ fontSize: { xs: 18, sm: 24 } }} />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <Description sx={{ fontSize: { xs: 18, sm: 24 } }} />;
    return <Folder sx={{ fontSize: { xs: 18, sm: 24 } }} />;
  };

  // Columns for DataTables
  const largestFilesColumns: GridColDef[] = [
    {
      field: 'filename',
      headerName: t('table.filename'),
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          {getTypeIcon(params.row.mimeType)}
          <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {params.row.filename}
          </Box>
        </Box>
      ),
    },
    {
      field: 'mimeType',
      headerName: t('table.type'),
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.row.mimeType} 
          size="small" 
          color={getTypeColor(params.row.mimeType)} 
          sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }} 
        />
      ),
    },
    {
      field: 'size',
      headerName: t('table.size'),
      width: 120,
      align: 'right',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold">
          {formatFileSize(params.row.size)}
        </Typography>
      ),
    },
    {
      field: 'createdAt',
      headerName: t('table.uploadDate'),
      width: 150,
      renderCell: (params) => new Date(params.row.createdAt).toLocaleDateString('ar-SA'),
    },
  ];

  const recentFilesColumns: GridColDef[] = [
    {
      field: 'filename',
      headerName: t('table.filename'),
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          {getTypeIcon(params.row.mimeType)}
          <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {params.row.filename}
          </Box>
        </Box>
      ),
    },
    {
      field: 'mimeType',
      headerName: t('table.type'),
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.row.mimeType} 
          size="small" 
          color={getTypeColor(params.row.mimeType)} 
          sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }} 
        />
      ),
    },
    {
      field: 'size',
      headerName: t('table.size'),
      width: 120,
      align: 'right',
      renderCell: (params) => formatFileSize(params.row.size),
    },
    {
      field: 'createdAt',
      headerName: t('table.uploadDate'),
      width: 150,
      renderCell: (params) => new Date(params.row.createdAt).toLocaleDateString('ar-SA'),
    },
  ];

  // Doughnut chart data for file types
  const fileTypesChartData = overview && overview.filesByType
    ? {
        labels: [t('types.images'), t('types.videos'), t('types.documents'), t('types.other')],
        datasets: [
          {
            data: [
              overview.filesByType.images || 0,
              overview.filesByType.videos || 0,
              overview.filesByType.documents || 0,
              overview.filesByType.other || 0,
            ],
            backgroundColor: [
              theme.palette.primary.main,
              theme.palette.secondary.main,
              theme.palette.warning.main,
              theme.palette.grey[400],
            ],
            borderWidth: 2,
            borderColor: '#fff',
          },
        ],
      }
    : null;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, sm: 4 }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            {t('analyticsPageTitle')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            {t('analyticsPageSubtitle')}
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh} disabled={loading} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          {t('refresh')}
        </Button>
      </Box>

      {/* KPI Cards */}
      {overview && (
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 4 } }}>
            <Grid component="div" size={{ xs: 6, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CloudUpload sx={{ fontSize: { xs: 30, sm: 40 }, color: theme.palette.primary.main, mr: { xs: 1, sm: 2 } }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                      {(overview.totalFiles || 0).toLocaleString('en-US')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                      {t('stats.totalFiles')}
                    </Typography>
                  </Box>
                </Box>
                <Chip label={`${overview.filesToday || 0} ${t('units.today')}`} size="small" color="success" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid component="div" size={{ xs: 6, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Storage sx={{ fontSize: { xs: 30, sm: 40 }, color: theme.palette.success.main, mr: { xs: 1, sm: 2 } }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.2rem', sm: '2.125rem' } }}>
                      {overview.totalSizeFormatted || '0 B'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                      {t('stats.totalSize')}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={`${overview.storageUsagePercent || 0}% ${t('stats.used')}`}
                  size="small"
                  color={(overview.storageUsagePercent || 0) > 80 ? 'error' : 'info'}
                  sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid component="div" size={{ xs: 6, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUp sx={{ fontSize: { xs: 30, sm: 40 }, color: theme.palette.warning.main, mr: { xs: 1, sm: 2 } }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                      {(overview.filesThisMonth || 0).toLocaleString('en-US')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                      {t('stats.filesThisMonth')}
                    </Typography>
                  </Box>
                </Box>
                <Chip label={`${overview.filesThisWeek || 0} ${t('units.thisWeek')}`} size="small" color="warning" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid component="div" size={{ xs: 6, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Assessment sx={{ fontSize: { xs: 30, sm: 40 }, color: theme.palette.info.main, mr: { xs: 1, sm: 2 } }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.2rem', sm: '2.125rem' } }}>
                      {overview.averageFileSizeFormatted || '0 B'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                      {t('stats.averageFileSize')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* File Types Distribution */}
      {overview && overview.filesByType && overview.sizeByType && (
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 4 } }}>
          <Grid component="div" size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  {t('stats.fileDistribution')}
                </Typography>
                <Box sx={{ height: { xs: 250, sm: 300 }, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {fileTypesChartData && <Doughnut data={fileTypesChartData} />}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid component="div" size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  {t('stats.detailsByType')}
                </Typography>
                <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mt: 1 }}>
                    <Grid component="div" size={{ xs: 6 }}>
                    <Box sx={{ p: { xs: 1, sm: 2 }, bgcolor: 'primary.light', borderRadius: 1, color: 'white' }}>
                      <Image sx={{ fontSize: { xs: 20, sm: 24 } }} />
                      <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{(overview.filesByType.images || 0).toLocaleString('en-US')}</Typography>
                      <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>{t('types.images')}</Typography>
                      <Typography variant="caption" display="block" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                        {formatFileSize(overview.sizeByType.images || 0)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid component="div" size={{ xs: 6 }}>
                    <Box sx={{ p: { xs: 1, sm: 2 }, bgcolor: 'secondary.light', borderRadius: 1, color: 'white' }}>
                      <VideoLibrary sx={{ fontSize: { xs: 20, sm: 24 } }} />
                      <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{(overview.filesByType.videos || 0).toLocaleString('en-US')}</Typography>
                      <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>{t('types.videos')}</Typography>
                      <Typography variant="caption" display="block" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                        {formatFileSize(overview.sizeByType.videos || 0)}
                      </Typography>
                    </Box>
                  </Grid>
                    <Grid component="div" size={{ xs: 6 }}>
                    <Box sx={{ p: { xs: 1, sm: 2 }, bgcolor: 'warning.light', borderRadius: 1, color: 'white' }}>
                      <Description sx={{ fontSize: { xs: 20, sm: 24 } }} />
                      <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{(overview.filesByType.documents || 0).toLocaleString('en-US')}</Typography>
                      <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>{t('types.documents')}</Typography>
                      <Typography variant="caption" display="block" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                        {formatFileSize(overview.sizeByType.documents || 0)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid component="div" size={{ xs: 6 }}>
                    <Box sx={{ p: { xs: 1, sm: 2 }, bgcolor: 'grey.400', borderRadius: 1, color: 'white' }}>
                      <Folder sx={{ fontSize: { xs: 20, sm: 24 } }} />
                      <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{(overview.filesByType.other || 0).toLocaleString('en-US')}</Typography>
                      <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>{t('types.other')}</Typography>
                      <Typography variant="caption" display="block" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                        {formatFileSize(overview.sizeByType.other || 0)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Storage Stats */}
      {storage && (
        <Card sx={{ mb: { xs: 2, sm: 4 } }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              {t('stats.storageStats')}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  {t('stats.used')}: {storage.usedFormatted || '0 B'} / {storage.totalFormatted || '0 B'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  {storage.usagePercent || 0}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={storage.usagePercent || 0}
                sx={{ height: 10, borderRadius: 5 }}
                color={(storage.usagePercent || 0) > 80 ? 'error' : (storage.usagePercent || 0) > 60 ? 'warning' : 'success'}
              />
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    {t('stats.available')}
                  </Typography>
                  <Typography variant="h6" color="success.main" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {storage.availableFormatted || '0 B'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    {t('stats.used')}
                  </Typography>
                  <Typography variant="h6" color="primary.main" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {storage.usedFormatted || '0 B'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: { xs: 2, sm: 3 } }}>
        <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)} variant="scrollable">
          <Tab icon={<Storage />} label={t('tabs.largestFiles')} iconPosition="start" />
          <Tab icon={<Timeline />} label={t('tabs.recentFiles')} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={selectedTab} index={0}>
        {largestFiles.length === 0 && !loading ? (
          <Alert severity="info">{t('stats.noData')}</Alert>
        ) : (
          <DataTable
            columns={largestFilesColumns}
            rows={largestFiles}
            loading={loading}
            paginationModel={largestFilesPagination}
            onPaginationModelChange={setLargestFilesPagination}
            getRowId={(row: any) => row._id}
            height={400}
          />
        )}
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        {recentFiles.length === 0 && !loading ? (
          <Alert severity="info">{t('stats.noData')}</Alert>
        ) : (
          <DataTable
            columns={recentFilesColumns}
            rows={recentFiles}
            loading={loading}
            paginationModel={recentFilesPagination}
            onPaginationModelChange={setRecentFilesPagination}
            getRowId={(row: any) => row._id}
            height={400}
          />
        )}
      </TabPanel>
    </Container>
  );
};

export default MediaAnalyticsPage;

