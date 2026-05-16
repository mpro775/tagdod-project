import React, { useState, useEffect } from 'react';
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
import { useCreateSchedule, useUpdateSchedule } from '../hooks/useAnalytics';
import {
  ReportType,
  ReportFormat,
  ScheduleFrequency,
  CreateReportScheduleDto,
  UpdateReportScheduleDto,
  ReportSchedule,
} from '../types/analytics.types';

interface ReportScheduleFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  schedule?: ReportSchedule | null;
}

export const ReportScheduleForm: React.FC<ReportScheduleFormProps> = ({
  open,
  onClose,
  onSuccess,
  schedule,
}) => {
  const { t } = useTranslation('analytics');
  const breakpoint = useBreakpoint();
  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();

  const isEditing = !!schedule?.id;

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

  useEffect(() => {
    if (open && schedule) {
      setFormData({
        name: schedule.name || '',
        description: schedule.description || '',
        reportType: schedule.reportType || ReportType.MONTHLY_REPORT,
        frequency: schedule.frequency || ScheduleFrequency.MONTHLY,
        formats: schedule.formats?.length ? schedule.formats : [ReportFormat.PDF],
        recipients: Array.isArray(schedule.recipients) ? schedule.recipients : [],
        filters: schedule.filters || {},
        config: schedule.config || {},
      });
    } else if (open) {
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
    }
    setNewRecipient('');
    setRecipientError('');
  }, [open, schedule]);

  const handleInputChange = (field: keyof CreateReportScheduleDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateEmail = (email: string) => {
    return /^\S+@\S+\.\S+$/.test(email);
  };

  const handleAddRecipient = () => {
    if (!newRecipient.trim()) {
      setRecipientError(t('reportSchedule.recipients.emailRequired', 'البريد مطلوب'));
      return;
    }

    if (!validateEmail(newRecipient)) {
      setRecipientError(t('reportSchedule.recipients.invalidEmail', 'بريد غير صالح'));
      return;
    }

    if (formData.recipients?.includes(newRecipient)) {
      setRecipientError(t('reportSchedule.recipients.duplicateEmail', 'البريد موجود'));
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
    if (!formData.name.trim() || !formData.reportType || !formData.frequency) {
      return;
    }

    if (!formData.recipients || formData.recipients.length === 0) {
      setRecipientError(t('reportSchedule.recipients.atLeastOne', 'مطلوب بريد واحد على الأقل'));
      return;
    }

    try {
      if (isEditing && schedule?.id) {
        const updatePayload: UpdateReportScheduleDto = {
          name: formData.name,
          description: formData.description,
          reportType: formData.reportType,
          frequency: formData.frequency,
          formats: formData.formats,
          recipients: formData.recipients,
          filters: formData.filters,
          config: formData.config,
        };
        await updateSchedule.mutateAsync({ id: schedule.id, data: updatePayload });
      } else {
        await createSchedule.mutateAsync(formData);
      }
      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to save schedule:', error);
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

  const isValid =
    formData.name.trim() &&
    formData.reportType &&
    formData.frequency &&
    formData.recipients &&
    formData.recipients.length > 0;

  const mutationPending = createSchedule.isPending || updateSchedule.isPending;
  const mutationError = createSchedule.isError || updateSchedule.isError;
  const mutationSuccess = createSchedule.isSuccess || updateSchedule.isSuccess;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth fullScreen={breakpoint.isXs}>
      <DialogTitle sx={{ fontSize: breakpoint.isXs ? '1.125rem' : undefined }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <ScheduleIcon />
          <Typography
            variant={breakpoint.isXs ? 'subtitle1' : 'h6'}
            sx={{ fontSize: breakpoint.isXs ? '1rem' : undefined }}
          >
            {isEditing
              ? t('reportSchedule.edit', 'تعديل الجدولة')
              : t('reportSchedule.title', 'جدولة تقرير')}
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
              {t('reportSchedule.basicInfo', 'المعلومات الأساسية')}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label={t('reportSchedule.name', 'اسم الجدولة')}
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
              label={t('reportSchedule.description', 'الوصف')}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              multiline
              rows={2}
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
              {t('reportSchedule.reportConfig', 'إعدادات التقرير')}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size={breakpoint.isXs ? 'medium' : 'small'}>
              <InputLabel>{t('reportSchedule.reportType', 'نوع التقرير')}</InputLabel>
              <Select
                value={formData.reportType}
                onChange={(e) => handleInputChange('reportType', e.target.value)}
                label={t('reportSchedule.reportType', 'نوع التقرير')}
              >
                {Object.values(ReportType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {t(`reportSchedule.reportTypes.${type}`, type)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size={breakpoint.isXs ? 'medium' : 'small'}>
              <InputLabel>{t('reportSchedule.frequency', 'التكرار')}</InputLabel>
              <Select
                value={formData.frequency}
                onChange={(e) => handleInputChange('frequency', e.target.value)}
                label={t('reportSchedule.frequency', 'التكرار')}
              >
                {Object.values(ScheduleFrequency).map((freq) => (
                  <MenuItem key={freq} value={freq}>
                    {t(`reportSchedule.frequencies.${freq}`, freq)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth size={breakpoint.isXs ? 'medium' : 'small'}>
              <InputLabel>{t('reportSchedule.formats', 'الصيغ')}</InputLabel>
              <Select
                multiple
                value={formData.formats || []}
                onChange={(e) => handleInputChange('formats', e.target.value as ReportFormat[])}
                label={t('reportSchedule.formats', 'الصيغ')}
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
              {t('reportSchedule.recipients.title', 'المستلمون')}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Stack direction={breakpoint.isMobile ? 'column' : 'row'} spacing={1}>
              <TextField
                fullWidth
                label={t('reportSchedule.recipients.email', 'البريد الإلكتروني')}
                value={newRecipient}
                onChange={(e) => {
                  setNewRecipient(e.target.value);
                  setRecipientError('');
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
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
                sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined, whiteSpace: 'nowrap' }}
              >
                {t('reportSchedule.recipients.add', 'إضافة')}
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
              {t('reportSchedule.advancedOptions', 'خيارات متقدمة')}
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
              label={t('reportSchedule.includeCharts', 'تضمين الرسوم البيانية')}
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
              label={t('reportSchedule.includeRawData', 'تضمين البيانات الخام')}
              sx={{
                '& .MuiFormControlLabel-label': {
                  fontSize: breakpoint.isXs ? '0.875rem' : undefined,
                },
              }}
            />
          </Grid>

          {/* Success/Error Messages */}
          {mutationSuccess && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="success">
                <Typography
                  variant="body2"
                  sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                >
                  {isEditing
                    ? t('reportSchedule.updateSuccess', 'تم تحديث الجدولة بنجاح')
                    : t('reportSchedule.success', 'تم إنشاء الجدولة بنجاح')}
                </Typography>
              </Alert>
            </Grid>
          )}

          {mutationError && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="error">
                <Typography
                  variant="body2"
                  sx={{ fontSize: breakpoint.isXs ? '0.8125rem' : undefined }}
                >
                  {t('reportSchedule.error', 'حدث خطأ أثناء حفظ الجدولة')}
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
          {t('reportSchedule.cancel', 'إلغاء')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isValid || mutationPending}
          startIcon={<ScheduleIcon />}
          size={breakpoint.isXs ? 'medium' : 'medium'}
          sx={{ fontSize: breakpoint.isXs ? '0.875rem' : undefined }}
        >
          {mutationPending
            ? t('reportSchedule.saving', 'جاري الحفظ...')
            : isEditing
            ? t('reportSchedule.update', 'تحديث')
            : t('reportSchedule.schedule', 'جدولة')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
