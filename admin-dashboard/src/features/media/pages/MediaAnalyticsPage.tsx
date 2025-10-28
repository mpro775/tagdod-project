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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  useTheme,
  Grid,
} from '@mui/material';
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
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);

  const [overview, setOverview] = useState<MediaOverview | null>(null);
  const [storage, setStorage] = useState<StorageStats | null>(null);
  const [largestFiles, setLargestFiles] = useState<FileInfo[]>([]);
  const [recentFiles, setRecentFiles] = useState<FileInfo[]>([]);

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
      toast.error('فشل تحميل الإحصائيات العامة');
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
      toast.error('فشل تحميل إحصائيات التخزين');
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
      toast.error('فشل تحميل أكبر الملفات');
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
      toast.error('فشل تحميل الملفات الحديثة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchStorage();
  }, []);

  useEffect(() => {
    if (selectedTab === 1) {
      fetchLargestFiles();
    } else if (selectedTab === 2) {
      fetchRecentFiles();
    }
  }, [selectedTab]);

  const handleRefresh = () => {
    fetchOverview();
    fetchStorage();
    if (selectedTab === 1) fetchLargestFiles();
    if (selectedTab === 2) fetchRecentFiles();
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
    if (mimeType.startsWith('image/')) return <Image />;
    if (mimeType.startsWith('video/')) return <VideoLibrary />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <Description />;
    return <Folder />;
  };

  // Doughnut chart data for file types
  const fileTypesChartData = overview && overview.filesByType
    ? {
        labels: ['صور', 'فيديوهات', 'مستندات', 'أخرى'],
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
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            إحصائيات الوسائط والملفات
          </Typography>
          <Typography variant="body1" color="text.secondary">
            إحصائيات شاملة عن جميع الملفات والوسائط المرفوعة
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh} disabled={loading}>
          تحديث
        </Button>
      </Box>

      {/* KPI Cards */}
      {overview && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CloudUpload sx={{ fontSize: 40, color: theme.palette.primary.main, mr: 2 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {(overview.totalFiles || 0).toLocaleString('ar-SA')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي الملفات
                    </Typography>
                  </Box>
                </Box>
                <Chip label={`${overview.filesToday || 0} اليوم`} size="small" color="success" />
              </CardContent>
            </Card>
          </Grid>

          <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Storage sx={{ fontSize: 40, color: theme.palette.success.main, mr: 2 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {overview.totalSizeFormatted || '0 B'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي المساحة
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={`${overview.storageUsagePercent || 0}% مستخدم`}
                  size="small"
                  color={(overview.storageUsagePercent || 0) > 80 ? 'error' : 'info'}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUp sx={{ fontSize: 40, color: theme.palette.warning.main, mr: 2 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {overview.filesThisMonth || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ملفات هذا الشهر
                    </Typography>
                  </Box>
                </Box>
                <Chip label={`${overview.filesThisWeek || 0} هذا الأسبوع`} size="small" color="warning" />
              </CardContent>
            </Card>
          </Grid>

          <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Assessment sx={{ fontSize: 40, color: theme.palette.info.main, mr: 2 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {overview.averageFileSizeFormatted || '0 B'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      متوسط حجم الملف
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
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid component="div" size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  توزيع الملفات حسب النوع
                </Typography>
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {fileTypesChartData && <Doughnut data={fileTypesChartData} />}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid component="div" size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  تفاصيل حسب النوع
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid component="div" size={{ xs: 6 }}>
                    <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1, color: 'white' }}>
                      <Image />
                      <Typography variant="h6">{overview.filesByType.images || 0}</Typography>
                      <Typography variant="caption">صور</Typography>
                      <Typography variant="caption" display="block">
                        {formatFileSize(overview.sizeByType.images || 0)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid component="div" size={{ xs: 6 }}>
                    <Box sx={{ p: 2, bgcolor: 'secondary.light', borderRadius: 1, color: 'white' }}>
                      <VideoLibrary />
                      <Typography variant="h6">{overview.filesByType.videos || 0}</Typography>
                      <Typography variant="caption">فيديوهات</Typography>
                      <Typography variant="caption" display="block">
                        {formatFileSize(overview.sizeByType.videos || 0)}
                      </Typography>
                    </Box>
                  </Grid>
                    <Grid component="div" size={{ xs: 6 }}>
                    <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1, color: 'white' }}>
                      <Description />
                      <Typography variant="h6">{overview.filesByType.documents || 0}</Typography>
                      <Typography variant="caption">مستندات</Typography>
                      <Typography variant="caption" display="block">
                        {formatFileSize(overview.sizeByType.documents || 0)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid component="div" size={{ xs: 6 }}>
                    <Box sx={{ p: 2, bgcolor: 'grey.400', borderRadius: 1, color: 'white' }}>
                      <Folder />
                      <Typography variant="h6">{overview.filesByType.other || 0}</Typography>
                      <Typography variant="caption">أخرى</Typography>
                      <Typography variant="caption" display="block">
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
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              إحصائيات التخزين
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  المستخدم: {storage.usedFormatted || '0 B'} / {storage.totalFormatted || '0 B'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
                  <Typography variant="caption" color="text.secondary">
                    المتاح
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {storage.availableFormatted || '0 B'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    المستخدم
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    {storage.usedFormatted || '0 B'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)} variant="scrollable">
          <Tab icon={<Assessment />} label="نظرة عامة" iconPosition="start" />
          <Tab icon={<Storage />} label="أكبر الملفات" iconPosition="start" />
          <Tab icon={<Timeline />} label="الملفات الحديثة" iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={selectedTab} index={0}>
        <Alert severity="info">نظرة عامة على الإحصائيات معروضة أعلاه</Alert>
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : largestFiles.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>اسم الملف</TableCell>
                  <TableCell>النوع</TableCell>
                  <TableCell align="right">الحجم</TableCell>
                  <TableCell>تاريخ الرفع</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {largestFiles.map((file) => (
                  <TableRow key={file._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTypeIcon(file.mimeType)}
                        {file.filename}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={file.mimeType} size="small" color={getTypeColor(file.mimeType)} />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatFileSize(file.size)}
                    </TableCell>
                    <TableCell>{new Date(file.createdAt).toLocaleDateString('ar-SA')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">لا توجد بيانات متاحة</Alert>
        )}
      </TabPanel>

      <TabPanel value={selectedTab} index={2}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : recentFiles.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>اسم الملف</TableCell>
                  <TableCell>النوع</TableCell>
                  <TableCell align="right">الحجم</TableCell>
                  <TableCell>تاريخ الرفع</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentFiles.map((file) => (
                  <TableRow key={file._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTypeIcon(file.mimeType)}
                        {file.filename}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={file.mimeType} size="small" color={getTypeColor(file.mimeType)} />
                    </TableCell>
                    <TableCell align="right">{formatFileSize(file.size)}</TableCell>
                    <TableCell>{new Date(file.createdAt).toLocaleDateString('ar-SA')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">لا توجد بيانات متاحة</Alert>
        )}
      </TabPanel>
    </Container>
  );
};

export default MediaAnalyticsPage;

