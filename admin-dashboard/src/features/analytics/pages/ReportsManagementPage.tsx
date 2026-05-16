import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Stack,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { getCardPadding, getCardSpacing } from '../utils/responsive';
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Archive as ArchiveIcon,
  Assessment as AssessmentIcon,
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
import {
  ReportCategory,
  ReportFormat,
  GenerateAdvancedReportDto,
  ReportPriority,
  ReportStatus,
} from '../types/analytics.types';
import { DataExportDialog, ReportScheduleForm, ReportCard } from '../components';
import { EmptyAnalyticsState } from '../components/EmptyAnalyticsState';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { withAnalyticsErrorBoundary } from '../components/AnalyticsErrorBoundary';
import { ConfirmDialog } from '@/shared/components';

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
      {value === index && <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

export const ReportsManagementPage = withAnalyticsErrorBoundary(function ReportsManagementPage() {
  const theme = useTheme();
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();
  const cardPadding = getCardPadding(breakpoint);
  const cardSpacing = getCardSpacing(breakpoint);
  const { confirmDialog, dialogProps } = useConfirmDialog();
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<ReportCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ReportStatus | 'all'>('all');
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

  const [reportForm, setReportForm] = useState<Partial<GenerateAdvancedReportDto>>({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    category: ReportCategory.SALES,
    priority: ReportPriority.MEDIUM,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    exportSettings: {
      formats: [ReportFormat.PDF],
      includeCharts: true,
      includeRawData: false,
    },
    compareWithPrevious: false,
    includeRecommendations: true,
    generateCharts: true,
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleCreateReport = async () => {
    if (
      !reportForm.title ||
      !reportForm.titleEn ||
      !reportForm.startDate ||
      !reportForm.endDate ||
      !reportForm.category
    ) {
      return;
    }

    try {
      const reportData: GenerateAdvancedReportDto = {
        title: reportForm.title,
        titleEn: reportForm.titleEn,
        description: reportForm.description,
        descriptionEn: reportForm.descriptionEn,
        category: reportForm.category,
        priority: reportForm.priority || ReportPriority.MEDIUM,
        startDate: reportForm.startDate,
        endDate: reportForm.endDate,
        filters: reportForm.filters,
        exportSettings: reportForm.exportSettings,
        compareWithPrevious: reportForm.compareWithPrevious || false,
        includeRecommendations: reportForm.includeRecommendations !== false,
        generateCharts: reportForm.generateCharts !== false,
      };

      await generateReport.mutateAsync(reportData);
      setShowCreateDialog(false);
      setReportForm({
        title: '',
        titleEn: '',
        description: '',
        descriptionEn: '',
        category: ReportCategory.SALES,
        priority: ReportPriority.MEDIUM,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        exportSettings: {
          formats: [ReportFormat.PDF],
          includeCharts: true,
          includeRawData: false,
        },
        compareWithPrevious: false,
        includeRecommendations: true,
        generateCharts: true,
      });
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  const handleExportReport = async (reportId: string, format: ReportFormat) => {
    if (!reportId) {
      toast.error(t('reportsManagement.noReportId', 'لم يتم العثور على معرف التقرير'));
      return;
    }
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
    if (!reportId) return;
    const confirmed = await confirmDialog({
      title: t('reportsManagement.deleteTitle', 'تأكيد الحذف'),
      message: t('reportsManagement.deleteConfirm', 'هل أنت متأكد من حذف هذا التقرير؟'),
      type: 'warning',
      confirmColor: 'error',
    });
    if (confirmed) {
      try {
        await deleteReport.mutateAsync(reportId);
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  const handleArchiveReport = async (reportId: string) => {
    if (!reportId) return;
    try {
      await archiveReport.mutateAsync(reportId);
    } catch (error) {
      console.error('Error archiving report:', error);
    }
  };

  const handleViewReport = (reportId: string) => {
    if (!reportId) return;
    navigate(`/analytics/reports/${reportId}`);
  };

  const tabs = [
    { label: t('reportsManagement.tabs.all', 'الكل'), value: 0 },
    { label: t('reportsManagement.tabs.sales', 'المبيعات'), value: 1, category: ReportCategory.SALES },
    { label: t('reportsManagement.tabs.products', 'المنتجات'), value: 2, category: ReportCategory.PRODUCTS },
    { label: t('reportsManagement.tabs.customers', 'العملاء'), value: 3, category: ReportCategory.CUSTOMERS },
    { label: t('reportsManagement.tabs.inventory', 'المخزون'), value: 4, category: ReportCategory.INVENTORY },
    { label: t('reportsManagement.tabs.financial', 'المالية'), value: 5, category: ReportCategory.FINANCIAL },
    { label: t('reportsManagement.tabs.marketing', 'التسويق'), value: 6, category: ReportCategory.MARKETING },
  ];

  const reports = reportsData?.data ?? [];
  const meta = reportsData?.meta;

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      (report.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      ((report.description || '').toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || report.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.generatedAt || a.createdAt || 0).getTime() - new Date(b.generatedAt || b.createdAt || 0).getTime();
        break;
      case 'title':
        comparison = (a.title || '').localeCompare(b.title || '');
        break;
      case 'category':
        comparison = (a.category || '').localeCompare(b.category || '');
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  if (error) {
    return (
      <Box sx={{ width: '100%', px: { xs: 1, sm: 0 } }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            {t('reportsManagement.title', 'إدارة التقارير')}
          </Typography>
        </Paper>
        <Alert severity="error" sx={{ m: { xs: 1, sm: 2 } }}>
          {t('reportsManagement.loadError', 'تعذر تحميل التقارير')}
        </Alert>
        <Button startIcon={<RefreshIcon />} onClick={() => refetch()} sx={{ m: 2 }}>
          {t('reportsManagement.retry', 'إعادة المحاولة')}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', px: { xs: 1, sm: 0 } }}>
      {/* Header */}
      <Paper
        elevation={1}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: { xs: 2, sm: 3 },
          background:
            theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
        }}
      >
        <Stack
          direction={breakpoint.isXs ? 'column' : 'row'}
          spacing={breakpoint.isXs ? 1.5 : 0}
          sx={{
            justifyContent: 'space-between',
            alignItems: breakpoint.isXs ? 'flex-start' : 'center',
            gap: { xs: 1.5, sm: 2 },
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography
              variant={breakpoint.isXs ? 'h5' : 'h4'}
              component="h1"
              gutterBottom
              sx={{
                fontSize: breakpoint.isXs ? '1.5rem' : undefined,
                fontWeight: 'bold',
              }}
            >
              {t('reportsManagement.title', 'إدارة التقارير')}
            </Typography>
            <Typography
              variant={breakpoint.isXs ? 'body2' : 'body1'}
              sx={{
                opacity: 0.9,
                fontSize: breakpoint.isXs ? '0.875rem' : undefined,
              }}
            >
              {t('reportsManagement.subtitle', 'إنشاء وإدارة التقارير المتقدمة')}
            </Typography>
          </Box>

          <Stack
            direction={breakpoint.isXs ? 'column' : 'row'}
            spacing={1}
            sx={{ width: breakpoint.isXs ? '100%' : 'auto' }}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: breakpoint.isXs ? 18 : undefined }} />}
              onClick={() => setShowCreateDialog(true)}
              size={breakpoint.isXs ? 'medium' : 'medium'}
              fullWidth={breakpoint.isXs}
              sx={{
                backgroundColor: 'white',
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
                fontSize: breakpoint.isXs ? '0.875rem' : undefined,
              }}
            >
              {t('reportsManagement.newReport', 'تقرير جديد')}
            </Button>

            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon sx={{ fontSize: breakpoint.isXs ? 18 : undefined }} />}
              onClick={() => setShowExportDialog(true)}
              size={breakpoint.isXs ? 'medium' : 'medium'}
              fullWidth={breakpoint.isXs}
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.8)',
                },
                fontSize: breakpoint.isXs ? '0.875rem' : undefined,
              }}
            >
              {t('reportsManagement.exportData', 'تصدير')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<AssessmentIcon sx={{ fontSize: breakpoint.isXs ? 18 : undefined }} />}
              onClick={() => setShowScheduleDialog(true)}
              size={breakpoint.isXs ? 'medium' : 'medium'}
              fullWidth={breakpoint.isXs}
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.8)',
                },
                fontSize: breakpoint.isXs ? '0.875rem' : undefined,
              }}
            >
              {t('reportsManagement.scheduleReport', 'جدولة')}
            </Button>

            <Tooltip title={t('reportsManagement.refresh', 'تحديث')}>
              <IconButton
                onClick={() => refetch()}
                sx={{
                  color: 'white',
                  alignSelf: breakpoint.isXs ? 'flex-start' : 'center',
                }}
              >
                <RefreshIcon sx={{ fontSize: breakpoint.isXs ? 20 : undefined }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Filters */}
      <Paper elevation={1} sx={{ p: cardPadding, mb: cardSpacing }}>
        <Grid container spacing={breakpoint.isXs ? 1.5 : 2} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              placeholder={t('reportsManagement.searchPlaceholder', 'بحث في التقارير...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size={breakpoint.isXs ? 'medium' : 'medium'}
              InputProps={{
                startAdornment: (
                  <SearchIcon
                    sx={{
                      mr: 1,
                      color: 'text.secondary',
                      fontSize: breakpoint.isXs ? 20 : undefined,
                    }}
                  />
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size={breakpoint.isXs ? 'medium' : 'medium'}>
              <InputLabel>{t('reportsManagement.categoryLabel', 'التصنيف')}</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                label={t('reportsManagement.categoryLabel', 'التصنيف')}
              >
                <MenuItem value="all">{t('reportsManagement.allCategories', 'الكل')}</MenuItem>
                {Object.values(ReportCategory).map((category) => (
                  <MenuItem key={category} value={category}>
                    {t(`reports.category.${category}`, category)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size={breakpoint.isXs ? 'medium' : 'medium'}>
              <InputLabel>{t('reportsManagement.statusLabel', 'الحالة')}</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                label={t('reportsManagement.statusLabel', 'الحالة')}
              >
                <MenuItem value="all">{t('reportsManagement.allStatuses', 'الكل')}</MenuItem>
                {Object.values(ReportStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {t(`reports.status.${status}`, status)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size={breakpoint.isXs ? 'medium' : 'medium'}>
              <InputLabel>{t('reportsManagement.sortBy', 'الترتيب')}</InputLabel>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} label={t('reportsManagement.sortBy', 'الترتيب')}>
                <MenuItem value="date">{t('reportsManagement.sortByDate', 'التاريخ')}</MenuItem>
                <MenuItem value="title">{t('reportsManagement.sortByTitle', 'العنوان')}</MenuItem>
                <MenuItem value="category">{t('reportsManagement.sortByCategory', 'التصنيف')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SortIcon sx={{ fontSize: breakpoint.isXs ? 18 : undefined }} />}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              size={breakpoint.isXs ? 'medium' : 'medium'}
              sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
            >
              {sortOrder === 'asc'
                ? t('reportsManagement.sortAscending', 'تصاعدي')
                : t('reportsManagement.sortDescending', 'تنازلي')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Chips */}
      <Paper elevation={1} sx={{ p: cardPadding, mb: cardSpacing }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Chip
            icon={<AssessmentIcon sx={{ fontSize: breakpoint.isXs ? 16 : undefined }} />}
            label={`${t('reportsManagement.total', 'الإجمالي')}: ${meta?.total || reports.length || 0}`}
            color="primary"
            variant="outlined"
            size={breakpoint.isXs ? 'small' : 'medium'}
          />
          <Chip
            icon={<ArchiveIcon sx={{ fontSize: breakpoint.isXs ? 16 : undefined }} />}
            label={`${t('reportsManagement.archived', 'مؤرشف')}: ${sortedReports.filter((r) => r.isArchived).length}`}
            color="secondary"
            variant="outlined"
            size={breakpoint.isXs ? 'small' : 'medium'}
          />
          <Chip
            label={`${t('reportsManagement.completed', 'مكتمل')}: ${sortedReports.filter((r) => r.status === ReportStatus.COMPLETED).length}`}
            color="success"
            variant="outlined"
            size={breakpoint.isXs ? 'small' : 'medium'}
          />
          <Chip
            label={`${t('reportsManagement.pending', 'معلق')}: ${sortedReports.filter((r) => r.status === ReportStatus.PENDING).length}`}
            color="warning"
            variant="outlined"
            size={breakpoint.isXs ? 'small' : 'medium'}
          />
        </Stack>
      </Paper>

      {/* Tabs */}
      <Paper
        elevation={1}
        sx={{
          mb: { xs: 2, sm: 3 },
          backgroundColor:
            theme.palette.mode === 'dark' ? theme.palette.background.paper : undefined,
        }}
      >
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant={breakpoint.isXs ? 'scrollable' : 'standard'}
          scrollButtons={breakpoint.isXs ? 'auto' : false}
          sx={{
            '& .MuiTab-root': {
              minWidth: breakpoint.isXs ? 100 : 160,
              fontSize: breakpoint.isXs ? '0.75rem' : undefined,
              px: { xs: 1, sm: 2 },
              color: theme.palette.mode === 'dark' ? theme.palette.text.primary : undefined,
              '&.Mui-selected': {
                color: theme.palette.primary.main,
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.primary.main,
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={selectedTab} index={0}>
        {/* All Reports */}
        <Grid container spacing={breakpoint.isXs ? 2 : 3}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent sx={{ p: cardPadding }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: breakpoint.isXs ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: breakpoint.isXs ? 'flex-start' : 'center',
                    mb: 2,
                    gap: 1.5,
                  }}
                >
                  <Typography
                    variant={breakpoint.isXs ? 'h6' : 'h6'}
                    sx={{ fontSize: breakpoint.isXs ? '1.125rem' : undefined }}
                  >
                    {t('reportsManagement.allReports', 'جميع التقارير')} ({sortedReports.length})
                  </Typography>
                </Box>

                {isLoading ? (
                  <Box>
                    {[...Array(5)].map((_, index) => (
                      <Skeleton
                        key={index}
                        variant="rectangular"
                        height={breakpoint.isXs ? 80 : 100}
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Box>
                ) : sortedReports.length > 0 ? (
                  <Grid container spacing={2}>
                    {sortedReports.map((report) => {
                      const reportKey = report.reportId ?? report.id;
                      if (!reportKey) return null;
                      return (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={reportKey}>
                          <ReportCard
                            report={report as any}
                            onView={handleViewReport}
                            onDownload={(reportId: string) => handleExportReport(reportId, ReportFormat.PDF)}
                            onArchive={handleArchiveReport}
                            onDelete={handleDeleteReport}
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                ) : (
                  <EmptyAnalyticsState
                    title={t('reportsManagement.empty.title', 'لا توجد تقارير')}
                    description={t('reportsManagement.empty.description', 'لم يتم إنشاء أي تقرير بعد. يمكنك إنشاء تقرير جديد من الزر بالأعلى.')}
                    actionLabel={t('reportsManagement.newReport', 'تقرير جديد')}
                    onAction={() => setShowCreateDialog(true)}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Category-specific tabs */}
      {tabs.slice(1).map((tab) => (
        <TabPanel key={tab.value} value={selectedTab} index={tab.value}>
          <Grid container spacing={breakpoint.isXs ? 2 : 3}>
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent sx={{ p: cardPadding }}>
                  <Typography
                    variant={breakpoint.isXs ? 'h6' : 'h6'}
                    gutterBottom
                    sx={{ fontSize: breakpoint.isXs ? '1.125rem' : undefined }}
                  >
                    {t('reportsManagement.reportsCategory', { category: tab.label })}
                  </Typography>
                  {sortedReports.filter((report) => report.category === tab.category).length === 0 ? (
                    <EmptyAnalyticsState
                      title={t('reportsManagement.emptyCategory', 'لا توجد تقارير في هذا التصنيف')}
                      description={t('reportsManagement.emptyCategoryDesc', 'لم يتم إنشاء أي تقرير في هذا التصنيف.')}
                    />
                  ) : (
                    <List>
                      {sortedReports
                        .filter((report) => report.category === tab.category)
                        .map((report) => {
                          const reportKey = report.reportId ?? report.id;
                          if (!reportKey) return null;
                          return (
                            <ListItem key={reportKey} divider>
                              <ListItemText
                                primary={report.title}
                                secondary={report.description}
                                primaryTypographyProps={{
                                  sx: { fontSize: breakpoint.isXs ? '0.9375rem' : undefined },
                                }}
                                secondaryTypographyProps={{
                                  sx: { fontSize: breakpoint.isXs ? '0.8125rem' : undefined },
                                }}
                              />
                              <ListItemSecondaryAction>
                                <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
                                  <Tooltip title={t('actions.view', 'عرض')}>
                                    <span>
                                      <IconButton
                                        size={breakpoint.isXs ? 'small' : 'medium'}
                                        onClick={() => handleViewReport(reportKey)}
                                      >
                                        <VisibilityIcon sx={{ fontSize: breakpoint.isXs ? 18 : 20 }} />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                  <Tooltip title={t('actions.download', 'تحميل')}>
                                    <span>
                                      <IconButton
                                        size={breakpoint.isXs ? 'small' : 'medium'}
                                        onClick={() => handleExportReport(reportKey, ReportFormat.PDF)}
                                        disabled={report.status !== ReportStatus.COMPLETED}
                                      >
                                        <DownloadIcon sx={{ fontSize: breakpoint.isXs ? 18 : 20 }} />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </Box>
                              </ListItemSecondaryAction>
                            </ListItem>
                          );
                        })}
                    </List>
                  )}
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
        fullScreen={breakpoint.isXs}
      >
        <DialogTitle sx={{ fontSize: breakpoint.isXs ? '1.125rem' : undefined }}>
          {t('reportsManagement.createDialog.title', 'إنشاء تقرير جديد')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Grid container spacing={breakpoint.isXs ? 1.5 : 2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label={t('reportsManagement.createDialog.reportTitle', 'عنوان التقرير')}
                  value={reportForm.title || ''}
                  onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                  fullWidth
                  required
                  size={breakpoint.isXs ? 'medium' : 'medium'}
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: breakpoint.isXs ? '0.875rem' : undefined,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label={t('reportsManagement.createDialog.reportTitleEn', 'العنوان بالإنجليزية')}
                  value={reportForm.titleEn || ''}
                  onChange={(e) => setReportForm({ ...reportForm, titleEn: e.target.value })}
                  fullWidth
                  required
                  size={breakpoint.isXs ? 'medium' : 'medium'}
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: breakpoint.isXs ? '0.875rem' : undefined,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label={t('reportsManagement.createDialog.reportDescription', 'الوصف')}
                  value={reportForm.description || ''}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                  size={breakpoint.isXs ? 'medium' : 'medium'}
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: breakpoint.isXs ? '0.875rem' : undefined,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size={breakpoint.isXs ? 'medium' : 'medium'}>
                  <InputLabel>{t('reportsManagement.createDialog.reportCategory', 'التصنيف')}</InputLabel>
                  <Select
                    value={reportForm.category || ReportCategory.SALES}
                    onChange={(e) =>
                      setReportForm({ ...reportForm, category: e.target.value as ReportCategory })
                    }
                    label={t('reportsManagement.createDialog.reportCategory', 'التصنيف')}
                  >
                    {Object.values(ReportCategory).map((category) => (
                      <MenuItem key={category} value={category}>
                        {t(`reports.category.${category}`, category)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size={breakpoint.isXs ? 'medium' : 'medium'}>
                  <InputLabel>{t('reportsManagement.createDialog.priority', 'الأولوية')}</InputLabel>
                  <Select
                    value={reportForm.priority || ReportPriority.MEDIUM}
                    onChange={(e) =>
                      setReportForm({ ...reportForm, priority: e.target.value as ReportPriority })
                    }
                    label={t('reportsManagement.createDialog.priority', 'الأولوية')}
                  >
                    {Object.values(ReportPriority).map((priority) => (
                      <MenuItem key={priority} value={priority}>
                        {t(`reports.priority.${priority}`, priority)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t('reportsManagement.createDialog.startDate', 'تاريخ البدء')}
                  type="date"
                  value={reportForm.startDate || ''}
                  onChange={(e) => setReportForm({ ...reportForm, startDate: e.target.value })}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  size={breakpoint.isXs ? 'medium' : 'medium'}
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: breakpoint.isXs ? '0.875rem' : undefined,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t('reportsManagement.createDialog.endDate', 'تاريخ الانتهاء')}
                  type="date"
                  value={reportForm.endDate || ''}
                  onChange={(e) => setReportForm({ ...reportForm, endDate: e.target.value })}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  size={breakpoint.isXs ? 'medium' : 'medium'}
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: breakpoint.isXs ? '0.875rem' : undefined,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth size={breakpoint.isXs ? 'medium' : 'medium'}>
                  <InputLabel>{t('reportsManagement.createDialog.reportFormat', 'صيغة التقرير')}</InputLabel>
                  <Select
                    multiple
                    value={reportForm.exportSettings?.formats || [ReportFormat.PDF]}
                    onChange={(e) =>
                      setReportForm({
                        ...reportForm,
                        exportSettings: {
                          formats: e.target.value as ReportFormat[],
                          includeCharts:
                            reportForm.exportSettings?.includeCharts !== undefined
                              ? reportForm.exportSettings.includeCharts
                              : true,
                          includeRawData:
                            reportForm.exportSettings?.includeRawData !== undefined
                              ? reportForm.exportSettings.includeRawData
                              : false,
                          ...(reportForm.exportSettings?.customBranding && {
                            customBranding: reportForm.exportSettings.customBranding,
                          }),
                        },
                      })
                    }
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as ReportFormat[]).map((value) => (
                          <Chip
                            key={value}
                            label={value.toUpperCase()}
                            size="small"
                            sx={{ fontSize: breakpoint.isXs ? '0.7rem' : undefined }}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {Object.values(ReportFormat).map((format) => (
                      <MenuItem key={format} value={format}>
                        {format.toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={reportForm.exportSettings?.includeCharts || false}
                      onChange={(e) =>
                        setReportForm({
                          ...reportForm,
                          exportSettings: {
                            formats: reportForm.exportSettings?.formats || [ReportFormat.PDF],
                            includeCharts: e.target.checked,
                            includeRawData:
                              reportForm.exportSettings?.includeRawData !== undefined
                                ? reportForm.exportSettings.includeRawData
                                : false,
                            ...(reportForm.exportSettings?.customBranding && {
                              customBranding: reportForm.exportSettings.customBranding,
                            }),
                          },
                        })
                      }
                    />
                  }
                  label={t('export.filters.includeCharts', 'تضمين الرسوم البيانية')}
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontSize: breakpoint.isXs ? '0.875rem' : undefined,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={reportForm.exportSettings?.includeRawData || false}
                      onChange={(e) =>
                        setReportForm({
                          ...reportForm,
                          exportSettings: {
                            formats: reportForm.exportSettings?.formats || [ReportFormat.PDF],
                            includeCharts:
                              reportForm.exportSettings?.includeCharts !== undefined
                                ? reportForm.exportSettings.includeCharts
                                : true,
                            includeRawData: e.target.checked,
                            ...(reportForm.exportSettings?.customBranding && {
                              customBranding: reportForm.exportSettings.customBranding,
                            }),
                          },
                        })
                      }
                    />
                  }
                  label={t('export.filters.includeRawData', 'تضمين البيانات الخام')}
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontSize: breakpoint.isXs ? '0.875rem' : undefined,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={reportForm.compareWithPrevious || false}
                      onChange={(e) =>
                        setReportForm({ ...reportForm, compareWithPrevious: e.target.checked })
                      }
                    />
                  }
                  label={t('reportsManagement.createDialog.compareWithPrevious', 'مقارنة مع الفترة السابقة')}
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontSize: breakpoint.isXs ? '0.875rem' : undefined,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={reportForm.includeRecommendations !== false}
                      onChange={(e) =>
                        setReportForm({ ...reportForm, includeRecommendations: e.target.checked })
                      }
                    />
                  }
                  label={t('reportsManagement.createDialog.includeRecommendations', 'تضمين التوصيات')}
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontSize: breakpoint.isXs ? '0.875rem' : undefined,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={reportForm.generateCharts !== false}
                      onChange={(e) =>
                        setReportForm({ ...reportForm, generateCharts: e.target.checked })
                      }
                    />
                  }
                  label={t('reportsManagement.createDialog.generateCharts', 'إنشاء الرسوم البيانية')}
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontSize: breakpoint.isXs ? '0.875rem' : undefined,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
          <Button
            onClick={() => setShowCreateDialog(false)}
            size={breakpoint.isXs ? 'medium' : 'medium'}
            sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
          >
            {t('reportsManagement.createDialog.cancel', 'إلغاء')}
          </Button>
          <Button
            onClick={handleCreateReport}
            variant="contained"
            disabled={
              !reportForm.title ||
              !reportForm.titleEn ||
              !reportForm.startDate ||
              !reportForm.endDate ||
              generateReport.isPending
            }
            size={breakpoint.isXs ? 'medium' : 'medium'}
            sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
          >
            {generateReport.isPending
              ? t('reportsManagement.createDialog.creating', 'جاري الإنشاء...')
              : t('reportsManagement.createDialog.create', 'إنشاء')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <DataExportDialog open={showExportDialog} onClose={() => setShowExportDialog(false)} />

      {/* Schedule Report Dialog */}
      <ReportScheduleForm
        open={showScheduleDialog}
        onClose={() => setShowScheduleDialog(false)}
        onSuccess={() => {
          setShowScheduleDialog(false);
          refetch();
        }}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog {...dialogProps} />
    </Box>
  );
});
