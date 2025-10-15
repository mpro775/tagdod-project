import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  Snackbar,
  LinearProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
 
} from '@mui/material';
import {
  GetApp,
  FileDownload,
  PictureAsPdf,
  Description,
  TableChart,
  Code,
  ExpandMore,
  CheckCircle,
  Analytics,
  Inventory,
  People,
  AttachMoney,
  ShoppingCart,
} from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';
import { ReportFormat, PeriodType, ReportCategory } from '../types/analytics.types';

interface ExportConfig {
  dataType: string;
  format: ReportFormat;
  period: PeriodType;
  startDate: string;
  endDate: string;
  includeCharts: boolean;
  includeRawData: boolean;
  category?: ReportCategory;
}

const dataTypes = [
  {
    id: 'dashboard',
    name: 'لوحة التحكم',
    description: 'البيانات العامة والنظرة الشاملة',
    icon: <Analytics />,
    availableFormats: [ReportFormat.PDF, ReportFormat.EXCEL, ReportFormat.CSV, ReportFormat.JSON],
  },
  {
    id: 'sales',
    name: 'المبيعات',
    description: 'بيانات المبيعات والإيرادات',
    icon: <AttachMoney />,
    availableFormats: [ReportFormat.PDF, ReportFormat.EXCEL, ReportFormat.CSV, ReportFormat.JSON],
  },
  {
    id: 'products',
    name: 'المنتجات',
    description: 'أداء المنتجات والمخزون',
    icon: <Inventory />,
    availableFormats: [ReportFormat.PDF, ReportFormat.EXCEL, ReportFormat.CSV, ReportFormat.JSON],
  },
  {
    id: 'customers',
    name: 'العملاء',
    description: 'بيانات العملاء والقطاعات',
    icon: <People />,
    availableFormats: [ReportFormat.PDF, ReportFormat.EXCEL, ReportFormat.CSV, ReportFormat.JSON],
  },
  {
    id: 'orders',
    name: 'الطلبات',
    description: 'تفاصيل الطلبات والمعاملات',
    icon: <ShoppingCart />,
    availableFormats: [ReportFormat.EXCEL, ReportFormat.CSV, ReportFormat.JSON],
  },
  {
    id: 'financial',
    name: 'التقارير المالية',
    description: 'البيانات المالية والأرباح',
    icon: <AttachMoney />,
    availableFormats: [ReportFormat.PDF, ReportFormat.EXCEL, ReportFormat.CSV, ReportFormat.JSON],
  },
];

const formatLabels = {
  [ReportFormat.PDF]: 'PDF',
  [ReportFormat.EXCEL]: 'Excel',
  [ReportFormat.CSV]: 'CSV',
  [ReportFormat.JSON]: 'JSON',
};

const formatIcons = {
  [ReportFormat.PDF]: <PictureAsPdf />,
  [ReportFormat.EXCEL]: <TableChart />,
  [ReportFormat.CSV]: <Description />,
  [ReportFormat.JSON]: <Code />,
};

export const DataExportPage: React.FC = () => {
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    dataType: 'dashboard',
    format: ReportFormat.PDF,
    period: PeriodType.MONTHLY,
    startDate: '',
    endDate: '',
    includeCharts: true,
    includeRawData: false,
  });

  const [expandedPanel, setExpandedPanel] = useState<string | false>('export-panel');

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async (config: ExportConfig) => {
      if (config.dataType === 'dashboard') {
        return analyticsApi.exportData(config.format, config.dataType, config.period);
      } else if (config.dataType === 'sales') {
        return analyticsApi.exportSalesData(config.format, config.startDate, config.endDate);
      } else if (config.dataType === 'products') {
        return analyticsApi.exportProductsData(config.format, config.startDate, config.endDate);
      } else if (config.dataType === 'customers') {
        return analyticsApi.exportCustomersData(config.format, config.startDate, config.endDate);
      } else if (config.dataType === 'financial') {
        return analyticsApi.getFinancialReport({ startDate: config.startDate, endDate: config.endDate });
      }
      throw new Error('نوع البيانات غير مدعوم');
    },
    onSuccess: (response) => {
      // Handle file download
      if (response.data?.fileUrl) {
        window.open(response.data.fileUrl, '_blank');
      }
    },
  });

  const handleExport = () => {
    exportMutation.mutate(exportConfig);
  };

  const handleConfigChange = (field: keyof ExportConfig, value: unknown) => {
    setExportConfig(prev => ({ ...prev, [field]: value }));
  };

  const getCurrentDataType = () => {
    return dataTypes.find(type => type.id === exportConfig.dataType) || dataTypes[0];
  };

  const isExportDisabled = () => {
    if (!exportConfig.startDate || !exportConfig.endDate) return true;
    return exportMutation.isPending;
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          تصدير البيانات
        </Typography>
        <Typography variant="body1" color="text.secondary">
          تصدير البيانات التحليلية بصيغ مختلفة (PDF, Excel, CSV, JSON)
        </Typography>
      </Box>

      {/* Export Configuration */}
      <Card>
        <CardContent>
          <Accordion
            expanded={expandedPanel === 'export-panel'}
            onChange={(_, isExpanded) => setExpandedPanel(isExpanded ? 'export-panel' : false)}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <GetApp />
                <Typography variant="h6">إعدادات التصدير</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                {/* Data Type Selection */}
                <Grid size={{xs: 12, md: 6}}>
                  <FormControl fullWidth>
                    <InputLabel>نوع البيانات</InputLabel>
                    <Select
                      value={exportConfig.dataType}
                      label="نوع البيانات"
                      onChange={(e) => handleConfigChange('dataType', e.target.value)}
                    >
                      {dataTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {type.icon}
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {type.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {type.description}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Format Selection */}
                <Grid size={{xs: 12, md: 6}}>
                  <FormControl fullWidth>
                    <InputLabel>صيغة الملف</InputLabel>
                    <Select
                      value={exportConfig.format}
                      label="صيغة الملف"
                      onChange={(e) => handleConfigChange('format', e.target.value)}
                    >
                      {getCurrentDataType().availableFormats.map((format) => (
                        <MenuItem key={format} value={format}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {formatIcons[format]}
                            <Typography variant="body2">
                              {formatLabels[format]}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Period Selection */}
                <Grid size={{xs: 12, md: 6}}>
                  <FormControl fullWidth>
                    <InputLabel>الفترة الزمنية</InputLabel>
                    <Select
                      value={exportConfig.period}
                      label="الفترة الزمنية"
                      onChange={(e) => handleConfigChange('period', e.target.value)}
                    >
                      <MenuItem value={PeriodType.DAILY}>يومي</MenuItem>
                      <MenuItem value={PeriodType.WEEKLY}>أسبوعي</MenuItem>
                      <MenuItem value={PeriodType.MONTHLY}>شهري</MenuItem>
                      <MenuItem value={PeriodType.QUARTERLY}>ربع سنوي</MenuItem>
                      <MenuItem value={PeriodType.YEARLY}>سنوي</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Date Range (for custom periods) */}
                <Grid size={{xs: 12, md: 3}}>
                  <TextField
                    fullWidth
                    label="تاريخ البداية"
                    type="date"
                    value={exportConfig.startDate}
                    onChange={(e) => handleConfigChange('startDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{xs: 12, md: 3}}>
                  <TextField
                    fullWidth
                    label="تاريخ النهاية"
                    type="date"
                    value={exportConfig.endDate}
                    onChange={(e) => handleConfigChange('endDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Export Options */}
                <Grid size={{xs: 12}}>
                  <Typography variant="h6" gutterBottom>
                    خيارات التصدير
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label="تضمين الرسوم البيانية"
                      color={exportConfig.includeCharts ? 'primary' : 'default'}
                      onClick={() => handleConfigChange('includeCharts', !exportConfig.includeCharts)}
                      icon={<CheckCircle />}
                      variant={exportConfig.includeCharts ? 'filled' : 'outlined'}
                    />
                    <Chip
                      label="تضمين البيانات الأولية"
                      color={exportConfig.includeRawData ? 'primary' : 'default'}
                      onClick={() => handleConfigChange('includeRawData', !exportConfig.includeRawData)}
                      icon={<CheckCircle />}
                      variant={exportConfig.includeRawData ? 'filled' : 'outlined'}
                    />
                  </Box>
                </Grid>

                {/* Export Button */}
                <Grid size={{xs: 12}}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={exportMutation.isPending ? <LinearProgress /> : <FileDownload />}
                    onClick={handleExport}
                    disabled={isExportDisabled()}
                    fullWidth
                  >
                    {exportMutation.isPending ? 'جاري التصدير...' : 'تصدير البيانات'}
                  </Button>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      {/* Data Types Information */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            أنواع البيانات المتاحة للتصدير
          </Typography>
          <Grid container spacing={2}>
            {dataTypes.map((type) => (
              <Grid size={{xs: 12, sm: 6, md: 4}} key={type.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {type.icon}
                      <Typography variant="h6" fontSize="1rem">
                        {type.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {type.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {type.availableFormats.map((format) => (
                        <Chip
                          key={format}
                          label={formatLabels[format]}
                          size="small"
                          variant="outlined"
                          icon={formatIcons[format]}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Export History */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            سجل التصدير
          </Typography>
          <Alert severity="info">
            سجل عمليات التصدير سيظهر هنا قريباً
          </Alert>
        </CardContent>
      </Card>

      {/* Success/Error Messages */}
      <Snackbar
        open={exportMutation.isSuccess}
        autoHideDuration={6000}
        onClose={() => exportMutation.reset()}
      >
        <Alert severity="success">
          تم تصدير البيانات بنجاح!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!exportMutation.error}
        autoHideDuration={6000}
        onClose={() => exportMutation.reset()}
      >
        <Alert severity="error">
          حدث خطأ أثناء التصدير. يرجى المحاولة مرة أخرى.
        </Alert>
      </Snackbar>
    </Box>
  );
};
