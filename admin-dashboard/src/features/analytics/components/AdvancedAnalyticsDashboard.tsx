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
  useMediaQuery,
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
} from '@mui/material';
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
  useProductPerformance,
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

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`advanced-analytics-tabpanel-${index}`}
      aria-labelledby={`advanced-analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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
  const productPerformance = useProductPerformance();
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
      console.error('Error generating report:', error);
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
    try {
      await deleteReport.mutateAsync(reportId);
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const handleArchiveReport = async (reportId: string) => {
    try {
      await archiveReport.mutateAsync(reportId);
    } catch (error) {
      console.error('Error archiving report:', error);
    }
  };

  const tabs = [
    { label: 'المبيعات', icon: <TrendingUpIcon />, value: 0, category: ReportCategory.SALES },
    { label: 'المنتجات', icon: <ShoppingCartIcon />, value: 1, category: ReportCategory.PRODUCTS },
    { label: 'العملاء', icon: <PeopleIcon />, value: 2, category: ReportCategory.CUSTOMERS },
    { label: 'المخزون', icon: <InventoryIcon />, value: 3, category: ReportCategory.INVENTORY },
    { label: 'المالية', icon: <AccountBalanceIcon />, value: 4, category: ReportCategory.FINANCIAL },
    { label: 'التسويق', icon: <CampaignIcon />, value: 5, category: ReportCategory.MARKETING },
    { label: 'الوقت الفعلي', icon: <AnalyticsIcon />, value: 6 },
    { label: 'التقارير', icon: <AssessmentIcon />, value: 7 },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 3,
          background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
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
              التحليلات المتقدمة
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              تحليلات متخصصة وتقارير مفصلة لجميع جوانب النظام
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              icon={<AnalyticsIcon />}
              label={`الفئة: ${selectedCategory}`}
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
            />
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowReportDialog(true)}
              sx={{ 
                backgroundColor: 'white',
                color: theme.palette.secondary.main,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              تقرير جديد
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper elevation={1} sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontWeight: 600,
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              sx={{ minWidth: isMobile ? 120 : 160 }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={selectedTab} index={0}>
        {/* Sales Analytics */}
        <Grid container spacing={3}>
        <Grid size={{ xs: 12}}>
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
        <Grid container spacing={3}>
        <Grid size={{ xs: 12}}>
            <ProductPerformanceCard 
              data={productPerformance.data}
              isLoading={productPerformance.isLoading}
              error={productPerformance.error}
            />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={selectedTab} index={2}>
        {/* Customer Analytics */}
        <Grid container spacing={3}>
        <Grid size={{ xs: 12}}>
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
        <Grid container spacing={3}>
        <Grid size={{ xs: 12}}>
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
        <Grid container spacing={3}>
        <Grid size={{ xs: 12}}>
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
        <Grid container spacing={3}>
        <Grid size={{ xs: 12}}>
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
        <Grid container spacing={3}>
        <Grid size={{ xs: 12}}>
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
        <Grid container spacing={3}>
        <Grid size={{ xs: 12}}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">إدارة التقارير</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setShowReportDialog(true)}
                  >
                    تقرير جديد
                  </Button>
                </Box>
                
                {advancedReports.isLoading ? (
                  <Box>
                    {[...Array(3)].map((_, index) => (
                      <Skeleton key={index} variant="rectangular" height={80} sx={{ mb: 1 }} />
                    ))}
                  </Box>
                ) : (
                  <List>
                    {Array.isArray(advancedReports.data?.data) && advancedReports.data.data.map((report) => (
                      <ListItem key={report.reportId} divider>
                        <ListItemText
                          primary={report.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {report.description}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <Chip 
                                  label={report.category} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined" 
                                />
                                <Chip 
                                  label={new Date(report.generatedAt).toLocaleDateString('ar-SA')} 
                                  size="small" 
                                  variant="outlined" 
                                />
                                {report.isArchived && (
                                  <Chip 
                                    label="مؤرشف" 
                                    size="small" 
                                    color="secondary" 
                                    variant="outlined" 
                                  />
                                )}
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
                            <Tooltip title="تصدير PDF">
                              <IconButton 
                                size="small"
                                onClick={() => handleExportReport(report.reportId, ReportFormat.PDF)}
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="أرشفة">
                              <IconButton 
                                size="small"
                                onClick={() => handleArchiveReport(report.reportId)}
                              >
                                <ArchiveIcon />
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

      {/* Generate Report Dialog */}
      <Dialog 
        open={showReportDialog} 
        onClose={() => setShowReportDialog(false)}
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
                onChange={(e) => setReportForm({ ...reportForm, category: e.target.value as ReportCategory })}
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
                onChange={(e) => setReportForm({ ...reportForm, format: e.target.value as ReportFormat })}
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
                  onChange={(e) => setReportForm({ ...reportForm, includeCharts: e.target.checked })}
                />
              }
              label="تضمين الرسوم البيانية"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={reportForm.includeRawData}
                  onChange={(e) => setReportForm({ ...reportForm, includeRawData: e.target.checked })}
                />
              }
              label="تضمين البيانات الأولية"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReportDialog(false)}>
            إلغاء
          </Button>
          <Button 
            onClick={handleGenerateReport}
            variant="contained"
            disabled={!reportForm.title || generateReport.isPending}
          >
            {generateReport.isPending ? 'جاري الإنشاء...' : 'إنشاء التقرير'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
