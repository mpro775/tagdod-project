import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Typography,
  Box,
  Chip,
  Stack,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { Schedule as ScheduleIcon, Email as EmailIcon, Add as AddIcon } from '@mui/icons-material';
import { useScheduleReport } from '../hooks/useAnalytics';
import {
  ReportType,
  ReportFormat,
  ScheduleFrequency,
  CreateReportScheduleDto,
} from '../types/analytics.types';

interface ReportScheduleFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReportScheduleForm: React.FC<ReportScheduleFormProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();
  const scheduleReport = useScheduleReport();

  const [formData, setFormData] = useState<CreateReportScheduleDto>({
    name: '',
    description: '',
    reportType: ReportType.MONTHLY_REPORT,
    frequency: ScheduleFrequency.MONTHLY,
    formats: [ReportFormat.PDF],
    recipients: [],
    filters: {},
    config: {},
  });

  const [newRecipient, setNewRecipient] = useState('');
  const [recipientError, setRecipientError] = useState('');

  const handleInputChange = (field: keyof CreateReportScheduleDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddRecipient = () => {
    if (!newRecipient.trim()) {
      setRecipientError(t('reportSchedule.recipients.emailRequired'));
      return;
    }

    if (!validateEmail(newRecipient)) {
      setRecipientError(t('reportSchedule.recipients.invalidEmail'));
      return;
    }

    if (formData.recipients?.includes(newRecipient)) {
      setRecipientError(t('reportSchedule.recipients.duplicateEmail'));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      recipients: [...(prev.recipients || []), newRecipient],
    }));
    setNewRecipient('');
    setRecipientError('');
  };

  const handleRemoveRecipient = (email: string) => {
    setFormData((prev) => ({
      ...prev,
      recipients: prev.recipients?.filter((e) => e !== email) || [],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      return;
    }

    try {
      await scheduleReport.mutateAsync(formData);
      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to schedule report:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      reportType: ReportType.MONTHLY_REPORT,
      frequency: ScheduleFrequency.MONTHLY,
      formats: [ReportFormat.PDF],
      recipients: [],
      filters: {},
      config: {},
    });
    setNewRecipient('');
    setRecipientError('');
    onClose();
  };

  const isValid = formData.name.trim() && formData.description.trim();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth fullScreen={breakpoint.isXs}>
      <DialogTitle sx={{ fontSize: breakpoint.isXs ? '1.125rem' : undefined }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <ScheduleIcon />
          <Typography
            variant={breakpoint.isXs ? 'subtitle1' : 'h6'}
            sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
          >
            {t('reportSchedule.title')}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 1.5, sm: 3 } }}>
        <Grid container spacing={breakpoint.isXs ? 2 : 3} sx={{ mt: 1 }}>
          {/* Basic Information */}
          <Grid size={{ xs: 12 }}>
            <Typography
              variant={breakpoint.isXs ? 'subtitle1' : 'h6'}
              gutterBottom
              sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
            >
              {t('reportSchedule.basicInfo')}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label={t('reportSchedule.name')}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              size={breakpoint.isXs ? 'medium' : 'small'}
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: breakpoint.isXs ? '0.875rem' : undefined,
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label={t('reportSchedule.description')}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              multiline
              rows={3}
              size={breakpoint.isXs ? 'medium' : 'small'}
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: breakpoint.isXs ? '0.875rem' : undefined,
                },
              }}
            />
          </Grid>

          {/* Report Configuration */}
          <Grid size={{ xs: 12 }}>
            <Typography
              variant={breakpoint.isXs ? 'subtitle1' : 'h6'}
              gutterBottom
              sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined, mt: 2 }}
            >
              {t('reportSchedule.reportConfig')}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size={breakpoint.isXs ? 'medium' : 'small'}>
              <InputLabel>{t('reportSchedule.reportType')}</InputLabel>
              <Select
                value={formData.reportType}
                onChange={(e) => handleInputChange('reportType', e.target.value)}
                label={t('reportSchedule.reportType')}
              >
                {Object.values(ReportType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {t(`reportSchedule.reportTypes.${type}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size={breakpoint.isXs ? 'medium' : 'small'}>
              <InputLabel>{t('reportSchedule.frequency')}</InputLabel>
              <Select
                value={formData.frequency}
                onChange={(e) => handleInputChange('frequency', e.target.value)}
                label={t('reportSchedule.frequency')}
              >
                {Object.values(ScheduleFrequency).map((freq) => (
                  <MenuItem key={freq} value={freq}>
                    {t(`reportSchedule.frequencies.${freq}`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth size={breakpoint.isXs ? 'medium' : 'small'}>
              <InputLabel>{t('reportSchedule.formats')}</InputLabel>
              <Select
                multiple
                value={formData.formats || []}
                onChange={(e) => handleInputChange('formats', e.target.value as ReportFormat[])}
                label={t('reportSchedule.formats')}
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

          {/* Recipients */}
          <Grid size={{ xs: 12 }}>
            <Typography
              variant={breakpoint.isXs ? 'subtitle1' : 'h6'}
              gutterBottom
              sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined, mt: 2 }}
            >
              {t('reportSchedule.recipients.title')}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Stack direction={breakpoint.isMobile ? 'column' : 'row'} spacing={1}>
              <TextField
                fullWidth
                label={t('reportSchedule.recipients.email')}
                value={newRecipient}
                onChange={(e) => {
                  setNewRecipient(e.target.value);
                  setRecipientError('');
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddRecipient();
                  }
                }}
                error={!!recipientError}
                helperText={recipientError}
                size={breakpoint.isXs ? 'medium' : 'small'}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: breakpoint.isXs ? '0.875rem' : undefined,
                  },
                }}
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddRecipient}
                size={breakpoint.isXs ? 'medium' : 'small'}
                sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
              >
                {t('reportSchedule.recipients.add')}
              </Button>
            </Stack>
          </Grid>

          {formData.recipients && formData.recipients.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.recipients.map((email) => (
                  <Chip
                    key={email}
                    icon={<EmailIcon />}
                    label={email}
                    onDelete={() => handleRemoveRecipient(email)}
                    color="primary"
                    variant="outlined"
                    size={breakpoint.isXs ? 'small' : 'medium'}
                    sx={{ fontSize: breakpoint.isXs ? '0.75rem' : undefined }}
                  />
                ))}
              </Box>
            </Grid>
          )}

          {/* Advanced Options */}
          <Grid size={{ xs: 12 }}>
            <Typography
              variant={breakpoint.isXs ? 'subtitle1' : 'h6'}
              gutterBottom
              sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined, mt: 2 }}
            >
              {t('reportSchedule.advancedOptions')}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={(formData.config?.includeCharts as boolean) || false}
                  onChange={(e) =>
                    handleInputChange('config', {
                      ...formData.config,
                      includeCharts: e.target.checked,
                    })
                  }
                  size={breakpoint.isXs ? 'medium' : 'small'}
                />
              }
              label={t('reportSchedule.includeCharts')}
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
                  checked={(formData.config?.includeRawData as boolean) || false}
                  onChange={(e) =>
                    handleInputChange('config', {
                      ...formData.config,
                      includeRawData: e.target.checked,
                    })
                  }
                  size={breakpoint.isXs ? 'medium' : 'small'}
                />
              }
              label={t('reportSchedule.includeRawData')}
              sx={{
                '& .MuiFormControlLabel-label': {
                  fontSize: breakpoint.isXs ? '0.875rem' : undefined,
                },
              }}
            />
          </Grid>

          {/* Success/Error Messages */}
          {scheduleReport.isSuccess && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="success">
                <Typography
                  variant="body2"
                  sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                >
                  {t('reportSchedule.success')}
                </Typography>
              </Alert>
            </Grid>
          )}

          {scheduleReport.isError && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="error">
                <Typography
                  variant="body2"
                  sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                >
                  {t('reportSchedule.error')}
                </Typography>
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
        <Button
          onClick={handleClose}
          size={breakpoint.isXs ? 'medium' : 'medium'}
          sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
        >
          {t('reportSchedule.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isValid || scheduleReport.isPending}
          startIcon={<ScheduleIcon />}
          size={breakpoint.isXs ? 'medium' : 'medium'}
          sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
        >
          {scheduleReport.isPending ? t('reportSchedule.scheduling') : t('reportSchedule.schedule')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
