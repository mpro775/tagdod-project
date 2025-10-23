import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Download as DownloadIcon,
  FileDownload as FileDownloadIcon,
  TableChart as TableChartIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { 
  useExportSalesData,
  useExportProductsData,
  useExportCustomersData,
  useExportData,
} from '../hooks/useAnalytics';
import { ReportFormat, PeriodType } from '../types/analytics.types';

interface DataExportDialogProps {
  open: boolean;
  onClose: () => void;
}

export const DataExportDialog: React.FC<DataExportDialogProps> = ({
  open,
  onClose,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [exportType, setExportType] = useState<'sales' | 'products' | 'customers' | 'custom'>('sales');
  const [format, setFormat] = useState<ReportFormat>(ReportFormat.EXCEL);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [filters, setFilters] = useState({
    includeCharts: true,
    includeRawData: false,
    groupBy: '',
    category: '',
    status: '',
  });
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'completed' | 'error'>('idle');
  const [exportResult, setExportResult] = useState<any>(null);

  const exportSalesData = useExportSalesData();
  const exportProductsData = useExportProductsData();
  const exportCustomersData = useExportCustomersData();
  const exportData = useExportData();

  const steps = [
    'اختيار نوع البيانات',
    'تحديد التنسيق والفترة',
    'إعداد الفلاتر',
    'تصدير البيانات',
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setExportType('sales');
    setFormat(ReportFormat.EXCEL);
    setDateRange({ startDate: '', endDate: '' });
    setFilters({
      includeCharts: true,
      includeRawData: false,
      groupBy: '',
      category: '',
      status: '',
    });
    setExportStatus('idle');
    setExportResult(null);
  };

  const handleExport = async () => {
    setExportStatus('exporting');
    
    try {
      let result;
      
      switch (exportType) {
        case 'sales':
          result = await exportSalesData.mutateAsync({
            format: format.toString(),
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          });
          break;
        case 'products':
          result = await exportProductsData.mutateAsync({
            format: format.toString(),
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          });
          break;
        case 'customers':
          result = await exportCustomersData.mutateAsync({
            format: format.toString(),
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          });
          break;
        case 'custom':
          result = await exportData.mutateAsync({
            format: format.toString(),
            type: 'custom',
            period: PeriodType.MONTHLY,
          });
          break;
        default:
          throw new Error('نوع التصدير غير مدعوم');
      }
      
      setExportResult(result);
      setExportStatus('completed');
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('error');
    }
  };

  const getFormatIcon = (format: ReportFormat) => {
    switch (format) {
      case ReportFormat.PDF:
        return <PictureAsPdfIcon />;
      case ReportFormat.EXCEL:
        return <TableChartIcon />;
      case ReportFormat.CSV:
        return <TableChartIcon />;
      case ReportFormat.JSON:
        return <DescriptionIcon />;
      default:
        return <FileDownloadIcon />;
    }
  };

  const getFormatLabel = (format: ReportFormat) => {
    switch (format) {
      case ReportFormat.PDF:
        return 'PDF';
      case ReportFormat.EXCEL:
        return 'Excel';
      case ReportFormat.CSV:
        return 'CSV';
      case ReportFormat.JSON:
        return 'JSON';
      default:
        return format;
    }
  };

  const getExportTypeLabel = (type: string) => {
    switch (type) {
      case 'sales':
        return 'بيانات المبيعات';
      case 'products':
        return 'بيانات المنتجات';
      case 'customers':
        return 'بيانات العملاء';
      case 'custom':
        return 'بيانات مخصصة';
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DownloadIcon />
          <Typography variant="h6">تصدير البيانات</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: Data Type Selection */}
          <Step>
            <StepLabel>اختيار نوع البيانات</StepLabel>
            <StepContent>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>نوع البيانات</InputLabel>
                <Select
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value as any)}
                >
                  <MenuItem value="sales">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TableChartIcon />
                      بيانات المبيعات والإيرادات
                    </Box>
                  </MenuItem>
                  <MenuItem value="products">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TableChartIcon />
                      بيانات المنتجات والمخزون
                    </Box>
                  </MenuItem>
                  <MenuItem value="customers">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TableChartIcon />
                      بيانات العملاء والمستخدمين
                    </Box>
                  </MenuItem>
                  <MenuItem value="custom">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TableChartIcon />
                      بيانات مخصصة
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  اختر نوع البيانات التي تريد تصديرها. يمكنك تصدير بيانات المبيعات، المنتجات، العملاء، أو بيانات مخصصة.
                </Typography>
              </Alert>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button onClick={handleNext} variant="contained">
                  التالي
                </Button>
                <Button onClick={onClose}>
                  إلغاء
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 2: Format and Date Range */}
          <Step>
            <StepLabel>تحديد التنسيق والفترة</StepLabel>
            <StepContent>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>تنسيق الملف</InputLabel>
                    <Select
                      value={format}
                      onChange={(e) => setFormat(e.target.value as ReportFormat)}
                    >
                      {Object.values(ReportFormat).map((formatOption) => (
                        <MenuItem key={formatOption} value={formatOption}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getFormatIcon(formatOption)}
                            {getFormatLabel(formatOption)}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="تاريخ البداية"
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="تاريخ النهاية"
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button onClick={handleNext} variant="contained">
                  التالي
                </Button>
                <Button onClick={handleBack}>
                  السابق
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 3: Filters */}
          <Step>
            <StepLabel>إعداد الفلاتر</StepLabel>
            <StepContent>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.includeCharts}
                        onChange={(e) => setFilters({ ...filters, includeCharts: e.target.checked })}
                      />
                    }
                    label="تضمين الرسوم البيانية"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.includeRawData}
                        onChange={(e) => setFilters({ ...filters, includeRawData: e.target.checked })}
                      />
                    }
                    label="تضمين البيانات الأولية"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="تجميع البيانات"
                    value={filters.groupBy}
                    onChange={(e) => setFilters({ ...filters, groupBy: e.target.value })}
                    placeholder="مثال: يومي، أسبوعي، شهري"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="فلترة حسب الفئة"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    placeholder="مثال: الطاقة الشمسية، الإضاءة"
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button onClick={handleNext} variant="contained">
                  التالي
                </Button>
                <Button onClick={handleBack}>
                  السابق
                </Button>
              </Box>
            </StepContent>
          </Step>

          {/* Step 4: Export */}
          <Step>
            <StepLabel>تصدير البيانات</StepLabel>
            <StepContent>
              {/* Export Summary */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  ملخص التصدير
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip
                    icon={<TableChartIcon />}
                    label={getExportTypeLabel(exportType)}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    icon={getFormatIcon(format)}
                    label={getFormatLabel(format)}
                    color="secondary"
                    variant="outlined"
                  />
                  {dateRange.startDate && (
                    <Chip
                      label={`من ${dateRange.startDate}`}
                      variant="outlined"
                    />
                  )}
                  {dateRange.endDate && (
                    <Chip
                      label={`إلى ${dateRange.endDate}`}
                      variant="outlined"
                    />
                  )}
                </Box>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      {filters.includeCharts ? <CheckCircleIcon color="success" /> : <ErrorIcon color="error" />}
                    </ListItemIcon>
                    <ListItemText
                      primary="الرسوم البيانية"
                      secondary={filters.includeCharts ? 'مضمنة' : 'غير مضمونة'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      {filters.includeRawData ? <CheckCircleIcon color="success" /> : <ErrorIcon color="error" />}
                    </ListItemIcon>
                    <ListItemText
                      primary="البيانات الأولية"
                      secondary={filters.includeRawData ? 'مضمنة' : 'غير مضمونة'}
                    />
                  </ListItem>
                </List>
              </Box>

              {/* Export Status */}
              {exportStatus === 'exporting' && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    جاري تصدير البيانات...
                  </Typography>
                  <LinearProgress />
                </Box>
              )}

              {exportStatus === 'completed' && exportResult && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    تم تصدير البيانات بنجاح! يمكنك تحميل الملف من الرابط أدناه.
                  </Typography>
                  {exportResult.data?.fileUrl && (
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={() => window.open(exportResult.data.fileUrl, '_blank')}
                      sx={{ mt: 1 }}
                    >
                      تحميل الملف
                    </Button>
                  )}
                </Alert>
              )}

              {exportStatus === 'error' && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  حدث خطأ أثناء تصدير البيانات. يرجى المحاولة مرة أخرى.
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  onClick={handleExport}
                  variant="contained"
                  disabled={exportStatus === 'exporting'}
                  startIcon={<DownloadIcon />}
                >
                  {exportStatus === 'exporting' ? 'جاري التصدير...' : 'بدء التصدير'}
                </Button>
                <Button onClick={handleBack} disabled={exportStatus === 'exporting'}>
                  السابق
                </Button>
                <Button onClick={handleReset}>
                  إعادة تعيين
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          إغلاق
        </Button>
      </DialogActions>
    </Dialog>
  );
};
