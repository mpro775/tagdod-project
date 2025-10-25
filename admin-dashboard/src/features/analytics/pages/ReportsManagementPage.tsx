import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Tabs,
  Tab,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Assessment as AssessmentIcon,
  PictureAsPdf as PictureAsPdfIcon,
  TableChart as TableChartIcon,
  Description as DescriptionIcon,
  FileDownload as FileDownloadIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  useAdvancedReports,
  useGenerateAdvancedReport,
  useExportReport,
  useDeleteReport,
  useArchiveReport,
} from '../hooks/useAnalytics';
import { ReportCategory, ReportFormat } from '../types/analytics.types';
import { DataExportDialog } from '../components/DataExportDialog';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const ReportsManagementPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [selectedTab, setSelectedTab] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<ReportCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const {
    data: reportsData,
    isLoading,
    error,
    refetch,
  } = useAdvancedReports({
    page: 1,
    limit: 50,
    search: searchTerm,
    category: filterCategory !== 'all' ? filterCategory : undefined,
  });

  const generateReport = useGenerateAdvancedReport();
  const exportReport = useExportReport();
  const deleteReport = useDeleteReport();
  const archiveReport = useArchiveReport();

  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    category: ReportCategory.SALES,
    format: ReportFormat.PDF,
    includeCharts: true,
    includeRawData: false,
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleCreateReport = async () => {
    try {
      await generateReport.mutateAsync({
        title: reportForm.title,
        description: reportForm.description,
        category: reportForm.category,
        format: reportForm.format,
        includeCharts: reportForm.includeCharts,
        includeRawData: reportForm.includeRawData,
      });
      setShowCreateDialog(false);
      setReportForm({
        title: '',
        description: '',
        category: ReportCategory.SALES,
        format: ReportFormat.PDF,
        includeCharts: true,
        includeRawData: false,
      });
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  const handleExportReport = async (reportId: string, format: ReportFormat) => {
    try {
      await exportReport.mutateAsync({
        reportId,
        data: { format, includeCharts: true, includeRawData: false },
      });
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التقرير؟')) {
      try {
        await deleteReport.mutateAsync(reportId);
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  const handleArchiveReport = async (reportId: string) => {
    try {
      await archiveReport.mutateAsync(reportId);
    } catch (error) {
      console.error('Error archiving report:', error);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <PictureAsPdfIcon />;
      case 'excel':
        return <TableChartIcon />;
      case 'csv':
        return <TableChartIcon />;
      case 'json':
        return <DescriptionIcon />;
      default:
        return <FileDownloadIcon />;
    }
  };

  const getCategoryColor = (category: ReportCategory) => {
    switch (category) {
      case ReportCategory.SALES:
        return 'primary';
      case ReportCategory.PRODUCTS:
        return 'secondary';
      case ReportCategory.CUSTOMERS:
        return 'success';
      case ReportCategory.INVENTORY:
        return 'warning';
      case ReportCategory.FINANCIAL:
        return 'error';
      case ReportCategory.MARKETING:
        return 'info';
      default:
        return 'default';
    }
  };

  const tabs = [
    { label: 'جميع التقارير', value: 0 },
    { label: 'المبيعات', value: 1, category: ReportCategory.SALES },
    { label: 'المنتجات', value: 2, category: ReportCategory.PRODUCTS },
    { label: 'العملاء', value: 3, category: ReportCategory.CUSTOMERS },
    { label: 'المخزون', value: 4, category: ReportCategory.INVENTORY },
    { label: 'المالية', value: 5, category: ReportCategory.FINANCIAL },
    { label: 'التسويق', value: 6, category: ReportCategory.MARKETING },
  ];

  const filteredReports =
    reportsData?.data?.filter((report) => {
      const matchesSearch =
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || report.category === filterCategory;
      return matchesSearch && matchesCategory;
    }) || [];

  const sortedReports = [...filteredReports].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  if (error) {
    return <Alert severity="error">حدث خطأ في تحميل التقارير. يرجى المحاولة مرة أخرى.</Alert>;
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              إدارة التقارير
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              إنشاء وإدارة التقارير التحليلية المتقدمة
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowCreateDialog(true)}
              sx={{
                backgroundColor: 'white',
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              تقرير جديد
            </Button>

            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => setShowExportDialog(true)}
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.8)',
                },
              }}
            >
              تصدير البيانات
            </Button>

            <Tooltip title="تحديث">
              <IconButton onClick={() => refetch()} sx={{ color: 'white' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Filters */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="البحث في التقارير..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>الفئة</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
              >
                <MenuItem value="all">جميع الفئات</MenuItem>
                {Object.values(ReportCategory).map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>ترتيب حسب</InputLabel>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                <MenuItem value="date">التاريخ</MenuItem>
                <MenuItem value="title">العنوان</MenuItem>
                <MenuItem value="category">الفئة</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SortIcon />}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} sx={{ minWidth: isMobile ? 120 : 160 }} />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={selectedTab} index={0}>
        {/* All Reports */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">جميع التقارير ({sortedReports.length})</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      icon={<AssessmentIcon />}
                      label={`إجمالي: ${reportsData?.data?.length || 0}`}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      icon={<ArchiveIcon />}
                      label={`مؤرشف: ${sortedReports.filter((r) => r.isArchived).length}`}
                      color="secondary"
                      variant="outlined"
                    />
                  </Box>
                </Box>

                {isLoading ? (
                  <Box>
                    {[...Array(5)].map((_, index) => (
                      <Skeleton key={index} variant="rectangular" height={100} sx={{ mb: 1 }} />
                    ))}
                  </Box>
                ) : (
                  <List>
                    {sortedReports.map((report) => (
                      <ListItem key={report.reportId} divider>
                        <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.main }}>
                          {getFormatIcon(report.fileUrls?.[0]?.split('.').pop() || 'pdf')}
                        </Avatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="h6">{report.title}</Typography>
                              {report.isArchived && (
                                <Chip label="مؤرشف" size="small" color="secondary" />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {report.description}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip
                                  label={report.category}
                                  size="small"
                                  color={getCategoryColor(report.category) as any}
                                  variant="outlined"
                                />
                                <Chip
                                  label={new Date(report.generatedAt).toLocaleDateString('ar-SA')}
                                  size="small"
                                  variant="outlined"
                                />
                                <Chip
                                  label={`بواسطة: ${report.generatedBy}`}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="عرض">
                              <IconButton size="small">
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="تحرير">
                              <IconButton size="small">
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="تصدير PDF">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleExportReport(report.reportId, ReportFormat.PDF)
                                }
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={report.isArchived ? 'إلغاء الأرشفة' : 'أرشفة'}>
                              <IconButton
                                size="small"
                                onClick={() => handleArchiveReport(report.reportId)}
                              >
                                {report.isArchived ? <UnarchiveIcon /> : <ArchiveIcon />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="حذف">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteReport(report.reportId)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Category-specific tabs */}
      {tabs.slice(1).map((tab) => (
        <TabPanel key={tab.value} value={selectedTab} index={tab.value}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    تقارير {tab.label}
                  </Typography>
                  <List>
                    {sortedReports
                      .filter((report) => report.category === tab.category)
                      .map((report) => (
                        <ListItem key={report.reportId} divider>
                          <ListItemText primary={report.title} secondary={report.description} />
                          <ListItemSecondaryAction>
                            <IconButton size="small">
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton size="small">
                              <DownloadIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      ))}

      {/* Create Report Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>إنشاء تقرير جديد</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="عنوان التقرير"
              value={reportForm.title}
              onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
              fullWidth
              required
            />

            <TextField
              label="وصف التقرير"
              value={reportForm.description}
              onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />

            <FormControl fullWidth>
              <InputLabel>فئة التقرير</InputLabel>
              <Select
                value={reportForm.category}
                onChange={(e) =>
                  setReportForm({ ...reportForm, category: e.target.value as ReportCategory })
                }
              >
                {Object.values(ReportCategory).map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>تنسيق التقرير</InputLabel>
              <Select
                value={reportForm.format}
                onChange={(e) =>
                  setReportForm({ ...reportForm, format: e.target.value as ReportFormat })
                }
              >
                {Object.values(ReportFormat).map((format) => (
                  <MenuItem key={format} value={format}>
                    {format.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={reportForm.includeCharts}
                  onChange={(e) =>
                    setReportForm({ ...reportForm, includeCharts: e.target.checked })
                  }
                />
              }
              label="تضمين الرسوم البيانية"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={reportForm.includeRawData}
                  onChange={(e) =>
                    setReportForm({ ...reportForm, includeRawData: e.target.checked })
                  }
                />
              }
              label="تضمين البيانات الأولية"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>إلغاء</Button>
          <Button
            onClick={handleCreateReport}
            variant="contained"
            disabled={!reportForm.title || generateReport.isPending}
          >
            {generateReport.isPending ? 'جاري الإنشاء...' : 'إنشاء التقرير'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <DataExportDialog open={showExportDialog} onClose={() => setShowExportDialog(false)} />
    </Box>
  );
};
