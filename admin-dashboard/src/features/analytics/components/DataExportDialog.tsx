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
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Chip,
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
} from '@mui/icons-material';
import {
  useExportSalesData,
  useExportProductsData,
  useExportCustomersData,
  useExportInventoryData,
  useExportFinancialData,
  useExportMarketingData,
} from '../hooks/useAnalytics';
import { normalizeExportFormat } from '../utils/exportMappers';
import type { ExportDataType } from '../types/exports';

interface DataExportDialogProps {
  open: boolean;
  onClose: () => void;
}

const EXPORT_TYPES: { value: ExportDataType; labelKey: string; disabled?: boolean }[] = [
  { value: 'sales', labelKey: 'export.dataType.sales' },
  { value: 'products', labelKey: 'export.dataType.products' },
  { value: 'customers', labelKey: 'export.dataType.customers' },
  { value: 'inventory', labelKey: 'export.dataType.inventory' },
  { value: 'financial', labelKey: 'export.dataType.financial' },
  { value: 'marketing', labelKey: 'export.dataType.marketing' },
];

const FORMAT_OPTIONS = [
  { value: 'pdf', label: 'PDF', icon: <PictureAsPdfIcon /> },
  { value: 'xlsx', label: 'Excel', icon: <TableChartIcon /> },
  { value: 'csv', label: 'CSV', icon: <TableChartIcon /> },
  { value: 'json', label: 'JSON', icon: <DescriptionIcon /> },
];

export const DataExportDialog: React.FC<DataExportDialogProps> = ({ open, onClose }) => {
  const { t } = useTranslation('analytics');
  const { isMobile } = useBreakpoint();
  const [activeStep, setActiveStep] = useState(0);
  const [exportType, setExportType] = useState<ExportDataType>('sales');
  const [format, setFormat] = useState<string>('xlsx');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'completed' | 'error'>(
    'idle'
  );
  const [exportResult, setExportResult] = useState<any>(null);

  const exportSalesData = useExportSalesData();
  const exportProductsData = useExportProductsData();
  const exportCustomersData = useExportCustomersData();
  const exportInventoryData = useExportInventoryData();
  const exportFinancialData = useExportFinancialData();
  const exportMarketingData = useExportMarketingData();

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setExportType('sales');
    setFormat('xlsx');
    setDateRange({ startDate: '', endDate: '' });
    setExportStatus('idle');
    setExportResult(null);
  };

  const handleExport = async () => {
    setExportStatus('exporting');

    try {
      const payload = {
        type: exportType,
        format: normalizeExportFormat(format),
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };

      let result;

      switch (payload.type) {
        case 'sales':
          result = await exportSalesData.mutateAsync(payload);
          break;
        case 'products':
          result = await exportProductsData.mutateAsync(payload);
          break;
        case 'customers':
          result = await exportCustomersData.mutateAsync(payload);
          break;
        case 'inventory':
          result = await exportInventoryData.mutateAsync(payload);
          break;
        case 'financial':
          result = await exportFinancialData.mutateAsync(payload);
          break;
        case 'marketing':
          result = await exportMarketingData.mutateAsync(payload);
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

  const getFormatLabel = (fmt: string) => {
    return FORMAT_OPTIONS.find((o) => o.value === fmt)?.label || fmt;
  };

  const getFormatIcon = (fmt: string) => {
    return FORMAT_OPTIONS.find((o) => o.value === fmt)?.icon || <FileDownloadIcon />;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={isMobile}>
      <DialogTitle sx={{ fontSize: isMobile ? '1.1rem' : undefined }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <DownloadIcon fontSize={isMobile ? 'small' : 'medium'} />
          <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ fontSize: isMobile ? '1rem' : undefined }}>
            {t('export.title')}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: isMobile ? 1.5 : 3 }}>
        <Stepper activeStep={activeStep} orientation={isMobile ? 'vertical' : 'vertical'}>
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
                  onChange={(e) => setExportType(e.target.value as ExportDataType)}
                  label={t('export.dataType.label')}
                >
                  {EXPORT_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value} disabled={type.disabled}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <TableChartIcon fontSize="small" />
                        <span>{t(type.labelKey)}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontSize: isMobile ? '0.8125rem' : undefined }}>
                  {t('export.dataType.info')}
                </Typography>
              </Alert>

              <Stack direction={isMobile ? 'column' : 'row'} spacing={1}>
                <Button onClick={handleNext} variant="contained" size={isMobile ? 'medium' : 'small'} fullWidth={isMobile}>
                  {t('export.actions.next')}
                </Button>
                <Button onClick={onClose} size={isMobile ? 'medium' : 'small'} fullWidth={isMobile}>
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
                      onChange={(e) => setFormat(e.target.value)}
                      label={t('export.format.label')}
                    >
                      {FORMAT_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            {option.icon}
                            <span>{option.label}</span>
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

              <Stack direction={isMobile ? 'column' : 'row'} spacing={1}>
                <Button onClick={handleNext} variant="contained" size={isMobile ? 'medium' : 'small'} fullWidth={isMobile}>
                  {t('export.actions.next')}
                </Button>
                <Button onClick={handleBack} size={isMobile ? 'medium' : 'small'} fullWidth={isMobile}>
                  {t('export.actions.previous')}
                </Button>
              </Stack>
            </StepContent>
          </Step>

          {/* Step 3: Export Summary & Execute */}
          <Step>
            <StepLabel sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
              {t('export.steps.export')}
            </StepLabel>
            <StepContent>
              <Box sx={{ mb: isMobile ? 2 : 3 }}>
                <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom sx={{ fontSize: isMobile ? '1rem' : undefined }}>
                  {t('export.summary.title')}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip
                    icon={<TableChartIcon fontSize="small" />}
                    label={t(`export.dataType.${exportType}`)}
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
                    />
                  )}
                  {dateRange.endDate && (
                    <Chip
                      label={`${t('export.dateRange.to')} ${dateRange.endDate}`}
                      variant="outlined"
                      size={isMobile ? 'small' : 'medium'}
                    />
                  )}
                </Stack>
              </Box>

              {exportStatus === 'exporting' && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom sx={{ fontSize: isMobile ? '0.8125rem' : undefined }}>
                    {t('export.status.exporting')}
                  </Typography>
                  <LinearProgress />
                </Box>
              )}

              {exportStatus === 'completed' && exportResult && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontSize: isMobile ? '0.8125rem' : undefined }}>
                    {t('export.status.completed')}
                  </Typography>
                  {exportResult?.fileUrl && (
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={() => window.open(exportResult.fileUrl, '_blank', 'noopener,noreferrer')}
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
                  <Typography variant="body2" sx={{ fontSize: isMobile ? '0.8125rem' : undefined }}>
                    {t('export.status.error')}
                  </Typography>
                </Alert>
              )}

              <Stack direction={isMobile ? 'column' : 'row'} spacing={1} sx={{ flexWrap: 'wrap' }}>
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
                    : t('export.status.startExport')}
                </Button>
                <Button onClick={handleBack} disabled={exportStatus === 'exporting'} size={isMobile ? 'medium' : 'small'} fullWidth={isMobile}>
                  {t('export.actions.previous')}
                </Button>
                <Button onClick={handleReset} size={isMobile ? 'medium' : 'small'} fullWidth={isMobile}>
                  {t('export.actions.reset')}
                </Button>
              </Stack>
            </StepContent>
          </Step>
        </Stepper>
      </DialogContent>

      <DialogActions sx={{ px: isMobile ? 1.5 : 3, pb: isMobile ? 2 : 3 }}>
        <Button onClick={onClose} size={isMobile ? 'medium' : 'large'} fullWidth={isMobile}>
          {t('export.actions.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
