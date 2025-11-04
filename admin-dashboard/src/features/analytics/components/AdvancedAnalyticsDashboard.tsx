import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { getCardPadding, getCardSpacing } from '../utils/responsive';
import {
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  AccountBalance as AccountBalanceIcon,
  Campaign as CampaignIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { 
  useSalesAnalytics,
  useCustomerAnalytics,
  useInventoryReport,
  useFinancialReport,
  useMarketingReport,
  useRealTimeMetrics,
  useAdvancedReports,
  useGenerateAdvancedReport,
  useExportReport,
  useDeleteReport,
  useArchiveReport,
} from '../hooks/useAnalytics';
import { ReportCategory, ReportFormat } from '../types/analytics.types';
import { SalesAnalyticsCard } from './SalesAnalyticsCard';
import { ProductPerformanceCard } from './ProductPerformanceCard';
import { CustomerAnalyticsCard } from './CustomerAnalyticsCard';
import { InventoryReportCard } from './InventoryReportCard';
import { FinancialReportCard } from './FinancialReportCard';
import { MarketingReportCard } from './MarketingReportCard';
import { RealTimeMetricsCard } from './RealTimeMetricsCard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  const breakpoint = useBreakpoint();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`advanced-analytics-tabpanel-${index}`}
      aria-labelledby={`advanced-analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: breakpoint.isXs ? 1.5 : 3 }}>{children}</Box>}
    </div>
  );
}

interface AdvancedAnalyticsDashboardProps {
  initialCategory?: ReportCategory;
}

export const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({
  initialCategory = ReportCategory.SALES,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();
  const cardPadding = getCardPadding(breakpoint);
  const cardSpacing = getCardSpacing(breakpoint);
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>(initialCategory);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    category: ReportCategory.SALES,
    format: ReportFormat.PDF,
    includeCharts: true,
    includeRawData: false,
  });

  // Hooks for different analytics
  const salesAnalytics = useSalesAnalytics();
  // ProductPerformanceCard now handles its own data fetching
  const customerAnalytics = useCustomerAnalytics();
  const inventoryReport = useInventoryReport();
  const financialReport = useFinancialReport();
  const marketingReport = useMarketingReport();
  const realTimeMetrics = useRealTimeMetrics();
  const advancedReports = useAdvancedReports();
  
  const generateReport = useGenerateAdvancedReport();
  const exportReport = useExportReport();
  const deleteReport = useDeleteReport();
  const archiveReport = useArchiveReport();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    
    // تحديث الفئة بناءً على التبويب المحدد
    const tabConfig = tabs.find(tab => tab.value === newValue);
    if (tabConfig?.category) {
      setSelectedCategory(tabConfig.category);
    }
  };

  const handleGenerateReport = async () => {
    try {
      await generateReport.mutateAsync({
        title: reportForm.title,
        description: reportForm.description,
        category: reportForm.category,
        format: reportForm.format,
        includeCharts: reportForm.includeCharts,
        includeRawData: reportForm.includeRawData,
      });
      setShowReportDialog(false);
      setReportForm({
        title: '',
        description: '',
        category: ReportCategory.SALES,
        format: ReportFormat.PDF,
        includeCharts: true,
        includeRawData: false,
      });
    } catch (error) {
      console.error(t('messages.generateError'), error);
    }
  };

  const handleExportReport = async (reportId: string, format: ReportFormat) => {
    try {
      await exportReport.mutateAsync({
        reportId,
        data: { format, includeCharts: true, includeRawData: false },
      });
    } catch (error) {
      console.error(t('messages.exportError'), error);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      await deleteReport.mutateAsync(reportId);
    } catch (error) {
      console.error(t('messages.deleteError'), error);
    }
  };

  const handleArchiveReport = async (reportId: string) => {
    try {
      await archiveReport.mutateAsync(reportId);
    } catch (error) {
      console.error(t('messages.archiveError'), error);
    }
  };

  const tabs = [
    { label: t('tabs.sales'), icon: <TrendingUpIcon />, value: 0, category: ReportCategory.SALES },
    { label: t('tabs.products'), icon: <ShoppingCartIcon />, value: 1, category: ReportCategory.PRODUCTS },
    { label: t('tabs.customers'), icon: <PeopleIcon />, value: 2, category: ReportCategory.CUSTOMERS },
    { label: t('tabs.inventory'), icon: <InventoryIcon />, value: 3, category: ReportCategory.INVENTORY },
    { label: t('tabs.financial'), icon: <AccountBalanceIcon />, value: 4, category: ReportCategory.FINANCIAL },
    { label: t('tabs.marketing'), icon: <CampaignIcon />, value: 5, category: ReportCategory.MARKETING },
    { label: t('tabs.realtime'), icon: <AnalyticsIcon />, value: 6 },
    { label: t('tabs.reports'), icon: <AssessmentIcon />, value: 7 },
  ];

  return (
    <Box sx={{ width: '100%', px: breakpoint.isXs ? 1 : 0 }}>
      {/* Header */}
      <Paper
        elevation={1}
        sx={{
          p: breakpoint.isXs ? 1.5 : 2,
          mb: breakpoint.isXs ? 2 : 3,
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`
            : `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
          color: 'white',
        }}
      >
        <Stack
          direction={breakpoint.isXs ? 'column' : 'row'}
          spacing={breakpoint.isXs ? 2 : 0}
          sx={{
            justifyContent: 'space-between',
            alignItems: breakpoint.isXs ? 'flex-start' : 'center',
          }}
        >
          <Box>
            <Typography 
              variant={breakpoint.isXs ? 'h5' : 'h4'} 
              component="h1" 
              gutterBottom
              sx={{ fontSize: breakpoint.isXs ? '1.5rem' : undefined }}
            >
              {t('title')}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                opacity: 0.9,
                fontSize: breakpoint.isXs ? '0.875rem' : undefined,
              }}
            >
              {t('subtitle')}
            </Typography>
          </Box>
          
          <Stack 
            direction={breakpoint.isXs ? 'column' : 'row'} 
            spacing={1} 
            sx={{ 
              width: breakpoint.isXs ? '100%' : 'auto',
              alignItems: breakpoint.isXs ? 'stretch' : 'center',
            }}
          >
            <Chip
              icon={<AnalyticsIcon />}
              label={`${t('header.category')}: ${t(`categories.${selectedCategory}`)}`}
              variant="outlined"
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                fontSize: breakpoint.isXs ? '0.75rem' : undefined,
              }}
            />
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowReportDialog(true)}
              size={breakpoint.isXs ? 'medium' : 'large'}
              fullWidth={breakpoint.isXs}
              sx={{ 
                backgroundColor: 'white',
                color: theme.palette.secondary.main,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
                whiteSpace: 'nowrap',
              }}
            >
              {t('header.newReport')}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Tabs */}
      <Paper 
        elevation={1} 
        sx={{ 
          mb: breakpoint.isXs ? 2 : 3,
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : undefined,
        }}
      >
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant={breakpoint.isXs ? 'scrollable' : 'standard'}
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTab-root': {
              minHeight: breakpoint.isXs ? 56 : 64,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: breakpoint.isXs ? '0.875rem' : undefined,
              px: breakpoint.isXs ? 1.5 : 2,
              color: theme.palette.mode === 'dark' ? theme.palette.text.primary : undefined,
              '&.Mui-selected': {
                color: theme.palette.secondary.main,
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: theme.palette.secondary.main,
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              label={breakpoint.isXs && !breakpoint.isXs ? undefined : tab.label}
              icon={tab.icon}
              iconPosition={breakpoint.isXs && !breakpoint.isXs ? 'top' : 'start'}
              sx={{ 
                minWidth: breakpoint.isXs ? (breakpoint.isXs ? 80 : 64) : 160,
              }}
              aria-label={tab.label}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={selectedTab} index={0}>
        {/* Sales Analytics */}
        <Grid container spacing={cardSpacing}>
          <Grid size={{ xs: 12 }}>
            <SalesAnalyticsCard 
              data={salesAnalytics.data}
              isLoading={salesAnalytics.isLoading}
              error={salesAnalytics.error}
            />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        {/* Product Performance */}
        <Grid container spacing={cardSpacing}>
          <Grid size={{ xs: 12 }}>
            <ProductPerformanceCard />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={selectedTab} index={2}>
        {/* Customer Analytics */}
        <Grid container spacing={cardSpacing}>
          <Grid size={{ xs: 12 }}>
            <CustomerAnalyticsCard 
              data={customerAnalytics.data}
              isLoading={customerAnalytics.isLoading}
              error={customerAnalytics.error}
            />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={selectedTab} index={3}>
        {/* Inventory Report */}
        <Grid container spacing={cardSpacing}>
          <Grid size={{ xs: 12 }}>
            <InventoryReportCard 
              data={inventoryReport.data}
              isLoading={inventoryReport.isLoading}
              error={inventoryReport.error}
            />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={selectedTab} index={4}>
        {/* Financial Report */}
        <Grid container spacing={cardSpacing}>
          <Grid size={{ xs: 12 }}>
            <FinancialReportCard 
              data={financialReport.data}
              isLoading={financialReport.isLoading}
              error={financialReport.error}
            />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={selectedTab} index={5}>
        {/* Marketing Report */}
        <Grid container spacing={cardSpacing}>
          <Grid size={{ xs: 12 }}>
            <MarketingReportCard 
              data={marketingReport.data}
              isLoading={marketingReport.isLoading}
              error={marketingReport.error}
            />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={selectedTab} index={6}>
        {/* Real-time Metrics */}
        <Grid container spacing={cardSpacing}>
          <Grid size={{ xs: 12 }}>
            <RealTimeMetricsCard 
              data={realTimeMetrics.data}
              isLoading={realTimeMetrics.isLoading}
              error={realTimeMetrics.error}
            />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={selectedTab} index={7}>
        {/* Reports Management */}
        <Grid container spacing={cardSpacing}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent sx={{ p: cardPadding }}>
                <Stack
                  direction={breakpoint.isXs ? 'column' : 'row'}
                  spacing={breakpoint.isXs ? 2 : 0}
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: breakpoint.isXs ? 'stretch' : 'center',
                    mb: 2,
                  }}
                >
                  <Typography 
                    variant="h6"
                    sx={{ fontSize: breakpoint.isXs ? '1.1rem' : undefined }}
                  >
                    {t('reports.management')}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setShowReportDialog(true)}
                    size={breakpoint.isXs ? 'medium' : 'large'}
                    fullWidth={breakpoint.isXs}
                  >
                    {t('reports.newReport')}
                  </Button>
                </Stack>
                
                {advancedReports.isLoading ? (
                  <Box>
                    {[...Array(3)].map((_, index) => (
                      <Skeleton 
                        key={index} 
                        variant="rectangular" 
                        height={breakpoint.isXs ? 120 : 80} 
                        sx={{ mb: 1 }} 
                      />
                    ))}
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {Array.isArray(advancedReports.data?.data) && advancedReports.data.data.map((report) => (
                      <ListItem 
                        key={report.reportId} 
                        divider
                        sx={{
                          flexDirection: breakpoint.isXs ? 'column' : 'row',
                          alignItems: breakpoint.isXs ? 'flex-start' : 'center',
                          px: breakpoint.isXs ? 0 : undefined,
                        }}
                      >
                        <ListItemText
                          primary={report.title}
                          secondary={
                            <Box>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                              >
                                {report.description}
                              </Typography>
                              <Stack
                                direction={breakpoint.isXs ? 'column' : 'row'}
                                spacing={1}
                                sx={{ mt: 1, flexWrap: 'wrap' }}
                              >
                                <Chip 
                                  label={t(`categories.${report.category}`)} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                  sx={{ fontSize: breakpoint.isXs ? '0.7rem' : undefined }}
                                />
                                <Chip 
                                  label={new Date(report.generatedAt).toLocaleDateString()} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ fontSize: breakpoint.isXs ? '0.7rem' : undefined }}
                                />
                                {report.isArchived && (
                                  <Chip 
                                    label={t('reports.archived')} 
                                    size="small" 
                                    color="secondary" 
                                    variant="outlined"
                                    sx={{ fontSize: breakpoint.isXs ? '0.7rem' : undefined }}
                                  />
                                )}
                              </Stack>
                            </Box>
                          }
                          sx={{ width: breakpoint.isXs ? '100%' : 'auto' }}
                        />
                        <ListItemSecondaryAction
                          sx={{
                            position: breakpoint.isXs ? 'relative' : 'absolute',
                            right: breakpoint.isXs ? 'auto' : 16,
                            top: breakpoint.isXs ? 'auto' : '50%',
                            transform: breakpoint.isXs ? 'none' : 'translateY(-50%)',
                            mt: breakpoint.isXs ? 1 : 0,
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={breakpoint.isXs ? 0.5 : 1}
                            sx={{ flexWrap: 'wrap', justifyContent: breakpoint.isXs ? 'flex-start' : 'flex-end' }}
                          >
                            <Tooltip title={t('reports.actions.view')}>
                              <IconButton size={breakpoint.isXs ? 'small' : 'medium'}>
                                <VisibilityIcon fontSize={breakpoint.isXs ? 'small' : 'medium'} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('reports.actions.exportPdf')}>
                              <IconButton 
                                size={breakpoint.isXs ? 'small' : 'medium'}
                                onClick={() => handleExportReport(report.reportId, ReportFormat.PDF)}
                              >
                                <DownloadIcon fontSize={breakpoint.isXs ? 'small' : 'medium'} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('reports.actions.archive')}>
                              <IconButton 
                                size={breakpoint.isXs ? 'small' : 'medium'}
                                onClick={() => handleArchiveReport(report.reportId)}
                              >
                                <ArchiveIcon fontSize={breakpoint.isXs ? 'small' : 'medium'} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('reports.actions.delete')}>
                              <IconButton 
                                size={breakpoint.isXs ? 'small' : 'medium'}
                                color="error"
                                onClick={() => handleDeleteReport(report.reportId)}
                              >
                                <DeleteIcon fontSize={breakpoint.isXs ? 'small' : 'medium'} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
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

      {/* Generate Report Dialog */}
      <Dialog 
        open={showReportDialog} 
        onClose={() => setShowReportDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={breakpoint.isXs}
      >
        <DialogTitle sx={{ fontSize: breakpoint.isXs ? '1.1rem' : undefined }}>
          {t('reports.createTitle')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label={t('reports.title')}
              value={reportForm.title}
              onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
              fullWidth
              required
              size={breakpoint.isXs ? 'small' : 'medium'}
            />
            
            <TextField
              label={t('reports.description')}
              value={reportForm.description}
              onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
              fullWidth
              multiline
              rows={breakpoint.isXs ? 2 : 3}
              size={breakpoint.isXs ? 'small' : 'medium'}
            />
            
            <FormControl fullWidth size={breakpoint.isXs ? 'small' : 'medium'}>
              <InputLabel>{t('reports.category')}</InputLabel>
              <Select
                value={reportForm.category}
                onChange={(e) => setReportForm({ ...reportForm, category: e.target.value as ReportCategory })}
                label={t('reports.category')}
              >
                {Object.values(ReportCategory).map((category) => (
                  <MenuItem key={category} value={category}>
                    {t(`categories.${category}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth size={breakpoint.isXs ? 'small' : 'medium'}>
              <InputLabel>{t('reports.format')}</InputLabel>
              <Select
                value={reportForm.format}
                onChange={(e) => setReportForm({ ...reportForm, format: e.target.value as ReportFormat })}
                label={t('reports.format')}
              >
                {Object.values(ReportFormat).map((format) => (
                  <MenuItem key={format} value={format}>
                    {t(`formats.${format}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={reportForm.includeCharts}
                  onChange={(e) => setReportForm({ ...reportForm, includeCharts: e.target.checked })}
                  size={breakpoint.isXs ? 'small' : 'medium'}
                />
              }
              label={t('reports.includeCharts')}
              sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={reportForm.includeRawData}
                  onChange={(e) => setReportForm({ ...reportForm, includeRawData: e.target.checked })}
                  size={breakpoint.isXs ? 'small' : 'medium'}
                />
              }
              label={t('reports.includeRawData')}
              sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: breakpoint.isXs ? 1.5 : 3, pb: breakpoint.isXs ? 2 : 3 }}>
          <Button 
            onClick={() => setShowReportDialog(false)}
            size={breakpoint.isXs ? 'medium' : 'large'}
            fullWidth={breakpoint.isXs}
          >
            {t('form.cancel')}
          </Button>
          <Button 
            onClick={handleGenerateReport}
            variant="contained"
            disabled={!reportForm.title || generateReport.isPending}
            size={breakpoint.isXs ? 'medium' : 'large'}
            fullWidth={breakpoint.isXs}
          >
            {generateReport.isPending ? t('form.creating') : t('form.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
