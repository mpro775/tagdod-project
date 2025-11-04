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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Grid,
  Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import {
  Download as DownloadIcon,
  FileDownload as FileDownloadIcon,
  TableChart as TableChartIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
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

export const DataExportDialog: React.FC<DataExportDialogProps> = ({ open, onClose }) => {
  const { t } = useTranslation('analytics');
  const { isMobile } = useBreakpoint();
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
          throw new Error(t('export.status.unsupportedType'));
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
    return t(`export.format.${format}`);
  };

  const getExportTypeLabel = (type: string) => {
    return t(`export.dataType.${type}`);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ fontSize: isMobile ? '1.1rem' : undefined }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <DownloadIcon fontSize={isMobile ? 'small' : 'medium'} />
          <Typography 
            variant={isMobile ? 'subtitle1' : 'h6'}
            sx={{ fontSize: isMobile ? '1rem' : undefined }}
          >
            {t('export.title')}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: isMobile ? 1.5 : 3 }}>
        <Stepper 
          activeStep={activeStep} 
          orientation={isMobile ? 'vertical' : 'vertical'}
        >
          {/* Step 1: Data Type Selection */}
          <Step>
            <StepLabel sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
              {t('export.steps.dataType')}
            </StepLabel>
            <StepContent>
              <FormControl fullWidth sx={{ mb: 2 }} size={isMobile ? 'medium' : 'small'}>
                <InputLabel>{t('export.dataType.label')}</InputLabel>
                <Select 
                  value={exportType} 
                  onChange={(e) => setExportType(e.target.value as any)}
                  label={t('export.dataType.label')}
                >
                  <MenuItem value="sales">
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <TableChartIcon fontSize="small" />
                      <span>{t('export.dataType.sales')}</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="products">
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <TableChartIcon fontSize="small" />
                      <span>{t('export.dataType.products')}</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="customers">
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <TableChartIcon fontSize="small" />
                      <span>{t('export.dataType.customers')}</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="custom">
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <TableChartIcon fontSize="small" />
                      <span>{t('export.dataType.custom')}</span>
                    </Stack>
                  </MenuItem>
                </Select>
              </FormControl>

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography 
                  variant="body2"
                  sx={{ fontSize: isMobile ? '0.8125rem' : undefined }}
                >
                  {t('export.dataType.info')}
                </Typography>
              </Alert>

              <Stack 
                direction={isMobile ? 'column' : 'row'} 
                spacing={1}
              >
                <Button 
                  onClick={handleNext} 
                  variant="contained"
                  size={isMobile ? 'medium' : 'small'}
                  fullWidth={isMobile}
                >
                  {t('export.actions.next')}
                </Button>
                <Button 
                  onClick={onClose}
                  size={isMobile ? 'medium' : 'small'}
                  fullWidth={isMobile}
                >
                  {t('export.actions.cancel')}
                </Button>
              </Stack>
            </StepContent>
          </Step>

          {/* Step 2: Format and Date Range */}
          <Step>
            <StepLabel sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
              {t('export.steps.formatAndPeriod')}
            </StepLabel>
            <StepContent>
              <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth size={isMobile ? 'medium' : 'small'}>
                    <InputLabel>{t('export.format.label')}</InputLabel>
                    <Select
                      value={format}
                      onChange={(e) => setFormat(e.target.value as ReportFormat)}
                      label={t('export.format.label')}
                    >
                      {Object.values(ReportFormat).map((formatOption) => (
                        <MenuItem key={formatOption} value={formatOption}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            {getFormatIcon(formatOption)}
                            <span>{getFormatLabel(formatOption)}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label={t('export.dateRange.startDate')}
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    size={isMobile ? 'medium' : 'small'}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label={t('export.dateRange.endDate')}
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    size={isMobile ? 'medium' : 'small'}
                  />
                </Grid>
              </Grid>

              <Stack 
                direction={isMobile ? 'column' : 'row'} 
                spacing={1}
              >
                <Button 
                  onClick={handleNext} 
                  variant="contained"
                  size={isMobile ? 'medium' : 'small'}
                  fullWidth={isMobile}
                >
                  {t('export.actions.next')}
                </Button>
                <Button 
                  onClick={handleBack}
                  size={isMobile ? 'medium' : 'small'}
                  fullWidth={isMobile}
                >
                  {t('export.actions.previous')}
                </Button>
              </Stack>
            </StepContent>
          </Step>

          {/* Step 3: Filters */}
          <Step>
            <StepLabel sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
              {t('export.steps.filters')}
            </StepLabel>
            <StepContent>
              <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={filters.includeCharts}
                        onChange={(e) =>
                          setFilters({ ...filters, includeCharts: e.target.checked })
                        }
                        size={isMobile ? 'medium' : 'small'}
                      />
                    }
                    label={t('export.filters.includeCharts')}
                    sx={{ fontSize: isMobile ? '0.875rem' : undefined }}
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
                        size={isMobile ? 'medium' : 'small'}
                      />
                    }
                    label={t('export.filters.includeRawData')}
                    sx={{ fontSize: isMobile ? '0.875rem' : undefined }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label={t('export.filters.groupBy')}
                    value={filters.groupBy}
                    onChange={(e) => setFilters({ ...filters, groupBy: e.target.value })}
                    placeholder={t('export.filters.groupByPlaceholder')}
                    size={isMobile ? 'medium' : 'small'}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label={t('export.filters.category')}
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    placeholder={t('export.filters.categoryPlaceholder')}
                    size={isMobile ? 'medium' : 'small'}
                  />
                </Grid>
              </Grid>

              <Stack 
                direction={isMobile ? 'column' : 'row'} 
                spacing={1}
              >
                <Button 
                  onClick={handleNext} 
                  variant="contained"
                  size={isMobile ? 'medium' : 'small'}
                  fullWidth={isMobile}
                >
                  {t('export.actions.next')}
                </Button>
                <Button 
                  onClick={handleBack}
                  size={isMobile ? 'medium' : 'small'}
                  fullWidth={isMobile}
                >
                  {t('export.actions.previous')}
                </Button>
              </Stack>
            </StepContent>
          </Step>

          {/* Step 4: Export */}
          <Step>
            <StepLabel sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
              {t('export.steps.export')}
            </StepLabel>
            <StepContent>
              {/* Export Summary */}
              <Box sx={{ mb: isMobile ? 2 : 3 }}>
                <Typography 
                  variant={isMobile ? 'subtitle1' : 'h6'} 
                  gutterBottom
                  sx={{ fontSize: isMobile ? '1rem' : undefined }}
                >
                  {t('export.summary.title')}
                </Typography>
                <Stack 
                  direction="row" 
                  spacing={1} 
                  sx={{ 
                    flexWrap: 'wrap', 
                    gap: 1, 
                    mb: 2 
                  }}
                >
                  <Chip
                    icon={<TableChartIcon fontSize="small" />}
                    label={getExportTypeLabel(exportType)}
                    color="primary"
                    variant="outlined"
                    size={isMobile ? 'small' : 'medium'}
                    sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                  />
                  <Chip
                    icon={getFormatIcon(format)}
                    label={getFormatLabel(format)}
                    color="secondary"
                    variant="outlined"
                    size={isMobile ? 'small' : 'medium'}
                    sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                  />
                  {dateRange.startDate && (
                    <Chip 
                      label={`${t('export.dateRange.from')} ${dateRange.startDate}`} 
                      variant="outlined"
                      size={isMobile ? 'small' : 'medium'}
                      sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                    />
                  )}
                  {dateRange.endDate && (
                    <Chip 
                      label={`${t('export.dateRange.to')} ${dateRange.endDate}`} 
                      variant="outlined"
                      size={isMobile ? 'small' : 'medium'}
                      sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
                    />
                  )}
                </Stack>

                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      {filters.includeCharts ? (
                        <CheckCircleIcon 
                          color="success" 
                          fontSize={isMobile ? 'small' : 'medium'}
                        />
                      ) : (
                        <ErrorIcon 
                          color="error" 
                          fontSize={isMobile ? 'small' : 'medium'}
                        />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={t('export.summary.charts')}
                      secondary={
                        filters.includeCharts 
                          ? t('export.summary.chartsIncluded') 
                          : t('export.summary.chartsNotIncluded')
                      }
                      primaryTypographyProps={{
                        fontSize: isMobile ? '0.875rem' : undefined,
                      }}
                      secondaryTypographyProps={{
                        fontSize: isMobile ? '0.75rem' : undefined,
                      }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      {filters.includeRawData ? (
                        <CheckCircleIcon 
                          color="success" 
                          fontSize={isMobile ? 'small' : 'medium'}
                        />
                      ) : (
                        <ErrorIcon 
                          color="error" 
                          fontSize={isMobile ? 'small' : 'medium'}
                        />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={t('export.summary.rawData')}
                      secondary={
                        filters.includeRawData 
                          ? t('export.summary.rawDataIncluded') 
                          : t('export.summary.rawDataNotIncluded')
                      }
                      primaryTypographyProps={{
                        fontSize: isMobile ? '0.875rem' : undefined,
                      }}
                      secondaryTypographyProps={{
                        fontSize: isMobile ? '0.75rem' : undefined,
                      }}
                    />
                  </ListItem>
                </List>
              </Box>

              {/* Export Status */}
              {exportStatus === 'exporting' && (
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    gutterBottom
                    sx={{ fontSize: isMobile ? '0.8125rem' : undefined }}
                  >
                    {t('export.status.exporting')}
                  </Typography>
                  <LinearProgress />
                </Box>
              )}

              {exportStatus === 'completed' && exportResult && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography 
                    variant="body2"
                    sx={{ fontSize: isMobile ? '0.8125rem' : undefined }}
                  >
                    {t('export.status.completed')}
                  </Typography>
                  {exportResult.data?.fileUrl && (
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={() => window.open(exportResult.data.fileUrl, '_blank')}
                      sx={{ mt: 1 }}
                      size={isMobile ? 'medium' : 'small'}
                      fullWidth={isMobile}
                    >
                      {t('export.status.downloadFile')}
                    </Button>
                  )}
                </Alert>
              )}

              {exportStatus === 'error' && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography 
                    variant="body2"
                    sx={{ fontSize: isMobile ? '0.8125rem' : undefined }}
                  >
                    {t('export.status.error')}
                  </Typography>
                </Alert>
              )}

              <Stack 
                direction={isMobile ? 'column' : 'row'} 
                spacing={1}
                sx={{ flexWrap: 'wrap' }}
              >
                <Button
                  onClick={handleExport}
                  variant="contained"
                  disabled={exportStatus === 'exporting'}
                  startIcon={<DownloadIcon />}
                  size={isMobile ? 'medium' : 'small'}
                  fullWidth={isMobile}
                >
                  {exportStatus === 'exporting' 
                    ? t('export.status.exportingText') 
                    : t('export.status.startExport')
                  }
                </Button>
                <Button 
                  onClick={handleBack} 
                  disabled={exportStatus === 'exporting'}
                  size={isMobile ? 'medium' : 'small'}
                  fullWidth={isMobile}
                >
                  {t('export.actions.previous')}
                </Button>
                <Button 
                  onClick={handleReset}
                  size={isMobile ? 'medium' : 'small'}
                  fullWidth={isMobile}
                >
                  {t('export.actions.reset')}
                </Button>
              </Stack>
            </StepContent>
          </Step>
        </Stepper>
      </DialogContent>

      <DialogActions sx={{ px: isMobile ? 1.5 : 3, pb: isMobile ? 2 : 3 }}>
        <Button 
          onClick={onClose}
          size={isMobile ? 'medium' : 'large'}
          fullWidth={isMobile}
        >
          {t('export.actions.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
