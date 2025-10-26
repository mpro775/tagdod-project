import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Download as DownloadIcon,
  FileDownload as FileDownloadIcon,
  TableChart as TableChartIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import {
  useExportSalesData,
  useExportProductsData,
  useExportCustomersData,
  useExportData,
} from '../hooks/useAnalytics';
import { ReportFormat, PeriodType } from '../types/analytics.types';

export const DataExportPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [activeStep, setActiveStep] = useState(0);
  const [exportType, setExportType] = useState<'sales' | 'products' | 'customers' | 'custom'>(
    'sales'
  );
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
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'completed' | 'error'>(
    'idle'
  );
  const [exportResult, setExportResult] = useState<any>(null);

  const exportSalesData = useExportSalesData();
  const exportProductsData = useExportProductsData();
  const exportCustomersData = useExportCustomersData();
  const exportData = useExportData();

  const steps = ['اختيار نوع البيانات', 'تحديد التنسيق والفترة', 'إعداد الفلاتر', 'تصدير البيانات'];

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

  const getExportTypeIcon = (type: string) => {
    switch (type) {
      case 'sales':
        return <TrendingUpIcon />;
      case 'products':
        return <ShoppingCartIcon />;
      case 'customers':
        return <PeopleIcon />;
      case 'custom':
        return <AssessmentIcon />;
      default:
        return <FileDownloadIcon />;
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
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 3,
          background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
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
              تصدير البيانات
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              تصدير البيانات التحليلية بصيغ مختلفة
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              icon={<DownloadIcon />}
              label="تصدير متقدم"
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Export Wizard */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            معالج تصدير البيانات
          </Typography>

          <Stepper activeStep={activeStep} orientation={isMobile ? 'vertical' : 'horizontal'}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                {isMobile && <StepContent>
                  {/* Step 1: Data Type Selection */}
                  {index === 0 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        اختر نوع البيانات التي تريد تصديرها
                      </Typography>

                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        {[
                          {
                            value: 'sales',
                            label: 'بيانات المبيعات',
                            description: 'تصدير بيانات المبيعات والإيرادات والطلبات',
                          },
                          {
                            value: 'products',
                            label: 'بيانات المنتجات',
                            description: 'تصدير بيانات المنتجات والمخزون والأداء',
                          },
                          {
                            value: 'customers',
                            label: 'بيانات العملاء',
                            description: 'تصدير بيانات العملاء والمستخدمين والتفاعلات',
                          },
                          {
                            value: 'custom',
                            label: 'بيانات مخصصة',
                            description: 'تصدير بيانات مخصصة حسب المعايير المحددة',
                          },
                        ].map((option) => (
                          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={option.value}>
                            <Card
                              sx={{
                                cursor: 'pointer',
                                border:
                                  exportType === option.value
                                    ? `2px solid ${theme.palette.primary.main}`
                                    : '1px solid #e0e0e0',
                                '&:hover': {
                                  boxShadow: theme.shadows[4],
                                },
                              }}
                              onClick={() => setExportType(option.value as any)}
                            >
                              <CardContent sx={{ textAlign: 'center' }}>
                                {getExportTypeIcon(option.value)}
                                <Typography variant="h6" sx={{ mt: 1 }}>
                                  {option.label}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {option.description}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>

                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          اختر نوع البيانات التي تريد تصديرها. يمكنك تصدير بيانات المبيعات،
                          المنتجات، العملاء، أو بيانات مخصصة.
                        </Typography>
                      </Alert>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button onClick={handleNext} variant="contained">
                          التالي
                        </Button>
                        <Button onClick={handleReset}>إعادة تعيين</Button>
                      </Box>
                    </Box>
                  )}

                  {/* Step 2: Format and Date Range */}
                  {index === 1 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        حدد تنسيق الملف والفترة الزمنية
                      </Typography>

                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 12, md: 6 }}>
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

                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            label="تاريخ البداية"
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) =>
                              setDateRange({ ...dateRange, startDate: e.target.value })
                            }
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            label="تاريخ النهاية"
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) =>
                              setDateRange({ ...dateRange, endDate: e.target.value })
                            }
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                      </Grid>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button onClick={handleNext} variant="contained">
                          التالي
                        </Button>
                        <Button onClick={handleBack}>السابق</Button>
                      </Box>
                    </Box>
                  )}

                  {/* Step 3: Filters */}
                  {index === 2 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        إعداد الفلاتر والخيارات
                      </Typography>

                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={filters.includeCharts}
                                onChange={(e) =>
                                  setFilters({ ...filters, includeCharts: e.target.checked })
                                }
                              />
                            }
                            label="تضمين الرسوم البيانية"
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={filters.includeRawData}
                                onChange={(e) =>
                                  setFilters({ ...filters, includeRawData: e.target.checked })
                                }
                              />
                            }
                            label="تضمين البيانات الأولية"
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            label="تجميع البيانات"
                            value={filters.groupBy}
                            onChange={(e) => setFilters({ ...filters, groupBy: e.target.value })}
                            placeholder="مثال: يومي، أسبوعي، شهري"
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
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
                        <Button onClick={handleBack}>السابق</Button>
                      </Box>
                    </Box>
                  )}

                  {/* Step 4: Export */}
                  {index === 3 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        تصدير البيانات
                      </Typography>

                      {/* Export Summary */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          ملخص التصدير
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          <Chip
                            icon={getExportTypeIcon(exportType)}
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
                            <Chip label={`من ${dateRange.startDate}`} variant="outlined" />
                          )}
                          {dateRange.endDate && (
                            <Chip label={`إلى ${dateRange.endDate}`} variant="outlined" />
                          )}
                        </Box>

                        <List dense>
                          <ListItem>
                            <ListItemIcon>
                              {filters.includeCharts ? (
                                <CheckCircleIcon color="success" />
                              ) : (
                                <ErrorIcon color="error" />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary="الرسوم البيانية"
                              secondary={filters.includeCharts ? 'مضمنة' : 'غير مضمونة'}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              {filters.includeRawData ? (
                                <CheckCircleIcon color="success" />
                              ) : (
                                <ErrorIcon color="error" />
                              )}
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
                        <Button onClick={handleReset}>إعادة تعيين</Button>
                      </Box>
                    </Box>
                  )}
                </StepContent>}
              </Step>
            ))}
          </Stepper>

          {/* محتوى الخطوات للشاشات الكبيرة (horizontal stepper) */}
          {!isMobile && activeStep === 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                اختر نوع البيانات التي تريد تصديرها
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  {
                    value: 'sales',
                    label: 'بيانات المبيعات',
                    description: 'تصدير بيانات المبيعات والإيرادات والطلبات',
                  },
                  {
                    value: 'products',
                    label: 'بيانات المنتجات',
                    description: 'تصدير بيانات المنتجات والمخزون والأداء',
                  },
                  {
                    value: 'customers',
                    label: 'بيانات العملاء',
                    description: 'تصدير بيانات العملاء والمستخدمين والتفاعلات',
                  },
                  {
                    value: 'custom',
                    label: 'بيانات مخصصة',
                    description: 'تصدير بيانات مخصصة حسب المعايير المحددة',
                  },
                ].map((option) => (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={option.value}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border:
                          exportType === option.value
                            ? `2px solid ${theme.palette.primary.main}`
                            : '1px solid #e0e0e0',
                        '&:hover': {
                          boxShadow: theme.shadows[4],
                        },
                      }}
                      onClick={() => setExportType(option.value as any)}
                    >
                      <CardContent sx={{ textAlign: 'center' }}>
                        {getExportTypeIcon(option.value)}
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          {option.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {option.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  اختر نوع البيانات التي تريد تصديرها. يمكنك تصدير بيانات المبيعات،
                  المنتجات، العملاء، أو بيانات مخصصة.
                </Typography>
              </Alert>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button onClick={handleNext} variant="contained">
                  التالي
                </Button>
                <Button onClick={handleReset}>إعادة تعيين</Button>
              </Box>
            </Box>
          )}

          {!isMobile && activeStep === 1 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                حدد تنسيق الملف والفترة الزمنية
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
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

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="تاريخ البداية"
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, startDate: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="تاريخ النهاية"
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, endDate: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button onClick={handleNext} variant="contained">
                  التالي
                </Button>
                <Button onClick={handleBack}>السابق</Button>
              </Box>
            </Box>
          )}

          {!isMobile && activeStep === 2 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                إعداد الفلاتر والخيارات
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.includeCharts}
                        onChange={(e) =>
                          setFilters({ ...filters, includeCharts: e.target.checked })
                        }
                      />
                    }
                    label="تضمين الرسوم البيانية"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.includeRawData}
                        onChange={(e) =>
                          setFilters({ ...filters, includeRawData: e.target.checked })
                        }
                      />
                    }
                    label="تضمين البيانات الأولية"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="تجميع البيانات"
                    value={filters.groupBy}
                    onChange={(e) => setFilters({ ...filters, groupBy: e.target.value })}
                    placeholder="مثال: يومي، أسبوعي، شهري"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
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
                <Button onClick={handleBack}>السابق</Button>
              </Box>
            </Box>
          )}

          {!isMobile && activeStep === 3 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                تصدير البيانات
              </Typography>

              {/* Export Summary */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  ملخص التصدير
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip
                    icon={getExportTypeIcon(exportType)}
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
                    <Chip label={`من ${dateRange.startDate}`} variant="outlined" />
                  )}
                  {dateRange.endDate && (
                    <Chip label={`إلى ${dateRange.endDate}`} variant="outlined" />
                  )}
                </Box>

                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      {filters.includeCharts ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <ErrorIcon color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary="الرسوم البيانية"
                      secondary={filters.includeCharts ? 'مضمنة' : 'غير مضمونة'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      {filters.includeRawData ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <ErrorIcon color="error" />
                      )}
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
                <Button onClick={handleReset}>إعادة تعيين</Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
