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
  Stack,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getCardPadding, getCardSpacing } from '../utils/responsive';
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
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
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

export const ReportsManagementPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();
  const cardPadding = getCardPadding(breakpoint);
  const cardSpacing = getCardSpacing(breakpoint);
  const { confirmDialog, dialogProps } = useConfirmDialog();

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
    const confirmed = await confirmDialog({
      title: t('reportsManagement.deleteTitle', 'تأكيد الحذف'),
      message: t('reportsManagement.deleteConfirm'),
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
    { label: t('reportsManagement.tabs.all'), value: 0 },
    { label: t('reportsManagement.tabs.sales'), value: 1, category: ReportCategory.SALES },
    { label: t('reportsManagement.tabs.products'), value: 2, category: ReportCategory.PRODUCTS },
    { label: t('reportsManagement.tabs.customers'), value: 3, category: ReportCategory.CUSTOMERS },
    { label: t('reportsManagement.tabs.inventory'), value: 4, category: ReportCategory.INVENTORY },
    { label: t('reportsManagement.tabs.financial'), value: 5, category: ReportCategory.FINANCIAL },
    { label: t('reportsManagement.tabs.marketing'), value: 6, category: ReportCategory.MARKETING },
  ];

  const reports = Array.isArray(reportsData?.data) ? reportsData.data : [];
  
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || report.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

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
    return (
      <Alert 
        severity="error"
        sx={{ m: { xs: 1, sm: 2 } }}
      >
        {t('reportsManagement.loadError')}
      </Alert>
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
          background: theme.palette.mode === 'dark'
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
              {t('reportsManagement.title')}
            </Typography>
            <Typography 
              variant={breakpoint.isXs ? 'body2' : 'body1'} 
              sx={{ 
                opacity: 0.9,
                fontSize: breakpoint.isXs ? '0.875rem' : undefined,
              }}
            >
              {t('reportsManagement.subtitle')}
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
              {t('reportsManagement.newReport')}
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
              {t('reportsManagement.exportData')}
            </Button>

            <Tooltip title={t('reportsManagement.refresh')}>
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
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder={t('reportsManagement.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size={breakpoint.isXs ? 'medium' : 'medium'}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: breakpoint.isXs ? 20 : undefined }} />,
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size={breakpoint.isXs ? 'medium' : 'medium'}>
              <InputLabel>{t('reportsManagement.categoryLabel')}</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
              >
                <MenuItem value="all">{t('reportsManagement.allCategories')}</MenuItem>
                {Object.values(ReportCategory).map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size={breakpoint.isXs ? 'medium' : 'medium'}>
              <InputLabel>{t('reportsManagement.sortBy')}</InputLabel>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                <MenuItem value="date">{t('reportsManagement.sortByDate')}</MenuItem>
                <MenuItem value="title">{t('reportsManagement.sortByTitle')}</MenuItem>
                <MenuItem value="category">{t('reportsManagement.sortByCategory')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 12, md: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SortIcon sx={{ fontSize: breakpoint.isXs ? 18 : undefined }} />}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              size={breakpoint.isXs ? 'medium' : 'medium'}
              sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
            >
              {sortOrder === 'asc' ? t('reportsManagement.sortAscending') : t('reportsManagement.sortDescending')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper 
        elevation={1} 
        sx={{ 
          mb: { xs: 2, sm: 3 },
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : undefined,
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
                    {t('reportsManagement.allReports')} ({sortedReports.length})
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<AssessmentIcon sx={{ fontSize: breakpoint.isXs ? 16 : undefined }} />}
                      label={`${t('reportsManagement.total')}: ${reportsData?.data?.length || 0}`}
                      color="primary"
                      variant="outlined"
                      size={breakpoint.isXs ? 'small' : 'medium'}
                      sx={{ fontSize: breakpoint.isXs ? '0.7rem' : undefined }}
                    />
                    <Chip
                      icon={<ArchiveIcon sx={{ fontSize: breakpoint.isXs ? 16 : undefined }} />}
                      label={`${t('reportsManagement.archived')}: ${sortedReports.filter((r) => r.isArchived).length}`}
                      color="secondary"
                      variant="outlined"
                      size={breakpoint.isXs ? 'small' : 'medium'}
                      sx={{ fontSize: breakpoint.isXs ? '0.7rem' : undefined }}
                    />
                  </Box>
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
                ) : (
                  <List>
                    {sortedReports.map((report) => (
                      <ListItem key={report.reportId} divider>
                        <Avatar 
                          sx={{ 
                            mr: { xs: 1, sm: 2 }, 
                            bgcolor: theme.palette.primary.main,
                            width: { xs: 36, sm: 40 },
                            height: { xs: 36, sm: 40 },
                          }}
                        >
                          {getFormatIcon(report.fileUrls?.[0]?.split('.').pop() || 'pdf')}
                        </Avatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography 
                                variant={breakpoint.isXs ? 'subtitle1' : 'h6'}
                                sx={{ fontSize: breakpoint.isXs ? '0.9375rem' : undefined }}
                              >
                                {report.title}
                              </Typography>
                              {report.isArchived && (
                                <Chip 
                                  label={t('reportsManagement.archivedLabel')} 
                                  size="small" 
                                  color="secondary"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ 
                                  mb: 1,
                                  fontSize: breakpoint.isXs ? '0.8125rem' : undefined,
                                }}
                              >
                                {report.description}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip
                                  label={report.category}
                                  size="small"
                                  color={getCategoryColor(report.category) as any}
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                                <Chip
                                  label={new Date(report.generatedAt).toLocaleDateString('ar-SA')}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                                <Chip
                                  label={`${t('reportsManagement.by')}: ${report.generatedBy}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              </Box>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 }, flexWrap: 'wrap' }}>
                            <Tooltip title={t('reportsManagement.actions.view')}>
                              <IconButton size={breakpoint.isXs ? 'small' : 'medium'}>
                                <VisibilityIcon sx={{ fontSize: breakpoint.isXs ? 18 : 20 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('reportsManagement.actions.edit')}>
                              <IconButton size={breakpoint.isXs ? 'small' : 'medium'}>
                                <EditIcon sx={{ fontSize: breakpoint.isXs ? 18 : 20 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('reportsManagement.actions.exportPdf')}>
                              <IconButton
                                size={breakpoint.isXs ? 'small' : 'medium'}
                                onClick={() =>
                                  handleExportReport(report.reportId, ReportFormat.PDF)
                                }
                              >
                                <DownloadIcon sx={{ fontSize: breakpoint.isXs ? 18 : 20 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={report.isArchived ? t('reportsManagement.unarchive') : t('reportsManagement.actions.archive')}>
                              <IconButton
                                size={breakpoint.isXs ? 'small' : 'medium'}
                                onClick={() => handleArchiveReport(report.reportId)}
                              >
                                {report.isArchived ? (
                                  <UnarchiveIcon sx={{ fontSize: breakpoint.isXs ? 18 : 20 }} />
                                ) : (
                                  <ArchiveIcon sx={{ fontSize: breakpoint.isXs ? 18 : 20 }} />
                                )}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('reportsManagement.actions.delete')}>
                              <IconButton
                                size={breakpoint.isXs ? 'small' : 'medium'}
                                color="error"
                                onClick={() => handleDeleteReport(report.reportId)}
                              >
                                <DeleteIcon sx={{ fontSize: breakpoint.isXs ? 18 : 20 }} />
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
                  <List>
                    {sortedReports
                      .filter((report) => report.category === tab.category)
                      .map((report) => (
                        <ListItem key={report.reportId} divider>
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
                              <IconButton size={breakpoint.isXs ? 'small' : 'medium'}>
                                <VisibilityIcon sx={{ fontSize: breakpoint.isXs ? 18 : 20 }} />
                              </IconButton>
                              <IconButton size={breakpoint.isXs ? 'small' : 'medium'}>
                                <DownloadIcon sx={{ fontSize: breakpoint.isXs ? 18 : 20 }} />
                              </IconButton>
                            </Box>
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
        fullScreen={breakpoint.isXs}
      >
        <DialogTitle sx={{ fontSize: breakpoint.isXs ? '1.125rem' : undefined }}>
          {t('reportsManagement.createDialog.title')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label={t('reportsManagement.createDialog.reportTitle')}
              value={reportForm.title}
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

            <TextField
              label={t('reportsManagement.createDialog.reportDescription')}
              value={reportForm.description}
              onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              size={breakpoint.isXs ? 'medium' : 'medium'}
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: breakpoint.isXs ? '0.875rem' : undefined,
                },
              }}
            />

            <FormControl fullWidth size={breakpoint.isXs ? 'medium' : 'medium'}>
              <InputLabel>{t('reportsManagement.createDialog.reportCategory')}</InputLabel>
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

            <FormControl fullWidth size={breakpoint.isXs ? 'medium' : 'medium'}>
              <InputLabel>{t('reportsManagement.createDialog.reportFormat')}</InputLabel>
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
              label={t('export.filters.includeCharts')}
              sx={{
                '& .MuiFormControlLabel-label': {
                  fontSize: breakpoint.isXs ? '0.875rem' : undefined,
                },
              }}
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
              label={t('export.filters.includeRawData')}
              sx={{
                '& .MuiFormControlLabel-label': {
                  fontSize: breakpoint.isXs ? '0.875rem' : undefined,
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
          <Button 
            onClick={() => setShowCreateDialog(false)}
            size={breakpoint.isXs ? 'medium' : 'medium'}
            sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
          >
            {t('reportsManagement.createDialog.cancel')}
          </Button>
          <Button
            onClick={handleCreateReport}
            variant="contained"
            disabled={!reportForm.title || generateReport.isPending}
            size={breakpoint.isXs ? 'medium' : 'medium'}
            sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
          >
            {generateReport.isPending 
              ? t('reportsManagement.createDialog.creating') 
              : t('reportsManagement.createDialog.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <DataExportDialog open={showExportDialog} onClose={() => setShowExportDialog(false)} />

      {/* Confirm Dialog */}
      <ConfirmDialog {...dialogProps} />
    </Box>
  );
};
